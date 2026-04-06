#!/usr/bin/env python3
"""
Fix article body issues:
1. lehrt-die-didache: remove duplicate h3 block (b0000) that mirrors the blockquote
2. aus-wasser-und-geist: remove manual Inhaltsverzeichnis (b0000-b0003)
"""
import os, sys, requests

PROJECT_ID  = "y5fwmpkn"
DATASET     = "production"
TOKEN       = os.environ.get("SANITY_API_TOKEN", "")
API_VERSION = "2024-01-01"

MUTATIONS_URL = f"https://{PROJECT_ID}.api.sanity.io/v{API_VERSION}/data/mutate/{DATASET}"
QUERY_URL     = f"https://{PROJECT_ID}.api.sanity.io/v{API_VERSION}/data/query/{DATASET}"
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json",
}

if not TOKEN:
    print("Error: SANITY_API_TOKEN not set.")
    sys.exit(1)


def fetch_body(slug: str, field: str = "bodyDe") -> tuple[str, list]:
    resp = requests.get(
        QUERY_URL,
        params={"query": f'*[_type=="article"&&slug.current=="{slug}"][0]{{_id,{field}}}'},
        headers=HEADERS, timeout=15,
    )
    data = resp.json()["result"]
    return data["_id"], data.get(field, [])


def patch(doc_id: str, field: str, blocks: list) -> None:
    r = requests.post(
        MUTATIONS_URL,
        headers=HEADERS,
        json={"mutations": [{"patch": {"id": doc_id, "set": {field: blocks}}}]},
        timeout=30,
    )
    if r.status_code == 200:
        print(f"  ✓ Patched {doc_id} ({field})")
    else:
        print(f"  ✗ Failed: {r.status_code} {r.text[:300]}")


# ── Fix 1: lehrt-die-didache ─────────────────────────────────────────────────
print("Fix 1: lehrt-die-didache-die-saeuglingstaufe")
doc_id, body = fetch_body("lehrt-die-didache-die-saeuglingstaufe")
print(f"  Body blocks: {len(body)}")
print(f"  Block 0 style: {body[0]['style'] if body else 'n/a'}")
print(f"  Block 1 style: {body[1]['style'] if len(body) > 1 else 'n/a'}")

if body and body[0]["style"] in ("h2", "h3"):
    # Check if block 1 is blockquote and contains similar content
    b0_text = "".join(c.get("text", "") for c in body[0].get("children", []))
    b1_text = "".join(c.get("text", "") for c in body[1].get("children", [])) if len(body) > 1 else ""
    # Both start with ❓ — confirmed duplicate
    if b0_text.startswith("\u2753") and b1_text.startswith("\u2753"):
        print(f"  Removing duplicate h3/h2 block (text: {b0_text[:40]!r}...)")
        patch(doc_id, "bodyDe", body[1:])
    else:
        print(f"  Block 0 and 1 don't look like duplicates, skipping.")
else:
    print(f"  Block 0 is not h2/h3, skipping.")

# Also fix bodyEn if it has the same pattern
print("  Checking bodyEn...")
doc_id, body_en = fetch_body("lehrt-die-didache-die-saeuglingstaufe", "bodyEn")
if body_en and body_en[0]["style"] in ("h2", "h3"):
    b0_text = "".join(c.get("text", "") for c in body_en[0].get("children", []))
    b1_text = "".join(c.get("text", "") for c in body_en[1].get("children", [])) if len(body_en) > 1 else ""
    if b0_text.startswith("\u2753") and b1_text.startswith("\u2753"):
        print(f"  Removing duplicate h3/h2 block from bodyEn...")
        patch(doc_id, "bodyEn", body_en[1:])
    else:
        print(f"  bodyEn blocks don't look like duplicates, skipping.")
else:
    print(f"  bodyEn block 0 is not h2/h3, skipping.")

print()

# ── Fix 2: aus-wasser-und-geist ──────────────────────────────────────────────
print("Fix 2: aus-wasser-und-geist-was-meinte-jesus-in-johannes-35")
doc_id, body = fetch_body("aus-wasser-und-geist-was-meinte-jesus-in-johannes-35")
print(f"  Body blocks: {len(body)}")

# Find the manual TOC: h2 "Inhaltsverzeichnis" followed by numbered plain paragraphs
if body and body[0]["style"] == "h2":
    b0_text = "".join(c.get("text", "") for c in body[0].get("children", []))
    if "Inhaltsverzeichnis" in b0_text:
        # Count how many TOC items follow (numbered normal blocks like "1. ...", "2. ...")
        toc_end = 1  # start after h2
        import re
        while toc_end < len(body) and body[toc_end]["style"] == "normal":
            t = "".join(c.get("text", "") for c in body[toc_end].get("children", []))
            if re.match(r"^\d+\.", t.strip()):
                toc_end += 1
            else:
                break
        print(f"  Removing {toc_end} TOC blocks (Inhaltsverzeichnis + {toc_end-1} items)")
        patch(doc_id, "bodyDe", body[toc_end:])
    else:
        print(f"  Block 0 is h2 but not 'Inhaltsverzeichnis', skipping.")
else:
    print(f"  Block 0 is not h2, skipping.")

# Also fix bodyEn
print("  Checking bodyEn...")
doc_id, body_en = fetch_body("aus-wasser-und-geist-was-meinte-jesus-in-johannes-35", "bodyEn")
if body_en and body_en[0]["style"] == "h2":
    b0_text = "".join(c.get("text", "") for c in body_en[0].get("children", []))
    if "Contents" in b0_text or "Inhaltsverzeichnis" in b0_text or "Table" in b0_text:
        toc_end = 1
        import re
        while toc_end < len(body_en) and body_en[toc_end]["style"] == "normal":
            t = "".join(c.get("text", "") for c in body_en[toc_end].get("children", []))
            if re.match(r"^\d+\.", t.strip()):
                toc_end += 1
            else:
                break
        print(f"  Removing {toc_end} TOC blocks from bodyEn")
        patch(doc_id, "bodyEn", body_en[toc_end:])
    else:
        print(f"  bodyEn block 0 doesn't look like TOC, skipping.")
else:
    print(f"  bodyEn block 0 is not h2, skipping.")

print("\nDone.")
