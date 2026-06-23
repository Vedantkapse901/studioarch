/**
 * B2 Upload API - Copied from EYE10 approach
 * Handles B2 authorization and file uploads server-side
 */

import { createHash } from 'node:crypto';

export const config = {
  api: { bodyParser: false },
};

let b2AuthCache = null;

function env(...keys) {
  for (const k of keys) {
    const v = String(process.env[k] || '').trim();
    if (v) return v;
  }
  return '';
}

function requireB2Config() {
  const keyId = env('VITE_B2_KEY_ID', 'B2B_KEY_ID');
  const applicationKey = env('VITE_B2_APPLICATION_KEY', 'B2B_APPLICATION_KEY');
  const bucketName = env('VITE_B2_BUCKET_NAME', 'B2B_BUCKET_NAME');
  const bucketId = env('VITE_B2_BUCKET_ID', 'B2B_BUCKET_ID');

  if (!keyId || !applicationKey || !bucketName || !bucketId) {
    throw new Error(
      'Missing B2 config. Set VITE_B2_KEY_ID, VITE_B2_APPLICATION_KEY, VITE_B2_BUCKET_NAME, and VITE_B2_BUCKET_ID.'
    );
  }
  return { keyId, applicationKey, bucketName, bucketId };
}

async function b2AuthorizeAccount() {
  const now = Date.now();
  if (b2AuthCache && b2AuthCache.expiresAt > now) return b2AuthCache;

  const { keyId, applicationKey } = requireB2Config();
  const basic = Buffer.from(`${keyId}:${applicationKey}`).toString('base64');

  const r = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
    method: 'GET',
    headers: { Authorization: `Basic ${basic}` },
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || `b2_authorize_account failed (${r.status})`);

  b2AuthCache = {
    apiUrl: data.apiUrl,
    downloadUrl: data.downloadUrl,
    authorizationToken: data.authorizationToken,
    expiresAt: now + 23 * 60 * 60 * 1000,
  };

  return b2AuthCache;
}

async function b2ApiPost(apiUrl, path, authorizationToken, body) {
  const r = await fetch(`${apiUrl}/b2api/v2/${path}`, {
    method: 'POST',
    headers: {
      Authorization: authorizationToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body || {}),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || `${path} failed (${r.status})`);
  return data;
}

// Read raw body from stream
async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-File-Name, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // Handle GET/HEAD requests - download/proxy images from B2
  if (req.method === 'GET' || req.method === 'HEAD') {
    try {
      const key = req.query.key;
      if (!key) {
        return res.status(400).json({ error: 'Missing key parameter' });
      }

      console.log(`📥 Proxying download: ${key}`);

      const { bucketName, bucketId } = requireB2Config();
      const auth = await b2AuthorizeAccount();

      // Get download authorization
      const authToken = await b2ApiPost(auth.apiUrl, 'b2_get_download_authorization', auth.authorizationToken, {
        bucketId,
        fileNamePrefix: key,
        validDurationInSeconds: 3600,
      });

      // Proxy the download request
      const encodedKey = key.split('/').map(encodeURIComponent).join('/');
      const downloadUrl = `${auth.downloadUrl}/file/${encodeURIComponent(bucketName)}/${encodedKey}`;

      const response = await fetch(downloadUrl, {
        method: req.method,
        headers: {
          Authorization: authToken.authorizationToken,
        },
      });

      if (!response.ok) {
        console.error(`❌ B2 download failed: ${response.status}`);
        return res.status(response.status).send('Download failed');
      }

      // Copy headers
      const contentType = response.headers.get('content-type');
      if (contentType) res.setHeader('Content-Type', contentType);
      const contentLength = response.headers.get('content-length');
      if (contentLength) res.setHeader('Content-Length', contentLength);

      if (req.method === 'HEAD') {
        res.status(200).end();
        return;
      }

      // Stream the file
      const buffer = await response.arrayBuffer();
      return res.status(200).send(Buffer.from(buffer));
    } catch (error) {
      console.error('❌ Download error:', error.message);
      return res.status(500).json({ error: error.message || 'Download failed' });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const fileName = req.headers['x-file-name'];
    const contentType = req.headers['content-type'] || 'application/octet-stream';

    if (!fileName) {
      return res.status(400).json({ error: 'Missing X-File-Name header' });
    }

    console.log(`📤 Uploading: ${fileName}`);

    // Get raw body
    const body = await readRawBody(req);

    if (!body || body.length === 0) {
      return res.status(400).json({ error: 'Empty file' });
    }

    // Get B2 config
    const { bucketName, bucketId } = requireB2Config();

    // Authorize with B2
    console.log('🔐 Authorizing with B2...');
    const auth = await b2AuthorizeAccount();

    // Get upload URL
    console.log('📍 Getting upload URL...');
    const uploadInfo = await b2ApiPost(auth.apiUrl, 'b2_get_upload_url', auth.authorizationToken, {
      bucketId,
    });

    // Calculate SHA1 (REQUIRED by B2!)
    const sha1 = createHash('sha1').update(body).digest('hex');

    // Upload to B2
    console.log('⬆️ Uploading to B2...');
    const uploadRes = await fetch(uploadInfo.uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: uploadInfo.authorizationToken,
        'X-Bz-File-Name': fileName, // Don't URL-encode - B2 stores literal file names
        'Content-Type': contentType,
        'X-Bz-Content-Sha1': sha1,
      },
      body,
    });

    const uploadData = await uploadRes.json().catch(() => ({}));

    if (!uploadRes.ok) {
      console.error('❌ B2 Upload failed:', uploadData);
      return res.status(uploadRes.status).json({
        error: uploadData.message || `Upload failed (${uploadRes.status})`,
      });
    }

    // Construct public URL using original fileName with proper encoding (like EYE10)
    const encodedFileName = fileName.split('/').map(encodeURIComponent).join('/');
    const publicUrl = `${auth.downloadUrl}/file/${encodeURIComponent(bucketName)}/${encodedFileName}`;

    console.log('✅ Upload successful:', publicUrl);

    return res.status(200).json({
      success: true,
      url: publicUrl,
      fileName: uploadData.fileName,
      fileId: uploadData.fileId,
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Upload failed',
    });
  }
}
