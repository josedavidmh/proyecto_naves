import sqlite3
import os

for root, dirs, files in os.walk("."):
    for f in files:
        if f.endswith(".db"):
            path = os.path.join(root, f)
            print("Found DB:", path, "Size:", os.path.getsize(path))
            con = sqlite3.connect(path)
            cur = con.cursor()
            cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = [r[0] for r in cur.fetchall()]
            print("  Tables:", tables)
            if "users" in tables:
                cur.execute("SELECT id, username, email FROM users")
                print("  Users:", cur.fetchall())
