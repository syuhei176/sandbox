import { Hono } from "hono";
import { cors } from "hono/cors";

// Cloudflare Workers environment bindings
type Bindings = {
  MESHY_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS for development
app.use("/*", cors());

// Health check endpoint
app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// Start 3D model generation
app.post("/api/generate-3d", async (c) => {
  try {
    const body = await c.req.json();
    const { prompt, art_style = "realistic", negative_prompt } = body;

    if (!prompt) {
      return c.json({ error: "Prompt is required" }, 400);
    }

    const meshyApiKey = c.env.MESHY_API_KEY;
    if (!meshyApiKey) {
      return c.json({ error: "MESHY_API_KEY not configured" }, 500);
    }

    // Call Meshy AI API to start generation
    const response = await fetch("https://api.meshy.ai/v2/text-to-3d", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${meshyApiKey}`,
      },
      body: JSON.stringify({
        mode: "preview",
        prompt,
        art_style,
        negative_prompt: negative_prompt || "",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Meshy API error:", errorData);
      return c.json(
        {
          error: "Failed to start generation",
          details: errorData,
        },
        response.status
      );
    }

    const data = await response.json();
    return c.json({
      task_id: data.result,
      status: "pending",
    });
  } catch (error) {
    console.error("Error in generate-3d:", error);
    return c.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// Check generation status
app.get("/api/generate-3d/:task_id", async (c) => {
  try {
    const taskId = c.req.param("task_id");

    const meshyApiKey = c.env.MESHY_API_KEY;
    if (!meshyApiKey) {
      return c.json({ error: "MESHY_API_KEY not configured" }, 500);
    }

    // Poll Meshy AI API for status
    const response = await fetch(
      `https://api.meshy.ai/v2/text-to-3d/${taskId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${meshyApiKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Meshy API error:", errorData);
      return c.json(
        {
          error: "Failed to check status",
          details: errorData,
        },
        response.status
      );
    }

    const data = await response.json();

    // Map Meshy AI response to our expected format
    return c.json({
      status: data.status, // "PENDING", "IN_PROGRESS", "SUCCEEDED", "FAILED"
      progress: data.progress || 0,
      model_url: data.model_urls?.glb || null,
      thumbnail_url: data.thumbnail_url || null,
      error: data.status === "FAILED" ? data.task_error?.message : null,
    });
  } catch (error) {
    console.error("Error checking generation status:", error);
    return c.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// Export for Cloudflare Workers
export default app;
