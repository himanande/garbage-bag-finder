#!/usr/bin/env python3
import json
import socket
import time
import urllib.request
import urllib.parse

# IPv6のHappy Eyeballsフォールバック待ちで毎回5秒かかるためIPv4を強制
_orig_getaddrinfo = socket.getaddrinfo
def _ipv4_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    return _orig_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)
socket.getaddrinfo = _ipv4_getaddrinfo

INPUT = 'data/draft-restaurants.json'
OUTPUT = 'data/draft-restaurants-geocoded.json'

with open(INPUT) as f:
    data = json.load(f)

total = len(data)
success = 0
failed = []

for i, r in enumerate(data):
    if r.get('lat', 0) != 0 or r.get('lng', 0) != 0:
        success += 1
        continue

    address = r.get('address', '').strip()
    if not address:
        failed.append(r['name'])
        continue

    query = urllib.parse.quote(address)
    url = f'https://msearch.gsi.go.jp/address-search/AddressSearch?q={query}'

    try:
        with urllib.request.urlopen(url, timeout=10) as res:
            results = json.loads(res.read())
        if results:
            coords = results[0]['geometry']['coordinates']  # [lng, lat]
            r['lng'] = coords[0]
            r['lat'] = coords[1]
            success += 1
            print(f'[{i+1}/{total}] OK  {r["name"]} → {r["lat"]:.4f}, {r["lng"]:.4f}')
        else:
            failed.append(r['name'])
            print(f'[{i+1}/{total}] NG  {r["name"]} (住所: {address})')
    except Exception as e:
        failed.append(r['name'])
        print(f'[{i+1}/{total}] ERR {r["name"]}: {e}')

    time.sleep(1)

with open(OUTPUT, 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'\n完了: {success}/{total}件取得, 失敗: {len(failed)}件')
if failed:
    print('座標取得失敗:')
    for name in failed:
        print(f'  - {name}')
