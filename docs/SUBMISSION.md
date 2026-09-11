# Submission copy

## Working product or demo URL

https://timur-good-day-thank-you-for.vercel.app

## Repository link

https://github.com/tematibur/proofpack-delivery-verification

Public repository; no reviewer invitation is required.

## Video walkthrough URL

https://timur-good-day-thank-you-for.vercel.app/proofpack-walkthrough.mp4

## Delivery notes: tests, speed, cost, AI tools and time spent

Proofpack is a browser prototype that compares a one-page text packing list with one to three delivery photos. It uses persistent printed UNIT IDs to consolidate repeated views of the same physical object. Every conclusive finding cites the packing-list row and a bounding box on a supporting photo. An obscured label or missing view is returned as Unverified with a specific photo request, never as proof that an item was not delivered.

The repository includes the one-page PDF, printable labels, five shareable synthetic development photos, pre-recorded expected findings, raw API responses and a corrected-delivery example. The synthetic images are disclosed as development fixtures; they are not photographs of actual physical contents. The same setup should be recreated with phone photos for strict compliance with the assignment wording.

Measured results: the initial case returned 1 confirmed, 2 mismatches and 1 unverified; the corrected case returned 4 confirmed; the insufficient single-view case returned 4 unverified findings with clarification requests and no false missing-item claims. All six acceptance checks passed. Four deterministic validator tests, ESLint and the production build pass.

Four recorded successful API runs took 19.36 s, 14.90 s, 17.09 s and 10.05 s. They used 26,338 input tokens and 4,662 output tokens in total, with zero API retries. Estimated total variable cost was $0.0109. The default model is OpenAI `gpt-5.6-luna`, reasoning effort `low`, high-detail image input, strict JSON Schema and a 4,000-token output cap. Pricing assumptions: $0.20/M uncached input, $0.02/M cached input and $1.20/M output. Product speech and paid-intermediary costs are $0. Hosting is separate; this Vercel deployment produced no observed incremental charge under the existing account.

AI tools: OpenAI Codex desktop for implementation and review; OpenAI Responses API `gpt-5.6-luna` for application inference; Codex built-in Image Gen for disclosed synthetic development photos (the tool did not expose the underlying image-model identifier); Playwright CLI for browser QA; local macOS Samantha text-to-speech and FFmpeg for the backup walkthrough. Reused components: Next.js, React, OpenAI JavaScript SDK, ReportLab, TypeScript and ESLint. Original work: capture convention, prompt and JSON Schema, deterministic safety validator, evidence UI, cost instrumentation, controlled test set and tests.

One output check example: a quantity mismatch is deterministically downgraded to Unverified unless the visible quantity differs from the document, exact SKU identity is visible, image evidence exists and enough distinct UNIT IDs support the count. A unit test verifies the downgrade. Browser QA also found and fixed repeat-selection of the same PDF after New check. A production smoke test initially exposed Vercel's multipart request limit (`413`) before the request reached OpenAI. Client-side image preparation reduced the payload, and the repeated production run returned HTTP `200`, the expected 1 confirmed / 2 mismatches / 1 unverified summary, no console errors and no false missing-item claim.

Focused implementation time: 64 minutes. End-to-end elapsed time: approximately 2 hours including generation, builds, authentication and deployment waits. Known limits: model bounding boxes are approximate, the public rate limit is best-effort per server instance, and the final strict-compliance pass still requires real phone photographs.
