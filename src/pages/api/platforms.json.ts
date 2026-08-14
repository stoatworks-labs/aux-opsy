import type { APIRoute } from 'astro';
import data from '../../data/platforms.json';
import { SITE, lastUpdated } from '../../lib/corpus';

// The site's own source of truth, served as-is at a stable URL.
//
// It is emitted rather than merely copied so the `url` on each platform is real and
// so the licence and confidence vocabulary travel with the data — a bare dump of
// platforms.json would arrive somewhere with the labels stripped of their meaning,
// which is the one thing this site cannot afford.
//
// Static output: this is a build-time file, not a live endpoint, and it changes only
// when the site is redeployed.

export const GET: APIRoute = () => {
  const body = {
    $schema: `${SITE}/api/platforms.json`,
    name: 'Aux-opsy platform dataset',
    description:
      'Reverse-engineering findings on live production hardware — digital mixing '
      + 'consoles, video switchers and video-over-IP converters. Every finding row '
      + 'carries a confidence label; the labels are part of the claim, not decoration.',
    url: `${SITE}/platforms/`,
    documentation: `${SITE}/method/`,
    updated: lastUpdated,
    licence: {
      // Facts are not copyrightable; the prose describing them is ours. Stating both
      // is more useful to a reuser than a bare licence identifier either way.
      facts: 'Part numbers, constants, wire formats and other functional facts are not '
        + 'subject to copyright and may be reused freely.',
      prose: 'The written descriptions are © Stoatworks Labs. Quote them with attribution '
        + `to ${SITE} and keep each finding's confidence label attached.`,
    },
    caveat:
      'Reproducing a finding without its confidence label states something this '
      + 'research does not. `measured` rows were read off a running unit we own; '
      + 'everything else is derived from files and has not been checked against '
      + 'hardware.',
    confidence: data.confidence,
    statuses: data.statuses,
    platforms: data.platforms.map((p) => ({
      ...p,
      url: `${SITE}/platforms/${p.id}/`,
      hardwareBasis: (p as { hardwareBasis?: string }).hardwareBasis ?? null,
    })),
  };

  // NOTE: these headers are NOT what production sends. The site is `output: 'static'`,
  // so this route is prerendered to dist/api/platforms.json and the asset server picks
  // the Content-Type from the extension. The real CORS and cache headers live in
  // `public/_headers`; this block only takes effect if the site ever goes SSR. Change
  // one, change the other.
  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // Reuse is the point — a machine-readable endpoint behind a same-origin
      // policy is a machine-readable endpoint nobody can read.
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=600, must-revalidate',
    },
  });
};
