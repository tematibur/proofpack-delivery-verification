import OpenAI from "openai";
import type { ResponseInputContent } from "openai/resources/responses/responses";
import { analysisSchema } from "@/lib/analysis-schema";
import type { VerificationResult } from "@/lib/types";
import { validateAnalysis } from "@/lib/validate-analysis";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_PDF_BYTES = 8 * 1024 * 1024;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MODEL_PRICING_USD_PER_MILLION: Record<
  string,
  { input: number; cachedInput: number; output: number }
> = {
  "gpt-5.6-luna": { input: 0.2, cachedInput: 0.02, output: 1.2 },
  "gpt-5.6-terra": { input: 2, cachedInput: 0.2, output: 12 },
  "gpt-5.6-sol": { input: 4, cachedInput: 0.4, output: 20 }
};

const SYSTEM_PROMPT = `You verify a small delivery against a one-page packing list.

Safety rules:
1. Read no more than five product rows from the PDF.
2. Every finding must cite the exact PDF row and at least one supporting image region, except an unverified finding when no useful region exists.
3. Coordinates are percentages of the original image: x/y are top-left, width/height are box size.
4. Count physical objects by distinct printed UNIT IDs only. The same UNIT ID in multiple photos is one object. Never count image appearances.
5. If UNIT IDs are absent, repeated, obscured, or inconsistent across overlapping photos, set canDeduplicate=false and do not claim a quantity match or mismatch.
6. An obscured label or missing camera view is not evidence that an item is missing or not delivered. Use unverified and request a specific photo.
7. Use identity_mismatch only when a visible observed SKU differs from the expected SKU for the clearly corresponding item.
8. Use quantity_mismatch only when exact SKU identity is visible and every counted unit has a distinct UNIT ID.
9. Use confirmed only when exact SKU and exact expected quantity are visibly supported.
10. Put unexpected products with no corresponding packing-list row in extras. An extra unit of an expected SKU is a quantity_mismatch on that row.

Required capture convention: each physical object carries a unique UNIT-XX label beside its SKU label; the same label stays attached in every photo. One overview photo should show all objects, with close-ups preserving UNIT IDs.

Return concise English conclusions. Do not infer brands or retail products without readable labels.`;

const dataUrl = async (file: File) => {
  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  return `data:${file.type};base64,${base64}`;
};

export async function POST(request: Request) {
  const startedAt = performance.now();

  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "Server configuration is incomplete: OPENAI_API_KEY is not set." },
        { status: 503 }
      );
    }

    const form = await request.formData();
    const packingList = form.get("packingList");
    const photos = form.getAll("photos").filter((value): value is File => value instanceof File);

    if (!(packingList instanceof File) || packingList.type !== "application/pdf") {
      return Response.json({ error: "Upload one PDF packing list." }, { status: 400 });
    }
    if (packingList.size > MAX_PDF_BYTES) {
      return Response.json({ error: "The PDF must be 8 MB or smaller." }, { status: 400 });
    }
    if (photos.length < 1 || photos.length > 3) {
      return Response.json({ error: "Upload between one and three delivery photos." }, { status: 400 });
    }
    if (photos.some((photo) => !SUPPORTED_IMAGE_TYPES.has(photo.type) || photo.size > MAX_IMAGE_BYTES)) {
      return Response.json(
        { error: "Each photo must be JPG, PNG, WEBP or GIF and no larger than 10 MB." },
        { status: 400 }
      );
    }

    const packingListUrl = await dataUrl(packingList);
    const photoUrls = await Promise.all(photos.map(dataUrl));
    const model = process.env.OPENAI_MODEL || "gpt-5.6-luna";
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const content: ResponseInputContent[] = [
      {
        type: "input_text",
        text: "Analyze this packing list and these numbered delivery photos. Follow the capture convention and conservative evidence rules."
      },
      {
        type: "input_file",
        filename: packingList.name,
        file_data: packingListUrl
      }
    ];
    photoUrls.forEach((imageUrl, index) => {
      content.push({ type: "input_text", text: `Delivery photo ${index + 1}:` });
      content.push({ type: "input_image", image_url: imageUrl, detail: "high" });
    });

    const response = await client.responses.create({
      model,
      reasoning: { effort: "low" },
      max_output_tokens: 4000,
      instructions: SYSTEM_PROMPT,
      input: [{ role: "user", content }],
      text: {
        format: {
          type: "json_schema",
          name: "delivery_verification",
          strict: true,
          schema: analysisSchema
        }
      }
    });

    const raw = JSON.parse(response.output_text) as Pick<
      VerificationResult,
      "findings" | "extras" | "captureAssessment"
    >;
    const checked = validateAnalysis(raw);
    const usage = response.usage;
    const inputTokens = usage?.input_tokens ?? 0;
    const outputTokens = usage?.output_tokens ?? 0;
    const cachedInputTokens = usage?.input_tokens_details?.cached_tokens ?? 0;
    const uncachedInputTokens = Math.max(0, inputTokens - cachedInputTokens);
    const pricing = MODEL_PRICING_USD_PER_MILLION[model] ?? MODEL_PRICING_USD_PER_MILLION["gpt-5.6-sol"];
    const estimatedUsd =
      (uncachedInputTokens * pricing.input +
        cachedInputTokens * pricing.cachedInput +
        outputTokens * pricing.output) /
      1_000_000;

    const result: VerificationResult = {
      ...raw,
      findings: checked.findings,
      summary: checked.summary,
      validationWarnings: checked.warnings,
      metrics: {
        processingMs: Math.round(performance.now() - startedAt),
        model,
        inputTokens,
        cachedInputTokens,
        outputTokens,
        retries: 0,
        estimatedUsd: Number(estimatedUsd.toFixed(4))
      }
    };

    return Response.json(result);
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Verification failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
