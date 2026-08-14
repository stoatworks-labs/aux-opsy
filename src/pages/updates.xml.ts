import type { APIRoute } from 'astro';
import { SITE, platforms, statusLabel, plain, lastUpdated } from '../lib/corpus';

// Atom rather than RSS: it has a real `updated` element per entry, which is the
// whole point here. Entries are revised in place on this site far more often than
// they are added, and a feed that only announced new platforms would go quiet while
// the research kept moving.
//
// Hand-rolled rather than pulled in as a dependency — the site has zero runtime deps
// and a feed is forty lines of string building.

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// A date-only `updated` is not a valid Atom timestamp; Atom wants RFC 3339.
const stamp = (d: string) => `${d}T00:00:00Z`;

export const GET: APIRoute = () => {
  const sorted = [...platforms].sort((a, b) => (b.updated ?? '').localeCompare(a.updated ?? ''));

  const entries = sorted.map((p) => {
    const url = `${SITE}/platforms/${p.id}/`;
    const summary = [
      plain(p.summary),
      p.headline ? `Key finding: ${plain(p.headline)}` : '',
      `Research status: ${statusLabel(p.status)}.`,
      (p as { hardwareBasis?: string }).hardwareBasis
        ? `Hardware in our hands: ${(p as { hardwareBasis?: string }).hardwareBasis}.`
        : 'No hardware involved — analysis is derived from files.',
    ]
      .filter(Boolean)
      .join(' ');

    return [
      '  <entry>',
      `    <title>${esc(`${p.manufacturer} ${p.model}`)}</title>`,
      `    <link href="${url}"/>`,
      `    <id>${url}</id>`,
      `    <updated>${stamp(p.updated)}</updated>`,
      `    <category term="${esc(p.class)}"/>`,
      `    <summary>${esc(summary)}</summary>`,
      '  </entry>',
    ].join('\n');
  });

  const xml = [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    '  <title>Aux-opsy — platform teardowns</title>',
    '  <subtitle>Reverse-engineering research on digital mixing consoles, video switchers and video-over-IP converters.</subtitle>',
    `  <link href="${SITE}/updates.xml" rel="self"/>`,
    `  <link href="${SITE}/"/>`,
    `  <id>${SITE}/</id>`,
    `  <updated>${stamp(lastUpdated)}</updated>`,
    '  <author><name>Stoatworks Labs</name></author>',
    ...entries,
    '</feed>',
    '',
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600, must-revalidate',
    },
  });
};
