#!/usr/bin/env python3
"""
HotPepper Gourmet API(店名検索が不安定なため緯度経度ベース)で
各店舗のHotPepperページURLを取得し、draft-restaurants.jsonに
hotpepperUrlフィールドとして付与する。

店名キーワード検索は表記揺れで一致率が低いため、座標+半径で
近隣店舗を取得し、店名の正規化マッチングで確認する方式を採用。
誤リンクを避けるため、確信度の低いものはリンクしない。
"""
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

API_KEY = os.environ.get('HOTPEPPER_API_KEY')
if not API_KEY:
    print('環境変数 HOTPEPPER_API_KEY が未設定です', file=sys.stderr)
    sys.exit(1)

DATA_PATH = 'data/draft-restaurants.json'
ENDPOINT = 'http://webservice.recruit.co.jp/hotpepper/gourmet/v1/'

BRANCH_WORDS = ['本店', '支店', '本館', '別館', '出店', '直営店']

def normalize(name):
    name = name or ''
    name = re.sub(r'[\s　]+', '', name)
    name = re.sub(r'[(（].*?[)）]', '', name)
    for w in BRANCH_WORDS:
        name = name.replace(w, '')
    return name.lower()

def is_match(our_name, their_name):
    a, b = normalize(our_name), normalize(their_name)
    if not a or not b:
        return False
    if a == b:
        return True
    # 片方がもう片方を包含(支店名等の差異を許容)、ただし極端に短い一致は除外
    shorter, longer = (a, b) if len(a) <= len(b) else (b, a)
    if len(shorter) >= 3 and shorter in longer:
        return True
    return False

def fetch_nearby(lat, lng):
    params = urllib.parse.urlencode({
        'key': API_KEY, 'lat': lat, 'lng': lng, 'range': 3,
        'count': 20, 'format': 'json',
    })
    url = f'{ENDPOINT}?{params}'
    try:
        with urllib.request.urlopen(url, timeout=10) as r:
            data = json.loads(r.read())
        return data.get('results', {}).get('shop', [])
    except Exception as e:
        print(f'  APIエラー: {e}', file=sys.stderr)
        return []

def clean_url(url):
    if not url:
        return None
    return url.split('?')[0]

def main():
    with open(DATA_PATH) as f:
        data = json.load(f)

    # 店名でユニーク化(座標があるもののみ)
    unique = {}
    for r in data:
        if r.get('lat', 0) != 0 and r['name'] not in unique:
            unique[r['name']] = r

    targets = list(unique.items())
    print(f'対象: {len(targets)}件')

    name_to_url = {}
    matched = 0
    for i, (name, r) in enumerate(targets):
        shops = fetch_nearby(r['lat'], r['lng'])
        found = None
        for shop in shops:
            if is_match(name, shop.get('name', '')):
                found = shop
                break
        if found:
            name_to_url[name] = clean_url(found['urls']['pc'])
            matched += 1
            print(f'[{i+1}/{len(targets)}] OK  {name} -> {found["name"]}', flush=True)
        else:
            print(f'[{i+1}/{len(targets)}] --  {name}', flush=True)
        time.sleep(1)

    # 全レコードに反映(同じ店名の全appearanceに同じURLを付与)
    applied = 0
    for r in data:
        if r['name'] in name_to_url:
            r['hotpepperUrl'] = name_to_url[r['name']]
            applied += 1

    with open(DATA_PATH, 'w') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f'\nマッチ: {matched}/{len(targets)}店舗, 適用レコード: {applied}件')

if __name__ == '__main__':
    main()
