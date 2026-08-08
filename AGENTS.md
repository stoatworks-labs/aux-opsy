# AGENTS.md — aux-opsy

Conventions and hard-won facts for anyone (human or agent) working in this repo.
Read this before editing. See `README.md` for what the project *is*.

## What is verified, and what is assumed

**Verified in this repo:**

- The site builds clean (17 pages, 16 in the sitemap) and every route renders.
- Search, status filter, class filter and all six sort orders were exercised in a real
  browser and produce correct results — including the year sort parking the undated entry
  (LOOM) last in both directions.
- The fourth class, `Video presentation switcher`, filters to exactly the three Analog Way
  entries and sorts to the end of the class order. Re-checked in the browser after they
  were added.
- Light and dark both render correctly, with the navy band surviving in light mode.
- **Live at `https://aux-opsy.com`** (and `www.`), deployed as a Cloudflare Worker serving
  static assets (not a Pages project — the fleet has none). Public repo at
  `github.com/stoatworks-labs/aux-opsy`.
- Discovery stack verified live: `/robots.txt` with content signals, `/sitemap-index.xml`
  (13 URLs, 404 excluded), `/llms.txt`, and JSON-LD on every page.

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
   place a row in `verified` / `inferred` / `unknown` / `public`, the row is not ready.
2. **Never promote a claim's confidence because it reads better.** The labels are the reason
   the site is worth anything.
3. **`traps` are not decoration.** They record mistakes the analysis actually made, each of
   which produced a *plausible* wrong answer. They are the most useful section on the page for
   a reader repeating the work. Do not drop them in a tidy-up.
4. **The scope boundaries on `/method/` are binding, not aspirational.** No entitlement or
   licensing analysis, no exploits, no modification instructions, no redistribution of
   manufacturer material. If new research crosses one of those lines, it does not come here.

## Two strands, one method

The site started as consoles only and now covers **digital mixing consoles and video
switchers** — the video strand deliberately says "video switchers", not "video presentation
switchers", because it holds both presentation switchers (Analog Way) and live production
switchers (Blackmagic ATEM). The h1, both meta descriptions, the method page's purpose section,
`Base.astro`'s footer and JSON-LD, `llms.txt` and the README were all broadened together —
if you add a third strand, they all have to move again, and the `class` field is what keeps
them separable in the index.

Two consequences worth knowing:

- **Do not reintroduce a hard count of teardowns.** The home page and `llms.txt` used to say
  "two of the four teardowns concluded no". That went stale silently as entries were added
  and was wrong long before anyone noticed. Both now say "several", which stays true.
- **Method boundary 1 gets closer on the video pages.** These platforms are sold as tiers of
  one design, so "what differs between the models" is a natural question — and it is a
  question about card population and firmware images, not about entitlement. The purpose
  section says so explicitly. Keep it that way: record the structural fact, never the
  mechanism for changing it.

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
