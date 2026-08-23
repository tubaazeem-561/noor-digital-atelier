import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import { GoogleGenAI } from "@google/genai";

admin.initializeApp();

// Define Gemini API key secret in Secret Manager for Cloud Functions
const geminiApiKey = defineSecret("GEMINI_API_KEY");

export interface GeminiStylistRequest {
  prompt: string;
  userContext?: {
    genderPreference?: string;
    skinTone?: string;
    styleGoal?: string;
  };
}

export interface GeminiStylistResponse {
  recommendation: string;
  suggestedColors?: string[];
  timestamp: string;
}

/**
 * Cloud Function to securely handle Gemini API calls server-side.
 * The GEMINI_API_KEY is retrieved securely from environment / Secret Manager
 * and is NEVER exposed to the frontend client.
 */
export const callGeminiStylist = onCall(
  { secrets: [geminiApiKey] },
  async (request): Promise<GeminiStylistResponse> => {
    // 1. Verify caller authentication
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }

    const data = request.data as GeminiStylistRequest;
    if (!data.prompt) {
      throw new HttpsError(
        "invalid-argument",
        "The function must be called with a 'prompt' field."
      );
    }

    // 2. Fetch secret API key securely on the server
    const apiKey = geminiApiKey.value() || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new HttpsError(
        "failed-precondition",
        "Gemini API key is not configured on the server."
      );
    }

    try {
      // 3. Initialize Gemini SDK server-side
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          `You are NOOR, a luxury bespoke digital atelier stylist. Provide high-fashion advice based on context: ${JSON.stringify(data.userContext || {})}. User query: ${data.prompt}`
        ]
      });

      const text = response.text || "Styling recommendation created.";

      return {
        recommendation: text,
        timestamp: new Date().toISOString()
      };
    } catch (err: any) {
      console.error("Error executing Gemini API in Cloud Function:", err);
      throw new HttpsError("internal", err.message || "Failed to query Gemini AI.");
    }
  }
);

export { processClothingUpload } from "./processClothingUpload";

