#!/usr/bin/env python3
"""
raw/*.html (onairページ) + shops/*.json (店舗詳細) から
draft-restaurants.json と同じ形式のレコードを生成してマージする
"""
import json, os, re, glob

DATA_DIR = os.path.dirname(os.path.abspath(__file__)) + '/data'
RAW_DIR = f'{DATA_DIR}/raw'
SHOPS_DIR = f'{DATA_DIR}/shops'
DRAFT_PATH = f'{DATA_DIR}/draft-restaurants.json'

PREF_TO_REGION = {
    '北海道': '北海道・東北', '青森県': '北海道・東北', '岩手県': '北海道・東北', '宮城県': '北海道・東北',
    '秋田県': '北海道・東北', '山形県': '北海道・東北', '福島県': '北海道・東北',
    '茨城県': '関東', '栃木県': '関東', '群馬県': '関東', '埼玉県': '関東', '千葉県': '関東',
    '東京都': '関東', '神奈川県': '関東',
    '新潟県': '中部', '富山県': '中部', '石川県': '中部', '福井県': '中部', '山梨県': '中部',
    '長野県': '中部', '岐阜県': '中部', '静岡県': '中部', '愛知県': '中部',
    '三重県': '関西', '滋賀県': '関西', '京都府': '関西', '大阪府': '関西', '兵庫県': '関西',
    '奈良県': '関西', '和歌山県': '関西',
    '鳥取県': '中国・四国', '島根県': '中国・四国', '岡山県': '中国・四国', '広島県': '中国・四国',
    '山口県': '中国・四国', '徳島県': '中国・四国', '香川県': '中国・四国', '愛媛県': '中国・四国',
    '高知県': '中国・四国',
    '福岡県': '九州・沖縄', '佐賀県': '九州・沖縄', '長崎県': '九州・沖縄', '熊本県': '九州・沖縄',
    '大分県': '九州・沖縄', '宮崎県': '九州・沖縄', '鹿児島県': '九州・沖縄', '沖縄県': '九州・沖縄',
}
PREF_PATTERN = re.compile('(' + '|'.join(PREF_TO_REGION.keys()) + ')(.+)')

GENRE_KEYWORDS = [
    ('パン・ベーカリー', ['パン', 'ベーカリー', 'BAKERY', 'BREAD', 'ボワン', 'ブーランジェリー']),
    ('ラーメン', ['ラーメン', '中華そば', 'らぁめん', '麺屋']),
    ('うどん・そば', ['うどん', 'そば', '蕎麦']),
    ('焼肉', ['焼肉', 'ホルモン', '牛角', ' 韓国', '韓国食堂']),
    ('寿司・海鮮', ['寿司', '鮨', '海鮮', '魚', '鮮魚']),
    ('お好み焼き・粉もん', ['お好み焼', '粉もん', 'たこ焼', 'もんじゃ']),
    ('中華', ['中華', '飯店', '餃子', '王将', '珉珉']),
    ('イタリアン', ['イタリアン', 'パスタ', 'ピッツァ', 'ピザ']),
    ('フレンチ', ['フレンチ', 'ビストロ', 'シュクレ']),
    ('カレー', ['カレー']),
    ('スイーツ・カフェ', ['カフェ', '喫茶', 'スイーツ', 'ケーキ', 'パフェ', 'プリン']),
    ('居酒屋・バル', ['居酒屋', 'バル', '酒場']),
    ('スーパー・量販店', ['スーパー', 'コストコ', 'ロピア', 'イオン', '無印良品', 'ニトリ', 'カルディ', '成城石井', 'ライフ', 'コンビニ', 'ローソン', 'ファミリーマート', 'セブン', 'Seria']),
    ('洋食', ['洋食', 'オムライス', 'ビフテキ', 'ステーキ', 'ハンバーグ']),
    ('和食・割烹', ['割烹', '定食', '食堂', '和食']),
    ('郷土料理', ['郷土料理']),
]

def classify_genre(name, rank_info, episode_title):
    haystack = f'{name} {rank_info} {episode_title}'
    for genre, keywords in GENRE_KEYWORDS:
        if any(kw in haystack for kw in keywords):
            return genre
    return 'その他'

def parse_location(address):
    if not address:
        return '不明', '不明', '不明'
    m = PREF_PATTERN.match(address)
    if not m:
        return '不明', '不明', '不明'
    pref = m.group(1)
    rest = m.group(2)
    region = PREF_TO_REGION.get(pref, '不明')
    city_m = re.match(r'([^\d０-９]+?[市区町村])', rest)
    city = city_m.group(1) if city_m else ''
    return region, pref, city

def extract_onair_shops(html):
    """onairページHTMLから (shop_uuid, rankInfo) のリストとepisodeTitleを取る"""
    title_m = re.search(r'<title>(.*?)\s*\|', html)
    episode_title = title_m.group(1).strip() if title_m else ''

    shop_ids = re.findall(r'/shops/([0-9a-f-]{36})', html)
    seen = []
    for sid in shop_ids:
        if sid not in seen:
            seen.append(sid)
    return episode_title, seen

def main():
    with open(DRAFT_PATH) as f:
        existing = json.load(f)
    existing_keys = set((r['id'], r['broadcastDate']) for r in existing)

    shop_cache = {}
    new_records = []
    skipped_no_shop = 0

    raw_files = sorted(glob.glob(f'{RAW_DIR}/*.html'))
    for raw_path in raw_files:
        date = os.path.basename(raw_path).replace('.html', '')
        with open(raw_path) as f:
            html = f.read()
        episode_title, shop_ids = extract_onair_shops(html)

        for sid in shop_ids:
            key = (sid, date)
            if key in existing_keys:
                continue

            if sid not in shop_cache:
                shop_path = f'{SHOPS_DIR}/{sid}.json'
                if not os.path.exists(shop_path):
                    skipped_no_shop += 1
                    continue
                with open(shop_path) as f:
                    shop_cache[sid] = json.load(f)
            shop = shop_cache[sid]

            name = shop.get('name', '')
            if not name:
                continue
            address = shop.get('address', '')
            region, pref, city = parse_location(address)

            # rankInfoはbroadcastInfoの該当日のものを使う(なければ空)
            rank_info = ''
            for info in shop.get('broadcastInfo', []):
                if date.replace('-', '') in info.replace('年','').replace('月','').replace('日',''):
                    rank_info = info
                    break

            genre = classify_genre(name, rank_info, episode_title)

            record = {
                'id': sid,
                'name': name,
                'genre': genre,
                'region': region,
                'prefecture': pref,
                'city': city,
                'address': address,
                'lat': 0,
                'lng': 0,
                'award': f'{episode_title}'.strip(),
                'broadcastDate': date,
                'description': f'{name}　{episode_title}',
                '_episodeTitle': episode_title,
                '_rankInfo': rank_info,
                '_nearStation': shop.get('nearStation', ''),
                '_tel': shop.get('tel', ''),
            }
            new_records.append(record)
            existing_keys.add(key)

    print(f'新規レコード: {len(new_records)}件')
    print(f'shop詳細未取得でスキップ: {skipped_no_shop}件')

    merged = existing + new_records
    with open(DRAFT_PATH, 'w') as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)
    print(f'マージ後合計: {len(merged)}件')

if __name__ == '__main__':
    main()
