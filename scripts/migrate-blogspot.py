#!/usr/bin/env python3
"""
Migrate Blogspot XML export to Sanity.

Usage:
  1. Export your Blogspot: Settings → Manage Blog → Back up content → Download
  2. Save the .xml file as scripts/blogspot-export.xml
  3. Get a write token from Sanity: sanity.io → project → API → Tokens (add Editor token)
  4. Run:
     NEXT_PUBLIC_SANITY_PROJECT_ID=y5fwmpkn \\
     NEXT_PUBLIC_SANITY_DATASET=production \\
     SANITY_API_TOKEN=your_write_token \\
     python3 scripts/migrate-blogspot.py

Requirements: pip3 install requests beautifulsoup4 lxml
"""

import xml.etree.ElementTree as ET
import json
import re
import os
import sys
from typing import Any

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Missing dependencies. Run: pip3 install requests beautifulsoup4 lxml")
    sys.exit(1)

# --- Config ---
PROJECT_ID = os.environ.get("NEXT_PUBLIC_SANITY_PROJECT_ID", "y5fwmpkn")
DATASET = os.environ.get("NEXT_PUBLIC_SANITY_DATASET", "production")
TOKEN = os.environ.get("SANITY_API_TOKEN", "")
API_VERSION = "2024-01-01"

MUTATIONS_URL = (
    f"https://{PROJECT_ID}.api.sanity.io/v{API_VERSION}/data/mutate/{DATASET}"
)
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json",
}

BLOGSPOT_XML = os.path.join(os.path.dirname(__file__), "blogspot-export.xml")


def slugify(text: str) -> str:
    """Convert text to URL-safe slug."""
    text = text.lower().strip()
    text = re.sub(r"[äöüß]", lambda m: {"ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss"}[m.group()], text)
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text[:80].strip("-")


def html_to_portable_text(html: str) -> list[dict[str, Any]]:
    """Convert HTML body to simplified Portable Text blocks."""
    if not html:
        return []
    soup = BeautifulSoup(html, "lxml")
    blocks: list[dict[str, Any]] = []
    block_index = 0

    def make_block(style: str, text: str, marks: list[str] | None = None) -> dict[str, Any]:
        nonlocal block_index
        block = {
            "_type": "block",
            "_key": f"b{block_index:04d}",
            "style": style,
            "children": [
                {
                    "_type": "span",
                    "_key": f"s{block_index:04d}",
                    "text": text.strip(),
                    "marks": marks or [],
                }
            ],
            "markDefs": [],
        }
        block_index += 1
        return block

    for elem in soup.find_all(["p", "h2", "h3", "h4", "blockquote", "ul", "ol", "li"]):
        tag = elem.name
        text = elem.get_text(separator=" ").strip()
        if not text:
            continue

        if tag == "h2":
            blocks.append(make_block("h2", text))
        elif tag in ("h3", "h4"):
            blocks.append(make_block("h3", text))
        elif tag == "blockquote":
            blocks.append(make_block("blockquote", text))
        elif tag == "p":
            # Skip if it's inside a blockquote (already handled)
            if elem.find_parent("blockquote"):
                continue
            if text:
                blocks.append(make_block("normal", text))
        elif tag in ("li",):
            blocks.append(make_block("normal", f"• {text}"))

    return blocks


def parse_blogspot_xml(filepath: str) -> list[dict[str, Any]]:
    """Parse Blogspot Atom XML and return list of post dicts."""
    if not os.path.exists(filepath):
        print(f"Error: {filepath} not found.")
        print("Export your Blogspot content and save as scripts/blogspot-export.xml")
        sys.exit(1)

    tree = ET.parse(filepath)
    root = tree.getroot()
    ns = {"atom": "http://www.w3.org/2005/Atom"}
    posts = []

    for entry in root.findall("atom:entry", ns):
        # Filter: only actual posts (not pages, comments, settings)
        kind = None
        labels = []
        for cat in entry.findall("atom:category", ns):
            scheme = cat.get("scheme", "")
            term = cat.get("term", "")
            if "kind" in scheme:
                kind = term.split("#")[-1]
            elif "ns#" in scheme:
                labels.append(term)

        if kind != "post":
            continue

        # Skip drafts
        draft_elem = entry.find(".//{http://purl.org/atom/app#}draft")
        if draft_elem is not None and draft_elem.text == "yes":
            continue

        title = entry.findtext("atom:title", "", ns).strip()
        content = entry.findtext("atom:content", "", ns)
        published = entry.findtext("atom:published", "", ns)

        if not title:
            continue

        posts.append({
            "title": title,
            "content": content or "",
            "published": published,
            "labels": labels,
            "slug": slugify(title),
        })

    return posts


def map_label_to_category_slug(label: str) -> str | None:
    """Map Blogspot label to Sanity category slug."""
    label_lower = label.lower()
    mappings = {
        "theologie": "theologie",
        "theology": "theologie",
        "apologetik": "apologetik",
        "apologetics": "apologetik",
        "geistliches leben": "geistliches-leben",
        "spiritual life": "geistliches-leben",
        "kirchengeschichte": "kirchengeschichte",
        "church history": "kirchengeschichte",
    }
    return mappings.get(label_lower)


def fetch_category_ids() -> dict[str, str]:
    """Fetch existing category documents from Sanity to get their _ids."""
    query = '*[_type == "category"] { _id, "slug": slug.current }'
    url = f"https://{PROJECT_ID}.api.sanity.io/v{API_VERSION}/data/query/{DATASET}"
    resp = requests.get(url, params={"query": query}, headers=HEADERS, timeout=15)
    if resp.status_code != 200:
        print(f"Warning: Could not fetch categories: {resp.text}")
        return {}
    result = resp.json().get("result", [])
    return {item["slug"]: item["_id"] for item in result}


def build_sanity_article(
    post: dict[str, Any],
    category_ids: dict[str, str],
) -> dict[str, Any]:
    """Convert a parsed Blogspot post to a Sanity article mutation."""
    body = html_to_portable_text(post["content"])
    doc_id = f"imported-{post['slug']}"

    article: dict[str, Any] = {
        "_type": "article",
        "_id": doc_id,
        "titleDe": post["title"],
        "slug": {"_type": "slug", "current": post["slug"]},
        "publishedAt": post["published"],
        "bodyDe": body,
        "language": "de",
    }

    # Try to assign a category
    for label in post["labels"]:
        cat_slug = map_label_to_category_slug(label)
        if cat_slug and cat_slug in category_ids:
            article["category"] = {
                "_type": "reference",
                "_ref": category_ids[cat_slug],
            }
            break

    return article


def upload_in_batches(articles: list[dict[str, Any]], batch_size: int = 50) -> None:
    """Upload articles to Sanity in batches."""
    total = len(articles)
    for i in range(0, total, batch_size):
        batch = articles[i : i + batch_size]
        mutations = [{"createOrReplace": a} for a in batch]
        resp = requests.post(
            MUTATIONS_URL,
            headers=HEADERS,
            json={"mutations": mutations},
            timeout=30,
        )
        if resp.status_code == 200:
            results = resp.json().get("results", [])
            print(f"  Batch {i // batch_size + 1}: uploaded {len(results)} documents ✓")
        else:
            print(f"  Batch {i // batch_size + 1}: ERROR {resp.status_code}")
            print(f"  {resp.text[:500]}")


def main() -> None:
    if not TOKEN:
        print("Error: SANITY_API_TOKEN is not set.")
        print("Create an Editor token at: sanity.io → your project → API → Tokens")
        sys.exit(1)

    print(f"Migrating to project: {PROJECT_ID} / dataset: {DATASET}")
    print(f"Parsing {BLOGSPOT_XML}...")

    posts = parse_blogspot_xml(BLOGSPOT_XML)
    print(f"Found {len(posts)} posts to migrate.")

    if len(posts) == 0:
        print("Nothing to migrate.")
        return

    print("Fetching existing Sanity categories...")
    category_ids = fetch_category_ids()
    print(f"Found {len(category_ids)} categories: {list(category_ids.keys())}")

    articles = [build_sanity_article(p, category_ids) for p in posts]

    print(f"Uploading {len(articles)} articles...")
    upload_in_batches(articles)

    print("\nMigration complete.")
    print("Open /studio to review imported articles and add excerpts/featured images.")


if __name__ == "__main__":
    main()
