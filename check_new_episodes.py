#!/usr/bin/env python3
"""
onair-urls.csvの最新日付より後の水曜日をチェックし、
新しい放送回(お店紹介ページが存在するもの)があればCSVに追記する。
週次の自動実行を想定(GitHub Actions等)。IPv4強制で接続を高速化。
"""
import csv
import datetime
import socket
import subprocess

CSV_PATH = 'data/onair-urls.csv'

_orig_getaddrinfo = socket.getaddrinfo
def _ipv4_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    return _orig_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)
socket.getaddrinfo = _ipv4_getaddrinfo

def check(date_str):
    url = f'https://mahou-contents.mbs.jp/shops/onair/{date_str}'
    result = subprocess.run(
        ['curl', '-4', '-s', '-o', '/dev/null', '-w', '%{http_code}', '-A', 'Mozilla/5.0', '--max-time', '10', url],
        capture_output=True, text=True
    )
    return result.stdout.strip() == '200'

def main():
    with open(CSV_PATH) as f:
        rows = list(csv.DictReader(f))
    existing_dates = {r['broadcastDate'] for r in rows}

    latest = max(existing_dates)
    latest_dt = datetime.date.fromisoformat(latest)
    today = datetime.date.today()

    new_rows = []
    d = latest_dt + datetime.timedelta(days=7)
    while d <= today:
        date_str = d.isoformat()
        if date_str not in existing_dates:
            if check(date_str):
                new_rows.append({'broadcastDate': date_str, 'url': f'https://mahou-contents.mbs.jp/shops/onair/{date_str}'})
                print(f'新着放送回を発見: {date_str}')
            else:
                print(f'お店紹介なし: {date_str}')
        d += datetime.timedelta(days=7)

    if new_rows:
        all_rows = new_rows + rows  # 新しい日付を先頭に
        with open(CSV_PATH, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=['broadcastDate', 'url'])
            writer.writeheader()
            writer.writerows(all_rows)
        print(f'{len(new_rows)}件の新着放送回をCSVに追加しました')
    else:
        print('新着放送回はありませんでした')

if __name__ == '__main__':
    main()
