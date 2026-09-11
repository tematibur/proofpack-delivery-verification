import assert from "node:assert/strict";
import test from "node:test";
import { validateAnalysis } from "../lib/validate-analysis";
import type { Finding, VerificationResult } from "../lib/types";

const evidence = {
  photoIndex: 1,
  regionId: "A",
  bbox: { x: 10, y: 10, width: 20, height: 15 },
  labelText: "SKU-ONE UNIT-01",
  instanceIds: ["UNIT-01"],
};

const baseFinding: Finding = {
  rowNumber: 1,
  itemName: "Sample item",
  expectedSku: "SKU-ONE",
  expectedQuantity: 1,
  status: "confirmed",
  observedSku: "SKU-ONE",
  visibleQuantity: 1,
  conclusion: "Exact item and quantity are visible.",
  documentEvidence: { rowNumber: 1, rowText: "1 Sample item SKU-ONE 1" },
  imageEvidence: [evidence],
  clarificationRequest: null,
};

const raw = (finding: Finding): Pick<VerificationResult, "findings" | "extras" | "captureAssessment"> => ({
  findings: [finding],
  extras: [],
  captureAssessment: { conventionFollowed: true, canDeduplicate: true, note: "ok", issues: [] },
});

test("keeps an evidence-backed exact confirmation", () => {
  const result = validateAnalysis(raw(baseFinding));
  assert.equal(result.findings[0].status, "confirmed");
  assert.equal(result.summary.confirmed, 1);
});

test("prevents a false missing-item conclusion", () => {
  const result = validateAnalysis(raw({
    ...baseFinding,
    status: "unverified",
    observedSku: null,
    visibleQuantity: null,
    conclusion: "Item is missing and was not delivered.",
    imageEvidence: [],
  }));
  assert.equal(result.findings[0].status, "unverified");
  assert.match(result.findings[0].conclusion, /not proof/i);
  assert.equal(result.warnings.length, 1);
});

test("rejects a quantity mismatch without unique UNIT evidence", () => {
  const result = validateAnalysis(raw({
    ...baseFinding,
    expectedQuantity: 2,
    status: "quantity_mismatch",
    visibleQuantity: 3,
    imageEvidence: [{ ...evidence, instanceIds: ["UNIT-01"] }],
  }));
  assert.equal(result.findings[0].status, "unverified");
  assert.match(result.findings[0].conclusion, /distinct UNIT IDs/i);
});

test("keeps a visible identity mismatch", () => {
  const result = validateAnalysis(raw({
    ...baseFinding,
    status: "identity_mismatch",
    observedSku: "SKU-ONO",
    conclusion: "A different but similarly named SKU is visible.",
  }));
  assert.equal(result.findings[0].status, "identity_mismatch");
  assert.equal(result.summary.mismatch, 1);
});
