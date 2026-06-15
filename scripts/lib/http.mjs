import fs from 'node:fs'

export const DELAY_MS = 3000
export const USER_AGENT =
  'magic-restaurant-search-research-bot/0.1 (+https://github.com/himanande/magic-restaurant-search; contact: ikeda3.note@gmail.com)'

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 指定パスにキャッシュがあれば再取得せずそれを使う。
// なければfetchし、成功時のみ書き込む。
export async function fetchAndCache(url, cachePath) {
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
