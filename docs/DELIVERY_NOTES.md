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

The three measured runs below use the five AI-generated development fixtures under `sample-data/synthetic/`. Raw API responses are committed under `sample-data/results/`. The fixtures are disclosed as synthetic and do not replace the required real controlled photographs.

| Case | Expected | Actual | Evidence/source check | Pass? |
| --- | --- | --- | --- | --- |
| Correct mug | Confirmed | Confirmed | Row 1 + two regions for `UNIT-01` | Pass |
| Wrong towel SKU | Identity mismatch | Identity mismatch | Row 2 + visible `TOWEL-SAND-20` regions | Pass |
| Extra soap unit | Quantity mismatch, 3 vs 2 | Quantity mismatch, 3 vs 2 | Row 3 + `UNIT-03/04/05` regions | Pass |
| Obscured candle | Unverified, request photo | Unverified, requested unobscured `UNIT-06` photo | Row 4, no false missing claim | Pass |
| Corrected delivery | 4 confirmed | 4 confirmed | Every row + image region | Pass |
| Insufficient single view | Decline unsupported conclusions | 4 unverified + specific photo requests | Rows 1-4; no missing claims | Pass |

## Speed and variable cost

The app records API wall-clock duration, model, input tokens, cached input tokens, output tokens, retries and estimated USD cost for every operation.

Pricing assumption used in code for the default `gpt-5.6-luna`: $0.20 per million uncached input tokens, $0.02 per million cached input tokens and $1.20 per million output tokens. The route also contains current Terra and Sol rates and applies a 4,000-token output cap. Update the constants if pricing changes before submission.

| Run | Useful result time | Input tokens | Output tokens | Retries | Estimated variable cost |
| --- | ---: | ---: | ---: | ---: | ---: |
| Initial delivery | 19.36 s | 7,996 | 1,351 | 0 | $0.0032 |
| Corrected delivery | 14.90 s | 6,114 | 971 | 0 | $0.0024 |
| Ambiguous single view | 17.09 s | 4,232 | 1,369 | 0 | $0.0025 |
| **Measured total** | **51.35 s** | **18,342** | **3,691** | **0** | **$0.0081** |

Speech cost: $0.00 because the selected product workflow starts from existing documents and photographs, not voice. Paid intermediary cost: $0.00. Hosting is separate: the Vercel deployment produced no observed incremental charge under the existing account; future usage depends on that account's plan and is not included in per-operation inference cost.

## AI tools and models

- Product implementation: Codex desktop; exact task model must be copied from the model selector before submission.
- Application inference: OpenAI Responses API, `gpt-5.6-luna`, reasoning effort `low`, image detail `high`, strict JSON Schema and a 4,000-token output cap.
- Synthetic development photography: Codex built-in Image Gen in generation/edit mode, using the printable label sheet and prior accepted frame as references. The tool did not expose its underlying model identifier, so it is reported honestly as not exposed rather than guessed.
- Browser QA and walkthrough capture: Playwright CLI. Backup walkthrough assembly: FFmpeg with the local macOS Samantha text-to-speech voice; no paid speech API was used.

Example output check: the model response is passed through deterministic validation. A quantity mismatch is downgraded to `Unverified` unless visible quantity differs, exact SKU matches, image evidence exists and enough distinct UNIT IDs support the count. A unit test verifies this downgrade.

## Reused components and own changes

Reused libraries: Next.js, React, OpenAI JavaScript SDK, ReportLab, TypeScript and ESLint.

Own work: capture protocol, prompt and JSON schema, result validator, evidence overlay UI, sample order, labels, expected findings, cost instrumentation and test cases.

## What failed or remains limited

- Live multimodal inference passed on all three synthetic cases. The generated photos are development fixtures, not proof of physical contents.
- A short real phone-photo capture is still required before an honest hiring submission.
- Vision-model bounding boxes are approximate and should be treated as evidence pointers.
- The prototype has no automatic retries, image preprocessing, persistent history, warehouse integration or supplier workflow.
- The public demo has a best-effort limit of 12 valid runs per IP per hour; the counter can reset on a serverless cold start.
- Count verification intentionally declines when UNIT labels do not support deduplication.
- The generated 1:25 walkthrough uses synthetic narration. A short candidate-recorded voiceover would better demonstrate personal product judgment.

## Time spent

Focused implementation time recorded in `docs/TIME_LOG.md`: 52 minutes. End-to-end elapsed time was approximately 1 hour 45 minutes including model generation, builds, authentication and deployment waits. A real phone-photo capture and an optional candidate-recorded replacement voiceover are not included.

## Next improvement

Add a guided camera capture that checks whether all UNIT IDs are visible before inference, then run a second low-cost OCR pass only on uncertain label crops.
