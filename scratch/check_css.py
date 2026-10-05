import re

with open("frontend/index.html", "r", encoding="utf-8") as f:
    html = f.read()

with open("frontend/css/style.css", "r", encoding="utf-8") as f:
    css = f.read()

classes = set()
for match in re.finditer(r'class=["\']([^"\']+)["\']', html):
    for c in match.group(1).split():
        classes.add(c)

missing = sorted([c for c in classes if f".{c}" not in css and f"{c}:" not in css])
print("Missing classes count:", len(missing))
for m in missing:
    print(" -", m)
