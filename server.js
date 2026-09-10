import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();
import express from 'express';
import cors from 'cors';
import multer from 'multer';

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200 * 1024 * 1024 } });

const bunnyApiKey = process.env.BUNNY_API_KEY || '';
const bunnyStorageZone = process.env.BUNNY_STORAGE_ZONE || '';
const bunnyBaseUrl = (process.env.BUNNY_BASE_URL || 'https://storage.bunnycdn.com').replace(/\/$/, '');
const bunnyCdnUrl = (process.env.BUNNY_CDN_URL || '').replace(/\/$/, '');
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN || '';

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'ai-darslar-api', timestamp: new Date().toISOString() });
});

app.get('/api/courses', (_req, res) => {
  res.json({
    items: [
      {
        id: 'course-ai-secrets',
        title: "Sun'iy Intellekt (AI) sirlari",
        category: "Sun'iy Intellekt",
        level: 'O\'rta',
        duration: '40 soat',
        instructor: 'Aslonbek Muxtorov',
      },
      {
        id: 'course-web-development',
        title: 'Web-saytlar yaratish',
        category: 'Web Dasturlash',
        level: 'Boshlang\'ich',
        duration: '45 soat',
        instructor: 'Aslonbek Muxtorov',
      },
    ],
  });
});

app.get('/api/announcements', (_req, res) => {
  res.json({
    items: [
      {
        id: 'ann-1',
        title: 'AI Future platformasi ishga tushdi',
        message: 'Barcha xizmatlar API orqali ishlay boshladi.',
        category: 'important',
        author: 'Admin',
        createdAt: new Date().toISOString(),
      },
    ],
  });
});

app.post('/api/feedback', (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !message) {
    return res.status(400).json({ ok: false, error: 'name and message are required' });
  }

  return res.status(201).json({
    ok: true,
    id: `fb-${Date.now()}`,
    saved: { name, email: email || '', message },
  });
});

app.post('/api/upload-media', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ ok: false, error: 'file is required' });
  }

  if (!bunnyApiKey || !bunnyStorageZone) {
    return res.status(200).json({
      ok: true,
      id: `local-${Date.now()}`,
      url: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      publicUrl: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      note: 'Bunny.net env not configured; using data URL fallback',
    });
  }

  try {
    const uploadUrl = `${bunnyBaseUrl}/${bunnyStorageZone}/${encodeURIComponent(file.originalname)}`;
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        AccessKey: bunnyApiKey,
        'Content-Type': file.mimetype || 'application/octet-stream',
      },
      body: file.buffer,
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({ ok: false, error: text || 'Bunny.net upload failed' });
    }

    const publicUrl = bunnyCdnUrl
      ? `${bunnyCdnUrl}/${encodeURIComponent(file.originalname)}`
      : `${bunnyBaseUrl}/${bunnyStorageZone}/${encodeURIComponent(file.originalname)}`;
    return res.status(200).json({
      ok: true,
      id: `bunny-${Date.now()}`,
      url: publicUrl,
      publicUrl,
      storage: 'bunny',
    });
  } catch (error) {
    console.error('Bunny upload error:', error);
    return res.status(500).json({ ok: false, error: 'Upload failed' });
  }
});

app.all('/api/telegram', async (req, res) => {
  const action = String(req.query.action || '');
  if (!['getMe', 'getUpdates', 'sendMessage'].includes(action)) {
    return res.status(400).json({ ok: false, description: 'Invalid action' });
  }
  if (!telegramBotToken) {
    return res.status(503).json({ ok: false, description: 'Telegram bot is not configured' });
  }
  try {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query)) {
      if (key !== 'action' && typeof value === 'string') query.set(key, value);
    }
    const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/${action}${query.size ? `?${query}` : ''}`, {
      method: action === 'sendMessage' ? 'POST' : 'GET',
      headers: action === 'sendMessage' ? { 'Content-Type': 'application/json' } : undefined,
      body: action === 'sendMessage' ? JSON.stringify(req.body || {}) : undefined,
    });
    return res.status(response.status).json(await response.json());
  } catch (error) {
    console.error('Telegram proxy error:', error);
    return res.status(502).json({ ok: false, description: 'Telegram API unavailable' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`API running on http://localhost:${port}`);
});
