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
 * Chunked upload for large files (>50MB)
 */
async function chunkedB2Upload(
  file: File,
  fileName: string,
  chunkSize: number,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; url?: string; error?: string }> {
  const chunks = Math.ceil(file.size / chunkSize);
  const uploadId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    for (let i = 0; i < chunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('chunkIndex', i.toString());
      formData.append('totalChunks', chunks.toString());
      formData.append('uploadId', uploadId);
      formData.append('fileName', fileName);

      const response = await fetch('/api/b2-upload', {
        method: 'POST',
        headers: {
          'X-Upload-ID': uploadId,
          'X-Chunk-Index': i.toString(),
          'X-Total-Chunks': chunks.toString(),
          'X-File-Name': fileName,
        },
        body: chunk,
      });

      if (!response.ok) {
        if (response.status === 413) {
          throw new Error('Chunk too large - server payload limit exceeded');
        }
        throw new Error(`Chunk upload failed: ${response.status}`);
      }

      const progress = Math.round(((i + 1) / chunks) * 100);
      if (onProgress) onProgress(progress);

      console.log(`📦 Chunk ${i + 1}/${chunks} uploaded (${progress}%)`);
    }

    // All chunks uploaded, finalize
    const finalResponse = await fetch('/api/b2-upload', {
      method: 'POST',
      headers: {
        'X-Upload-ID': uploadId,
        'X-Finalize': 'true',
        'X-File-Name': fileName,
      },
    });

    if (!finalResponse.ok) {
      throw new Error(`Upload finalization failed: ${finalResponse.status}`);
    }

    const data = await finalResponse.json();
    console.log('✅ Chunked upload successful:', data.url);

    return {
      success: true,
      url: data.url,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Chunked upload failed';
    console.error('Chunked upload error:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Real B2 upload via API endpoint (Vercel/Production)
 * Handles large files with chunked upload for videos >50MB
 */
async function realB2Upload(
  file: File,
  fileName: string,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; url?: string; error?: string }> {
  const apiUrl = `/api/b2-upload`;
  const CHUNK_SIZE = 5242880; // 5MB chunks for large files
  const fileSize = file.size;

  console.log('Calling B2 API:', apiUrl, { fileSize: `${(fileSize / 1024 / 1024).toFixed(2)}MB` });

  // For large files, use chunked upload
  if (fileSize > 50 * 1024 * 1024) {
    console.log('📦 Large file detected, using chunked upload');
    return await chunkedB2Upload(file, fileName, CHUNK_SIZE, onProgress);
  }

  // For smaller files, use direct upload
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'X-File-Name': fileName,
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

    // Handle specific error codes
    if (response.status === 413) {
      return {
        success: false,
        error: 'File too large for direct upload. Please try again or contact support.',
      };
    }
    if (response.status === 408 || response.status === 504) {
      return {
        success: false,
        error: 'Upload timeout. File may be too large or connection too slow.',
      };
    }

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
