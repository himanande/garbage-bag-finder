// data/extracted + data/shops を統合して Restaurant 型の JSON ドラフトを生成するスクリプト。
//
// 使い方:
//   node scripts/build-restaurants.mjs [年]
//   例: node scripts/build-restaurants.mjs 2026   ← 2026年分のみ
//       node scripts/build-restaurants.mjs         ← 全年分
//
// 出力: data/draft-restaurants.json

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const EXTRACTED_DIR = path.join(ROOT, 'data', 'extracted')
const SHOPS_DIR = path.join(ROOT, 'data', 'shops')
const OUT_FILE = path.join(ROOT, 'data', 'draft-restaurants.json')

// ---- 都道府県マップ ----
// 市区名 → 都道府県名（住所に都道府県が省略されている場合の補完）
const CITY_TO_PREF = {
  '札幌市': '北海道',
  '旭川市': '北海道',
  '函館市': '北海道',
  '仙台市': '宮城県',
  'さいたま市': '埼玉県',
  '川越市': '埼玉県',
  '所沢市': '埼玉県',
  '千葉市': '千葉県',
  '船橋市': '千葉県',
  '柏市': '千葉県',
  '東京都': '東京都',
  '横浜市': '神奈川県',
  '川崎市': '神奈川県',
  '相模原市': '神奈川県',
  '新潟市': '新潟県',
  '静岡市': '静岡県',
  '浜松市': '静岡県',
  '名古屋市': '愛知県',
  '岐阜市': '岐阜県',
  '津市': '三重県',
  '四日市市': '三重県',
  '大津市': '滋賀県',
  '草津市': '滋賀県',
  '京都市': '京都府',
  '大阪市': '大阪府',
  '堺市': '大阪府',
  '東大阪市': '大阪府',
  '豊中市': '大阪府',
  '吹田市': '大阪府',
  '高槻市': '大阪府',
  '枚方市': '大阪府',
  '八尾市': '大阪府',
  '寝屋川市': '大阪府',
  '門真市': '大阪府',
  '守口市': '大阪府',
  '岸和田市': '大阪府',
  '和泉市': '大阪府',
  '泉佐野市': '大阪府',
  '泉南市': '大阪府',
  '阪南市': '大阪府',
  '貝塚市': '大阪府',
  '泉大津市': '大阪府',
  '高石市': '大阪府',
  '松原市': '大阪府',
  '藤井寺市': '大阪府',
  '羽曳野市': '大阪府',
  '富田林市': '大阪府',
  '河内長野市': '大阪府',
  '大阪狭山市': '大阪府',
  '摂津市': '大阪府',
  '池田市': '大阪府',
  '箕面市': '大阪府',
  '茨木市': '大阪府',
  '豊能郡': '大阪府',
  '泉北郡': '大阪府',
  '南河内郡': '大阪府',
  '神戸市': '兵庫県',
  '姫路市': '兵庫県',
  '尼崎市': '兵庫県',
  '西宮市': '兵庫県',
  '芦屋市': '兵庫県',
  '明石市': '兵庫県',
  '宝塚市': '兵庫県',
  '伊丹市': '兵庫県',
  '川西市': '兵庫県',
  '加古川市': '兵庫県',
  '奈良市': '奈良県',
  '橿原市': '奈良県',
  '桜井市': '奈良県',
  '和歌山市': '和歌山県',
  '鳥取市': '鳥取県',
  '松江市': '島根県',
  '岡山市': '岡山県',
  '倉敷市': '岡山県',
  '広島市': '広島県',
  '福山市': '広島県',
  '山口市': '山口県',
  '下関市': '山口県',
  '徳島市': '徳島県',
  '高松市': '香川県',
  '松山市': '愛媛県',
  '高知市': '高知県',
  '福岡市': '福岡県',
  '北九州市': '福岡県',
  '久留米市': '福岡県',
  '佐賀市': '佐賀県',
  '長崎市': '長崎県',
  '熊本市': '熊本県',
  '大分市': '大分県',
  '宮崎市': '宮崎県',
  '鹿児島市': '鹿児島県',
  '那覇市': '沖縄県',
}

// 都道府県 → 地域
const PREF_TO_REGION = {
  '北海道': '北海道・東北',
  '青森県': '北海道・東北', '岩手県': '北海道・東北', '宮城県': '北海道・東北',
  '秋田県': '北海道・東北', '山形県': '北海道・東北', '福島県': '北海道・東北',
  '茨城県': '関東', '栃木県': '関東', '群馬県': '関東',
  '埼玉県': '関東', '千葉県': '関東', '東京都': '関東', '神奈川県': '関東',
  '新潟県': '中部', '富山県': '中部', '石川県': '中部', '福井県': '中部',
  '山梨県': '中部', '長野県': '中部', '岐阜県': '中部', '静岡県': '中部', '愛知県': '中部',
  '三重県': '関西', '滋賀県': '関西', '京都府': '関西', '大阪府': '関西',
  '兵庫県': '関西', '奈良県': '関西', '和歌山県': '関西',
  '鳥取県': '中国・四国', '島根県': '中国・四国', '岡山県': '中国・四国',
  '広島県': '中国・四国', '山口県': '中国・四国',
  '徳島県': '中国・四国', '香川県': '中国・四国', '愛媛県': '中国・四国', '高知県': '中国・四国',
  '福岡県': '九州・沖縄', '佐賀県': '九州・沖縄', '長崎県': '九州・沖縄',
  '熊本県': '九州・沖縄', '大分県': '九州・沖縄', '宮崎県': '九州・沖縄',
  '鹿児島県': '九州・沖縄', '沖縄県': '九州・沖縄',
}

// スーパー・量販店と判定する店名キーワード(食品以外の業態)
const STORE_KEYWORDS = ['ライフ', 'ロピア', 'コストコ', '無印良品', 'ニトリ', 'Seria', 'seria', 'オーケー']

// ジャンル推定キーワード (優先順)
const GENRE_RULES = [
  ['ラーメン', ['ラーメン', 'らーめん', '拉麺', '拉麵', '中華そば', 'ワンタン', '人類みな麺類']],
  ['うどん・そば', ['うどん', 'そば', '蕎麦', 'ウドン']],
  ['お好み焼き・粉もん', ['お好み焼き', 'たこ焼き', 'タコ焼き', '粉もん', '鉄板焼き', 'もんじゃ', '鶴橋風月']],
  ['寿司・海鮮', ['寿司', '鮨', '海鮮', '刺身', '魚介', '海老', 'カニ', '牡蠣']],
  ['焼肉', ['焼肉', '焼き肉', 'ホルモン', '牛タン', 'ステーキ', '牛']],
  ['中華', ['中華', '中国料理', '餃子', '担々麺', '麻婆', '北京', '上海', '点心', '飲茶', '炒飯', 'チャーハン', '回鍋肉', '麻辣', '豚まん', 'シュウマイ', '焼売', '饅頭', '小籠包', '蓬莱', '老祥記']],
  ['イタリアン', ['イタリアン', 'パスタ', 'ピザ', 'ピッツァ', 'リゾット', 'イタリア', 'トラットリア', 'オステリア']],
  ['フレンチ', ['フレンチ', 'フランス', 'ビストロ', 'ブラッスリー', 'Paris', 'パリ', 'おでん フレンチ', '赤白']],
  ['カレー', ['カレー', 'スパイス', 'インド', 'スリランカ', 'ターリー']],
  ['スイーツ・カフェ', ['スイーツ', 'ケーキ', 'カフェ', 'Cafe', 'cafe', 'Coffee', 'コーヒー', 'パン', 'パティスリー', 'チョコ', 'アイス', 'プリン', 'パフェ', 'ショコラ', 'ベーカリー', '珈琲', 'クレープ', 'ワッフル', 'タルト', 'タピオカ', '和菓子', '餅', 'もち', 'おはぎ', '八つ橋', 'チーズケーキ', 'バウム', 'バームクーヘン', '饅頭', '大福', '最中', 'ふたば', 'りくろー', 'アフタヌーンティー', 'ティールーム', 'ゴンチャ', 'お茶', '甘味', 'どら焼き', 'お菓子', '製菓', 'おこし', 'おたべ', '月化粧']],
  ['居酒屋・バル', ['居酒屋', 'バル', 'バー', '立ち飲み', '立呑み', '酒場', 'ビール', 'ワイン', '串焼き', '串揚げ', '串かつ', '串カツ', '炭火焼', '小料理', '料理屋', 'やきとり', '焼き鳥', '焼鳥', '大衆', 'ビアホール', 'ミュンヘン']],
  ['和食・割烹', ['和食', '割烹', '懐石', '日本料理', '天ぷら', 'とんかつ', '天丼', 'うな', '鰻', '鍋', '蟹', '京料理', '食堂', '定食', '煮物', '出汁', '茶漬け', '粥', 'おかゆ', 'おぶ', '丼', 'どんぶり', '親子丼', '牛丼', 'おでん', '炙り', '揚げ物', '天重']],
  ['洋食', ['洋食', 'グリル', 'オムライス', 'ハンバーグ', 'エビフライ', 'コロッケ', 'デミグラス', 'デミ', '豚テキ', 'ビフテキ', '欧風', '洋风']],
  ['郷土料理', []],
]

function inferGenre(texts, shopName = '') {
  // スーパー・量販店の判定
  if (STORE_KEYWORDS.some(kw => shopName.includes(kw))) return 'スーパー・量販店'

  const combined = [shopName, ...texts].filter(Boolean).join(' ')
  for (const [genre, keywords] of GENRE_RULES) {
    if (keywords.some(kw => combined.includes(kw))) return genre
  }
  return 'その他'
}

function parsePrefectureAndCity(rawAddress) {
  if (!rawAddress) return { prefecture: '不明', city: '不明' }

  // 郵便番号(〒xxx-xxxx や T xxx-xxxx)を除去
  const address = rawAddress.replace(/^[〒T]?\d{3}-?\d{4}\s*/, '')

  // 都道府県名が先頭にある場合
  const prefixMatch = address.match(
    /^(北海道|(?:青森|岩手|宮城|秋田|山形|福島|茨城|栃木|群馬|埼玉|千葉|東京|神奈川|新潟|富山|石川|福井|山梨|長野|岐阜|静岡|愛知|三重|滋賀|京都|大阪|兵庫|奈良|和歌山|鳥取|島根|岡山|広島|山口|徳島|香川|愛媛|高知|福岡|佐賀|長崎|熊本|大分|宮崎|鹿児島|沖縄)(?:都|道|府|県))/
  )
  if (prefixMatch) {
    const pref = prefixMatch[1]
    const rest = address.slice(pref.length)
    const cityMatch = rest.match(/^([^\d\s]{2,6}(?:市|区|町|村|郡))/)
    const city = cityMatch ? pref.replace(/都|道|府|県$/, '') === '' ? cityMatch[1] : cityMatch[1] : '不明'
    return { prefecture: pref, city }
  }

  // 既知の市名で始まる場合(東京区チェックより先に)
  for (const [city, pref] of Object.entries(CITY_TO_PREF)) {
    if (address.startsWith(city)) {
      return { prefecture: pref, city }
    }
  }

  // 東京都の特殊処理: 市区名なしで「〇〇区」から始まる場合
  const tokyoWardMatch = address.match(/^([^\d市府県]{2,4}区)/)
  if (tokyoWardMatch) {
    return { prefecture: '東京都', city: tokyoWardMatch[1] }
  }

  // 電話番号エリアコードからの推定は省略 (addressベースで足りる場合が多い)
  return { prefecture: '不明', city: '不明' }
}

function buildAward(rankInfo, episodeTitle) {
  if (!rankInfo && !episodeTitle) return ''
  if (!rankInfo) return episodeTitle
  if (!episodeTitle) return rankInfo
  if (rankInfo === episodeTitle) return rankInfo
  return `${episodeTitle} / ${rankInfo}`
}

function buildDescription(shop, shopDetail) {
  const parts = []
  if (shop.menu) parts.push(shop.menu)
  if (shopDetail?.broadcastInfo?.length > 1) {
    parts.push(...shopDetail.broadcastInfo.slice(1))
  }
  return parts.filter(Boolean).join('　')
}

function main() {
  const yearFilter = process.argv[2] ?? ''

  const extractedFiles = fs.readdirSync(EXTRACTED_DIR)
    .filter(f => f.endsWith('.json') && f.startsWith(yearFilter))
    .sort()

  console.log(`対象放送回: ${extractedFiles.length}件`)

  const results = []
  const seen = new Set()

  for (const file of extractedFiles) {
    const episode = JSON.parse(fs.readFileSync(path.join(EXTRACTED_DIR, file), 'utf-8'))
    if (!episode.shops?.length) continue

    for (const shop of episode.shops) {
      const uuidMatch = shop.detailUrl?.match(/\/shops\/([0-9a-f-]{36})$/)
      if (!uuidMatch) continue
      const uuid = uuidMatch[1]

      // 同じ店が複数回登場する場合は初回放送日を使う
      const shopDetailPath = path.join(SHOPS_DIR, `${uuid}.json`)
      if (!fs.existsSync(shopDetailPath)) continue

      const shopDetail = JSON.parse(fs.readFileSync(shopDetailPath, 'utf-8'))
      const { prefecture, city } = parsePrefectureAndCity(shopDetail.address)

      const allText = [
        episode.episodeTitle,
        shop.rankInfo,
        shop.menu,
        ...(shopDetail.broadcastInfo ?? []),
      ]

      const record = {
        id: uuid,
        name: shopDetail.name,
        genre: inferGenre(allText, shopDetail.name),
        region: PREF_TO_REGION[prefecture] ?? '不明',
        prefecture,
        city,
        address: shopDetail.address ?? '',
        lat: 0,
        lng: 0,
        award: buildAward(shop.rankInfo, episode.episodeTitle),
        broadcastDate: episode.broadcastDate,
        description: buildDescription(shop, shopDetail),
        imageUrl: shop.imageUrl ?? undefined,
        // デバッグ用メタ情報 (本番では除去)
        _episodeTitle: episode.episodeTitle,
        _rankInfo: shop.rankInfo,
        _nearStation: shopDetail.nearStation,
        _tel: shopDetail.tel,
      }

      // 同一店・同一放送日の重複を除去
      const key = `${uuid}::${episode.broadcastDate}`
      if (!seen.has(key)) {
        seen.add(key)
        results.push(record)
      }
    }
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(results, null, 2))
  console.log(`出力: ${OUT_FILE} (${results.length}件)`)

  // サマリー表示
  const prefSummary = {}
  const genreSummary = {}
  for (const r of results) {
    prefSummary[r.prefecture] = (prefSummary[r.prefecture] ?? 0) + 1
    genreSummary[r.genre] = (genreSummary[r.genre] ?? 0) + 1
  }
  console.log('\n--- 都道府県別 ---')
  for (const [k, v] of Object.entries(prefSummary).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k}: ${v}件`)
  }
  console.log('\n--- ジャンル別 ---')
  for (const [k, v] of Object.entries(genreSummary).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k}: ${v}件`)
  }
}

main()
