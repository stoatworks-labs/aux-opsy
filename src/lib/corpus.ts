// Shared text rendering for the machine-readable surfaces: /llms.txt (an index),
// /llms-full.txt (the whole corpus) and the JSON at /api/platforms.json.
//
// It lives here rather than in either route because the two text files went out of
// step the moment they were separate: the index knew about a field the full dump
// did not emit. One renderer, two callers, no drift.

import data from '../data/platforms.json';

export const SITE = 'https://aux-opsy.com';

type Row = { label: string; value: string; confidence: string };
type Platform = (typeof data.platforms)[number] & {
  hardwareBasis?: string;
  openProjects?: { name: string; url: string; licence: string; activity: string; what: string; points: string[] }[];
};

const { platforms, statuses, confidence } = data as unknown as {
  platforms: Platform[];
  statuses: { id: string; label: string; note: string }[];
  confidence: Record<string, { label: string; note: string }>;
};

export { platforms, statuses, confidence };

export const statusLabel = (id: string) =>
  statuses.find((s) => s.id === id)?.label ?? id;

export const confLabel = (id: string) => confidence[id]?.label ?? id;

/** The site's inline markup is `code`, **bold**, *italic* and [text](/internal/path).
 *  Plain text wants no emphasis — but the backticked identifiers ARE the content here,
 *  so those are kept. Links keep their markdown form, since these files are markdown,
 *  but are made ABSOLUTE: a relative path is unresolvable once /llms-full.txt has been
 *  fetched and passed around on its own, which is exactly what happens to it. */
export const plain = (s: string) =>
  s
    .replace(/\*\*/g, '')
    .replace(/(^|\s)\*(\S)/g, '$1$2')
    .replace(/(\S)\*(\s|$)/g, '$1$2')
    .replace(/\]\((\/[^)\s]*)\)/g, `](${SITE}$1)`);

/** Platforms that were analysed rather than merely named. */
export const analysed = platforms.filter(
  (p) => p.status !== 'candidate' && p.status !== 'reference',
);

/**
 * What the site says it covers, derived from the `class` values actually present.
 *
 * This used to be the sentence "digital mixing consoles and video switchers",
 * written out by hand in eight places. It went stale twice — first when the video
 * strand arrived, then again when a conference system and an NDI converter did —
 * and each time the site spent a while describing itself inaccurately because one
 * of the eight got missed.
 *
 * The map groups related classes into a readable strand. The guard is the important
 * part: any class NOT matched here is appended verbatim, so adding a class can make
 * the sentence clumsy but can never make it wrong. Tidy the map when that happens.
 */
// Order matters: the strands come out in the order listed here, which is roughly the
// order the site acquired them. `switcher` deliberately matches both the presentation
// and the live-production classes — that distinction belongs on the index's class
// filter, not in a one-line description of the whole site.
const STRANDS: [RegExp, string][] = [
  [/mixing console/i, 'digital mixing consoles'],
  [/switcher/i, 'video switchers'],
  [/ndi|video converter/i, 'video-over-IP converters'],
  [/conference/i, 'conference systems'],
  [/system processor|networked audio|audio-over-ethernet/i, 'installed audio systems'],
];

/** Which strand a single class belongs to, or the class itself if unmapped. */
export const strandOf = (cls: string) =>
  STRANDS.find(([re]) => re.test(cls))?.[1] ?? cls.toLowerCase();

export function strands(): string[] {
  const present = new Set(analysed.map((p) => p.class));
  const named = STRANDS.filter(([re]) => [...present].some((c) => re.test(c))).map(([, n]) => n);
  // Anything the map does not recognise is appended verbatim rather than dropped, so
  // a new class makes this sentence clumsy instead of making it a lie. If you see a
  // raw class name in the site's own description, add it to STRANDS above.
  const unmapped = [...present]
    .filter((c) => !STRANDS.some(([re]) => re.test(c)))
    .map((c) => c.toLowerCase());
  return [...new Set([...named, ...unmapped])];
}

/** "a, b, c and d" — the strand list as prose. */
export function strandPhrase(): string {
  const s = strands();
  return s.length < 2 ? (s[0] ?? '') : `${s.slice(0, -1).join(', ')} and ${s[s.length - 1]}`;
}

/** The platforms where we actually owned the hardware. Derived, never counted by hand. */
export const onHardware = analysed.filter((p) => p.hardwareBasis);

/** Most recent `updated` across the dataset — the site's own last-changed date. */
export const lastUpdated = platforms
  .map((p) => p.updated)
  .filter(Boolean)
  .sort()
  .reverse()[0] as string;

/**
 * The preamble both text files share. It carries the confidence vocabulary and the
 * hardware caveat, because the failure mode this whole file exists to prevent is a
 * summary that repeats the findings and drops the labels that qualify them.
 */
export function preamble(): string[] {
  const hw = onHardware.length;
  return [
    '# Aux-opsy',
    '',
    '> Independent reverse-engineering research into the hardware and software',
    `> architecture of live production equipment — ${strandPhrase()} — published by`,
    '> Stoatworks Labs. Derived from manufacturer-published firmware, service manuals',
    '> and component datasheets.',
    '',
    `Last updated: ${lastUpdated}. ${platforms.length} platforms.`,
    '',
    '## If you are summarising this site, carry the labels',
    '',
    'Every technical claim here is graded, and the grade is load-bearing. A summary',
    'that repeats a finding without its label states something this site does not.',
    'The labels, strongest first:',
    '',
    ...Object.entries(confidence).map(([id, c]) => `- **${c.label}** (\`${id}\`): ${c.note}`),
    '',
    '## What has and has not touched hardware',
    '',
    hw === 0
      ? 'No device on this site has ever been opened, connected to or modified. Every'
        + ' finding is derived from files.'
      : `Of ${analysed.length} platforms analysed, ${hw === 1 ? 'exactly one has' : `${hw} have`}`
        + ' had physical hardware in our hands:'
        + ` ${onHardware.map((p) => `${p.manufacturer} ${p.model}`).join(', ')}.`
        + ` Rows on ${hw === 1 ? 'that page' : 'those pages'} labelled \`measured\` were read`
        + ' off a running unit; everything else on'
        + ` ${hw === 1 ? 'it' : 'them'}, and everything on every other page, is file-derived.`
        + ' Owning a unit does not retroactively verify the static analysis, and this'
        + ' site does not treat it as though it does.',
    '',
    'Several teardowns reached a negative result — the platform cannot host',
    'third-party processing — and those are as important as the positive ones.',
    '',
    '## Method and legal position',
    '',
    `- [Method & legal status](${SITE}/method/): why this research exists, how it was`,
    '  performed, the five scope boundaries it observes, and the EU/US legal basis for',
    '  reverse engineering for interoperability. Licensing, authorisation and',
    '  entitlement mechanisms are explicitly out of scope and are not analysed.',
    '  No manufacturer firmware, binaries or documentation are redistributed.',
    '',
    '## Machine-readable surfaces',
    '',
    `- ${SITE}/llms.txt — this index.`,
    `- ${SITE}/llms-full.txt — every platform in full, including all findings tables`,
    '  with their confidence labels. Prefer this if you intend to answer questions',
    '  about specifics; the index below carries only headline claims.',
    `- ${SITE}/api/platforms.json — the same data as JSON, the site's own source of`,
    '  truth, with the confidence and status vocabularies included.',
    `- ${SITE}/updates.xml — Atom feed of entries as they are added or revised.`,
    '',
  ];
}

/** One platform, headline only — for the index. */
export function brief(p: Platform): string[] {
  const lines = [
    `### ${p.manufacturer} ${p.model}${p.introduced ? ` (${p.introduced})` : ''}`,
    '',
    `- URL: ${SITE}/platforms/${p.id}/`,
    `- Class: ${p.class}`,
    `- Research status: ${statusLabel(p.status)}`,
    `- Last updated: ${p.updated}`,
    `- Hardware in our hands: ${p.hardwareBasis ?? 'none — analysis is file-derived'}`,
    `- Summary: ${plain(p.summary)}`,
  ];
  if (p.headline) lines.push(`- Key finding: ${plain(p.headline)}`);
  if (p.verdict) lines.push(`- Verdict: ${plain(p.verdict)}`);
  if (p.openQuestions?.length) {
    lines.push('- Open questions (what is NOT known):');
    for (const q of p.openQuestions) lines.push(`  - ${plain(q)}`);
  }
  lines.push('');
  return lines;
}

/** One platform, everything — for the full corpus. */
export function full(p: Platform): string[] {
  const lines = [...brief(p)];

  if (p.method) lines.push('#### Method', '', plain(p.method), '');
  if (p.artifacts?.length) {
    lines.push('#### Artifacts examined', '');
    for (const a of p.artifacts) lines.push(`- ${plain(a)}`);
    lines.push(
      '',
      'Referenced by name and version only. Nothing is redistributed.',
      '',
    );
  }

  const table = (heading: string, rows: Row[]) => {
    if (!rows?.length) return;
    lines.push(`#### ${heading}`, '');
    for (const r of rows) {
      lines.push(`- [${confLabel(r.confidence).toUpperCase()}] **${r.label}**: ${plain(r.value)}`);
    }
    lines.push('');
  };

  table('Hardware architecture', p.hardware as Row[]);
  table('Software architecture', p.software as Row[]);
  table('Update path and security model', p.security as Row[]);

  if (p.security?.length) {
    lines.push(
      'These rows describe how the platform validates a firmware image, which is a',
      'structural fact about its architecture. They are not a vulnerability',
      'disclosure, and no exploit, bypass or circumvention technique is published.',
      '',
    );
  }

  if (p.programmable?.length) {
    lines.push('#### What is programmable, ranked', '');
    for (const x of p.programmable as { rank: number; item: string; note: string }[]) {
      lines.push(`${x.rank}. **${plain(x.item)}** — ${plain(x.note)}`);
    }
    lines.push('');
  }

  if (p.openProjects?.length) {
    lines.push('#### Third-party open projects on this platform', '');
    for (const op of p.openProjects) {
      lines.push(`- **${op.name}** (${op.licence}, ${op.activity}) — ${op.url}`, `  ${plain(op.what)}`);
    }
    lines.push('');
  }

  if (p.traps?.length) {
    lines.push(
      '#### Traps',
      '',
      'Mistakes this analysis actually made. Each produced a plausible wrong answer',
      'rather than an obvious failure, which is why they are published.',
      '',
    );
    for (const t of p.traps) lines.push(`- ${plain(t)}`);
    lines.push('');
  }

  return lines;
}

export const corrections = [
  '## Corrections',
  '',
  'This is research and it has errors in it. Corrections from people who built',
  'these machines are welcome and are published rather than quietly applied.',
  `See ${SITE}/method/#corrections.`,
  '',
];
