import { ImageAnnotatorClient } from "@google-cloud/vision";
import { NextRequest, NextResponse } from "next/server";
import { parseReceipt } from "@/lib/receiptParser";

let _client: ImageAnnotatorClient | null = null;

function getClient(): ImageAnnotatorClient {
  if (!_client) {
    _client = new ImageAnnotatorClient({
      credentials: {
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    });
  }
  return _client;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image } = body as { image?: string };

    if (!image) {
      return NextResponse.json(
        { success: false, error: "No image provided" },
        { status: 400 }
      );
    }

    const base64Data = image.includes(",") ? image.split(",")[1] : image;

    const client = getClient();
    const [result] = await client.textDetection({
      image: { content: base64Data },
    });

    const rawText =
      result.fullTextAnnotation?.text ??
      result.textAnnotations?.[0]?.description ??
      "";

    if (!rawText.trim()) {
      return NextResponse.json({
        success: true,
        parsed: {
          storeName: null,
          purchaseDate: null,
          itemDescription: null,
          price: null,
          rawText: "",
          confidence: { store: 0, date: 0, item: 0, price: 0 },
        },
      });
    }

    const parsed = parseReceipt(rawText);

    return NextResponse.json({ success: true, parsed });
  } catch (error) {
    console.error("OCR API error:", error);

    const message =
      error instanceof Error ? error.message : "Unknown error during OCR";

    return NextResponse.json(
      { success: false, error: message, rawText: "" },
      { status: 500 }
    );
  }
}
