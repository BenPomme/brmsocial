#!/usr/bin/env python3
"""Google Autocomplete fan-out. Hit counts are Proxy typed demand, not volume."""

from __future__ import annotations

import argparse
import collections
import json
import sys
import time
import urllib.parse
import urllib.request

UA = "Mozilla/5.0 (compatible; BabyRockSEO/1.0)"
AZ = "abcdefghijklmnopqrstuvwxyz"
PREFIXES = ("how to", "how", "can i", "can you", "what is", "does", "do", "should you", "why")


def suggest(q: str, hl: str, gl: str) -> list[str]:
    url = (
        "https://suggestqueries.google.com/complete/search"
        f"?client=firefox&hl={urllib.parse.quote(hl)}&gl={urllib.parse.quote(gl)}"
        f"&q={urllib.parse.quote(q)}"
    )
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=12) as r:
            data = json.loads(r.read().decode("utf-8"))
    except Exception as e:
        print(f"warn: {q!r} -> {e}", file=sys.stderr)
        return []
    if isinstance(data, list) and len(data) > 1 and isinstance(data[1], list):
        return [str(x) for x in data[1]]
    return []


def fanout(seed: str) -> list[str]:
    queries = [seed]
    queries += [f"{seed} {c}" for c in AZ]
    queries += [f"{p} {seed}" for p in PREFIXES]
    return queries


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--seed", required=True)
    p.add_argument("--hl", default="en")
    p.add_argument("--gl", default="us")
    p.add_argument("--sleep", type=float, default=0.05)
    p.add_argument("--top", type=int, default=15)
    args = p.parse_args()

    counts: collections.Counter[str] = collections.Counter()
    seen: set[str] = set()
    for q in fanout(args.seed.strip()):
        time.sleep(args.sleep)
        for s in suggest(q, args.hl, args.gl):
            sl = s.lower().strip()
            if not sl:
                continue
            seen.add(sl)
            counts[sl] += 1

    print(f"seed: {args.seed}")
    print(f"market: hl={args.hl} gl={args.gl}")
    print(f"unique: {len(seen)}")
    print("volume: Proxy (autocomplete hits), not monthly volume")
    print("top:")
    for term, n in counts.most_common(args.top):
        print(f"  {n:3d}  {term}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
