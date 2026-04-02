# Migration Scripts

## migrate-blogspot.py

Migrates a Blogspot XML export to Sanity.

### Setup

1. Export from Blogspot: Settings → Manage Blog → Back up content → Download
2. Save as `scripts/blogspot-export.xml` (NOT committed to git)
3. Install dependencies: `pip3 install requests beautifulsoup4 lxml`
4. Get a Sanity write token: sanity.io → project y5fwmpkn → API → Tokens (Editor role)

### Run

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=y5fwmpkn \
NEXT_PUBLIC_SANITY_DATASET=production \
SANITY_API_TOKEN=your_token_here \
python3 scripts/migrate-blogspot.py
```

### Notes

- The script uses `createOrReplace` — safe to run multiple times
- Categories must exist in Sanity first (create them via /studio)
- After migration, review articles in /studio to add excerpts and featured images
- `blogspot-export.xml` is in `.gitignore` — never commit it
