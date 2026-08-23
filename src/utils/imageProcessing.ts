/**
 * Processes an image base64 data URL to normalize room/studio backgrounds
 * to pure white (#FFFFFF) for seamless multiply blending on white canvas.
 */
export async function removeStudioBackground(base64Data: string): Promise<string> {
  return new Promise<string>((resolve) => {
    if (!base64Data || typeof window === 'undefined') {
      resolve(base64Data);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(base64Data);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;

        // Sample background color from four corners
        const cornerIndices = [
          0,
          (width - 1) * 4,
          (height - 1) * width * 4,
          ((height - 1) * width + (width - 1)) * 4
        ];
        let bgR = 0;
        let bgG = 0;
        let bgB = 0;
        cornerIndices.forEach((idx) => {
          bgR += data[idx];
          bgG += data[idx + 1];
          bgB += data[idx + 2];
        });
        bgR /= 4;
        bgG /= 4;
        bgB /= 4;

        let opaqueCount = 0;
        // Smoothly convert studio wall/background pixels to transparent
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const distToBg = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
          const brightness = (r + g + b) / 3;
          const maxVal = Math.max(r, g, b);
          const minVal = Math.min(r, g, b);
          const diff = maxVal - minVal;

          if (distToBg < 65 || (brightness > 205 && diff < 35)) {
            // Normalize background to pure transparent
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
            data[i + 3] = 0;
          } else {
            opaqueCount++;
          }
        }

        // If the result is near-zero opacity (e.g., less than 2% of image is opaque), fallback to original image
        const totalPixels = width * height;
        if (opaqueCount / totalPixels < 0.02) {
          console.warn('Background removal resulted in near-empty image, falling back to original.');
          resolve(base64Data);
          return;
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        console.warn('Canvas background normalization failed:', e);
        resolve(base64Data);
      }
    };

    img.onerror = () => resolve(base64Data);
    img.src = base64Data;
  });
}
