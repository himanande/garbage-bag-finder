#!/usr/bin/env python3
"""
政令指定都市(大阪市・京都市・神戸市・堺市等)で「OO市」止まりだったcityを
「OO市XX区」まで再パースする。merge.py/fix_location.pyの簡易regexが
区を読み取れていなかったケースの補完。
"""
import json, re

DATA_PATH = 'data/draft-restaurants.json'

PREF_KEYS = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県',
    '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
    '鳥取県', '島根県', '岡山県', '広島県', '山口県', '徳島県', '香川県', '愛媛県', '高知県',
    '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
]
PREF_PATTERN = re.compile('(' + '|'.join(PREF_KEYS) + ')(.+)')

def parse_city(rest):
    city_m = re.match(r'([^\d０-９]+?[市区町村])', rest)
    city = city_m.group(1) if city_m else ''
    if city.endswith('市'):
        ward_m = re.match(r'^([^\d０-９]+?区)', rest[len(city):])
        if ward_m:
            city = city + ward_m.group(1)
    return city

def main():
    with open(DATA_PATH) as f:
        data = json.load(f)

    updated = 0
    for r in data:
        addr = (r.get('address') or '').strip()
        if not addr:
            continue
        m = PREF_PATTERN.match(addr)
        if m:
            rest = m.group(2)
        elif r.get('prefecture') and r['prefecture'] != '不明' and r.get('city'):
            rest = addr
        else:
            continue

        new_city = parse_city(rest)
        if new_city and new_city != r.get('city'):
            r['city'] = new_city
            updated += 1

    with open(DATA_PATH, 'w') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f'更新: {updated}件')

if __name__ == '__main__':
    main()
