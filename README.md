# Aux-opsy

> **AI-assisted project.** This codebase was created with [Claude Code](https://claude.com/claude-code).
> The site builds and every page has been rendered and checked in a browser; the *technical
> content* is drawn from private research repositories and, as the site itself says
> throughout, almost none of it has been verified against physical hardware.

The public face of Stoatworks Labs' reverse-engineering research into live production
platforms — digital mixing consoles and video presentation switchers. A statement of method
and legal position, plus a sortable, searchable index of the platforms examined, each with a
detailed hardware and software architecture breakdown.

**Astro, static output, zero runtime dependencies, no CSS framework** — the same posture as
the main Stoatworks Labs site, and the same navy brand tokens, so the two read as one house.

## Structure

| Path | What it is |
|---|---|
| `src/data/platforms.json` | **Single source of truth.** Every platform, every table row, every confidence label. The index page and all detail pages derive from it. |
| `src/pages/index.astro` | Overview — the question the research started from, and how to read the site |
| `src/pages/method.astro` | Method & legal status. The page everything else defers to |
| `src/pages/platforms/index.astro` | The sortable/searchable index. Vanilla JS, progressively enhanced |
| `src/pages/platforms/[slug].astro` | One detail page per platform, generated from the JSON |
| `src/styles/global.css` | Design tokens and every rule. Light and dark both ship |

## Adding or editing a platform

Edit `src/data/platforms.json` and nothing else. Each entry needs:

- **`status`** — one of the ids in the `statuses` array. The array's **order is the sort order**
  for "Research depth" and the filter-chip order.
- **`hardware` / `software` / `security`** — arrays of `{ label, value, confidence }`. Every
  row must carry a confidence level from the `confidence` map; there is no default and there
  should not be one.
- **`headline`** — the single load-bearing finding, rendered in the callout at the top.
- **`traps`** — mistakes the analysis actually made. These are the most useful part of a page
  for anyone repeating the work; do not quietly drop them when a page is tidied.

Backticks in a `value`, artifact or trap string are rendered as `<code>`. Nothing else in
those strings is parsed as markup.

## The content boundaries this repo observes

These are enforced by editorial care, not by code, so they need restating whenever the data
file is edited. The full statement is on `/method/`, and it is binding:

1. **No licensing, authorisation or entitlement analysis.** One platform in the index has such
   a mechanism; the analysis stopped when it was identified and the page says only that it
   exists.
2. **No exploits and no modification instructions.** Recording that a platform validates with
   a CRC and no signature is a structural fact about its architecture. A bypass is not, and
   does not go here.
3. **No redistribution of manufacturer material** — no firmware, no extracted binaries, no
   scanned manuals, no artwork.
4. **Manufacturer names are used nominatively**, for identification in a factual description.
   Note that this is a *deliberate departure* from the main stoatworks-labs.com policy of not
   naming third-party products — that rule is scoped to the commercial product pages, and
   reverse-engineering documentation is meaningless without the model number. Do not "fix"
   this to match the other site.

## Local development

```bash
npm install
npm run dev      # or: npm run build && npm run preview
```

A preview config named `aux-opsy` on port 4531 is registered in
`~/.claude/launch.json`.

## Source repositories

The underlying research lives in private repositories — `yamaha-ql-re`, `sq5-re`, `hd96-re`,
`wing-os`, `soundgrid-protocol`, `dmix-surface` and `loom`. This site is a curated public rendering of
that work, not a mirror of it. When a finding changes there, it does **not** propagate here
automatically; `platforms.json` is hand-maintained on purpose, the same way the main site's
`projects.json` is.
