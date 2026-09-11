# Proofpack controlled test set

Record expected outcomes before running the app. Do not modify this file after seeing model output; put actual results in `docs/DELIVERY_NOTES.md`.

## Physical contents

Use ordinary shareable household objects. Attach the matching cut-out labels from `printable-unit-labels.pdf`:

- one mug: `MUG-BLUE-12`, `UNIT-01` (correct);
- one towel: `TOWEL-SAND-20`, `UNIT-02` (wrong but similarly named);
- three soap bars: `SOAP-LAV-100`, `UNIT-03` to `UNIT-05` (one extra unit);
- one candle: `CANDLE-VAN-08`, `UNIT-06` (SKU deliberately obscured in every submitted initial photo).

The packing list expects five physical units. The staged initial delivery contains six.

## Capture convention

Each physical object keeps one unique `UNIT-XX` label attached in all photographs. Do not move, remove or swap labels between photographs. Use:

1. `initial/photo-1-overview.jpg`: all six objects in one frame; every UNIT ID visible; candle SKU covered with an opaque note.
2. `initial/photo-2-labels.jpg`: close-up of mug, towel and at least two soap labels while preserving their UNIT IDs.
3. `initial/photo-3-ambiguity.jpg`: candle and soaps from another angle; keep the candle SKU obscured and all visible UNIT IDs unchanged.

This convention lets the app merge repeated views of the same physical object. If an ID is unreadable, the product must mark the count unverified rather than guess.

## Expected initial findings

- Row 1: `Confirmed` - exact mug SKU, one distinct unit.
- Row 2: `Identity mismatch` - expected `TOWEL-SAND-02`, visible `TOWEL-SAND-20`.
- Row 3: `Quantity mismatch` - expected 2, visible 3 distinct units with the exact SKU.
- Row 4: `Unverified` - object/UNIT may be visible, but SKU is obscured. It must not be called missing.
- No object should be counted twice across photographs.
- Every conclusive result must cite the packing-list row and at least one image bounding box.

## Corrected-delivery example

Remove `UNIT-02` and `UNIT-05`. Add a replacement towel with `TOWEL-SAND-02`, `UNIT-07`. Uncover the candle SKU. Photograph the corrected five units using the same overview plus close-up convention. Expected result: all four document rows confirmed, no mismatches, no unverified rows.

## Clarification/decline input

Use the initial photo set with the candle SKU covered. Expected behavior: ask for a clear photo showing both `CANDLE-VAN-08` and `UNIT-06`; do not conclude that the candle is absent.

## File naming

Place the real photographs under `sample-data/initial/` and `sample-data/corrected/`. Keep the exact filenames above where possible so the test can be reproduced.
