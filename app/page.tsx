"use client";

import { useEffect, useMemo, useState } from "react";
import { EvidencePanel } from "@/components/evidence-panel";
import { CheckIcon, HelpIcon, ResetIcon, WarningIcon } from "@/components/icons";
import { ResultsTable } from "@/components/results-table";
import { UploadPanel } from "@/components/upload-panel";
import type { VerificationResult } from "@/lib/types";

export default function Home() {
  const [packingList, setPackingList] = useState<File | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [selectedRow, setSelectedRow] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const photoUrls = useMemo(() => photos.map((photo) => URL.createObjectURL(photo)), [photos]);
  const pdfUrl = useMemo(() => (packingList ? URL.createObjectURL(packingList) : null), [packingList]);

  useEffect(() => {
    return () => {
      photoUrls.forEach(URL.revokeObjectURL);
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [photoUrls, pdfUrl]);

  const reset = () => {
    setPackingList(null);
    setPhotos([]);
    setResult(null);
    setError(null);
    setSelectedRow(1);
  };

  const runVerification = async () => {
    if (!packingList || photos.length === 0) return;
    setBusy(true);
    setError(null);
    setResult(null);

    try {
      const form = new FormData();
      form.append("packingList", packingList);
      photos.forEach((photo) => form.append("photos", photo));
      const response = await fetch("/api/verify", { method: "POST", body: form });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Verification failed.");
      const nextResult = body as VerificationResult;
      setResult(nextResult);
      setSelectedRow(nextResult.findings[0]?.rowNumber ?? 1);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Verification failed.");
    } finally {
      setBusy(false);
    }
  };

  const selectedFinding = result?.findings.find((finding) => finding.rowNumber === selectedRow);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">Proofpack</div>
        <div className="topbar-divider" />
        <span>Verify a delivery</span>
        <button className="reset-button" type="button" onClick={reset}>
          <ResetIcon /> New check
        </button>
      </header>

      <div className="workspace">
        <UploadPanel
          packingList={packingList}
          photos={photos}
          photoUrls={photoUrls}
          busy={busy}
          onPackingList={setPackingList}
          onPhotos={setPhotos}
          onRun={runVerification}
        />

        <section className="main-panel">
          {!result && !busy && (
            <div className="empty-state">
              <div className="empty-mark"><span /><span /><span /></div>
              <h1>Evidence before conclusions.</h1>
              <p>
                Upload a one-page packing list and up to three delivery photos. Proofpack checks visible identity and quantity while refusing unsupported missing-item claims.
              </p>
              <ol>
                <li><span>1</span>Attach a unique UNIT-XX label to every physical object.</li>
                <li><span>2</span>Take one overview and clear label close-ups without removing the labels.</li>
                <li><span>3</span>Upload the original PDF and photos, then run verification.</li>
              </ol>
              <div className="test-kit-links">
                <a href="/test-kit/packing-list.pdf" download>Download sample packing list</a>
                <a href="/test-kit/printable-unit-labels.pdf" download>Download printable labels</a>
              </div>
            </div>
          )}

          {busy && (
            <div className="loading-state">
              <div className="scan-frame"><span /></div>
              <h1>Checking rows and image evidence…</h1>
              <p>Reading labels, consolidating repeated UNIT IDs and validating every conclusion.</p>
            </div>
          )}

          {error && (
            <div className="error-banner" role="alert">
              <strong>Verification could not finish</strong>
              <span>{error}</span>
            </div>
          )}

          {result && (
            <>
              <div className="results-heading">
                <div>
                  <h1>Verification results</h1>
                  <p>Checked {result.findings.length} packing-list rows against {photos.length} delivery photos.</p>
                </div>
                <div className="run-metrics">
                  <strong>{(result.metrics.processingMs / 1000).toFixed(1)} s</strong>
                  <span>·</span>
                  <strong>${result.metrics.estimatedUsd.toFixed(4)} estimated</strong>
                </div>
              </div>

              <div className="summary-grid">
                <div className="summary-item summary-confirmed"><CheckIcon /><span><small>Confirmed</small><strong>{result.summary.confirmed}</strong></span></div>
                <div className="summary-item summary-mismatch"><WarningIcon /><span><small>Mismatch</small><strong>{result.summary.mismatch}</strong></span></div>
                <div className="summary-item summary-unverified"><HelpIcon /><span><small>Unverified</small><strong>{result.summary.unverified}</strong></span></div>
              </div>

              {!result.captureAssessment.canDeduplicate && (
                <div className="capture-warning">
                  <WarningIcon />
                  <div><strong>Quantity verification is limited</strong><span>{result.captureAssessment.note}</span></div>
                </div>
              )}

              <ResultsTable findings={result.findings} selectedRow={selectedRow} onSelect={setSelectedRow} />
              {selectedFinding && <EvidencePanel finding={selectedFinding} photoUrls={photoUrls} pdfUrl={pdfUrl} />}

              <footer className="analysis-footer">
                <span>Model: {result.metrics.model}</span>
                <span>{result.metrics.inputTokens.toLocaleString()} input tokens</span>
                <span>{result.metrics.outputTokens.toLocaleString()} output tokens</span>
                <span>{result.metrics.retries} retries</span>
                <span>{result.validationWarnings.length} safety corrections</span>
              </footer>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
