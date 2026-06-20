// 「魔法のレストラン」実データ（MBS公式より取得）
import restaurantsJson from './restaurants.json'

export interface Restaurant {
  id: string
  name: string
  genre: string
  region: string
  prefecture: string
  city: string
  address: string
  lat: number
  lng: number
  award: string
  broadcastDate: string
  description: string
  imageUrl?: string
  episodeTitle?: string
  rankInfo?: string
  nearStation?: string
  tel?: string
  hotpepperUrl?: string
}

export const restaurants: Restaurant[] = restaurantsJson as Restaurant[]

export const PREFECTURES = [
  '大阪府',
  '京都府',
  '兵庫県',
  '東京都',
  '奈良県',
  '滋賀県',
  '和歌山県',
  '広島県',
  '三重県',
  '群馬県',
  '沖縄県',
  '高知県',
  '神奈川県',
  '岐阜県',
  '千葉県',
  '新潟県',
  '愛知県',
  '香川県',
  '不明',
] as const

export const REGIONS = [
  '中国・四国',
  '中部',
  '九州・沖縄',
  '関東',
  '関西',
  '不明',
] as const

export const GENRES = [
  'うどん・そば',
  'お好み焼き・粉もん',
  'その他',
  'イタリアン',
  'カレー',
  'スイーツ・カフェ',
  'スーパー・量販店',
  'パン・ベーカリー',
  'フレンチ',
  'ラーメン',
  '中華',
  '和食・割烹',
  '寿司・海鮮',
  '居酒屋・バル',
  '洋食',
  '焼肉',
] as const
