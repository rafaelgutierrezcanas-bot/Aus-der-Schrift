#!/usr/bin/env python3
"""
Remove duplicate h2/h3 blocks that precede a blockquote with the same 📌 prefix.
Applies to all articles.
"""
import os, sys, requests

PROJECT_ID  = "y5fwmpkn"
DATASET     = "production"
TOKEN       = os.environ.get("SANITY_API_TOKEN", "")
API_VERSION = "2024-01-01"

MUTATIONS_URL = f"https://{PROJECT_ID}.api.sanity.io/v{API_VERSION}/data/mutate/{DATASET}"
QUERY_URL     = f"https://{PROJECT_ID}.api.sanity.io/v{API_VERSION}/data/query/{DATASET}"
HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

if not TOKEN:
    print("Error: SANITY_API_TOKEN not set.")
    sys.exit(1)


def first_text(block: dict) -> str:
    children = block.get("children", [])
    return children[0].get("text", "") if children else ""


def remove_heading_duplicates(blocks: list) -> tuple[list, int]:
    """Remove h2/h3 blocks where the next block is a blockquote with the same emoji prefix."""
    cleaned = []
    removed = 0
    i = 0
    while i < len(blocks):
        b = blocks[i]
        if b.get("style") in ("h2", "h3") and i + 1 < len(blocks):
            next_b = blocks[i + 1]
            ft = first_text(b)
            next_ft = first_text(next_b)
            if (
                next_b.get("style") == "blockquote"
                and ft
                and next_ft
                and ft[0] == next_ft[0]
                and ord(ft[0]) > 127  # emoji
            ):
                removed += 1
                i += 1  # skip the h2/h3
                continue
        cleaned.append(b)
        i += 1
    return cleaned, removed


def patch_field(doc_id: str, field: str, blocks: list) -> None:
    r = requests.post(
        MUTATIONS_URL,
        headers=HEADERS,
        json={"mutations": [{"patch": {"id": doc_id, "set": {field: blocks}}}]},
        timeout=30,
    )
    if r.status_code == 200:
        print(f"  ✓ Patched {doc_id} ({field})")
    else:
        print(f"  ✗ Failed {doc_id}: {r.status_code} {r.text[:200]}")


def process_article(slug: str, field: str) -> None:
    resp = requests.get(
        QUERY_URL,
        params={"query": f'*[_type=="article"&&slug.current=="{slug}"][0]{{_id,{field}}}'},
        headers=HEADERS, timeout=15,
    )
    result = resp.json().get("result")
    if not result:
        print(f"  Article not found: {slug}")
        return
    doc_id = result["_id"]
    blocks = result.get(field, []) or []
    cleaned, removed = remove_heading_duplicates(blocks)
    if removed:
        print(f"  Removed {removed} duplicate heading(s) from {slug} ({field})")
        patch_field(doc_id, field, cleaned)
    else:
        print(f"  No duplicates found in {slug} ({field})")


# Fetch all articles
resp = requests.get(
    QUERY_URL,
    params={"query": '*[_type=="article"]{"slug":slug.current}'},
    headers=HEADERS, timeout=15,
)
slugs = [a["slug"] for a in resp.json().get("result", [])]
print(f"Found {len(slugs)} articles\n")

for slug in slugs:
    process_article(slug, "bodyDe")
    process_article(slug, "bodyEn")

print("\nDone.")
