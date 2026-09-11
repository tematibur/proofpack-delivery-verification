# Proofpack

Proofpack is a narrow browser prototype that compares a one-page packing list with up to three delivery photos. It returns evidence-backed confirmations, visible identity or quantity mismatches, and conservative `Unverified` results when the submitted views do not prove a conclusion.

The app does not use arbitrary retail-product recognition. It reads printed SKUs and unique `UNIT-XX` labels attached to controlled household objects.

## Core safety rule

Every physical object keeps one unique `UNIT-XX` label in every photograph. The same label in multiple photos is one object. If labels are obscured or the capture set cannot distinguish repeated objects, Proofpack refuses to verify the count. A missing camera view never becomes a missing-item claim.

## Run locally

Requirements: Node.js 20+ and an OpenAI API key with access to an image-capable Responses API model.

```bash
npm install
cp .env.example .env.local
# Set OPENAI_API_KEY in .env.local. Never commit it.
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The default analysis model is `gpt-5.6-sol` with low reasoning. Override it with `OPENAI_MODEL` if required.

## Reproducible test set

- `sample-data/packing-list.pdf` - one-page, four-row source document.
- `sample-data/printable-unit-labels.pdf` - six initial labels and one correction label.
- `sample-data/expected-findings.json` - expected outcomes recorded before testing.
- `sample-data/README.md` - physical contents, photo convention and corrected-delivery procedure.

Real photographs are intentionally not generated. Create them from the controlled physical setup and place them in `sample-data/initial/` and `sample-data/corrected/`.

## Quality checks

```bash
npm test
npm run lint
npm run build
```

The server validates model output before returning it to the browser. It downgrades unsafe conclusions to `Unverified` when:

- a confirmation lacks exact SKU, quantity or image evidence;
- a quantity mismatch lacks enough distinct `UNIT-XX` IDs;
- an identity mismatch lacks a visibly different SKU;
- a result references the wrong document row;
- a conclusion claims an item is missing, absent or not delivered from photographs alone.

## Architecture

1. The browser submits one PDF and one to three images as multipart form data.
2. A Next.js server route validates file type, count and size.
3. The OpenAI Responses API reads the PDF and photos in a single multimodal request and returns strict JSON with document rows, conclusions and percentage bounding boxes.
4. Deterministic server rules validate identity, count evidence, row references and missing-item language.
5. The browser displays the row result and overlays the returned bounding box on the supporting image.
6. Token usage and wall-clock time are converted to an estimated variable cost and shown with the result.

## Scope and limits

- English only.
- One-page text PDF, maximum five product rows.
- One to three photographs, maximum 10 MB each.
- Printed SKU and UNIT labels required.
- No warehouse integration, supplier complaint automation, accounts or payments.
- Bounding boxes come from the vision model and can be approximate; they are evidence pointers, not metrology.
- No automatic API retries in the prototype. A failed operation is shown to the user and costs must be measured separately if manually retried.

## Reused components and original work

Reused: Next.js, React, OpenAI JavaScript SDK, ReportLab, ESLint and TypeScript.

Original for this assignment: the capture convention, multimodal prompt, strict response schema, safety validator, evidence UI, cost instrumentation, controlled test set, expected outcomes and tests.

See `docs/DELIVERY_NOTES.md` for measured results and `docs/VIDEO_SCRIPT.md` for the walkthrough.
