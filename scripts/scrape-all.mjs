// onairページ → 店舗詳細ページ をまとめてスクレイピングするオーケストレーションスクリプト。
//
// 使い方:
//   node scripts/scrape-all.mjs [対象日プレフィックス]
//   例: node scripts/scrape-all.mjs 2025      ← 2025年分のonairページのみ対象
//       node scripts/scrape-all.mjs           ← data/onair-urls.csv の全件
//
// 処理:
//   1. 対象のonairページを取得・抽出 (data/raw/, data/extracted/)
//   2. data/extracted/ 全体から店舗詳細ページのUUIDを重複なく収集
//   3. 各店舗詳細ページを取得・抽出 (data/raw-shops/, data/shops/)
//
// 既に取得済みのページはキャッシュを使うため、中断しても再実行で続きから進む。

import fs from 'node:fs'
import path from 'node:path'
import { sleep, fetchAndCache, DELAY_MS } from './lib/http.mjs'
import { loadOnairTargets, extractOnair } from './scrape-onair.mjs'
import { extractShopDetail, SHOP_BASE_URL } from './scrape-shop-detail.mjs'

const ROOT = process.cwd()
const RAW_DIR = path.join(ROOT, 'data', 'raw')
const EXTRACTED_DIR = path.join(ROOT, 'data', 'extracted')
const RAW_SHOPS_DIR = path.join(ROOT, 'data', 'raw-shops')
const SHOPS_DIR = path.join(ROOT, 'data', 'shops')

const UUID_RE = /\/shops\/([0-9a-f-]{36})$/

async function scrapeOnairPages(targets) {
  fs.mkdirSync(RAW_DIR, { recursive: true })
  fs.mkdirSync(EXTRACTED_DIR, { recursive: true })

  let ok = 0
  let skipped = 0

  for (const [i, { broadcastDate, url }] of targets.entries()) {
    const cachePath = path.join(RAW_DIR, `${broadcastDate}.html`)
    process.stdout.write(`[onair ${i + 1}/${targets.length}] ${broadcastDate} `)

    const { html, status, fromCache } = await fetchAndCache(url, cachePath)
    if (!html) {
      console.log(`-> スキップ (HTTP ${status})`)
      skipped++
      continue
    }

    console.log(fromCache ? '-> キャッシュ利用' : '-> 取得OK')
    const extracted = extractOnair(html, broadcastDate, url)
    fs.writeFileSync(
      path.join(EXTRACTED_DIR, `${broadcastDate}.json`),
      JSON.stringify(extracted, null, 2)
    )
    ok++

    if (!fromCache && i < targets.length - 1) {
      await sleep(DELAY_MS)
    }
  }

  console.log(`onairページ: 成功 ${ok}件 / スキップ ${skipped}件`)
}

// data/extracted/ 全体(過去実行分も含む)から店舗UUIDを重複なく収集
function collectShopUuids() {
  const uuids = new Set()

  if (!fs.existsSync(EXTRACTED_DIR)) return []

  for (const file of fs.readdirSync(EXTRACTED_DIR)) {
    if (!file.endsWith('.json')) continue
    const data = JSON.parse(fs.readFileSync(path.join(EXTRACTED_DIR, file), 'utf-8'))
    for (const shop of data.shops ?? []) {
      const match = shop.detailUrl?.match(UUID_RE)
      if (match) uuids.add(match[1])
    }
  }

  return [...uuids]
}

async function scrapeShopDetails(uuids) {
  fs.mkdirSync(RAW_SHOPS_DIR, { recursive: true })
  fs.mkdirSync(SHOPS_DIR, { recursive: true })

  let ok = 0
  let skipped = 0

  for (const [i, uuid] of uuids.entries()) {
    const url = `${SHOP_BASE_URL}/${uuid}`
    const cachePath = path.join(RAW_SHOPS_DIR, `${uuid}.html`)
    process.stdout.write(`[shop ${i + 1}/${uuids.length}] ${uuid} `)

    const { html, status, fromCache } = await fetchAndCache(url, cachePath)
    if (!html) {
      console.log(`-> スキップ (HTTP ${status})`)
      skipped++
      continue
    }

    console.log(fromCache ? '-> キャッシュ利用' : '-> 取得OK')
    const extracted = extractShopDetail(html, uuid, url)
    fs.writeFileSync(path.join(SHOPS_DIR, `${uuid}.json`), JSON.stringify(extracted, null, 2))
    ok++

    if (!fromCache && i < uuids.length - 1) {
      await sleep(DELAY_MS)
    }
  }

  console.log(`店舗詳細ページ: 成功 ${ok}件 / スキップ ${skipped}件`)
}

async function main() {
  const prefix = process.argv[2] ?? ''
  const targets = loadOnairTargets(prefix)
  console.log(`onairページ対象: ${targets.length}件 (prefix: "${prefix}")`)

  await scrapeOnairPages(targets)

  const uuids = collectShopUuids()
  console.log(`店舗詳細ページ対象(重複除去後・累積): ${uuids.length}件`)

  await scrapeShopDetails(uuids)

  console.log('完了')
}

main()
