import sqlite3
import sys

conn = sqlite3.connect('foms_mes.db')
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print('Tables:', [t[0] for t in tables])

# Get molds schema
cursor.execute('PRAGMA table_info(molds)')
cols = cursor.fetchall()
print('\nMolds columns:')
for c in cols:
    print(f'  {c[1]} ({c[2]})')

# Check if rayoun_id exists
cursor.execute('PRAGMA table_info(molds)')
has_rayoun_id = any(c[1] == 'rayoun_id' for c in cursor.fetchall())
print(f'\nHas rayoun_id: {has_rayoun_id}')

# Get rayouns schema
cursor.execute('PRAGMA table_info(rayouns)')
cols = cursor.fetchall()
print('\nRayouns columns:')
for c in cols:
    print(f'  {c[1]} ({c[2]})')

conn.close()