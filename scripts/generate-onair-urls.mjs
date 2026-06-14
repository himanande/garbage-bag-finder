// 「魔法のレストラン」公式サイトの過去放送ページURL候補一覧を生成するスクリプト。
// 実際の放送が毎週ではない週(特番・お休み等)は404になる可能性があるため、
// 生成後にスクレイピングスクリプト側で存在チェック(HTTPステータス)を行うこと。
//
// 使い方:
//   node scripts/generate-onair-urls.mjs [開始日(YYYY-MM-DD)] [年数]
//   例: node scripts/generate-onair-urls.mjs 2026-06-10 5

const BASE_URL = 'https://mahou-contents.mbs.jp/shops/onair'

const startDateArg = process.argv[2] ?? '2026-06-10'
const years = Number(process.argv[3] ?? '5')

const toISODate = (date) => date.toISOString().slice(0, 10)

const startDate = new Date(`${startDateArg}T00:00:00Z`)
const oldestDate = new Date(startDate)
oldestDate.setUTCFullYear(oldestDate.getUTCFullYear() - years)

const rows = []
const current = new Date(startDate)
while (current >= oldestDate) {
  const dateStr = toISODate(current)
  rows.push({ broadcastDate: dateStr, url: `${BASE_URL}/${dateStr}` })
  current.setUTCDate(current.getUTCDate() - 7)
}

// CSV出力
const header = 'broadcastDate,url'
const csv = [header, ...rows.map((r) => `${r.broadcastDate},${r.url}`)].join('\n')
console.log(csv)
console.error(`\n# 件数: ${rows.length} (起点: ${startDateArg}, 過去${years}年分・週1回想定)`)
