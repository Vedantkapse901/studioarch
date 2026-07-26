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
    // Sanitize filename - replace spaces and special chars with underscores
    const sanitizedFileName = fileName.replace(/\s+/g, '_');

    console.log('Starting B2 upload:', { originalName: fileName, sanitizedName: sanitizedFileName, fileSize: file.size, type: file.type });

    if (onProgress) onProgress(10);

    // Use simulation mode for local development
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (isDev) {
      console.log('📦 Using simulation mode (local dev)');
      return await simulateB2Upload(file, sanitizedFileName, onProgress);
    }

    // Use real API endpoint for production
    return await realB2Upload(file, sanitizedFileName, onProgress);
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
 * For videos: Creates blob URL from file
 * For images: Uses placeholder from /public folder
 */
function simulateB2Upload(
  file: File | undefined,
  fileName: string,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; url?: string; error?: string }> {
  return new Promise((resolve) => {
    if (onProgress) onProgress(25);

    // Simulate upload delay
    setTimeout(() => {
      if (onProgress) onProgress(75);

      // Check if it's a video or image
      const isImage = fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);
      const isVideo = fileName.toLowerCase().match(/\.(mp4|webm|mov|avi|mkv)$/);

      let devUrl: string;

      if (isVideo && file) {
        // For videos: Create a blob URL from the actual file (works in current session)
        devUrl = URL.createObjectURL(file);
        console.log('✅ Mock video upload (blob URL):', devUrl);
      } else if (isImage) {
        // For images: Use placeholder from /public
        devUrl = '/architecture-1.jpg';
        console.log('✅ Mock image upload (placeholder):', devUrl);
      } else {
        devUrl = '/file-placeholder.txt';
      }

      if (onProgress) onProgress(100);

      resolve({
        success: true,
        url: devUrl,
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
      'X-File-Name': fileName, // Send plain filename - server will encode for proxy URL
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
