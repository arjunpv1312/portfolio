import os
import rcssmin
import rjsmin

BASE = os.path.dirname(__file__)

def minify_assets():
    pairs = [
        (
            os.path.join(BASE, 'static', 'css', 'style.css'),
            os.path.join(BASE, 'static', 'css', 'style.min.css'),
        ),
        (
            os.path.join(BASE, 'static', 'js', 'main.js'),
            os.path.join(BASE, 'static', 'js', 'main.min.js'),
        ),
    ]
    for src, dst in pairs:
        with open(src, 'r', encoding='utf-8') as f:
            raw = f.read()
        if src.endswith('.css'):
            minified = rcssmin.cssmin(raw)
        else:
            minified = rjsmin.jsmin(raw)
        with open(dst, 'w', encoding='utf-8') as f:
            f.write(minified)
        orig_kb  = len(raw.encode()) / 1024
        mini_kb  = len(minified.encode()) / 1024
        saved_pct = 100 * (1 - mini_kb / orig_kb)
        print(f"  {os.path.basename(src):20s}  {orig_kb:7.1f} KB  →  {mini_kb:7.1f} KB  ({saved_pct:.0f}% saved)")

if __name__ == '__main__':
    print("Building minified assets…")
    minify_assets()
    print("Done.")
