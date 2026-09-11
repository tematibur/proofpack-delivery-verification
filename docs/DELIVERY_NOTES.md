# Delivery notes

## Product

Proofpack verifies a small delivery against a one-page packing list using printed SKU and `UNIT-XX` labels. It reports confirmed rows, visible identity/quantity mismatches and items that cannot be checked. Every conclusive result links a document row to a bounding box on a supporting photo.

## Test inputs and expected outcomes

Expected outcomes were recorded in `sample-data/expected-findings.json` before model testing.

Initial controlled delivery:

- Row 1: correct `MUG-BLUE-12`, quantity 1 -> Confirmed.
- Row 2: visible `TOWEL-SAND-20` against expected `TOWEL-SAND-02` -> Identity mismatch.
- Row 3: three distinct `SOAP-LAV-100` units against expected quantity 2 -> Quantity mismatch.
- Row 4: candle SKU obscured -> Unverified and request another photo; never claim missing.
- Repeated objects across photos must be consolidated by their unchanged UNIT IDs.

Corrected delivery:

- remove the wrong towel `UNIT-02` and extra soap `UNIT-05`;
- add the correct towel `TOWEL-SAND-02`, `UNIT-07`;
- uncover the candle SKU;
- expected summary: 4 confirmed, 0 mismatches, 0 unverified.

## Actual results

Pending the first live API run. Five AI-generated development fixtures are included under `sample-data/synthetic/`; they are disclosed as synthetic and do not replace the required real controlled photographs. Fill the table from saved app output without changing the pre-recorded expectations.

| Case | Expected | Actual | Evidence/source check | Pass? |
| --- | --- | --- | --- | --- |
| Correct mug | Confirmed | Pending | Row 1 + photo region | Pending |
| Wrong towel SKU | Identity mismatch | Pending | Row 2 + label region | Pending |
| Extra soap unit | Quantity mismatch, 3 vs 2 | Pending | Row 3 + distinct UNIT IDs | Pending |
| Obscured candle | Unverified, request photo | Pending | Row 4, no false missing claim | Pending |
| Corrected delivery | 4 confirmed | Pending | Every row + image region | Pending |

## Speed and variable cost

The app records API wall-clock duration, model, input tokens, cached input tokens, output tokens, retries and estimated USD cost for every operation.

Pricing assumption used in code for `gpt-5.6-sol`: $4.00 per million uncached input tokens, $0.40 per million cached input tokens and $20.00 per million output tokens. Update the constants if pricing changes before submission.

| Run | Useful result time | Input tokens | Output tokens | Retries | Estimated variable cost |
| --- | ---: | ---: | ---: | ---: | ---: |
| Initial delivery | Pending | Pending | Pending | 0 | Pending |
| Corrected delivery | Pending | Pending | Pending | 0 | Pending |
| Ambiguous input | Pending | Pending | Pending | 0 | Pending |

Speech cost: $0.00 because the selected workflow starts from existing documents and photographs, not voice. Paid intermediary cost: $0.00. Hosting cost is reported separately after deployment and is not included in per-operation inference cost.

## AI tools and models

- Product implementation: Codex desktop; exact task model must be copied from the model selector before submission.
- Application inference: OpenAI Responses API, `gpt-5.6-sol`, reasoning effort `low`, image detail `high`, strict JSON Schema.
- Synthetic development photography: Codex built-in Image Gen in generation/edit mode, using the printable label sheet and prior accepted frame as references. The tool did not expose its underlying model identifier, so it is reported honestly as not exposed rather than guessed.

Example output check: the model response is passed through deterministic validation. A quantity mismatch is downgraded to `Unverified` unless visible quantity differs, exact SKU matches, image evidence exists and enough distinct UNIT IDs support the count. A unit test verifies this downgrade.

## Reused components and own changes

Reused libraries: Next.js, React, OpenAI JavaScript SDK, ReportLab, TypeScript and ESLint.

Own work: capture protocol, prompt and JSON schema, result validator, evidence overlay UI, sample order, labels, expected findings, cost instrumentation and test cases.

## What failed or remains limited

- Live multimodal results are pending a configured API key. The included AI-generated photos are development fixtures, not proof of physical contents.
- A short real phone-photo capture is still required before an honest hiring submission.
- Vision-model bounding boxes are approximate and should be treated as evidence pointers.
- The prototype has no automatic retries, image preprocessing, persistent history, warehouse integration or supplier workflow.
- Count verification intentionally declines when UNIT labels do not support deduplication.

## Time spent

Record focused time only. Current implementation log is in `docs/TIME_LOG.md`; copy the final total here before submission.

## Next improvement

Add a guided camera capture that checks whether all UNIT IDs are visible before inference, then run a second low-cost OCR pass only on uncertain label crops.
