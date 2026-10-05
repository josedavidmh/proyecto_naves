import sqlite3
import traceback

try:
    con = sqlite3.connect("game.db")
    cur = con.cursor()
    tables = cur.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()
    print("Tables:", tables)
    for t in tables:
        t_name = t[0]
        cols = cur.execute(f"PRAGMA table_info({t_name});").fetchall()
        print(f"\nTable {t_name}:")
        for col in cols:
            print("  ", col)
        rows = cur.execute(f"SELECT * FROM {t_name} LIMIT 5;").fetchall()
        print(f"  Rows count: {len(rows)}")
        for r in rows:
            print("   ", r)
except Exception as e:
    traceback.print_exc()
