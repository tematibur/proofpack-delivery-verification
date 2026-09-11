"use client";

import type { Finding } from "@/lib/types";

type Props = {
  finding: Finding;
  photoUrls: string[];
  pdfUrl: string | null;
};

export function EvidencePanel({ finding, photoUrls, pdfUrl }: Props) {
  const evidence = finding.imageEvidence[0];
  const photoUrl = evidence ? photoUrls[evidence.photoIndex - 1] : null;

  return (
    <section className="evidence-panel" aria-labelledby="evidence-heading">
      <div className="evidence-title-row">
        <div>
          <h2 id="evidence-heading">Row {finding.rowNumber} · Evidence</h2>
          <p>{finding.documentEvidence.rowText}</p>
        </div>
        {pdfUrl && (
          <a className="document-link" href={pdfUrl} target="_blank" rel="noreferrer">
            Open packing list ↗
          </a>
        )}
      </div>

      <div className="evidence-content">
        <dl className="evidence-facts">
          <div><dt>Expected SKU</dt><dd>{finding.expectedSku}</dd></div>
          <div><dt>Expected quantity</dt><dd>{finding.expectedQuantity}</dd></div>
          <div><dt>Observed SKU</dt><dd>{finding.observedSku ?? "Not readable"}</dd></div>
          <div><dt>Visible quantity</dt><dd>{finding.visibleQuantity ?? "Not verified"}</dd></div>
        </dl>

        <div className="visual-evidence">
          {photoUrl && evidence ? (
            <>
              <div className="evidence-image-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoUrl} alt={`Photo ${evidence.photoIndex}, ${evidence.regionId}`} />
                <span
                  className="bounding-box"
                  style={{
                    left: `${evidence.bbox.x}%`,
                    top: `${evidence.bbox.y}%`,
                    width: `${evidence.bbox.width}%`,
                    height: `${evidence.bbox.height}%`,
                  }}
                />
              </div>
              <small>
                Photo {evidence.photoIndex} · {evidence.regionId} · {evidence.labelText || "label region"}
              </small>
            </>
          ) : (
            <div className="no-evidence">
              <strong>No conclusive image region</strong>
              <p>{finding.clarificationRequest || "Provide another photograph."}</p>
            </div>
          )}
        </div>
      </div>

      <div className={`evidence-callout callout-${finding.status}`}>
        <strong>{finding.conclusion}</strong>
        {finding.clarificationRequest && <span>{finding.clarificationRequest}</span>}
      </div>
    </section>
  );
}
