import sqlite3
import os

base = os.getcwd()
db_paths = [
    os.path.join(base, 'db.sqlite3'),
    os.path.abspath(os.path.join(base, '..', '..', 'OPAGe-Platform', 'db.sqlite3')),
]
for path in db_paths:
    print('DB path:', path)
    if not os.path.exists(path):
        print('  not found')
        continue
    conn = sqlite3.connect(path)
    c = conn.cursor()
    try:
        rows = c.execute('SELECT id, name, code, pillar_type FROM mpage_keypillar ORDER BY id').fetchall()
        print('  key pillars:')
        for row in rows:
            print('   ', row)
    except Exception as e:
        print('  error reading key pillars:', e)
    conn.close()
