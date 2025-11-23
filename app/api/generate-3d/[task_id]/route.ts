import { NextRequest, NextResponse } from "next/server";

const MESHY_API_KEY = process.env.MESHY_API_KEY;
const MESHY_API_URL = "https://api.meshy.ai/v2";

/**
 * GET /api/generate-3d/[task_id]
 *
 * Checks the status of a text-to-3D generation task.
 *
 * Response (pending/in_progress):
 * {
 *   status: "pending" | "in_progress";
 *   progress?: number;  // 0-100
 * }
 *
 * Response (completed):
 * {
 *   status: "completed";
 *   model_url: string;      // URL to download GLB file
 *   thumbnail_url?: string; // URL to preview image
 * }
 *
 * Response (failed):
 * {
 *   status: "failed";
 *   error?: string;
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ task_id: string }> },
) {
  try {
    // Validate API key
    if (!MESHY_API_KEY) {
      return NextResponse.json(
        { error: "Meshy API key not configured" },
        { status: 500 },
      );
    }

    const { task_id: taskId } = await params;

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 },
      );
    }

    console.log(`[Generate-3D] Checking status for task: ${taskId}`);

    // Check task status with Meshy API
    const response = await fetch(`${MESHY_API_URL}/text-to-3d/${taskId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${MESHY_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Generate-3D] Meshy API error:`, errorText);

      return NextResponse.json(
        {
          error: `Meshy API error: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Map Meshy status to our simplified status
    const meshyStatus = data.status as string;

    if (meshyStatus === "SUCCEEDED") {
      console.log(`[Generate-3D] Task ${taskId} completed successfully`);

      return NextResponse.json({
        status: "completed",
        model_url: data.model_urls?.glb || data.model_urls?.gltf,
        thumbnail_url: data.thumbnail_url,
      });
    } else if (meshyStatus === "FAILED") {
      console.log(`[Generate-3D] Task ${taskId} failed`);

      return NextResponse.json({
        status: "failed",
        error: data.error || "Generation failed",
      });
    } else if (meshyStatus === "IN_PROGRESS") {
      console.log(
        `[Generate-3D] Task ${taskId} in progress: ${data.progress || 0}%`,
      );

      return NextResponse.json({
        status: "in_progress",
        progress: data.progress || 0,
      });
    } else {
      // PENDING or unknown status
      console.log(`[Generate-3D] Task ${taskId} pending`);

      return NextResponse.json({
        status: "pending",
        progress: 0,
      });
    }
  } catch (error) {
    console.error("[Generate-3D] Unexpected error:", error);

    return NextResponse.json(
      {
        error: "Failed to check generation status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
