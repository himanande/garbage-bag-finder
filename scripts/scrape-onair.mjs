// 「魔法のレストラン」公式サイトの放送回ページをスクレイピングするスクリプト。
//
// サイトへの負荷軽減のため:
//   - リクエスト間に DELAY_MS の待機を入れる(逐次実行・同時アクセスなし)
//   - 取得したHTMLは data/raw/ にキャッシュし、再実行時は再取得しない
//   - User-Agent に連絡先を明記
//
// 使い方:
//   node scripts/scrape-onair.mjs [対象日プレフィックス]
//   例: node scripts/scrape-onair.mjs 2026-06   ← 2026年6月分のみ対象
//       node scripts/scrape-onair.mjs           ← data/onair-urls.csv の全件
//
// 出力:
//   - data/raw/<broadcastDate>.html       取得した生HTML(キャッシュ)
//   - data/extracted/<broadcastDate>.json HTMLから抽出した情報(構造調査用)

import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'
import { sleep, fetchAndCache, DELAY_MS } from './lib/http.mjs'

const ROOT = process.cwd()
const CSV_PATH = path.join(ROOT, 'data', 'onair-urls.csv')
const RAW_DIR = path.join(ROOT, 'data', 'raw')
const OUT_DIR = path.join(ROOT, 'data', 'extracted')

const filterPrefix = process.argv[2] ?? ''

export function loadOnairTargets(prefix = '') {
  const lines = fs.readFileSync(CSV_PATH, 'utf-8').trim().split('\n')
  const [, ...rows] = lines
  return rows
    .map((line) => {
      const [broadcastDate, url] = line.split(',')
      return { broadcastDate, url }
    })
    .filter(({ broadcastDate }) => broadcastDate.startsWith(prefix))
}

export function extractOnair(html, broadcastDate, url) {
  const $ = cheerio.load(html)

  // <title>は「{回タイトル} | {番組名} | MBS 毎日放送」の形式
  const [episodeTitle, programTitle] = $('title')
    .text()
    .split('|')
    .map((s) => s.trim())

  // 各お店は <dl><dt class="photo">...</dt><dd>順位(地域)</dd><dd>店名</dd><dd>紹介文</dd></dl>
  const shops = []
  $('dl').each((_, el) => {
    const $dl = $(el)
    const $photo = $dl.find('dt.photo')
    if ($photo.length === 0) return

    const dds = $dl.find('dd').map((_, dd) => $(dd).text().trim()).get()
    const href = $photo.find('a').attr('href') ?? null

    shops.push({
      rankInfo: dds[0] ?? null,
      name: dds[1] ?? $photo.find('img').attr('alt') ?? null,
      menu: dds[2] ?? null,
      detailUrl: href ? new URL(href, url).toString() : null,
      imageUrl: $photo.find('img').attr('data-src') ?? null,
    })
  })

  return {
    broadcastDate,
    url,
    programTitle: programTitle ?? null,
    episodeTitle: episodeTitle ?? null,
    shops,
  }
}

async function main() {
  fs.mkdirSync(RAW_DIR, { recursive: true })
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const targets = loadOnairTargets(filterPrefix)
  console.log(`対象: ${targets.length}件 (prefix: "${filterPrefix}")`)

  let ok = 0
  let skipped = 0

  for (const [i, { broadcastDate, url }] of targets.entries()) {
    const cachePath = path.join(RAW_DIR, `${broadcastDate}.html`)
    process.stdout.write(`[${i + 1}/${targets.length}] ${broadcastDate} `)

    const { html, status, fromCache } = await fetchAndCache(url, cachePath)
    if (!html) {
      console.log(`-> スキップ (HTTP ${status})`)
      skipped++
      continue
    }

    console.log(fromCache ? '-> キャッシュ利用' : '-> 取得OK')
    const extracted = extractOnair(html, broadcastDate, url)
    fs.writeFileSync(
      path.join(OUT_DIR, `${broadcastDate}.json`),
      JSON.stringify(extracted, null, 2)
    )
    ok++

    if (!fromCache && i < targets.length - 1) {
      await sleep(DELAY_MS)
    }
  }

  console.log(`完了: 成功 ${ok}件 / スキップ ${skipped}件`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
