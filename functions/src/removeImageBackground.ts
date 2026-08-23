import { onCall, HttpsError } from "firebase-functions/v2/https";

export interface RemoveBackgroundRequest {
  imageBase64: string;
}

export interface RemoveBackgroundResponse {
  success: boolean;
  imageBase64?: string;
  error?: string;
}

/**
 * Cloud Function to remove image background using AI.
 * Receives a base64 string, uses @imgly/background-removal-node to segment and remove background,
 * and returns a clean transparent PNG as base64.
 */
export const removeImageBackground = onCall(
  { timeoutSeconds: 120, memory: "1GiB" }, // Background removal can be memory intensive
  async (request): Promise<RemoveBackgroundResponse> => {
    // 1. Verify caller authentication (optional, but good practice)
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }

    const data = request.data as RemoveBackgroundRequest;
    if (!data || !data.imageBase64) {
      throw new HttpsError(
        "invalid-argument",
        "The function must be called with 'imageBase64'."
      );
    }

    try {
      const cleanBase64 = data.imageBase64.replace(/^data:image\/\w+;base64,/, "");
      
      // Node.js imgly usage: pass an ArrayBuffer, Uint8Array, Buffer, or Blob
      // For Node, we pass a Buffer or Uint8Array
      const imageBuffer = Buffer.from(cleanBase64, "base64");
      
      // Lazy load the library to prevent Firebase emulator startup timeout
      const imgly = await import("@imgly/background-removal-node");
      const removeBackground = imgly.removeBackground;
      
      // @imgly/background-removal-node uses onnxruntime-node internally
      const blob = await removeBackground(imageBuffer);
      
      const arrayBuffer = await blob.arrayBuffer();
      const resultBase64 = Buffer.from(arrayBuffer).toString("base64");
      
      return {
        success: true,
        imageBase64: `data:image/png;base64,${resultBase64}`
      };
    } catch (err: any) {
      console.error("Error removing background:", err);
      return {
        success: false,
        error: err.message || "Failed to remove background."
      };
    }
  }
);

