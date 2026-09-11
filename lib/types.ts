export type FindingStatus =
  | "confirmed"
  | "identity_mismatch"
  | "quantity_mismatch"
  | "unverified";

export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ImageEvidence = {
  photoIndex: number;
  regionId: string;
  bbox: BoundingBox;
  labelText: string;
  instanceIds: string[];
};

export type Finding = {
  rowNumber: number;
  itemName: string;
  expectedSku: string;
  expectedQuantity: number;
  status: FindingStatus;
  observedSku: string | null;
  visibleQuantity: number | null;
  conclusion: string;
  documentEvidence: {
    rowNumber: number;
    rowText: string;
  };
  imageEvidence: ImageEvidence[];
  clarificationRequest: string | null;
};

export type VerificationResult = {
  findings: Finding[];
  extras: Array<{
    observedSku: string | null;
    itemName: string;
    quantity: number;
    evidence: ImageEvidence[];
    conclusion: string;
  }>;
  captureAssessment: {
    conventionFollowed: boolean;
    canDeduplicate: boolean;
    note: string;
    issues: string[];
  };
  summary: {
    confirmed: number;
    mismatch: number;
    unverified: number;
  };
  metrics: {
    processingMs: number;
    model: string;
    inputTokens: number;
    cachedInputTokens: number;
    outputTokens: number;
    retries: number;
    estimatedUsd: number;
  };
  validationWarnings: string[];
};
