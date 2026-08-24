import { removeBackground } from '@imgly/background-removal';

/**
 * Processes an image data URL to cleanly segment and remove the background
 * using @imgly/background-removal in the browser.
 * Falls back to the original image if the process fails or returns empty.
 */
export async function removeStudioBackground(base64Data: string): Promise<string> {
  if (!base64Data || typeof window === 'undefined') {
    return base64Data;
  }

  try {
    // removeBackground can accept a base64 string directly
    const blob = await removeBackground(base64Data);
    
    // Convert Blob back to base64 Data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to convert blob to base64"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Error during background removal. Falling back to original.', error);
    return base64Data;
  }
}
