# 水野真紀の魔法のレストラン 紹介店検索 — 仕様書

最終更新: 2026-06-19
このファイルは本プロジェクトの正本ドキュメントです。今後の変更はこのファイルに追記・更新してください。

## 1. 概要

MBS（毎日放送）のテレビ番組「水野真紀の魔法のレストラン」で紹介された店舗を検索できるWebサイト。
番組公式サイト（mahou-contents.mbs.jp）から収集した店舗データ（2016年〜現在、2778件）を、都道府県・市区町村・ジャンル・キーワード・現在地から検索できる。

- 本番URL: （Vercelデプロイ前のため未確定）
- リポジトリ: https://github.com/himanande/magic-restaurant-search

## 2. システム構成図

```
┌─────────────────────────────────────────────────────────┐
│  ユーザーのブラウザ                                          │
│  - Next.js (App Router, クライアントコンポーネント)            │
│  - Geolocation API（現在地検索）                              │
│  - Leaflet（地図表示、OpenStreetMapタイル）                    │
└───────────────────────┬─────────────────────────────────┘
                         │ 静的ホスティング (Vercel)
┌───────────────────────┴─────────────────────────────────┐
│  Next.js アプリ（ビルド時に静的書き出し）                       │
│  src/data/restaurants.json … 全店舗データ（ビルドに同梱）       │
└─────────────────────────────────────────────────────────┘

【データ収集パイプライン（ビルド前・オフラインで実行、別ディレクトリ）】
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│ MBS公式サイト       │ → │ scrape.py         │ → │ data/raw/*.html   │
│ mahou-contents.    │   │ (onairページ取得)   │   │ data/shops/*.json │
│ mbs.jp             │   └──────────────────┘   └──────────────────┘
└──────────────────┘                                      │
                                                            ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│ 国土地理院         │ ← │ geocode.py         │ ← │ merge.py           │
│ ジオコーディングAPI │   │ (座標付与)          │   │ (draft-restaurants │
└──────────────────┘   └──────────────────┘   │  .json生成)         │
                                                 └──────────────────┘
                                                            │
                                                            ▼
                                          src/data/restaurants.json
                                          （アプリ側にコピーしてビルド）
```

## 3. ディレクトリ構成

本プロジェクトは**2つの独立したディレクトリ（別gitクローン、別ブランチ）**で構成される。今後の作業では両方の場所を意識すること。

### 3-1. アプリ本体（Next.js）
パス: `/home/ike3/work/ike3memo/magic-restaurant-search`
ブランチ: `claude/cissp-learning-service-gr4asr`（⚠️ 名前はCISSP学習サービス用だが、レストラン検索とCISSP学習サービスが同居している。詳細は「9. 既知の課題」参照）

```
magic-restaurant-search/
├── docs/
│   └── SPEC.md                      … 本ファイル
├── public/
│   └── leaflet/                     … Leafletマーカー画像
├── src/
│   ├── app/
│   │   ├── layout.tsx                … 全体レイアウト・メタデータ
│   │   ├── page.tsx                  … トップページ（RestaurantSearchを表示）
│   │   ├── globals.css               … Tailwind + Leaflet CSS読み込み
│   │   └── cissp/                    … （別機能）CISSP学習サービス
│   ├── components/
│   │   ├── RestaurantSearch.tsx      … メイン検索UI（フィルタ・一覧・地図切替）
│   │   ├── RestaurantMap.tsx         … Leaflet地図コンポーネント
│   │   └── cissp/                    … （別機能）CISSP用コンポーネント
│   ├── data/
│   │   ├── restaurants.json          … 店舗データ本体（2778件、ビルドに同梱）
│   │   ├── restaurants.ts            … 型定義 + JSONインポート + REGIONS/GENRES/PREFECTURES定数
│   │   └── cissp/                    … （別機能）CISSP用データ
│   └── lib/cissp/                    … （別機能）
├── package.json
├── next.config.ts
└── tsconfig.json
```

### 3-2. データ収集パイプライン（スクレイピング・整形スクリプト）
パス: `/home/ike3/work/ike3memo/app-dev/store-search/magic-restaurant-search`
ブランチ: `claude/magic-restaurant-scraping-nujto9`（⚠️ origin に未push、ローカル5コミット分先行。「9. 既知の課題」参照）

```
magic-restaurant-search/  (データ収集用クローン)
├── scrape.py              … MBS公式サイトからonairページ・店舗詳細ページを取得
├── merge.py                … raw HTML + shop JSON から draft-restaurants.json を生成
├── geocode.py               … 国土地理院APIで住所→緯度経度を付与
├── fix_location.py          … 都道府県名省略住所の補完（市区町村名から逆引き）
├── fix_broken.py             … 初回スクレイピング時の抽出バグを修正済みデータで上書き
└── data/
    ├── onair-urls.csv        … 放送日とonairページURLの対応表（444件、2016-04-13〜現在）
    ├── raw/*.html             … onairページの生HTML（360件）
    ├── shops/*.json           … 店舗詳細（店名・住所・電話番号等、2779件）
    ├── raw-shops/*.html       … （旧）初回収集時の店舗詳細HTML（673件、レガシー）
    ├── extracted/*.json       … （旧）初回収集時の中間データ（レガシー）
    └── draft-restaurants.json … 最終生成物（アプリ側 src/data/restaurants.json の元データ）
```

## 4. 主要コンポーネント

| コンポーネント | 役割 |
|---|---|
| `RestaurantSearch.tsx` | 検索条件（キーワード・都道府県・市区町村・ジャンル・現在地）の状態管理、フィルタリング、同名店舗のグルーピング（複数回登場の集約）、リスト/地図表示の切り替え |
| `RestaurantMap.tsx` | Leaflet地図表示。`lat`/`lng`が0の店舗は地図上で除外。マウント後に動的import（SSR回避） |
| `restaurants.ts` | `restaurants.json`を型付きでエクスポート。`REGIONS`・`GENRES`・`PREFECTURES`の選択肢定数を保持 |

### 主な機能
- キーワード検索（店名・都道府県・市区町村・住所・説明文を対象に部分一致）
- 都道府県 → 市区町村のカスケード式絞り込み
- ジャンル絞り込み（16種類、後述）
- 現在地検索（Geolocation API、半径1/3/5/10km、距離順ソート）
- 同一店舗の複数回登場をグルーピングして「N回登場」表示
- 各登場回の放送日・エピソードタイトルから公式サイトの放送回ページへリンク
- リスト表示 / 地図表示の切り替え

## 5. データスキーマ

DBは使用せず、ビルド時に静的JSONとして同梱する方式（`src/data/restaurants.json`）。

### Restaurant型（`src/data/restaurants.ts`）

| フィールド | 型 | 説明 |
|---|---|---|
| `id` | string | 店舗UUID（MBS公式サイトの店舗ページURLから取得） |
| `name` | string | 店名 |
| `genre` | string | ジャンル（`GENRES`定数のいずれか） |
| `region` | string | 地域（`REGIONS`定数のいずれか。現状ほぼ「関西」） |
| `prefecture` | string | 都道府県（`PREFECTURES`定数のいずれか、または「不明」） |
| `city` | string | 市区町村 |
| `address` | string | 住所（フリーテキスト） |
| `lat` / `lng` | number | 緯度・経度。ジオコーディング失敗時は`0` |
| `award` | string | 放送回の企画タイトル（≒`episodeTitle`と同義で表示に使用） |
| `broadcastDate` | string | 放送日（`YYYY-MM-DD`） |
| `description` | string | 一覧カード用の説明文 |
| `imageUrl?` | string | 店舗メニュー画像URL（MBS提供、storage.googleapis.com） |
| `episodeTitle?` | string | 放送回タイトル |
| `rankInfo?` | string | 番組内の企画・ランキング情報 |
| `nearStation?` | string | 最寄り駅 |
| `tel?` | string | 電話番号 |

**注意**: 同一店舗が複数の放送日に登場する場合、`restaurants.json`内では**店舗×放送日ごとに別レコード**として保持される（id+broadcastDateで一意）。UI側（`RestaurantSearch.tsx`）で店名をキーにグルーピングし、`appearances`配列にまとめて表示する。

### 選択肢定数

- `GENRES`（16種類）: うどん・そば / お好み焼き・粉もん / その他 / イタリアン / カレー / スイーツ・カフェ / スーパー・量販店 / パン・ベーカリー / フレンチ / ラーメン / 中華 / 和食・割烹 / 寿司・海鮮 / 居酒屋・バル / 洋食 / 焼肉
- `PREFECTURES`（19種類、件数降順）: 大阪府 / 京都府 / 兵庫県 / 東京都 / 奈良県 / 滋賀県 / 和歌山県 / 広島県 / 三重県 / 群馬県 / 沖縄県 / 高知県 / 神奈川県 / 岐阜県 / 千葉県 / 新潟県 / 愛知県 / 香川県 / 不明
- `REGIONS`: 関西 / 関東 / 中部 / 中国・四国 / 九州・沖縄 / 不明（現在UIでは未使用。データ上のみ保持）

### データ統計（2026-06-18時点）
- 総レコード数: 2778件（2016-04-13 〜 2026-06-10放送分）
- 座標取得済み: 2646件（95.2%）
- ジャンル「その他」: 148件（5.3%、店名からは業態判定不能なもの）
- 都道府県分布: 大阪府1907 / 京都府415 / 兵庫県247 / 不明95 / その他

## 6. 外部API・外部サービス一覧

本アプリ自体はAPIルートを持たない（完全静的）。ビルド前のデータ収集パイプラインが以下の外部サービスを利用する。

| サービス | 用途 | 利用箇所 | 認証 |
|---|---|---|---|
| `mahou-contents.mbs.jp` | 番組公式サイト。放送回ページ・店舗詳細ページのスクレイピング元 | `scrape.py` | 不要（公開ページ） |
| 国土地理院 地名検索API (`msearch.gsi.go.jp`) | 住所→緯度経度のジオコーディング | `geocode.py` | 不要（無料・無認証） |
| OpenStreetMapタイルサーバー | 地図タイル表示 | `RestaurantMap.tsx`（ブラウザから直接） | 不要 |
| ブラウザ Geolocation API | 現在地取得 | `RestaurantSearch.tsx` | ユーザー許可 |

### スクレイピング運用ルール
- リクエスト間隔: 1秒（連続アクセスでサイトに負荷をかけない）
- User-Agent: `Mozilla/5.0` を明示
- IPv4強制（`curl -4` / Python `socket.getaddrinfo`パッチ）— IPv6 Happy Eyeballsのフォールバック待ちで1リクエスト5秒以上かかる問題への対処

## 7. 環境変数一覧

現時点で **環境変数は使用していない**（`process.env`参照なし）。

Vercelプロジェクトは作成済み（`.vercel/project.json`が存在、projectId: `prj_L1KXWVzDW3R12xgrggJLTQmGthRU`）だが、本デプロイ未実施。
今後OGP設定等で `NEXT_PUBLIC_SITE_URL` のような値が必要になった場合はここに追記する。

## 8. 技術スタック

| 項目 | 内容 |
|---|---|
| フレームワーク | Next.js 15.5.19（App Router） |
| 言語 | TypeScript 5 |
| UIライブラリ | React 19.1.0 |
| スタイリング | Tailwind CSS 4 |
| 地図 | react-leaflet 5 / leaflet 1.9.4（OpenStreetMapタイル） |
| アイコン | lucide-react |
| ホスティング（予定） | Vercel |
| データ収集 | Python 3（標準ライブラリのみ、外部パッケージ不使用） |

## 9. 既知の課題・リリースまでの残タスク

優先度の高い順。

1. **【要対応】データ収集リポジトリの未保存作業**
   `/home/ike3/work/ike3memo/app-dev/store-search/magic-restaurant-search` に、2105件超の新規店舗JSON・統合済みdraft-restaurants.json等が**未コミット**。さらにローカルに5コミット分の未push分あり。マシン障害等で消失するリスクがあるため、最優先でコミット・push推奨。

2. **【要対応】アプリ側の未コミット変更**
   `magic-restaurant-search`（アプリ本体）も `src/data/restaurants.json`・`restaurants.ts`・`RestaurantSearch.tsx`・`RestaurantMap.tsx` 等が未コミット。

3. **【要確認】ブランチ運用の整理**
   アプリ側は現在 `claude/cissp-learning-service-gr4asr` ブランチ上で作業しており、無関係なCISSP学習サービスと同居している。`main`へのマージ方針（CISSP機能を含めるか、レストラン検索だけ分離するか）を決める必要がある。

4. **メタデータの不一致**
   `src/app/layout.tsx` の `title`/`description` が旧サイト名「魔法のレストラン セレクション」のままで、実際の表示名「水野真紀の魔法のレストラン 紹介店検索」と一致していない。`lang="en"`になっているが日本語サイトなので`lang="ja"`が適切。

5. **Vercel本番デプロイ**
   プロジェクトは作成済みだが本番デプロイ未実施。

6. **OGP / metaタグ整備**
   SNSシェア時のタイトル・画像設定（未着手）。

7. **ジャンル「その他」残り148件（5.3%）**
   同名店舗が複数地域に存在し一意特定できないもの、既存16ジャンルに当てはまらない業態（スペイン料理・韓国海苔巻き専門店等）が中心。これ以上の自動改善は限界、必要なら個別対応。

8. **データ更新の仕組み**
   番組は毎週放送のため、新しい回のデータをどう追加するか運用フローが未確立（現状は手動でスクリプト実行）。

## 10. 運用メモ

- ローカル動作確認: アプリディレクトリで `npm run dev`（デフォルト3000番、競合時は3001等にフォールバック）
- ビルド確認: `npm run build`（型エラー・配列リテラルの複雑度エラーに注意。データはJSON importにしているため2778件規模でも問題なくビルド可能）
- データ再生成の流れ: データ収集ディレクトリで `scrape.py` → `merge.py` → `geocode.py` → 整形してJSON出力 → アプリ側 `src/data/restaurants.json` にコピー → `npm run build`で確認
