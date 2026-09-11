import type { Finding, VerificationResult } from "./types";

type RawAnalysis = Pick<VerificationResult, "findings" | "extras" | "captureAssessment">;

const normalize = (value: string | null) =>
  (value ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");

function forceUnverified(finding: Finding, reason: string): Finding {
  return {
    ...finding,
    status: "unverified",
    conclusion: reason,
    clarificationRequest:
      finding.clarificationRequest ||
      "Provide one overview photo plus a clear label photo with the same UNIT ID visible.",
  };
}

export function validateAnalysis(raw: RawAnalysis) {
  const warnings: string[] = [];
  const seenRows = new Set<number>();

  const findings = raw.findings
    .sort((a, b) => a.rowNumber - b.rowNumber)
    .map((finding) => {
      let checked = finding;
      if (seenRows.has(finding.rowNumber)) {
        warnings.push(`Duplicate result for document row ${finding.rowNumber}.`);
        return forceUnverified(finding, "Duplicate document-row analysis requires review.");
      }
      seenRows.add(finding.rowNumber);

      if (finding.documentEvidence.rowNumber !== finding.rowNumber) {
        warnings.push(`Row-reference mismatch on row ${finding.rowNumber}.`);
        checked = forceUnverified(checked, "The document-row reference could not be validated.");
      }

      const hasImageEvidence = checked.imageEvidence.length > 0;
      const instanceIds = checked.imageEvidence.flatMap((evidence) => evidence.instanceIds);
      const uniqueIds = new Set(instanceIds.filter(Boolean));
      const exactSku = normalize(checked.observedSku) === normalize(checked.expectedSku);

      if (checked.status === "confirmed") {
        if (!hasImageEvidence || !exactSku || checked.visibleQuantity !== checked.expectedQuantity) {
          warnings.push(`Unsafe confirmation prevented on row ${checked.rowNumber}.`);
          checked = forceUnverified(
            checked,
            "The available evidence does not prove both identity and quantity."
          );
        }
      }

      if (checked.status === "identity_mismatch") {
        if (!hasImageEvidence || !checked.observedSku || exactSku) {
          warnings.push(`Unsupported identity mismatch prevented on row ${checked.rowNumber}.`);
          checked = forceUnverified(checked, "The visible label does not prove an identity mismatch.");
        }
      }

      if (checked.status === "quantity_mismatch") {
        const quantityActuallyDiffers =
          checked.visibleQuantity !== null && checked.visibleQuantity !== checked.expectedQuantity;
        const instancesSupportCount =
          checked.visibleQuantity !== null && uniqueIds.size >= checked.visibleQuantity;
        if (!hasImageEvidence || !exactSku || !quantityActuallyDiffers || !instancesSupportCount) {
          warnings.push(`Unsupported quantity mismatch prevented on row ${checked.rowNumber}.`);
          checked = forceUnverified(
            checked,
            "Quantity cannot be verified without distinct UNIT IDs for every counted object."
          );
        }
      }

      if (/\b(missing|not delivered|absent)\b/i.test(checked.conclusion)) {
        warnings.push(`False missing-item claim prevented on row ${checked.rowNumber}.`);
        checked = forceUnverified(
          checked,
          "The item is not visible in the submitted views; this is not proof that it was not delivered."
        );
      }

      return checked;
    });

  const summary = findings.reduce(
    (totals, finding) => {
      if (finding.status === "confirmed") totals.confirmed += 1;
      else if (finding.status === "unverified") totals.unverified += 1;
      else totals.mismatch += 1;
      return totals;
    },
    { confirmed: 0, mismatch: 0, unverified: 0 }
  );

  return { findings, summary, warnings };
}
