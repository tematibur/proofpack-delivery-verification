"use client";

import type { Finding, FindingStatus } from "@/lib/types";
import { CheckIcon, HelpIcon, WarningIcon } from "./icons";

const labels: Record<FindingStatus, string> = {
  confirmed: "Confirmed",
  identity_mismatch: "Wrong identity",
  quantity_mismatch: "Wrong quantity",
  unverified: "Unverified",
};

const StatusIcon = ({ status }: { status: FindingStatus }) => {
  if (status === "confirmed") return <CheckIcon />;
  if (status === "unverified") return <HelpIcon />;
  return <WarningIcon />;
};

type Props = {
  findings: Finding[];
  selectedRow: number;
  onSelect: (row: number) => void;
};

export function ResultsTable({ findings, selectedRow, onSelect }: Props) {
  return (
    <div className="results-table-wrap">
      <table className="results-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Expected</th>
            <th>Qty</th>
            <th>Finding</th>
            <th>Visible</th>
            <th>Conclusion</th>
            <th>Sources</th>
          </tr>
        </thead>
        <tbody>
          {findings.map((finding) => (
            <tr
              key={finding.rowNumber}
              className={selectedRow === finding.rowNumber ? "selected" : ""}
              onClick={() => onSelect(finding.rowNumber)}
            >
              <td>{finding.rowNumber}</td>
              <td>
                <strong>{finding.expectedSku}</strong>
                <small>{finding.itemName}</small>
              </td>
              <td>{finding.expectedQuantity}</td>
              <td>
                <span className={`status status-${finding.status}`}>
                  <StatusIcon status={finding.status} />
                  {labels[finding.status]}
                </span>
              </td>
              <td>{finding.visibleQuantity ?? "—"}</td>
              <td>{finding.conclusion}</td>
              <td>
                <button type="button" className="source-link" onClick={() => onSelect(finding.rowNumber)}>
                  Row {finding.documentEvidence.rowNumber}
                  {finding.imageEvidence[0]
                    ? ` · Photo ${finding.imageEvidence[0].photoIndex}`
                    : " · photo needed"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
