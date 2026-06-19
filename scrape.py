#!/usr/bin/env python3
"""
2段階スクレイピング:
  Phase 1: 未収集のonairページHTMLを取得
  Phase 2: 未収集のshop詳細ページを取得
"""
import csv, json, os, re, time, urllib.request, sys

DATA_DIR = os.path.dirname(os.path.abspath(__file__)) + '/data'
RAW_DIR = f'{DATA_DIR}/raw'
SHOPS_DIR = f'{DATA_DIR}/shops'
URLS_CSV = f'{DATA_DIR}/onair-urls.csv'

import subprocess

def fetch(url):
    result = subprocess.run(
        ['curl', '-4', '-s', '-A', 'Mozilla/5.0', '-w', '\n__STATUS__%{http_code}', '--max-time', '10', url],
        capture_output=True, text=True
    )
    output = result.stdout
    if '\n__STATUS__' in output:
        body, status = output.rsplit('\n__STATUS__', 1)
        if status.strip() == '200':
            return body
    return None

def extract_shop_ids(html):
    return list(dict.fromkeys(re.findall(
        r'/shops/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})',
        html
    )))

# ---- Phase 1: onairページHTML取得 ----
print('=== Phase 1: onairページ取得 ===')
with open(URLS_CSV) as f:
    all_urls = list(csv.DictReader(f))

missing_onair = [r for r in all_urls if not os.path.exists(f'{RAW_DIR}/{r["broadcastDate"]}.html')]
print(f'未収集: {len(missing_onair)}件')

if missing_onair:
    for i, row in enumerate(missing_onair):
        date = row['broadcastDate']
        html = fetch(row['url'])
        if html:
            with open(f'{RAW_DIR}/{date}.html', 'w') as f:
                f.write(html)
            shops = extract_shop_ids(html)
            print(f'[{i+1}/{len(missing_onair)}] OK  {date} ({len(shops)}店舗)', flush=True)
        else:
            print(f'[{i+1}/{len(missing_onair)}] NG  {date}', flush=True)
        time.sleep(1)
else:
    print('スキップ（全件収集済み）')

# ---- Phase 2: shop詳細ページ取得 ----
print('\n=== Phase 2: shop詳細取得 ===')
all_shop_ids = set()
for raw_file in os.listdir(RAW_DIR):
    if not raw_file.endswith('.html'):
        continue
    with open(f'{RAW_DIR}/{raw_file}') as f:
        all_shop_ids.update(extract_shop_ids(f.read()))

existing_shops = set(f.replace('.json', '') for f in os.listdir(SHOPS_DIR) if f.endswith('.json'))
missing_shops = [sid for sid in all_shop_ids if sid not in existing_shops]
print(f'新規shop: {len(missing_shops)}件')

def parse_shop_html(html, uuid):
    # 店名: <title>店名 | 水野真紀の魔法のレストラン...
    m = re.search(r'<title>(.*?)\s*\|', html)
    name = m.group(1).strip() if m else ''

    # dt/dd形式で詳細を取得
    dt_dd = re.findall(r'<dt[^>]*>(.*?)</dt>\s*<dd[^>]*>(.*?)</dd>', html, re.DOTALL)
    fields = {}
    for k, v in dt_dd:
        key = re.sub(r'<[^>]+>', '', k).strip()
        val = re.sub(r'<[^>]+>', '', v).strip()
        if key:
            fields[key] = val

    # broadcastInfo: dt/dd内の放送日情報
    broadcast_info = []
    for k, v in dt_dd:
        if not re.sub(r'<[^>]+>', '', k).strip():
            text = re.sub(r'<[^>]+>', ' ', v)
            text = re.sub(r'\s+', ' ', text).strip()
            if '年' in text and '放送' in text:
                broadcast_info.append(text)

    return {
        'uuid': uuid,
        'url': f'https://mahou-contents.mbs.jp/shops/{uuid}',
        'name': name,
        'address': fields.get('住所', ''),
        'tel': fields.get('電話番号', ''),
        'nearStation': fields.get('最寄り駅', ''),
        'broadcastInfo': broadcast_info,
    }

for i, sid in enumerate(missing_shops):
    url = f'https://mahou-contents.mbs.jp/shops/{sid}'
    html = fetch(url)
    if html:
        data = parse_shop_html(html, sid)
        with open(f'{SHOPS_DIR}/{sid}.json', 'w') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f'[{i+1}/{len(missing_shops)}] OK  {data.get("name","?")}', flush=True)
    else:
        print(f'[{i+1}/{len(missing_shops)}] NG  {sid}', flush=True)
    time.sleep(1)

print('\n完了')
