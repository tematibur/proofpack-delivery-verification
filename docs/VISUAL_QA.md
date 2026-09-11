# Visual QA ledger

Accepted concept: `work/concepts/proofpack-ui-concept.png`.

Rendered implementation: captured at 1440 x 1000 through Playwright after the core UI had already been checked in the Codex in-app browser. The Playwright capture was needed only to save a local file for side-by-side `view_image` inspection.

## Comparison points

| Area | Concept evidence | Render evidence | Result |
| --- | --- | --- | --- |
| Information architecture | Header, input rail, results, table, evidence inspector | Same order and hierarchy | Match |
| Palette | True white, navy text, cool gray borders, teal accent | Same palette, no gradients | Match |
| Typography | Compact UI chrome and readable table hierarchy | Explicit control/table sizes and weights | Match |
| Results | Summary counts plus row-level statuses | Confirmed, identity mismatch, quantity mismatch and unverified | Match |
| Evidence | Selected row, source reference and bounding box | Direct overlay on the original uploaded image | Match |
| Responsive behavior | Desktop-first product surface | Verified at 390 x 844; input panel stacks before results | Match |
| Core controls | PDF, up to three photos, run and reset | Uploads accept the required sources and validation error is visible | Match |

## Copy diff

No unapproved marketing copy, navigation, fake metrics or decorative badges were added above the fold. The empty state adds only capture instructions and test-kit downloads required to make the prototype usable.

## Intentional deviations

- The implementation shows four packing-list rows because the reproducible test set covers the required correct, wrong identity, extra quantity and obscured-label cases with four product types.
- The concept included a separate zoomed crop. The implementation instead overlays the evidence box on the original photo, avoiding a second model-generated crop and keeping the source intact.
- The QA fixture used a rendered label sheet as a stand-in image only for visual comparison. The temporary fixture route and asset were removed before handoff. Real results use user-uploaded photographs.

No material visual mismatch remains in the implemented empty/upload state or results structure.
