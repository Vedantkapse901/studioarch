/**
 * B2 Storage Upload Utility
 * - Production (Vercel): Calls /api/b2-upload backend endpoint
 * - Local dev: Uses dev-server.js proxy
 */

export async function uploadToB2(
  file: File,
  fileName: string,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    console.log('Starting B2 upload:', { fileName, fileSize: file.size, type: file.type });

    if (onProgress) onProgress(10);

    // Always use real API endpoint
    return await realB2Upload(file, fileName, onProgress);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('B2 upload error:', errorMessage, error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Simulate B2 upload for local development
 * Uses placeholder image from /public folder (works locally)
 */
function simulateB2Upload(
  fileName: string,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; url?: string; error?: string }> {
  return new Promise((resolve) => {
    if (onProgress) onProgress(25);

    // Simulate upload delay
    setTimeout(() => {
      if (onProgress) onProgress(75);

      // Use placeholder image that actually exists in dev
      // This simulates what B2 would return, but uses local placeholder
      const isImage = fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);
      const isVideo = fileName.toLowerCase().match(/\.(mp4|webm|mov)$/);

      // For dev mode, use placeholder URLs that work locally
      let devUrl: string;
      if (isImage) {
        devUrl = '/architecture-1.jpg'; // Placeholder from /public
      } else if (isVideo) {
        devUrl = '/sample-video.mp4'; // Placeholder video (if exists)
      } else {
        devUrl = '/file-placeholder.txt';
      }

      console.log('✅ Mock upload successful (dev placeholder):', devUrl);

      if (onProgress) onProgress(100);

      resolve({
        success: true,
        url: devUrl, // Return local placeholder URL
      });
    }, 1000);
  });
}

/**
 * Real B2 upload via API endpoint (Vercel/Production)
 */
async function realB2Upload(
  file: File,
  fileName: string,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; url?: string; error?: string }> {
  const apiUrl = `/api/b2-upload`;

  console.log('Calling B2 API:', apiUrl);

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'X-File-Name': encodeURIComponent(fileName),
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  });

  console.log('API response status:', response.status);

  if (onProgress) onProgress(50);

  // Try to parse JSON
  let data;
  const contentType = response.headers.get('content-type');
  console.log('Response Content-Type:', contentType);

  if (contentType && contentType.includes('application/json')) {
    const responseText = await response.text();
    console.log('Response text:', responseText);

    if (!responseText) {
      throw new Error('Empty response from server');
    }

    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw response:', responseText);
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
    }
  } else {
    const responseText = await response.text();
    console.error('Non-JSON response:', responseText);
    throw new Error(`Server returned ${contentType || 'unknown'} content type`);
  }

  if (onProgress) onProgress(75);

  if (!response.ok) {
    console.error('B2 Upload API error:', data);
    return {
      success: false,
      error: data?.error || `Upload failed (${response.status})`,
    };
  }

  if (onProgress) onProgress(100);

  console.log('✅ B2 upload successful:', data.url);

  return {
    success: true,
    url: data.url, // Proxy URL - save directly to database
  };
}
