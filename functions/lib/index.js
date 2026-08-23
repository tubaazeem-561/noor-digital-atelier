"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callGeminiStylist = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const admin = require("firebase-admin");
const genai_1 = require("@google/genai");
admin.initializeApp();
// Define Gemini API key secret in Secret Manager for Cloud Functions
const geminiApiKey = (0, params_1.defineSecret)("GEMINI_API_KEY");
/**
 * Cloud Function to securely handle Gemini API calls server-side.
 * The GEMINI_API_KEY is retrieved securely from environment / Secret Manager
 * and is NEVER exposed to the frontend client.
 */
exports.callGeminiStylist = (0, https_1.onCall)({ secrets: [geminiApiKey] }, async (request) => {
    // 1. Verify caller authentication
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const data = request.data;
    if (!data.prompt) {
        throw new https_1.HttpsError("invalid-argument", "The function must be called with a 'prompt' field.");
    }
    // 2. Fetch secret API key securely on the server
    const apiKey = geminiApiKey.value() || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new https_1.HttpsError("failed-precondition", "Gemini API key is not configured on the server.");
    }
    try {
        // 3. Initialize Gemini SDK server-side
        const ai = new genai_1.GoogleGenAI({ apiKey });
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
    }
    catch (err) {
        console.error("Error executing Gemini API in Cloud Function:", err);
        throw new https_1.HttpsError("internal", err.message || "Failed to query Gemini AI.");
    }
});
//# sourceMappingURL=index.js.map