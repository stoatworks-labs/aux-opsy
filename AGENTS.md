# AGENTS.md — aux-opsy

Conventions and hard-won facts for anyone (human or agent) working in this repo.
Read this before editing. See `README.md` for what the project *is*.

## What is verified, and what is assumed

**Verified in this repo:**

- The site builds clean (26 routes, 25 in the sitemap) and every route renders.
- Search, status filter, class filter and all six sort orders were exercised in a real
  browser and produce correct results — including the year sort parking the undated entry
  (LOOM) last in both directions.
- All nine class filters were exercised in the browser after the 2026-08-14 additions; the
  three new ones (`NDI video converter`, `Wireless conference system`, `Installed system
  processor`) each filter to exactly their one entry. The new "Recently updated" sort orders
  by `updated` and puts the four newest first. Search finds the new entries' silicon
  (`rk3328`, `vxworks`).
- The `measured` confidence marker is the only filled chip and clears WCAG AA in both schemes
  — 6.02:1 light, 6.45:1 dark, checked by computing the ratio in the page.
- Every detail page now has at least one outbound "Related entries" link (checked across all
  22 built pages; the minimum is 1, on the MXCW).
- Light and dark both render correctly, with the navy band surviving in light mode.
- **Live at `https://aux-opsy.com`** (and `www.`), deployed as a Cloudflare Worker serving
  static assets (not a Pages project — the fleet has none). Public repo at
  `github.com/stoatworks-labs/aux-opsy`.
- Discovery stack verified at build: `/robots.txt` with content signals, `/sitemap-index.xml`
  (25 URLs, and the non-HTML routes correctly excluded), `/llms.txt`, `/llms-full.txt`,
  `/api/platforms.json`, `/updates.xml` (parses as Atom), and JSON-LD on every page —
  `Dataset` + `ItemList` on the index, `TechArticle` + `BreadcrumbList` on each platform,
  `DefinedTermSet` for the confidence vocabulary on `/method/`.

- The BirdDog entry is the first with hardware behind it. `hardwareBasis` on that entry is
  what makes `/method/`'s third column non-empty and what the site's derived "almost none of
  this touched hardware" sentences count.

**Assumed / not verified:**

- **The technical content.** It is a curated rendering of the private research repos. It was
  transcribed faithfully, but no claim here has been independently re-derived, and the
  research itself is largely unverified against hardware — which the site says on every page.
- **Auto-deploy from GitHub.** Not wired up. Connecting a repo as a Worker's build source
  needs the Cloudflare dashboard; the API token gets 403 on `/accounts/{id}/builds/*`. Every
  deploy is currently a manual `cf-run npm run deploy`.

## The single source of truth

`src/data/platforms.json`. The index page, every detail page and the per-platform table on
`/method/` all derive from it. There is deliberately **no** live fetch from GitHub or from the
research repos — the curation is the feature, exactly as on the main site.

Consequence worth internalising: **a finding corrected in `sq5-re` does not correct itself
here.** When the research moves, this file has to be edited by hand.

## Editorial rules that are not enforced by code

1. **Every table row carries a confidence label, and there is no default.** If you cannot
   place a row in `measured` / `verified` / `inferred` / `unknown` / `public`, it is not ready.
2. **Never promote a claim's confidence because it reads better.** The labels are the reason
   the site is worth anything.
3. **`measured` means a number off a running unit we own, and nothing else.** It was added on
   2026-08-14 with the BirdDog entry, which is the first platform in the index with hardware
   behind it. It outranks `verified` because it is the one label static analysis cannot
   produce. Three things follow:
   - An entry may only use `measured` if it also carries a **`hardwareBasis`** string naming
     the unit and firmware. That string is what fills `/method/`'s "Hardware involved" column
     and what the site's derived "almost none of this touched hardware" sentences count.
   - **A simulator is not hardware.** `ahm-control` passes its tests over a real TCP socket
     against a simulator; that is `verified` at best and its own repo says so outright.
   - **Owning a unit does not retroactively upgrade the static analysis.** On the BirdDog page
     the file-derived rows stay `verified` and the FPGA models stay file-only. Sweeping a
     whole entry to `measured` because a unit exists is the exact failure this label invites.
4. **`traps` are not decoration.** They record mistakes the analysis actually made, each of
   which produced a *plausible* wrong answer. They are the most useful section on the page for
   a reader repeating the work. Do not drop them in a tidy-up.
5. **The scope boundaries on `/method/` are binding, not aspirational.** No entitlement or
   licensing analysis, no exploits, no modification instructions, no redistribution of
   manufacturer material. If new research crosses one of those lines, it does not come here.

### Where boundary 3 actually sits — the BirdDog case

The BirdDog entry is the sharpest case in the index and is worth reading before deciding what
a new security row may say. `birddog-re` is a repo that **can never be pushed**, and an entry
was still publishable from it.

**In scope, and on the site:** the container is a gzip'd tar around an AES-256 payload; **one
password serves the entire product line and every generation**; pre-2022 firmware is not
encrypted at all; the only checks in the chain are an md5 over a shell stub and a model-string
whitelist, so **there is no signature verification anywhere in the update path**; the REST API
on `:8080` has no authentication and sets `ACAO: *`.

**Out of scope, and deliberately absent:** the key in any form — value, length, character set,
where it lives — the technique that recovered it, the per-generation KDF choices, and every
step of getting a package the vendor did not sign onto a device.

The rule that separates them: **what the platform *is* goes on the site; how to make it do
something else does not.** "No signature check" is the same class of fact as "Zynq-7000". A
recipe is not.

## The strands are DERIVED now — stop editing them by hand

The site started as consoles only, added video switchers, and on **2026-08-14** added an NDI
converter line, a wireless conference system and an installed system processor. Each time, the
self-description had to be rewritten in eight places — h1, both meta descriptions, the method
page's purpose section, `Base.astro`'s footer and JSON-LD, `llms.txt` and the README — and each
time at least one was missed and the site spent a while describing itself inaccurately.

**That is fixed and must stay fixed.** `strands()` and `strandPhrase()` in `src/lib/corpus.ts`
derive the sentence from the `class` values actually present, and every one of those eight
places interpolates the result. Adding a platform in a new class updates the site's own
description automatically.

- The `STRANDS` map groups related classes into a readable name; `/switcher/i` deliberately
  matches both the presentation and live-production classes, because that distinction belongs
  on the index's class filter, not in a one-line description of the whole site.
- **The guard is the point:** an unmatched class is appended *verbatim and lowercased* rather
  than dropped. So a new class can make the sentence clumsy but can never make it a lie. If
  you see a raw class name in the site's own description, add it to `STRANDS`.
- Do not reintroduce a hand-written strand list anywhere. It has gone stale twice.

Two consequences worth knowing:

- **Do not reintroduce a hard count of teardowns.** The home page and `llms.txt` used to say
  "two of the four teardowns concluded no". That went stale silently as entries were added
  and was wrong long before anyone noticed. Both now say "several", which stays true.
- **Method boundary 1 gets closer on the video pages.** These platforms are sold as tiers of
  one design, so "what differs between the models" is a natural question — and it is a
  question about card population and firmware images, not about entitlement. The purpose
  section says so explicitly. Keep it that way: record the structural fact, never the
  mechanism for changing it.

## The machine-readable surfaces, and why there are four

`/llms.txt`, `/llms-full.txt`, `/api/platforms.json` and `/updates.xml` are all generated from
`platforms.json` at build, and the shared rendering lives in `src/lib/corpus.ts` so they cannot
drift. They did drift when the two text files were written separately — the index knew about a
field the full dump did not emit — which is why the renderer is shared now.

- **The failure mode all four exist to prevent is a summary that keeps the findings and drops
  the labels.** Every one of them states the confidence vocabulary before any finding, and
  `llms-full.txt` prefixes each row `[MEASURED]`, `[VERIFIED]` and so on so the qualifier
  cannot be separated from the claim by a naive extraction. Keep that property.
- **`/llms-full.txt` is the one that matters.** An assistant answering "what SoC is in the
  Avantis?" from the index alone has to guess, and given the choice between guessing and
  fetching, most guess. The full corpus removes the choice.
- **`public/_headers` is where the response headers actually come from, not the route.**
  The site is `output: 'static'`, so every `src/pages/*.ts` endpoint is prerendered to a file
  and the `headers` object in the `Response` it returns is **never sent** — the asset server
  picks a Content-Type from the extension and adds nothing else. `/api/platforms.json` shipped
  with no `Access-Control-Allow-Origin` at all until `_headers` was added, and the route's own
  header block looked correct the whole time. If you change a header in a handler, change it
  in `_headers` too, or it does nothing in production.
- `/api/platforms.json` is CORS-open on purpose — a machine-readable endpoint behind a
  same-origin policy is one nobody can read.
- **`dateModified` comes from each entry's `updated` field, never from the build clock.**
  Rebuilding the site does not modify an entry, and this is the last site that should tell
  that particular freshness lie.

## The naming-policy departure — do not "fix" it

The main Stoatworks Labs site **deliberately does not name third-party products** (Analog Way
Aquilon, Barco E3 and d&b R70 were all removed from it at Allan's request). This site names
manufacturers and model numbers throughout.

That is intentional and was confirmed explicitly: reverse-engineering documentation is
meaningless without the model number, and the no-naming rule is scoped to the commercial
product pages on the other site. A future fleet-wide sweep that "corrects" the naming here
would destroy the site. The nominative-use position is stated on `/method/#trademarks`.

## Traps in this repo

- **A `title` attribute wins the accessible-name computation over button text.** The status
  filter chips announced their entire tooltip ("A written teardown exists and its claims carry
  evidence citations") instead of "Documented". Fixed with an explicit `aria-label`; keep both
  attributes if you add chips.
- **`astro preview` dies when `dist/` is rebuilt under it.** The symptom is
  ERR_CONNECTION_REFUSED, not a bad page. Restart the preview after a build.
- **The launcher reads `~/.claude/launch.json`, not the repo's `.claude/launch.json`.** The
  preview config is named `aux-opsy` on port 4531 and is already registered there.
- **`year: 0` means "no meaningful date"**, used for our own design. Both year sorters special-
  case it so it parks last rather than sorting as the year zero. Don't "simplify" that away.
- **Every deploy lies for one to two minutes afterwards, and the lie looks like a bug.**
  Freshly-uploaded paths return 404 — or, right after a custom domain is attached, `500` —
  moving to a *different* path on each pass. It settles on its own. Never diagnose from one
  pass, and never check status and body in separate curls: they are two requests and can hit
  different edge states, producing a "404 with the correct title" that is pure artefact.
- **`grep -c` on `robots.txt` returned 0 while `grep -E` on the same file printed matches** —
  same cause, two separate requests. One request per assertion.
- **Do not round-trip `platforms.json` through `json.dumps`.** The file is hand-formatted:
  table rows are one object per line and `tags` arrays are inline. A reformat produced a
  648-line diff that would have collided head-on with a co-session. Edit it as text, scoped to
  the entry's line range, or make the change by hand.
- **`<script type="application/ld+json" set:html={...} />`** is the working form. A
  `<set:html value={...} />` element is not Astro syntax, and an HTML comment inside a
  `{list.map(...)}` block is a compiler error — use `{/* */}` outside the map.

## Style

Minimalist, hairline borders, no shadows, generous whitespace, mono eyebrows — inherited from
the main site, with a denser, more document-like setting because this is a research index
rather than a product catalogue. Brand tokens are the navy set and must not be re-picked:

```
NAVY #0e2942   PAPER #fafaf8   ACCENT #7fa8ce
```

`#7fa8ce` fails WCAG AA on paper, so light mode's `--accent` is the darkened same-hue
`#235f92` and `#7fa8ce` survives only on the navy bands. This is the same deviation the main
site makes, for the same reason.
