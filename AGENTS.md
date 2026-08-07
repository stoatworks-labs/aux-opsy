# AGENTS.md — console-internals

Conventions and hard-won facts for anyone (human or agent) working in this repo.
Read this before editing. See `README.md` for what the project *is*.

## What is verified, and what is assumed

**Verified in this repo:**

- The site builds clean (13 pages) and every route renders.
- Search, status filter, class filter and all six sort orders were exercised in a real
  browser and produce correct results — including the year sort parking the undated entry
  (LOOM) last in both directions.
- Light and dark both render correctly, with the navy band surviving in light mode.

**Assumed / not verified:**

- **The technical content.** It is a curated rendering of five private research repos. It was
  transcribed faithfully, but no claim here has been independently re-derived, and the
  research itself is largely unverified against hardware — which the site says on every page.
- **Deployment.** Nothing has been deployed. There is no domain, no Cloudflare Worker and no
  GitHub remote yet.

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
  preview config is named `console-internals` on port 4531 and is already registered there.
- **`year: 0` means "no meaningful date"**, used for our own design. Both year sorters special-
  case it so it parks last rather than sorting as the year zero. Don't "simplify" that away.

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
