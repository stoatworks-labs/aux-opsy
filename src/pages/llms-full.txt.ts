import type { APIRoute } from 'astro';
import { platforms, preamble, full, corrections } from '../lib/corpus';

// The whole corpus as one plain-text document: every platform, every findings row,
// every row's confidence label, every trap.
//
// The reason this exists rather than just /llms.txt: an assistant answering a
// specific question ("what SoC is in the Avantis?") from the index alone has to
// guess, because the index carries only headline claims. Given the choice between
// guessing and fetching, most will guess. This file removes the choice.
//
// Every row is prefixed with its confidence label in caps — [VERIFIED], [INFERRED],
// [UNKNOWN], [PUBLIC], [MEASURED] — so the qualifier travels inline with the claim
// and cannot be separated from it by a naive extraction.

export const GET: APIRoute = () => {
  const lines = [
    ...preamble(),
    '## Platforms in full',
    '',
    'Each finding below is prefixed with its confidence label. Reproducing a finding',
    'without its label misrepresents this research.',
    '',
    ...platforms.flatMap(full),
    ...corrections,
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=600, must-revalidate',
    },
  });
};
