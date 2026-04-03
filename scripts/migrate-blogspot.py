#!/usr/bin/env python3
"""
Migrate Google Takeout Blogger export to Sanity.

Supports both:
  - Google Takeout format (feed.atom with blogger:type/blogger:status)
  - Classic Blogspot XML export

Usage:
  SANITY_API_TOKEN=your_token python3 scripts/migrate-blogspot.py

Requirements: pip3 install requests beautifulsoup4 lxml
"""

import xml.etree.ElementTree as ET
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

# Try Google Takeout path first, then classic export
TAKEOUT_PATH  = os.path.expanduser(
    "~/Downloads/Takeout/Blogger/Blogs/Aus der Schrift/feed.atom"
)
CLASSIC_PATH  = os.path.join(os.path.dirname(__file__), "blogspot-export.xml")

# XML namespaces
ATOM    = "http://www.w3.org/2005/Atom"
BLOGGER = "http://schemas.google.com/blogger/2018"

# ── Categories ────────────────────────────────────────────────────────────────
CATEGORIES = [
    {"slug": "theologie",         "titleDe": "Theologie",         "titleEn": "Theology"},
    {"slug": "bibelauslegung",    "titleDe": "Bibelauslegung",    "titleEn": "Bible Interpretation"},
    {"slug": "apologetik",        "titleDe": "Apologetik",        "titleEn": "Apologetics"},
    {"slug": "kirchengeschichte", "titleDe": "Kirchengeschichte", "titleEn": "Church History"},
    {"slug": "geistliches-leben", "titleDe": "Geistliches Leben", "titleEn": "Spiritual Life"},
]

LABEL_MAP: dict[str, str] = {
    "theologie": "theologie",
    "theology": "theologie",
    "gottheit jesu": "theologie",
    "taufe": "theologie",
    "eschatologie": "theologie",
    "soteriologie": "theologie",
    "bibelauslegung": "bibelauslegung",
    "bible interpretation": "bibelauslegung",
    "exegese": "bibelauslegung",
    "schriften": "bibelauslegung",
    "überblick": "bibelauslegung",
    "uberblick": "bibelauslegung",
    "apologetik": "apologetik",
    "apologetics": "apologetik",
    "bücher": "apologetik",
    "bucher": "apologetik",
    "books": "apologetik",
    "kirchengeschichte": "kirchengeschichte",
    "church history": "kirchengeschichte",
    "kirchenväter": "kirchengeschichte",
    "kirchenvater": "kirchengeschichte",
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


def elem_to_children(elem) -> list[dict]:
    spans: list[dict] = []
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


def html_to_portable_text(html: str) -> list[dict[str, Any]]:
    if not html:
        return []
    soup = BeautifulSoup(html, "lxml")
    blocks: list[dict[str, Any]] = []
    block_index = 0
    seen: set[int] = set()

    def make_block(style: str, children: list[dict]) -> dict[str, Any]:
        nonlocal block_index
        b = {
            "_type": "block",
            "_key": f"b{block_index:04d}",
            "style": style,
            "children": children,
            "markDefs": [],
        }
        block_index += 1
        return b

    for elem in soup.find_all(["p", "h2", "h3", "h4", "blockquote", "li"]):
        if id(elem) in seen:
            continue
        seen.add(id(elem))
        if elem.find_parent("blockquote") and elem.name != "blockquote":
            continue

        children = elem_to_children(elem)
        if not children:
            continue

        tag = elem.name
        if tag == "h2":
            blocks.append(make_block("h2", children))
        elif tag in ("h3", "h4"):
            blocks.append(make_block("h3", children))
        elif tag == "blockquote":
            blocks.append(make_block("blockquote", children))
        else:
            blocks.append(make_block("normal", children))

    return blocks


def parse_takeout_atom(filepath: str) -> list[dict[str, Any]]:
    """Parse Google Takeout Atom feed."""
    tree = ET.parse(filepath)
    root = tree.getroot()
    posts = []

    for entry in root.findall(f"{{{ATOM}}}entry"):
        btype  = entry.find(f"{{{BLOGGER}}}type")
        bstatus = entry.find(f"{{{BLOGGER}}}status")

        if btype is None or btype.text != "POST":
            continue
        if bstatus is None or bstatus.text != "LIVE":
            continue

        title     = entry.findtext(f"{{{ATOM}}}title", "").strip()
        content   = entry.findtext(f"{{{ATOM}}}content", "")
        published = entry.findtext(f"{{{ATOM}}}published", "")
        labels    = [
            c.get("term", "")
            for c in entry.findall(f"{{{ATOM}}}category")
            if c.get("term")
        ]

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


def parse_classic_xml(filepath: str) -> list[dict[str, Any]]:
    """Parse classic Blogspot XML export."""
    tree = ET.parse(filepath)
    root = tree.getroot()
    ns = {"atom": ATOM}
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

        title     = entry.findtext("atom:title", "", ns).strip()
        content   = entry.findtext("atom:content", "", ns)
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

    to_create = [c for c in CATEGORIES if c["slug"] not in existing]
    if to_create:
        print(f"  Erstelle {len(to_create)} fehlende Kategorien...")
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
                print(f"    ✓ {cat['titleDe']}")
        else:
            print(f"  Warnung: Kategorie-Erstellung fehlgeschlagen: {r.text[:300]}")

    return existing


def map_labels(labels: list[str]) -> str | None:
    for label in labels:
        slug = LABEL_MAP.get(label.lower())
        if slug:
            return slug
    return None


def build_article(post: dict[str, Any], category_ids: dict[str, str]) -> dict[str, Any]:
    doc: dict[str, Any] = {
        "_type": "article",
        "_id": f"imported-{post['slug']}",
        "titleDe": post["title"],
        "slug": {"_type": "slug", "current": post["slug"]},
        "publishedAt": post["published"],
        "bodyDe": html_to_portable_text(post["content"]),
        "language": "de",
    }
    cat_slug = map_labels(post["labels"])
    if cat_slug and cat_slug in category_ids:
        doc["category"] = {"_type": "reference", "_ref": category_ids[cat_slug]}
    return doc


def upload(articles: list[dict[str, Any]]) -> None:
    for i in range(0, len(articles), 50):
        batch = articles[i:i + 50]
        r = requests.post(
            MUTATIONS_URL,
            headers=HEADERS,
            json={"mutations": [{"createOrReplace": a} for a in batch]},
            timeout=30,
        )
        if r.status_code == 200:
            n = len(r.json().get("results", []))
            print(f"  ✓ Batch {i // 50 + 1}: {n} Artikel hochgeladen")
        else:
            print(f"  ✗ Batch {i // 50 + 1}: Fehler {r.status_code} — {r.text[:300]}")


def main() -> None:
    if not TOKEN:
        print("Fehler: SANITY_API_TOKEN nicht gesetzt.")
        sys.exit(1)

    # Detect which file to use
    if os.path.exists(TAKEOUT_PATH):
        print(f"→ Google Takeout gefunden: {TAKEOUT_PATH}")
        posts = parse_takeout_atom(TAKEOUT_PATH)
    elif os.path.exists(CLASSIC_PATH):
        print(f"→ Klassischer Export gefunden: {CLASSIC_PATH}")
        posts = parse_classic_xml(CLASSIC_PATH)
    else:
        print("Fehler: Keine Export-Datei gefunden.")
        print(f"  Gesucht in:\n  - {TAKEOUT_PATH}\n  - {CLASSIC_PATH}")
        sys.exit(1)

    print(f"→ {len(posts)} veröffentlichte Artikel gefunden.\n")
    if not posts:
        print("Nichts zu migrieren.")
        return

    print("→ Kategorien vorbereiten...")
    category_ids = ensure_categories_exist()
    print()

    articles = [build_article(p, category_ids) for p in posts]

    unmapped = [p for p in posts if map_labels(p["labels"]) is None]
    if unmapped:
        print(f"  Hinweis: {len(unmapped)} Artikel ohne Kategorie-Zuweisung:")
        for p in unmapped:
            print(f"    - {p['title'][:50]} (Labels: {p['labels']})")
        print()

    print(f"→ Lade {len(articles)} Artikel in Sanity hoch...")
    upload(articles)
    print("\n✓ Migration abgeschlossen.")
    print("  Öffne /studio um Artikel zu prüfen und Bilder hinzuzufügen.")


if __name__ == "__main__":
    main()
