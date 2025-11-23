import { NextRequest, NextResponse } from "next/server";

const MESHY_API_KEY = process.env.MESHY_API_KEY;
const MESHY_API_URL = "https://api.meshy.ai/v2";

/**
 * POST /api/generate-3d
 *
 * Initiates a text-to-3D model generation task using Meshy AI API.
 *
 * Request body:
 * {
 *   prompt: string;              // Text description of the 3D model
 *   art_style?: string;          // "realistic" | "cartoon" | "low-poly" (default: "realistic")
 *   negative_prompt?: string;    // What to avoid in generation (optional)
 * }
 *
 * Response:
 * {
 *   task_id: string;   // Task ID for polling generation status
 *   status: "pending"; // Initial status
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!MESHY_API_KEY) {
      return NextResponse.json(
        { error: "Meshy API key not configured. Please add MESHY_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { prompt, art_style = "realistic", negative_prompt = "" } = body;

    // Validate required fields
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Validate art_style
    const validStyles = ["realistic", "cartoon", "low-poly"];
    if (art_style && !validStyles.includes(art_style)) {
      return NextResponse.json(
        { error: `Invalid art_style. Must be one of: ${validStyles.join(", ")}` },
        { status: 400 }
      );
    }

    console.log(`[Generate-3D] Starting generation with prompt: "${prompt}"`);

    // Call Meshy AI API to start generation
    const response = await fetch(`${MESHY_API_URL}/text-to-3d`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MESHY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt.trim(),
        art_style,
        negative_prompt,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Generate-3D] Meshy API error:`, errorText);

      return NextResponse.json(
        {
          error: `Meshy API error: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log(`[Generate-3D] Task created: ${data.result}`);

    return NextResponse.json({
      task_id: data.result,
      status: "pending",
    });
  } catch (error) {
    console.error("[Generate-3D] Unexpected error:", error);

    return NextResponse.json(
      {
        error: "Failed to start 3D model generation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
