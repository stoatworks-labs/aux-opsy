# Notes

Working notes for this repo: status, decisions, and the traps that have actually bitten.
Migrated out of Claude Code's memory on 2026-08-24, so they are written in the first
person and dated by when each thing was learned — that date is usually the useful part.

Cross-cutting notes that are not specific to this repo live in
[fleet-notes](https://github.com/stoatworks-labs/fleet-notes).

*aux-opsy — PUBLIC Astro site presenting the console AND video-switcher RE research (method/legal page + sortable platform index). LIVE at https://aux-opsy.com. Renamed from console-internals 2026-08-07*

**`~/Projects/aux-opsy`** — created **2026-08-07**. Astro static site, zero runtime deps, navy
brand tokens shared with [stoatworks website](https://github.com/stoatworks-labs/stoatworks-website/blob/main/docs/NOTES.md) (`stoatworks-website`) so the two read as one house.

**PUBLIC at `github.com/stoatworks-labs/aux-opsy`, branch `main`, and LIVE at
`https://aux-opsy.com`** (also `aux-opsy.allan-sargeant.workers.dev`). **22 platforms, 26
routes, 25 sitemap URLs, 9 classes, 5 confidence tiers** as of 2026-08-14 (was 14/18/17 on
08-08 and 10/14 at creation — these counts go stale fast; the site's own copy derives them,
so never hard-code a count in the pages).

**Preview config `aux-opsy` on port 4531 was NOT in `~/.claude/launch.json`** despite this
file previously claiming it was — added 2026-08-14. Verify before assuming it is there.

## The 2026-08-14 pass — four entries, a fifth confidence tier, derived strands

Added **Yamaha DM7** ([dm7 re](https://github.com/stoatworks-labs/dm7-re/blob/main/docs/NOTES.md) (`dm7-re`)), **Allen & Heath AHM** ([ahm re](https://github.com/stoatworks-labs/ahm-re/blob/main/docs/NOTES.md) (`ahm-re`)),
**Shure MXCW** ([mxcw re](https://github.com/stoatworks-labs/mxcw-re/blob/main/docs/NOTES.md) (`mxcw-re`)) and **BirdDog NDI converters** ([birddog re](https://github.com/stoatworks-labs/birddog-re/blob/main/docs/NOTES.md) (`birddog-re`)),
all `partial` except BirdDog (`documented`). Three new classes, so three new filter chips.

**A fifth confidence label `measured` now outranks `verified`** — a number read off a running
unit we own. BirdDog is the only entry with it (9 rows) and the only one carrying the new
optional **`hardwareBasis`** field. `hardwareBasis` is load-bearing: it fills `/method/`'s
"Hardware involved" column (which was **hardcoded to `None`** for every row before this) and
its presence is what the site's honesty sentences count. **The site previously asserted
absolutely, in five places, that nothing had ever touched hardware** — that claim is now
derived from `hardwareBasis` and pluralises itself. Allan chose the honest reframe over
publishing only BirdDog's file-derived findings.

**`measured` is the label most likely to be misapplied.** A simulator is not hardware
(`ahm-control` runs 103 tests over a real socket against a simulator — that is `verified` at
best, and its own AGENTS.md says so). Owning a unit does NOT retroactively upgrade the static
analysis: BirdDog's FPGA models stay file-only and its file-derived rows stay `verified`.

**The eight-places strand sweep is GONE — `strands()`/`strandPhrase()` in
`src/lib/corpus.ts` derive it from the `class` values.** It went stale twice (video, then
these three). An unmapped class is appended **verbatim and lowercased**, so a new class can
make the sentence clumsy but never false — if you see a raw class name in the site's own
description, add it to `STRANDS`. Two bugs this caught on first build: `/video switcher/i`
missed `Video presentation switcher` (use `/switcher/i`), and Set-iteration order needs
replacing with the map's own order.

**BirdDog is the boundary case worth reusing.** `birddog-re` can never be pushed and an entry
was still publishable. On the site: AES-256 container, **one password across the whole line
and every generation**, pre-2022 unencrypted, **no signature verification anywhere**,
unauthenticated `:8080` with `ACAO: *`. Deliberately absent: the key in any form, the
recovery technique, the KDF variants, and every step of installing an unsigned package. Rule:
*what the platform **is** goes on the site; how to make it do something else does not.*

## Machine-readable surfaces, and the header trap

Added `/llms-full.txt` (whole corpus, every row prefixed `[MEASURED]`/`[VERIFIED]`/… so the
label cannot be split from the claim), `/api/platforms.json` (CORS-open, carries both
vocabularies + a reuse caveat), `/updates.xml` (Atom, ordered by each entry's new `updated`
field), plus `Dataset`+`ItemList` JSON-LD on the index, `DefinedTermSet` for the confidence
vocabulary on `/method/`, `dateModified` from `updated` (**never the build clock**), a
1200×630 `og.png` (first card this site has had; `rsvg-convert` renders it), and 8 more named
crawler groups in `robots.txt`.

**TRAP — `output: 'static'` SILENTLY DROPS a route's `Response` headers.** Every
`src/pages/*.ts` endpoint is prerendered to a file; the asset server sets Content-Type from
the extension and adds nothing else. `/api/platforms.json` shipped with **no
`Access-Control-Allow-Origin` at all** while the handler's header block looked perfectly
correct. Real headers live in **`public/_headers`** (copied to `dist/`, consumed not served by
the Workers assets runtime). Change one, change the other.

## RESOLVED — the DM3 entry had published the INVERSE of its own source research

Found via [dm7 re](https://github.com/stoatworks-labs/dm7-re/blob/main/docs/NOTES.md) (`dm7-re`), settled and corrected 2026-08-14. **The failure mode is the
transcription onto this site, not the research** — and it is the one to watch on every future
entry.

`yamaha-ql-re/docs/dm3-comparison.md` says the DSP subsystem is boot-loaded and
field-updatable, *"which looks at first like the opposite of the QL. **It isn't.**"*, then
proves `DSP_V121.bin` is several **Cortex-M** images plus coefficient tables — first word
`0x200081B8` is a Cortex-M initial SP, Thumb-2 throughout, ≈1.3 MB real content of 3.8 MB,
data region fails the QL's own code test (monotonic runs of 10,235/4,097/4,096 words vs 7 for
DSP code) and holds a descending ASCII ramp, i.e. a lookup curve. **Whoever wrote the entry
read the first half of the argument and stopped before the correction**, publishing "the DSP
is loadable here" as the headline, verdict, a `Loadable DSP` tag and programmable rank 2.
Note the entry's own `summary` said "the same DSP philosophy" the whole time — **an entry
whose summary contradicts its headline is the tell.**

Also corrected: the "**16-byte digest**" in the archive header, `verified` in two rows, was
**assumed from the field's size, never checked**. The DM7 derivation of the same container
gives a **20-byte identifier at `0x34` that is not a digest of anything**. The DM3 image is
**gone** (`mbdf_out/` empty, no image on disk), so it cannot be re-derived — now `unknown`.
This is the platform `/method/#corrections` means by "source image no longer in our
possession".

Both errors are published as **traps on the page**, per the site's own no-quiet-edits policy.

## Deployed 2026-08-14

Committed, pushed and `cf-run npm run deploy`d. **No edge flapping this time** — all 15 URLs
returned 200 on the first pass, so the 1–2 minutes of lying is not guaranteed; still use one
request per URL capturing status and body together. **`public/_headers` confirmed working in
production** on Workers static assets: `access-control-allow-origin: *` and
`content-type: application/atom+xml` both applied.

## Two strands, and why the video one is named the way it is

The site covers **digital mixing consoles and "video switchers"** — the short name is
deliberate. The video strand holds *both* presentation switchers (the three Analog Way
entries, class `Video presentation switcher`) and live production switchers (Blackmagic ATEM,
class `Live production video switcher`), so naming it "video presentation switchers" would be
wrong. It was broadened on **2026-08-08** when the ATEM landed; a fleet sweep that "restores"
the longer name is a regression. Recorded in AGENTS.md too.

**The framing is stated in seven places and they all move together:** both meta descriptions
(`index.astro`, `platforms/index.astro`), the h1 lede, `Base.astro`'s JSON-LD description, the
method page's purpose section, `src/pages/llms.txt.ts`, and the README — plus the "covers two
strands" paragraph on the home page. Adding a strand means editing all eight.

**Class filters are derived from the data, not a hardcoded list** — a new `class` value in
`platforms.json` produces a new filter chip and sorts in on its own, no code change needed.

**Everything was called `console-internals` for the first few hours of 2026-08-07** — repo,
Worker, local directory, wordmark and this memory file. Allan then bought **aux-opsy.com** and
all five were renamed. The old `console-internals` Worker was **deleted**; GitHub redirects the
old repo URL. The name reads as *aux send* + *autopsy*, but Allan chose to leave the pun
implicit — **the tagline stays factual ("How digital mixing consoles are actually built") and
must never play on "autopsy"**.

Deployed as a **Worker serving static assets, not a Pages project** — Allan asked for "a
cloudflare pages site" but [cloudflare access](https://github.com/stoatworks-labs/fleet-notes/blob/main/notes/reference_cloudflare_access.md) records that the fleet has no Pages
projects at all; every hosted app is a Worker with `assets.directory`. Deploy with
`cf-run npm run deploy` (= `astro build && npx wrangler deploy`). `workers_dev` is set
**explicitly true** in `wrangler.jsonc` so that attaching the custom domain later does not
silently kill the workers.dev URL. **Auto-deploy from GitHub is NOT wired up** — connecting a
repo as a Worker's build source needs the dashboard and cannot be done with an API token.

Three routes plus a 404: `/` overview, `/method/` (method & legal), `/platforms/` (sortable +
searchable index), `/platforms/[slug]/`. Preview config `console-internals` on **port 4531**,
registered in `~/.claude/launch.json` (NOT the repo's — see [stoatworks website](https://github.com/stoatworks-labs/stoatworks-website/blob/main/docs/NOTES.md) (`stoatworks-website`)).

## The four scoping decisions Allan made up front

Asked before any code was written, and they are the shape of the whole thing:

1. **Standalone repo**, not a section of stoatworks-labs.com.
2. **Full technical detail goes public, but the research repos stay PRIVATE.** The site is the
   public face of `yamaha-ql-re`, `sq5-re`, `wing-os`, `soundgrid-protocol`, `dmix-surface`,
   `loom` — none of which flip visibility.
3. **Nine entries**: the four teardowns + dMix 128 + LOOM as the contrast case + candidate
   stubs. (Yamaha DM3 turned out to have a real 208-line doc, so it is a `partial` entry, not
   a stub.)
4. **Naming third-party products is the point here.**

## The naming departure — the thing most likely to get "fixed" wrongly

The main site **deliberately strips third-party product names** (Aquilon, Barco E3, d&b R70
all removed at Allan's request). This site names manufacturers and model numbers on every
page. Allan confirmed that explicitly: RE documentation is meaningless without the model
number, and the no-naming rule is **scoped to the commercial product pages** on the other
site. A fleet-wide sweep that harmonises the two would destroy this site. Recorded in its
AGENTS.md too, and the nominative-use position is stated on `/method/#trademarks`.

## Content boundaries baked into the site

`/method/` states five hard boundaries and they are binding on future edits: no
licensing/entitlement/DRM analysis (the SQ-5's mechanism was identified and the page records
only that it exists — the DNA/key-scheme detail in
[sq5 firmware platform](https://github.com/stoatworks-labs/fleet-notes/blob/main/notes/reference_sq5_firmware_platform.md) is deliberately **not** on the site); nothing enabling
unlicensed use; no exploits or modification instructions; no redistribution of manufacturer
material; nothing sourced from incompatibly licensed projects.

The page also does something worth keeping: it refuses the two terms everyone misuses —
this is **not black-box** (findings come from inspecting vendor binaries) and **not
clean-room** (no implementation, so no team separation). Lifted from
`soundgrid-protocol/docs/00-methodology-and-legal.md`, which was already the best legal
writing in the fleet and is the backbone of the page.

## Data model

**`src/data/platforms.json` is the single source of truth** — index, detail pages and the
per-platform table on `/method/` all derive from it. No live fetch, by design.

Every `hardware`/`software`/`security` row is `{label, value, confidence}` and **confidence
has no default** — four levels, `verified` / `inferred` / `unknown` / `public`. The
distribution is the honesty check: WING is 8 unknown / 5 inferred / 1 verified (no hardware
ever acquired), SQ-5 is 18 verified / 1 inferred. Backticks in a value render as `<code>`;
nothing else is parsed.

**A finding corrected in the research repo does NOT propagate here** — hand-maintained on
purpose, same as the main site's `projects.json`, and the same staleness risk applies.

## Traps found building it

- **A `title` attribute beats button text in the accessible-name computation.** The status
  filter chips announced their entire tooltip instead of "Documented". Fixed with an explicit
  `aria-label`; keep both attributes.
- **HTML comments are invalid inside an Astro expression block** — `{list.map(...)}` needs
  `{/* */}` outside the map, not `<!-- -->` inside it. Fails as `[CompilerError] Unexpected
  token` pointing at the comment line.
- **`year: 0` means "no meaningful date"** (LOOM). Both year sorters special-case it so it
  parks last in both directions rather than sorting as year zero.
- **Browser-pane screenshots came back blank once the page was scrolled** (pane reported
  hidden). Unscrolled captures were fine. DOM reads via `javascript_tool` verified the tables
  instead — consistent with **screenshot capture** (working-practice note, kept in Claude memory) and
  [browser pane verification traps](https://github.com/stoatworks-labs/fleet-notes/blob/main/notes/reference_browser_pane_verification_traps.md).

- **Deploy verification: the edge 404s for a minute or two after upload, on random paths.**
  Immediately after `wrangler deploy` the same URLs flapped 200/404 across three passes ~4 s
  apart, settling to all-200 shortly after. Do **not** diagnose from one pass, and note that
  checking status and body in *separate* curls produces a fake contradiction (correct `<title>`
  alongside a 404) because they are two different requests hitting different edge states. One
  request per URL, capture both. Matches [stoatworks website](https://github.com/stoatworks-labs/stoatworks-website/blob/main/docs/NOTES.md) (`stoatworks-website`)'s flapping warning.

## Discovery stack (added 2026-08-07, all verified live)

`/robots.txt`, `/sitemap-index.xml` (13 URLs, 404 excluded), `/llms.txt` and JSON-LD on every
page. Built per [seo ai discovery](https://github.com/stoatworks-labs/fleet-notes/blob/main/notes/reference_seo_ai_discovery.md) — and it caught that trap in the wild: **the
site was serving Cloudflare's content-signals preamble ALONE with no signals**, which under
the preamble's own clause (c) means *silent* about AI use, not permitting. Now grants
`search=yes, ai-input=yes, ai-train=yes`, repeated in all 8 named crawler groups because a
named group REPLACES `User-agent: *`.

`/llms.txt` is generated from `platforms.json` at build (`src/pages/llms.txt.ts`) and
deliberately emits each entry's **status and open questions**, so anything summarising the
site inherits "nothing tested on hardware" rather than the findings alone. Platform pages
carry a `TechArticle` whose `about` names the product and whose `isBasedOn` lists the
artifacts. **No og:image anywhere** — the fleet convention points at
`stoatworks-labs.com/thumbs/<name>.png` and no card exists for this site yet.

## Attaching the custom domain — what actually happened

`"routes": [{"pattern": "aux-opsy.com", "custom_domain": true}]` in `wrangler.jsonc` + deploy
was all it took; the token already had rights on the new zone, no dashboard needed. But
**expect ~2 minutes of lying afterwards**, and do not debug during it:

- **Intermittent `500`s on random paths**, moving between paths on each pass — `/` then
  `/platforms/loom/`, never the same one twice. Not a broken page; it settles to all-200.
  Distinct from the plain 404 flapping seen on the first deploy.
- **The workers.dev URL 404s** for a minute after a rename before coming good.
- **This Mac's resolver negative-caches the new name for far longer than the edge takes.**
  `dig @1.1.1.1` answered immediately while `dig` with no server stayed empty and every plain
  `curl` returned `000`. Verify with `curl --resolve aux-opsy.com:443:<ip>` — concluding "the
  deploy failed" from a bare curl is the trap. The Browser pane can't do `--resolve`, so
  verify visuals on the local preview instead.

## The Midas HD96 entry came from a co-session

While this site was first being deployed, another session working `~/Projects/hd96-re`
appended a **Midas HD96** entry to `src/data/platforms.json`. It was held back from the first
deploy (unreviewed, and that repo had a dirty file = RUNNING co-session per
**fleet sweep preflight** (working-practice note, kept in Claude memory)), then **published on Allan's say-so** after cross-checking
it against `hd96-re`: both Spartan-6 IDCODEs, ARM920T, Tegra124 and the :9990/:9094 ports all
matched, and the recovered proto3 schema really is in its `proto/`. See [hd96 re](https://github.com/stoatworks-labs/hd96-re/blob/main/docs/NOTES.md) (`hd96-re`).

**Its backticks were stripped somewhere in that hand-off** — HD96 rendered its inline code as
plain text while the other nine used `<code>`. **Fixed 2026-08-07** once `hd96-re` was
committed and clean; 50 code spans now. The fix had to be a **line-scoped text edit**, because
the first attempt round-tripped the file through `json.dumps` and reformatted all 648 lines —
`platforms.json` is hand-formatted (one object per line, inline `tags` arrays) and a reformat
collides head-on with whoever else is in it.

**The standing hazard this exposed:** `astro build` takes the **working tree, not HEAD**, so
any uncommitted edit another session leaves in `platforms.json` ships on the next
`cf-run npm run deploy`. Check `git status` before every deploy, exactly as
[stoatworks website](https://github.com/stoatworks-labs/stoatworks-website/blob/main/docs/NOTES.md) (`stoatworks-website`) records for the main site.

**The same hazard runs the other way, and it is what "the live site is behind" usually means.**
`platforms.json` is the file co-sessions append to, and a session that *finishes and stops*
without committing leaves the site correct-but-stale with no dirty-file owner to respect. This
happened with the ATEM entry on **2026-08-08** ([atem re](https://github.com/stoatworks-labs/fleet-notes/blob/main/notes/project_atem_re.md)). Triage order when Allan
says the site looks behind:

1. `git status` **and** `git log origin/main..` — the live site is usually already level with
   `origin/main`, and the delta is uncommitted local work, not a failed deploy.
2. `mcp__ccd_session_mgmt__list_sessions` to check `isRunning` on whoever owns it.
   **Stopped ⇒ finished work, safe to review and ship. Running ⇒ leave it alone**
   (**fleet sweep preflight** (working-practice note, kept in Claude memory)).
3. Only then deploy. A bare redeploy when live already matches `origin/main` is a no-op and
   will not fix the complaint.

Verified: builds clean; search, both filter groups and all six sort orders exercised
in-browser and correct; light and dark both render; all 13 live routes return 200 with the
right titles. **Not** verified: the technical content itself, which is transcribed research,
and the HD96 entry, which was never reviewed against its own repo.
