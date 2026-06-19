#!/usr/bin/env python3
"""
最初のバグで保存された壊れたレコード(name/addressにHTMLタグ混入)を
修正済みのshops/*.jsonで上書きする。座標もリセットして再ジオコーディング対象にする。
"""
import json, os

DATA_DIR = os.path.dirname(os.path.abspath(__file__)) + '/data'
SHOPS_DIR = f'{DATA_DIR}/shops'
DRAFT_PATH = f'{DATA_DIR}/draft-restaurants.json'

with open(DRAFT_PATH) as f:
    data = json.load(f)

fixed = 0
unfixable = 0
for r in data:
    name = r.get('name') or ''
    addr = r.get('address') or ''
    if '<' not in name and '<' not in addr:
        continue

    shop_path = f'{SHOPS_DIR}/{r["id"]}.json'
    if not os.path.exists(shop_path):
        unfixable += 1
        continue
    with open(shop_path) as f:
        shop = json.load(f)

    new_name = shop.get('name') or ''
    new_addr = shop.get('address') or ''
    if '<' in new_name or '<' in new_addr or not new_name:
        unfixable += 1
        continue

    r['name'] = new_name
    r['address'] = new_addr
    r['_nearStation'] = shop.get('nearStation', '')
    r['_tel'] = shop.get('tel', '')
    r['description'] = f'{new_name}　{r.get("_episodeTitle","")}'
    r['lat'] = 0
    r['lng'] = 0
    fixed += 1

with open(DRAFT_PATH, 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'修正: {fixed}件')
print(f'修正不可(shop詳細も壊れているか欠損): {unfixable}件')
