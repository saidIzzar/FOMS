import sqlite3
conn = sqlite3.connect('foms_mes.db')
cursor = conn.cursor()
cursor.execute('SELECT name FROM sqlite_master WHERE type="table"')
tables = [r[0] for r in cursor.fetchall()]
print("Tables:", tables)
for t in ['rayouns', 'boxes', 'molds']:
    if t in tables:
        cursor.execute(f'SELECT COUNT(*) FROM {t}')
        print(f"{t}: {cursor.fetchone()[0]}")
conn.close()