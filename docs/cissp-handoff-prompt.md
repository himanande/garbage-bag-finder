# ローカルClaude Code CLI向け 引継ぎ指示文

以下をそのままローカルの `claude` セッションに貼り付けてください。

---

このリポジトリ(magic-restaurant-search)には、既存のレストラン検索アプリに加えて、
CISSP試験対策の入門用語学習サービスを `/cissp` 以下に新規追加済みです
(ブランチ: claude/cissp-learning-service-gr4asr)。

## 実装済みの内容
- `/cissp` … ホーム(学習進捗サマリー、各機能への導線)
- `/cissp/glossary` … 用語集(キーワード検索 + ドメイン絞り込み、学習状況をクリックで切替)
- `/cissp/flashcards` … フラッシュカード(表/裏切替、シャッフル、学習状況の記録)
- `/cissp/quiz` … クイズ(一問一答 / 4択、ドメイン・出題数の設定、結果表示)

## 関連ファイル
- `src/data/cissp/types.ts` … 用語の型定義、CISSP 8ドメインの定義
- `src/data/cissp/terms.ts` … 用語データ(現在はサンプル16件の雛形)
- `src/lib/cissp/progress.ts` … 学習進捗をlocalStorageに保存するhook
- `src/lib/cissp/quiz.ts` … クイズの出題ロジック(4択の選択肢生成など)
- `src/components/cissp/` … 各画面のコンポーネント(GlossaryView / FlashcardView / QuizView)
- `src/app/cissp/` … 各ページ(layout, page, glossary, flashcards, quiz)

## 既存のレストラン検索アプリ
`/`(ルート)はそのまま既存の「魔法のレストラン セレクション」アプリで、変更していません。
データは `src/data/restaurants.ts`、コンポーネントは `src/components/RestaurantSearch.tsx` です。

## このあとお願いしたいこと
(ここに具体的な依頼内容を書く。例:)
- `src/data/cissp/terms.ts` の用語データを、別途用意した用語リスト(添付/貼り付け)に差し替えてほしい
- 用語数が増えるのでページネーションやドメイン別タブを追加してほしい
- フラッシュカードに「自動再生」機能を追加してほしい
- デザイン・配色を調整してほしい

---
