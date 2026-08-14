import type { APIRoute } from 'astro';
import { platforms, preamble, brief, corrections } from '../lib/corpus';

// Generated from platforms.json at build time so it cannot drift from the site.
//
// Honest caveat: llms.txt is a proposal, not a standard any assistant is documented
// to fetch. The JSON-LD, the sitemap and the robots.txt content signals are what
// actually do the work. This exists because the cost is a few lines and the
// alternative is an assistant summarising the site from the headlines alone — which
// is exactly how the confidence labels get dropped.
//
// This file is the INDEX: headline claim, verdict and open questions per platform.
// The findings tables live in /llms-full.txt, and the shared preamble points at it.
// Splitting them keeps this file small enough to be read whole while still leaving a
// complete corpus one fetch away.

export const GET: APIRoute = () => {
  const lines = [
    ...preamble(),
    '## Platforms',
    '',
    ...platforms.flatMap(brief),
    ...corrections,
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=600, must-revalidate',
    },
  });
};
