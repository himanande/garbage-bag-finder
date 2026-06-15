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

const ROOT = process.cwd()
const CSV_PATH = path.join(ROOT, 'data', 'onair-urls.csv')
const RAW_DIR = path.join(ROOT, 'data', 'raw')
const OUT_DIR = path.join(ROOT, 'data', 'extracted')

const DELAY_MS = 3000
const USER_AGENT =
  'magic-restaurant-search-research-bot/0.1 (+https://github.com/himanande/magic-restaurant-search; contact: ikeda3.note@gmail.com)'

const filterPrefix = process.argv[2] ?? ''

function loadTargets() {
  const lines = fs.readFileSync(CSV_PATH, 'utf-8').trim().split('\n')
  const [, ...rows] = lines
  return rows
    .map((line) => {
      const [broadcastDate, url] = line.split(',')
      return { broadcastDate, url }
    })
    .filter(({ broadcastDate }) => broadcastDate.startsWith(filterPrefix))
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchAndCache(url, cachePath) {
  if (fs.existsSync(cachePath)) {
    return { html: fs.readFileSync(cachePath, 'utf-8'), fromCache: true }
  }

  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok) {
    return { html: null, status: res.status, fromCache: false }
  }

  const html = await res.text()
  fs.writeFileSync(cachePath, html)
  return { html, fromCache: false }
}

// ページ構造がまだ不明なため、まずは構造調査に使える情報を広く抽出する。
function extract(html, broadcastDate, url) {
  const $ = cheerio.load(html)

  const jsonLd = []
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      jsonLd.push(JSON.parse($(el).text()))
    } catch {
      // 不正なJSON-LDは無視
    }
  })

  return {
    broadcastDate,
    url,
    title: $('title').text().trim(),
    ogTitle: $('meta[property="og:title"]').attr('content') ?? null,
    description: $('meta[name="description"]').attr('content') ?? null,
    headings: $('h1, h2, h3').map((_, el) => $(el).text().trim()).get(),
    jsonLd,
  }
}

async function main() {
  fs.mkdirSync(RAW_DIR, { recursive: true })
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const targets = loadTargets()
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
    const extracted = extract(html, broadcastDate, url)
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

main()
