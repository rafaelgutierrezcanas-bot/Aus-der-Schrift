#!/usr/bin/env python3
"""
Migrate Blogspot XML export to Sanity.

Usage:
  1. Export your Blogspot: Settings → Manage Blog → Back up content → Download
  2. Save the .xml file as scripts/blogspot-export.xml
  3. Get a write token from Sanity: sanity.io → project y5fwmpkn → API → Tokens → Add Editor token
  4. Run:
     SANITY_API_TOKEN=your_write_token python3 scripts/migrate-blogspot.py

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

BLOGSPOT_XML = os.path.join(os.path.dirname(__file__), "blogspot-export.xml")

# ── Category definitions ──────────────────────────────────────────────────────
# Defines all categories that will be auto-created in Sanity if missing.
CATEGORIES = [
    {"slug": "theologie",         "titleDe": "Theologie",         "titleEn": "Theology"},
    {"slug": "bibelauslegung",    "titleDe": "Bibelauslegung",    "titleEn": "Bible Interpretation"},
    {"slug": "apologetik",        "titleDe": "Apologetik",        "titleEn": "Apologetics"},
    {"slug": "kirchengeschichte", "titleDe": "Kirchengeschichte", "titleEn": "Church History"},
    {"slug": "geistliches-leben", "titleDe": "Geistliches Leben", "titleEn": "Spiritual Life"},
]

# Maps every Blogspot label to one of the slugs above.
LABEL_MAP: dict[str, str] = {
    # Theologie
    "theologie": "theologie",
    "theology": "theologie",
    "gottheit jesu": "theologie",
    "taufe": "theologie",
    "eschatologie": "theologie",
    "soteriologie": "theologie",
    # Bibelauslegung
    "bibelauslegung": "bibelauslegung",
    "bible interpretation": "bibelauslegung",
    "exegese": "bibelauslegung",
    "schriften": "bibelauslegung",
    "überblick": "bibelauslegung",
    "uberblick": "bibelauslegung",
    # Apologetik
    "apologetik": "apologetik",
    "apologetics": "apologetik",
    "bücher": "apologetik",
    "bucher": "apologetik",
    "books": "apologetik",
    # Kirchengeschichte
    "kirchengeschichte": "kirchengeschichte",
    "church history": "kirchengeschichte",
    "kirchenväter": "kirchengeschichte",
    "kirchenvater": "kirchengeschichte",
    "early church": "kirchengeschichte",
    # Geistliches Leben
    "geistliches leben": "geistliches-leben",
    "spiritual life": "geistliches-leben",
    "biographien": "geistliches-leben",
    "produktivität": "geistliches-leben",
    "produktivitat": "geistliches-leben",
    "gebet": "geistliches-leben",
    "nachfolge": "geistliches-leben",
}


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[äöüß]", lambda m: {"ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss"}[m.group()], text)
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text[:80].strip("-")


def html_to_portable_text(html: str) -> list[dict[str, Any]]:
    if not html:
        return []
    soup = BeautifulSoup(html, "lxml")
    blocks: list[dict[str, Any]] = []
    block_index = 0

    def make_block(style: str, children: list[dict]) -> dict[str, Any]:
        nonlocal block_index
        block = {
            "_type": "block",
            "_key": f"b{block_index:04d}",
            "style": style,
            "children": children,
            "markDefs": [],
        }
        block_index += 1
        return block

    def elem_to_children(elem) -> list[dict]:
        """Convert an element's inline content to Portable Text spans."""
        spans = []
        idx = [0]

        def walk(node, active_marks):
            if isinstance(node, str):
                text = node
                if text.strip():
                    spans.append({
                        "_type": "span",
                        "_key": f"s{idx[0]:04d}",
                        "text": text,
                        "marks": list(active_marks),
                    })
                    idx[0] += 1
                return
            tag = getattr(node, "name", None)
            new_marks = list(active_marks)
            if tag in ("strong", "b"):
                new_marks.append("strong")
            elif tag in ("em", "i"):
                new_marks.append("em")
            for child in node.children:
                walk(child, new_marks)

        walk(elem, [])
        if not spans:
            text = elem.get_text(separator=" ").strip()
            if text:
                spans.append({"_type": "span", "_key": "s0000", "text": text, "marks": []})
        return spans

    seen = set()

    for elem in soup.find_all(["p", "h2", "h3", "h4", "blockquote", "li"]):
        if id(elem) in seen:
            continue
        seen.add(id(elem))

        if elem.find_parent("blockquote") and elem.name != "blockquote":
            continue

        tag = elem.name
        children = elem_to_children(elem)
        if not children:
            continue

        if tag == "h2":
            blocks.append(make_block("h2", children))
        elif tag in ("h3", "h4"):
            blocks.append(make_block("h3", children))
        elif tag == "blockquote":
            blocks.append(make_block("blockquote", children))
        elif tag == "p":
            blocks.append(make_block("normal", children))
        elif tag == "li":
            blocks.append(make_block("normal", children))

    return blocks


def parse_blogspot_xml(filepath: str) -> list[dict[str, Any]]:
    if not os.path.exists(filepath):
        print(f"\nError: {filepath} not found.")
        print("Steps to export your Blogspot content:")
        print("  1. Go to https://www.blogger.com → your blog → Settings")
        print("  2. Scroll to 'Manage Blog' → 'Back up content'")
        print("  3. Click 'Download' — you get a .xml file")
        print(f"  4. Rename it to 'blogspot-export.xml' and put it in scripts/")
        sys.exit(1)

    tree = ET.parse(filepath)
    root = tree.getroot()
    ns = {"atom": "http://www.w3.org/2005/Atom"}
    posts = []

    for entry in root.findall("atom:entry", ns):
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


def ensure_categories_exist() -> dict[str, str]:
    """Create missing categories and return slug → _id map."""
    # Fetch existing
    resp = requests.get(
        QUERY_URL,
        params={"query": '*[_type == "category"] { _id, "slug": slug.current }'},
        headers=HEADERS,
        timeout=15,
    )
    existing: dict[str, str] = {}
    if resp.status_code == 200:
        for item in resp.json().get("result", []):
            existing[item["slug"]] = item["_id"]

    # Create missing
    to_create = [c for c in CATEGORIES if c["slug"] not in existing]
    if to_create:
        print(f"Creating {len(to_create)} missing categories...")
        mutations = []
        for cat in to_create:
            doc_id = f"category-{cat['slug']}"
            mutations.append({
                "createIfNotExists": {
                    "_type": "category",
                    "_id": doc_id,
                    "titleDe": cat["titleDe"],
                    "titleEn": cat["titleEn"],
                    "slug": {"_type": "slug", "current": cat["slug"]},
                }
            })
        r = requests.post(MUTATIONS_URL, headers=HEADERS, json={"mutations": mutations}, timeout=30)
        if r.status_code == 200:
            for cat in to_create:
                existing[cat["slug"]] = f"category-{cat['slug']}"
                print(f"  ✓ Created: {cat['titleDe']}")
        else:
            print(f"  Warning: category creation failed: {r.text[:300]}")

    return existing


def map_labels_to_category(labels: list[str]) -> str | None:
    for label in labels:
        cat_slug = LABEL_MAP.get(label.lower())
        if cat_slug:
            return cat_slug
    return None


def build_sanity_article(
    post: dict[str, Any],
    category_ids: dict[str, str],
) -> dict[str, Any]:
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

    cat_slug = map_labels_to_category(post["labels"])
    if cat_slug and cat_slug in category_ids:
        article["category"] = {
            "_type": "reference",
            "_ref": category_ids[cat_slug],
        }

    return article


def upload_in_batches(articles: list[dict[str, Any]], batch_size: int = 50) -> None:
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
            print(f"  Batch {i // batch_size + 1}: {len(results)} Artikel hochgeladen ✓")
        else:
            print(f"  Batch {i // batch_size + 1}: FEHLER {resp.status_code}")
            print(f"  {resp.text[:500]}")


def main() -> None:
    if not TOKEN:
        print("\nFehler: SANITY_API_TOKEN ist nicht gesetzt.")
        print("Token erstellen: https://sanity.io/manage → Projekt y5fwmpkn → API → Tokens → Add Editor token")
        print("\nDann ausführen:")
        print("  SANITY_API_TOKEN=dein_token python3 scripts/migrate-blogspot.py")
        sys.exit(1)

    print(f"\n→ Projekt: {PROJECT_ID} / Dataset: {DATASET}")
    print(f"→ Lese XML: {BLOGSPOT_XML}")

    posts = parse_blogspot_xml(BLOGSPOT_XML)
    print(f"→ {len(posts)} Artikel gefunden.\n")

    if len(posts) == 0:
        print("Nichts zu migrieren.")
        return

    print("→ Kategorien in Sanity vorbereiten...")
    category_ids = ensure_categories_exist()
    print(f"  Verfügbare Kategorien: {list(category_ids.keys())}\n")

    articles = [build_sanity_article(p, category_ids) for p in posts]

    # Label coverage report
    unmapped = [p for p in posts if map_labels_to_category(p["labels"]) is None]
    if unmapped:
        print(f"  Hinweis: {len(unmapped)} Artikel ohne zugewiesene Kategorie:")
        for p in unmapped[:5]:
            print(f"    - {p['title']} (Labels: {p['labels']})")
        if len(unmapped) > 5:
            print(f"    ... und {len(unmapped) - 5} weitere")
        print()

    print(f"→ Lade {len(articles)} Artikel hoch...")
    upload_in_batches(articles)

    print("\n✓ Migration abgeschlossen.")
    print("  Öffne /studio um die importierten Artikel zu prüfen und Bilder hinzuzufügen.")


if __name__ == "__main__":
    main()
