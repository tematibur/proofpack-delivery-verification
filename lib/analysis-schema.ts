export const analysisSchema = {
  type: "object",
  additionalProperties: false,
  required: ["findings", "extras", "captureAssessment"],
  properties: {
    findings: {
      type: "array",
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "rowNumber",
          "itemName",
          "expectedSku",
          "expectedQuantity",
          "status",
          "observedSku",
          "visibleQuantity",
          "conclusion",
          "documentEvidence",
          "imageEvidence",
          "clarificationRequest"
        ],
        properties: {
          rowNumber: { type: "integer", minimum: 1 },
          itemName: { type: "string" },
          expectedSku: { type: "string" },
          expectedQuantity: { type: "integer", minimum: 1 },
          status: {
            type: "string",
            enum: ["confirmed", "identity_mismatch", "quantity_mismatch", "unverified"]
          },
          observedSku: { type: ["string", "null"] },
          visibleQuantity: { type: ["integer", "null"], minimum: 0 },
          conclusion: { type: "string" },
          documentEvidence: {
            type: "object",
            additionalProperties: false,
            required: ["rowNumber", "rowText"],
            properties: {
              rowNumber: { type: "integer", minimum: 1 },
              rowText: { type: "string" }
            }
          },
          imageEvidence: {
            type: "array",
            items: { $ref: "#/$defs/imageEvidence" }
          },
          clarificationRequest: { type: ["string", "null"] }
        }
      }
    },
    extras: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["observedSku", "itemName", "quantity", "evidence", "conclusion"],
        properties: {
          observedSku: { type: ["string", "null"] },
          itemName: { type: "string" },
          quantity: { type: "integer", minimum: 1 },
          evidence: { type: "array", items: { $ref: "#/$defs/imageEvidence" } },
          conclusion: { type: "string" }
        }
      }
    },
    captureAssessment: {
      type: "object",
      additionalProperties: false,
      required: ["conventionFollowed", "canDeduplicate", "note", "issues"],
      properties: {
        conventionFollowed: { type: "boolean" },
        canDeduplicate: { type: "boolean" },
        note: { type: "string" },
        issues: { type: "array", items: { type: "string" } }
      }
    }
  },
  $defs: {
    imageEvidence: {
      type: "object",
      additionalProperties: false,
      required: ["photoIndex", "regionId", "bbox", "labelText", "instanceIds"],
      properties: {
        photoIndex: { type: "integer", minimum: 1, maximum: 3 },
        regionId: { type: "string" },
        bbox: {
          type: "object",
          additionalProperties: false,
          required: ["x", "y", "width", "height"],
          properties: {
            x: { type: "number", minimum: 0, maximum: 100 },
            y: { type: "number", minimum: 0, maximum: 100 },
            width: { type: "number", minimum: 0, maximum: 100 },
            height: { type: "number", minimum: 0, maximum: 100 }
          }
        },
        labelText: { type: "string" },
        instanceIds: { type: "array", items: { type: "string" } }
      }
    }
  }
} as const;
