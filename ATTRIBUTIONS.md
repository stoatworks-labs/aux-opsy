# Attributions

Aux-opsy is built on other people's work. This file lists what that work is, who did
it, and what it is doing here.

It is generated — the master lists live in the `stoatworks-backend` repo and are
pushed out by `scripts/sync-attributions.py`. Edit it there, not here.

## Third-party code this project uses

Libraries, SDKs and frameworks the project is built on or bundles.

### Astro

<https://astro.build>  
Licence: MIT  
Copyright: The Astro Technology Company

An npm dependency.

Builds this site to static HTML, so the pages carry no framework runtime to the reader.

### The npm ecosystem

<https://www.npmjs.com>  
Licence: predominantly MIT  
Copyright: the individual package authors

npm dependencies, resolved and pinned in the lockfile.

Build tooling, test runners and the libraries the front ends are assembled from. The exact set and versions for any build are in that repo's lockfile, which is the authoritative list.

The full transitive dependency set for any build is pinned in this repo's lockfile,
which is the authoritative list. What is named above is the layers a reader would
want to know about, not every package that has ever been resolved.

## Work we checked ourselves against

No code was taken from these — but they were how we knew we had it right, and that is worth saying out loud.

### OpenX32

<https://github.com/OpenMixerProject/OpenX32>  
Licence: GPL-3.0

The X32 / M32 entry's findings were cross-checked against OpenX32's published material, written by people who have the hardware, and that corrected three claims: the DSP split, the second-source FPGA and the digest format. The i.MX253 identification comes from OpenX32, and the dcp_compiler.pl and dcp_decompiler.pl it publishes, the original 2012 Behringer tool released with the author's permission, are among the artifacts examined. The page lists it, with OpenMixerControl, as a third-party open project.

### OpenWING

<https://github.com/OpenMixerProject/OpenWING>  
Licence: GPL-3.0

The WING Compact entry reads OpenWING's device tree for the fullsize WING (imx6dl, so DualLite and dual-core), and records that its .wingfw unpack, repack and verify tooling means the format is solved there and withheld, the implementation and constants living in a private repository.

### Project X-Ray and fasm2bels

The SQ-5 entry's fabric work goes bitstream to FASM to netlist to simulator, using Project X-Ray's bit-to-feature database and fasm2bels; the parts of that route which touch the console were run end to end.

### Wireshark's ACN dissector

The QLXD4 captures were decoded with a hand-written parser checked byte for byte against Wireshark's own ACN dissector; where the two disagreed on vector names, Wireshark won.

### Bitfocus Companion MXCW module

Read in full, every commit and every issue, as the one other public implementation of Shure's MXCW command strings. It is a careful transcription of the same Shure publication the entry uses, so it is recorded as prior art rather than corroboration; what it contributes of its own is a keepalive pattern and an explicitly guessed RSSI offset.

## Getting this wrong

If your work is here and the description is inaccurate, the licence is wrong, or you would rather not be listed — open an issue and it will be fixed.
