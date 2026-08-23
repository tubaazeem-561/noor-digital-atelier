import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';

interface RemoveBackgroundResponse {
  success: boolean;
  imageBase64?: string;
  error?: string;
}

/**
 * Processes an image base64 data URL to cleanly segment and remove the background
 * using a dedicated AI Cloud Function (imgly background removal).
 * Falls back to the original image if the process fails or returns empty.
 */
export async function removeStudioBackground(base64Data: string): Promise<string> {
  if (!base64Data || typeof window === 'undefined') {
    return base64Data;
  }

  try {
    const removeBgFn = httpsCallable<{ imageBase64: string }, RemoveBackgroundResponse>(
      functions,
      'removeImageBackground'
    );

    const result = await removeBgFn({ imageBase64: base64Data });

    if (result.data && result.data.success && result.data.imageBase64) {
      return result.data.imageBase64;
    } else {
      console.warn('AI Background removal failed or returned empty. Falling back to original.', result.data?.error);
      return base64Data;
    }
  } catch (error) {
    console.warn('Error calling removeImageBackground Cloud Function. Falling back to original.', error);
    return base64Data;
  }
}
