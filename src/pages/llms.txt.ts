import type { APIRoute } from 'astro';
import data from '../data/platforms.json';

// Generated from platforms.json at build time so it cannot drift from the site.
//
// Honest caveat: llms.txt is a proposal, not a standard any assistant is
// documented to fetch. The JSON-LD, the sitemap and the robots.txt content
// signals are what actually do the work. This exists because the cost is a few
// lines and the alternative is an assistant summarising the site from the
// headlines alone — which is exactly how the confidence labels get dropped.
//
// That is why every entry below carries its status and its open questions:
// anything summarising this site inherits "nothing has been tested on hardware"
// rather than the findings on their own.

const SITE = 'https://aux-opsy.com';

export const GET: APIRoute = () => {
  const { platforms, statuses, confidence } = data;
  const statusLabel = (id: string) =>
    statuses.find((s) => s.id === id)?.label ?? id;

  const lines: string[] = [
    '# Aux-opsy',
    '',
    '> Independent reverse-engineering research into the hardware and software',
    '> architecture of live production equipment — digital mixing consoles and video',
    '> switchers — published by Stoatworks Labs. Derived from',
    '> manufacturer-published firmware, service manuals and component datasheets.',
    '> No device has ever been opened, connected to or modified.',
    '',
    '## How to read this site',
    '',
    'Every technical claim carries one of four confidence labels. They are used',
    'strictly, and any summary of this material should carry them too:',
    '',
    ...Object.values(confidence).map((c) => `- **${c.label}**: ${c.note}`),
    '',
    'Several of the teardowns reached a negative result — the platform cannot host',
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
    '## Platforms',
    '',
  ];

  for (const p of platforms) {
    lines.push(
      `### ${p.manufacturer} ${p.model}${p.introduced ? ` (${p.introduced})` : ''}`,
      '',
      `- URL: ${SITE}/platforms/${p.id}/`,
      `- Class: ${p.class}`,
      `- Research status: ${statusLabel(p.status)}`,
      `- Summary: ${p.summary}`,
    );
    if (p.headline) lines.push(`- Key finding: ${p.headline.replace(/`/g, '')}`);
    if (p.verdict) lines.push(`- Verdict: ${p.verdict}`);
    if (p.openQuestions?.length) {
      lines.push('- Open questions (what is NOT known):');
      for (const q of p.openQuestions) lines.push(`  - ${q}`);
    }
    lines.push('');
  }

  lines.push(
    '## Corrections',
    '',
    'This is research and it has errors in it. Corrections from people who built',
    'these machines are welcome and are published rather than quietly applied.',
    `See ${SITE}/method/#corrections.`,
    '',
  );

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=600, must-revalidate',
    },
  });
};
