#!/usr/bin/env python3
"""
draft-restaurants.json からアプリ側(src/data/restaurants.json)用の
整形済みJSONを生成する。出力先はコマンドライン引数で指定可能。
"""
import json
import re
import sys

INPUT = 'data/draft-restaurants.json'
OUTPUT = sys.argv[1] if len(sys.argv) > 1 else 'app_restaurants.json'

BREAD_EPISODES = {
    '食のプロが選ぶ！京阪神ホンマに美味しいパン店ランキング',
    '同業店主が選ぶ！京阪神ホンマに美味しいパンランキング',
}

def is_bread(r):
    name = r.get('name', '') or ''
    ep = r.get('_episodeTitle', '') or ''
    if any(w in name for w in ['パン', 'ベーカリー', 'BAKERY', 'BREAD', 'Bakery', 'Bread']):
        return True
    return ep in BREAD_EPISODES

def clean(v):
    if v is None:
        return ''
    return re.sub(r'\s+', ' ', str(v)).strip()

def main():
    with open(INPUT) as f:
        data = json.load(f)

    records = []
    for r in data:
        genre = 'パン・ベーカリー' if is_bread(r) else (r.get('genre') or 'その他')
        rec = {
            'id': r['id'],
            'name': clean(r['name']),
            'genre': genre,
            'region': clean(r.get('region', '')),
            'prefecture': clean(r.get('prefecture', '')),
            'city': clean(r.get('city', '')),
            'address': clean(r.get('address', '')),
            'lat': r.get('lat', 0),
            'lng': r.get('lng', 0),
            'award': clean(r.get('award', '')),
            'broadcastDate': clean(r.get('broadcastDate', '')),
            'description': clean(r.get('description', '')),
        }
        if r.get('imageUrl'):
            rec['imageUrl'] = clean(r['imageUrl'])
        if r.get('_episodeTitle'):
            rec['episodeTitle'] = clean(r['_episodeTitle'])
        if r.get('_rankInfo'):
            rec['rankInfo'] = clean(r['_rankInfo'])
        if r.get('_nearStation'):
            rec['nearStation'] = clean(r['_nearStation'])
        if r.get('_tel'):
            rec['tel'] = clean(r['_tel'])
        if r.get('hotpepperUrl'):
            rec['hotpepperUrl'] = clean(r['hotpepperUrl'])
        records.append(rec)

    with open(OUTPUT, 'w') as f:
        json.dump(records, f, ensure_ascii=False)

    print(f'完了: {len(records)}件 -> {OUTPUT}')

if __name__ == '__main__':
    main()
