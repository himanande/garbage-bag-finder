// 「魔法のレストラン」の店舗詳細ページ(/shops/{uuid})をスクレイピングするスクリプト。
//
// 使い方:
//   node scripts/scrape-shop-detail.mjs <uuid> [<uuid> ...]
//   例: node scripts/scrape-shop-detail.mjs 16c9c12b-5439-4977-a278-78462e95b2f2
//
// 出力:
//   - data/raw-shops/<uuid>.html   取得した生HTML(キャッシュ)
//   - data/shops/<uuid>.json       抽出した店舗情報
//
// scrape-onair.mjs と同様に、サイト負荷軽減のため
// リクエスト間隔(DELAY_MS)とレスポンスキャッシュを行う。

import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'
import { sleep, fetchAndCache, DELAY_MS } from './lib/http.mjs'

const ROOT = process.cwd()
const RAW_DIR = path.join(ROOT, 'data', 'raw-shops')
const OUT_DIR = path.join(ROOT, 'data', 'shops')
export const SHOP_BASE_URL = 'https://mahou-contents.mbs.jp/shops'

export function extractShopDetail(html, uuid, url) {
  const $ = cheerio.load(html)

  // #details 内の <dl> は <dt>ラベル</dt><dd>値</dd> の繰り返し
  const details = {}
  $('#details dl > dt').each((_, el) => {
    const $dt = $(el)
    const label = $dt.text().trim()
    const value = $dt.next('dd').text().trim().replace(/\s+/g, ' ')
    details[label] = value
  })

  // store-text には「放送日・回タイトル・順位(地域)・店名・紹介メニュー」が入っている
  const storeText = $('#shop_info dl.store dd.store-text li')
    .map((_, el) => $(el).text().trim().replace(/\s+/g, ' '))
    .get()

  return {
    uuid,
    url,
    name: details['店舗名'] ?? null,
    address: details['住所'] ?? null,
    tel: details['電話'] ?? null,
    businessHours: details['営業時間'] ?? null,
    regularHoliday: details['定休日'] ?? null,
    nearStation: details['最寄駅'] ?? null,
    comment: details['備考'] ?? null,
    cast: details['出演者'] ?? null,
    broadcastInfo: storeText,
  }
}

async function main() {
  const uuids = process.argv.slice(2)
  if (uuids.length === 0) {
    console.error('使い方: node scripts/scrape-shop-detail.mjs <uuid> [<uuid> ...]')
    process.exit(1)
  }

  fs.mkdirSync(RAW_DIR, { recursive: true })
  fs.mkdirSync(OUT_DIR, { recursive: true })

  let ok = 0
  let skipped = 0

  for (const [i, uuid] of uuids.entries()) {
    const url = `${SHOP_BASE_URL}/${uuid}`
    const cachePath = path.join(RAW_DIR, `${uuid}.html`)
    process.stdout.write(`[${i + 1}/${uuids.length}] ${uuid} `)

    const { html, status, fromCache } = await fetchAndCache(url, cachePath)
    if (!html) {
      console.log(`-> スキップ (HTTP ${status})`)
      skipped++
      continue
    }

    console.log(fromCache ? '-> キャッシュ利用' : '-> 取得OK')
    const extracted = extractShopDetail(html, uuid, url)
    fs.writeFileSync(path.join(OUT_DIR, `${uuid}.json`), JSON.stringify(extracted, null, 2))
    ok++

    if (!fromCache && i < uuids.length - 1) {
      await sleep(DELAY_MS)
    }
  }

  console.log(`完了: 成功 ${ok}件 / スキップ ${skipped}件`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
