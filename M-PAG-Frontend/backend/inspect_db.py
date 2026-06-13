import sqlite3
import os

path = os.path.join(os.getcwd(), 'db.sqlite3')
print('DB path:', path)
conn = sqlite3.connect(path)
c = conn.cursor()
print('\nTABLES:')
for row in c.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"):
    print(row[0])

print('\nKEY PILLARS:')
for row in c.execute(
    "SELECT id, name, code, pillar_type FROM mpage_keypillar "
    "WHERE code IN ('governance','organizational','legal','technical','human','financial') "
    "ORDER BY id"
):
    print(row)

print('\nREADINESS LEVELS:')
for row in c.execute(
    "SELECT r.id, r.campaign_id, k.code, k.name, r.score "
    "FROM mpage_readinesslevel r "
    "JOIN mpage_keypillar k ON r.key_pillar_id = k.id "
    "WHERE k.code IN ('governance','organizational','legal','technical','human','financial') "
    "ORDER BY r.id"
):
    print(row)

conn.close()
