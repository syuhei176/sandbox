"use client";

import { useState } from "react";
import { modelStorage } from "@/lib/utils/model-storage";

interface ModelGeneratorProps {
  onModelGenerated: (modelId: string, modelUrl: string) => void;
  onClose: () => void;
}

type ArtStyle = "realistic" | "cartoon" | "low-poly";
type GenerationStatus = "idle" | "generating" | "completed" | "failed";

export function ModelGenerator({ onModelGenerated, onClose }: ModelGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [artStyle, setArtStyle] = useState<ArtStyle>("realistic");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setStatus("generating");
    setError(null);
    setProgress(0);

    try {
      // Step 1: Start generation
      console.log("[ModelGenerator] Starting generation...");
      const startResponse = await fetch("/api/generate-3d", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          art_style: artStyle,
          negative_prompt: negativePrompt.trim(),
        }),
      });

      if (!startResponse.ok) {
        const errorData = await startResponse.json();
        throw new Error(errorData.error || "Failed to start generation");
      }

      const { task_id } = await startResponse.json();
      setTaskId(task_id);
      console.log(`[ModelGenerator] Task started: ${task_id}`);

      // Step 2: Poll for completion
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`/api/generate-3d/${task_id}`);

          if (!statusResponse.ok) {
            throw new Error("Failed to check generation status");
          }

          const statusData = await statusResponse.json();
          console.log(`[ModelGenerator] Status: ${statusData.status}, Progress: ${statusData.progress || 0}%`);

          if (statusData.status === "completed") {
            clearInterval(pollInterval);
            await handleGenerationComplete(statusData.model_url, statusData.thumbnail_url);
          } else if (statusData.status === "failed") {
            clearInterval(pollInterval);
            throw new Error(statusData.error || "Generation failed");
          } else if (statusData.status === "in_progress") {
            setProgress(statusData.progress || 0);
          } else {
            // pending
            setProgress(5); // Show minimal progress
          }
        } catch (pollError) {
          clearInterval(pollInterval);
          console.error("[ModelGenerator] Poll error:", pollError);
          setError(pollError instanceof Error ? pollError.message : "Polling failed");
          setStatus("failed");
        }
      }, 3000); // Poll every 3 seconds

    } catch (err) {
      console.error("[ModelGenerator] Generation error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setStatus("failed");
    }
  };

  const handleGenerationComplete = async (modelUrl: string, thumbnailUrl?: string) => {
    try {
      console.log("[ModelGenerator] Downloading model from:", modelUrl);

      // Download the GLB file
      const modelResponse = await fetch(modelUrl);
      if (!modelResponse.ok) {
        throw new Error("Failed to download generated model");
      }

      const modelBlob = await modelResponse.blob();
      const arrayBuffer = await modelBlob.arrayBuffer();

      // Generate unique ID
      const modelId = `model-${Date.now()}`;

      // Download thumbnail if available
      let thumbnailBase64: string | undefined;
      if (thumbnailUrl) {
        try {
          const thumbResponse = await fetch(thumbnailUrl);
          if (thumbResponse.ok) {
            const thumbBlob = await thumbResponse.blob();
            thumbnailBase64 = await blobToBase64(thumbBlob);
          }
        } catch (thumbError) {
          console.warn("[ModelGenerator] Failed to download thumbnail:", thumbError);
        }
      }

      // Save to IndexedDB
      await modelStorage.saveModel({
        id: modelId,
        name: prompt.substring(0, 50),
        data: arrayBuffer,
        format: "glb",
        prompt: prompt.trim(),
        created_at: new Date().toISOString(),
        file_size: arrayBuffer.byteLength,
        thumbnail: thumbnailBase64,
      });

      console.log("[ModelGenerator] Model saved to IndexedDB:", modelId);

      setStatus("completed");
      setProgress(100);

      // Notify parent component
      onModelGenerated(modelId, modelUrl);

    } catch (err) {
      console.error("[ModelGenerator] Failed to save model:", err);
      setError(err instanceof Error ? err.message : "Failed to save model");
      setStatus("failed");
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleClose = () => {
    if (status === "generating") {
      if (!confirm("Generation is in progress. Are you sure you want to close?")) {
        return;
      }
    }
    onClose();
  };

  const isGenerating = status === "generating";
  const canGenerate = !isGenerating && prompt.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg border border-gray-700 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4 text-white">
          Generate 3D Model from Text
        </h3>

        <div className="space-y-4">
          {/* Prompt Input */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Describe your 3D model
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., a wooden medieval chair with ornate carvings"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white resize-none focus:outline-none focus:border-blue-500"
              rows={3}
              disabled={isGenerating}
            />
          </div>

          {/* Art Style Selector */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Art Style</label>
            <select
              value={artStyle}
              onChange={(e) => setArtStyle(e.target.value as ArtStyle)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
              disabled={isGenerating}
            >
              <option value="realistic">Realistic</option>
              <option value="cartoon">Cartoon</option>
              <option value="low-poly">Low Poly</option>
            </select>
          </div>

          {/* Negative Prompt (Optional) */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Negative Prompt (optional)
            </label>
            <input
              type="text"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="e.g., low quality, blurry"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
              disabled={isGenerating}
            />
          </div>

          {/* Progress Bar */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-400 text-center">
                Generating... {progress}%
                {taskId && (
                  <span className="block text-xs text-gray-500 mt-1">
                    Task ID: {taskId}
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500 text-center">
                This usually takes 2-3 minutes. Please wait...
              </p>
            </div>
          )}

          {/* Success Message */}
          {status === "completed" && (
            <div className="p-3 bg-green-900/30 border border-green-700 rounded text-green-400 text-sm">
              ✓ Model generated successfully! Click &quot;Apply&quot; to use it.
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded text-red-400 text-sm">
              ✗ {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
              disabled={isGenerating}
            >
              {status === "completed" ? "Close" : "Cancel"}
            </button>

            {status === "completed" ? (
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white transition-colors"
              >
                Apply
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-white transition-colors"
              >
                {isGenerating ? "Generating..." : "Generate"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
