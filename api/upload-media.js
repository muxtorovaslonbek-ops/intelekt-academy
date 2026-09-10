import Busboy from 'busboy';

export const config = {
  api: { bodyParser: false },
};

const bunnyApiKey = process.env.BUNNY_API_KEY || '';
const bunnyStorageZone = process.env.BUNNY_STORAGE_ZONE || '';
const bunnyBaseUrl = (process.env.BUNNY_BASE_URL || 'https://storage.bunnycdn.com').replace(/\/$/, '');
const bunnyCdnUrl = (process.env.BUNNY_CDN_URL || '').replace(/\/$/, '');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  if (!bunnyApiKey || !bunnyStorageZone) {
    return res.status(503).json({ ok: false, error: 'Bunny.net storage is not configured' });
  }

  try {
    const { buffer, filename, mimeType } = await readUpload(req);
    if (!buffer || !filename) {
      return res.status(400).json({ ok: false, error: 'file is required' });
    }

    const uploadUrl = `${bunnyBaseUrl}/${bunnyStorageZone}/${encodeURIComponent(filename)}`;
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        AccessKey: bunnyApiKey,
        'Content-Type': mimeType || 'application/octet-stream',
      },
      body: buffer,
    });

    if (!response.ok) {
      return res.status(502).json({ ok: false, error: 'Bunny.net upload failed' });
    }

    const publicUrl = bunnyCdnUrl
      ? `${bunnyCdnUrl}/${encodeURIComponent(filename)}`
      : uploadUrl;
    return res.status(200).json({ ok: true, id: `bunny-${Date.now()}`, url: publicUrl, publicUrl });
  } catch (error) {
    console.error('Vercel Bunny upload error:', error);
    return res.status(500).json({ ok: false, error: 'Upload failed' });
  }
}

function readUpload(req) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers, limits: { fileSize: 200 * 1024 * 1024, files: 1 } });
    let fileBuffer = [];
    let filename = '';
    let mimeType = '';

    busboy.on('file', (_field, file, info) => {
      filename = info.filename;
      mimeType = info.mimeType;
      file.on('data', (chunk) => fileBuffer.push(chunk));
      file.on('limit', () => reject(new Error('File is too large')));
    });
    busboy.on('finish', () => resolve({ buffer: Buffer.concat(fileBuffer), filename, mimeType }));
    busboy.on('error', reject);
    req.pipe(busboy);
  });
}