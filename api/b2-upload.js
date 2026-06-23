/**
 * B2 Upload API Endpoint
 * Handles B2 authorization and file uploads server-side to avoid CORS issues
 */

let b2AuthCache = null;

function requireB2Config() {
  const keyId = process.env.VITE_B2_KEY_ID || process.env.B2B_KEY_ID;
  const applicationKey =
    process.env.VITE_B2_APPLICATION_KEY || process.env.B2B_APPLICATION_KEY;
  const bucketName = process.env.VITE_B2_BUCKET_NAME || process.env.B2B_BUCKET_NAME;
  const bucketId = process.env.VITE_B2_BUCKET_ID || process.env.B2B_BUCKET_ID;

  if (!keyId || !applicationKey || !bucketName || !bucketId) {
    throw new Error(
      'Missing B2 config. Set VITE_B2_KEY_ID, VITE_B2_APPLICATION_KEY, VITE_B2_BUCKET_NAME, and VITE_B2_BUCKET_ID.'
    );
  }

  return { keyId, applicationKey, bucketName, bucketId };
}

async function b2AuthorizeAccount() {
  const now = Date.now();

  // Return cached auth if still valid
  if (b2AuthCache && b2AuthCache.expiresAt > now) {
    return b2AuthCache;
  }

  const { keyId, applicationKey } = requireB2Config();
  const basic = Buffer.from(`${keyId}:${applicationKey}`).toString('base64');

  try {
    const response = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
      method: 'GET',
      headers: {
        Authorization: `Basic ${basic}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `B2 authorization failed (${response.status})`);
    }

    const data = await response.json();

    b2AuthCache = {
      apiUrl: data.apiUrl,
      downloadUrl: data.downloadUrl,
      authorizationToken: data.authorizationToken,
      expiresAt: now + 23 * 60 * 60 * 1000,
    };

    return b2AuthCache;
  } catch (error) {
    console.error('B2 Authorization Error:', error);
    throw new Error(`Failed to authorize B2: ${error.message}`);
  }
}

async function b2GetUploadUrl(auth, bucketId) {
  try {
    const response = await fetch(`${auth.apiUrl}/b2api/v2/b2_get_upload_url`, {
      method: 'POST',
      headers: {
        Authorization: auth.authorizationToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bucketId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to get upload URL (${response.status})`);
    }

    return response.json();
  } catch (error) {
    console.error('B2 Get Upload URL Error:', error);
    throw error;
  }
}

export const config = {
  api: {
    bodyParser: false, // Disable default body parser to handle binary data
  },
};

// Helper to read raw body (EYE10 approach)
async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  console.log('B2 Upload API called:', {
    method: req.method,
    contentType: req.headers['content-type'],
    fileName: req.headers['x-file-name'],
  });

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-File-Name');

  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get B2 config and authorization
    const { bucketName, bucketId } = requireB2Config();
    const auth = await b2AuthorizeAccount();

    // Get upload URL
    const uploadUrlData = await b2GetUploadUrl(auth, bucketId);

    // Read file from request body
    let fileBuffer;
    let fileName = req.headers['x-file-name'] || `file-${Date.now()}`;

    // Decode fileName if it's encoded
    try {
      fileName = decodeURIComponent(fileName);
    } catch {
      // Keep as is if decode fails
    }

    // Get raw body data from stream
    const bodyData = await getRawBody(req);

    if (!bodyData) {
      console.error('No body data received');
      return res.status(400).json({ success: false, error: 'No file data received' });
    }

    // Handle different body formats
    if (Buffer.isBuffer(bodyData)) {
      fileBuffer = bodyData;
    } else if (bodyData instanceof ArrayBuffer) {
      fileBuffer = Buffer.from(bodyData);
    } else if (typeof bodyData === 'string') {
      fileBuffer = Buffer.from(bodyData, 'utf-8');
    } else {
      fileBuffer = Buffer.from(JSON.stringify(bodyData));
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      console.error('Empty file buffer');
      return res.status(400).json({ success: false, error: 'Empty file data' });
    }

    console.log('Uploading to B2:', {
      fileName,
      fileSize: fileBuffer.length,
      bucketId,
    });

    // Upload file to B2
    const uploadResponse = await fetch(uploadUrlData.uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: uploadUrlData.authorizationToken,
        'X-Bz-File-Name': encodeURIComponent(fileName),
        'X-Bz-Content-Type': req.headers['content-type'] || 'application/octet-stream',
        'Content-Type': req.headers['content-type'] || 'application/octet-stream',
        'Content-Length': fileBuffer.length.toString(),
      },
      body: fileBuffer,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('B2 Upload failed:', {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        body: errorText,
      });
      return res.status(uploadResponse.status).json({
        success: false,
        error: `Upload to B2 failed (${uploadResponse.status}): ${errorText || uploadResponse.statusText}`,
      });
    }

    const uploadedFile = await uploadResponse.json();

    // Build public URL
    const publicUrl = `${auth.downloadUrl}/file/${bucketName}/${uploadedFile.fileName}`;

    console.log('Upload successful:', publicUrl);

    return res.status(200).json({
      success: true,
      url: publicUrl,
      fileName: uploadedFile.fileName,
      fileId: uploadedFile.fileId,
    });
  } catch (error) {
    console.error('B2 Upload Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
