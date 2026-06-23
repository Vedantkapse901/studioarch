/**
 * Local Dev Server for B2 Uploads
 * Run alongside `npm run dev`
 *
 * Usage:
 *   node dev-server.js
 *
 * Then in another terminal:
 *   npm run dev
 */

import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.raw({ type: '*/*', limit: '50mb' }));

// B2 Upload Endpoint
app.post('/api/b2-upload', async (req, res) => {
  try {
    const fileName = req.headers['x-file-name'];
    const contentType = req.headers['content-type'] || 'application/octet-stream';

    if (!fileName) {
      return res.status(400).json({ error: 'Missing X-File-Name header' });
    }

    console.log(`📤 B2 Upload: ${fileName} (${req.body.length} bytes)`);

    // Get B2 credentials from env
    const keyId = process.env.VITE_B2_KEY_ID;
    const applicationKey = process.env.VITE_B2_APPLICATION_KEY;
    const bucketName = process.env.VITE_B2_BUCKET_NAME;
    const bucketId = process.env.VITE_B2_BUCKET_ID;

    if (!keyId || !applicationKey || !bucketName || !bucketId) {
      console.error('❌ Missing B2 credentials in .env');
      return res.status(500).json({
        error: 'B2 credentials not configured. Check .env file.',
        missing: {
          keyId: !keyId,
          applicationKey: !applicationKey,
          bucketName: !bucketName,
          bucketId: !bucketId
        }
      });
    }

    // Step 1: Authorize with B2
    console.log('🔐 Authorizing with B2...');
    const basic = Buffer.from(`${keyId}:${applicationKey}`).toString('base64');

    const authResponse = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
      method: 'GET',
      headers: { Authorization: `Basic ${basic}` },
    });

    if (!authResponse.ok) {
      const error = await authResponse.json();
      throw new Error(`B2 auth failed: ${error.message}`);
    }

    const authData = await authResponse.json();
    console.log('✅ B2 Authorization successful');

    // Step 2: Get upload URL
    console.log('📍 Getting upload URL...');
    const uploadUrlResponse = await fetch(`${authData.apiUrl}/b2api/v2/b2_get_upload_url`, {
      method: 'POST',
      headers: {
        Authorization: authData.authorizationToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bucketId }),
    });

    if (!uploadUrlResponse.ok) {
      const error = await uploadUrlResponse.json();
      throw new Error(`Get upload URL failed: ${error.message}`);
    }

    const uploadUrlData = await uploadUrlResponse.json();
    console.log('✅ Got upload URL');

    // Step 3: Calculate SHA1 (REQUIRED by B2!)
    const sha1 = crypto.createHash('sha1').update(req.body).digest('hex');

    // Step 4: Upload file to B2
    console.log('⬆️ Uploading to B2...');
    const uploadResponse = await fetch(uploadUrlData.uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: uploadUrlData.authorizationToken,
        'X-Bz-File-Name': fileName, // Don't URL-encode - B2 stores literal file names
        'X-Bz-Content-Type': contentType,
        'Content-Type': contentType,
        'X-Bz-Content-Sha1': sha1,
      },
      body: req.body,
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      throw new Error(`Upload failed: ${error.message}`);
    }

    const uploadedFile = await uploadResponse.json();
    // Return proxy URL for database storage (not direct B2 URL)
    const proxyUrl = `/api/b2-upload?key=${encodeURIComponent(fileName)}`;

    console.log('✅ Upload successful!');
    console.log(`📁 Proxy URL: ${proxyUrl}`);

    res.json({
      success: true,
      url: proxyUrl, // Proxy URL - save this to database
      fileName: uploadedFile.fileName,
      fileId: uploadedFile.fileId,
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// B2 Download/Proxy Endpoint (GET)
app.get('/api/b2-upload', async (req, res) => {
  try {
    const keyParam = req.query.key;
    if (!keyParam) {
      return res.status(400).json({ error: 'Missing key parameter' });
    }

    // Decode the key parameter
    const key = decodeURIComponent(String(keyParam));
    console.log(`📥 Proxying download: ${key}`);

    const keyId = process.env.VITE_B2_KEY_ID;
    const applicationKey = process.env.VITE_B2_APPLICATION_KEY;
    const bucketName = process.env.VITE_B2_BUCKET_NAME;
    const bucketId = process.env.VITE_B2_BUCKET_ID;

    if (!keyId || !applicationKey || !bucketName || !bucketId) {
      return res.status(500).json({ error: 'B2 credentials not configured' });
    }

    // Step 1: Authorize with B2
    const basic = Buffer.from(`${keyId}:${applicationKey}`).toString('base64');
    const authResponse = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
      method: 'GET',
      headers: { Authorization: `Basic ${basic}` },
    });

    if (!authResponse.ok) {
      throw new Error(`B2 auth failed: ${authResponse.status}`);
    }

    const authData = await authResponse.json();

    // Step 2: Get download authorization
    const authTokenResponse = await fetch(`${authData.apiUrl}/b2api/v2/b2_get_download_authorization`, {
      method: 'POST',
      headers: {
        Authorization: authData.authorizationToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bucketId,
        fileNamePrefix: key,
        validDurationInSeconds: 3600,
      }),
    });

    if (!authTokenResponse.ok) {
      throw new Error(`Get auth token failed: ${authTokenResponse.status}`);
    }

    const authToken = await authTokenResponse.json();

    // Step 3: Build download URL and fetch from B2
    const encodedKey = key.split('/').map(encodeURIComponent).join('/');
    const downloadUrl = `${authData.downloadUrl}/file/${encodeURIComponent(bucketName)}/${encodedKey}`;

    console.log(`⬆️ Fetching from B2: ${downloadUrl}`);

    const downloadResponse = await fetch(downloadUrl, {
      method: 'GET',
      headers: { Authorization: authToken.authorizationToken },
    });

    if (!downloadResponse.ok) {
      console.error(`❌ B2 download failed: ${downloadResponse.status}`);
      return res.status(downloadResponse.status).send('Download failed');
    }

    // Step 4: Proxy the response back to client
    const contentType = downloadResponse.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);

    const contentLength = downloadResponse.headers.get('content-length');
    if (contentLength) res.setHeader('Content-Length', contentLength);

    const buffer = await downloadResponse.arrayBuffer();
    console.log(`✅ Downloaded ${buffer.byteLength} bytes`);

    return res.status(200).send(Buffer.from(buffer));

  } catch (error) {
    console.error('❌ Download error:', error.message);
    return res.status(500).json({ error: error.message || 'Download failed' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'B2 Upload Server Running' });
});

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  B2 Upload Dev Server Running          ║
║  http://localhost:${PORT}               ║
║                                        ║
║  In another terminal, run:             ║
║  npm run dev                           ║
║                                        ║
║  Frontend will call /api/b2-upload     ║
║  This server will upload to B2         ║
╚════════════════════════════════════════╝
  `);
});

export default server;
