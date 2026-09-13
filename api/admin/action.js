import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const adminClient =
  SUPABASE_URL && SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
    : null;

function verifyToken(token) {
  if (!token || !TOKEN_SECRET) return false;
  const parts = String(token).split('.');
  if (parts.length !== 2) return false;
  const [body, signature] = parts;

  const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(body).digest('base64url');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    return payload && payload.role === 'admin' && typeof payload.exp === 'number' && payload.exp > Date.now();
  } catch {
    return false;
  }
}

// Ruxsat etilgan amallar ro'yxati (whitelist). Shu ro'yxatda bo'lmagan
// hech qanday amal bajarilmaydi — bu server orqali ham "faqat kerakli
// ishlar" qilinishini kafolatlaydi.
const ACTIONS = {
  upsertCourse: (payload) => adminClient.from('courses').upsert(payload),
  deleteCourse: (payload) => adminClient.from('courses').delete().eq('id', payload.id),

  upsertLesson: (payload) => adminClient.from('lessons').upsert(payload),
  deleteLesson: (payload) => adminClient.from('lessons').delete().eq('id', payload.id),

  upsertAnnouncement: (payload) => adminClient.from('announcements').upsert(payload),
  updateAnnouncement: (payload) => adminClient.from('announcements').update(payload.updates).eq('id', payload.id),
  deleteAnnouncement: (payload) => adminClient.from('announcements').delete().eq('id', payload.id),

  updateFeedback: (payload) => adminClient.from('feedback').update(payload.updates).eq('id', payload.id),
  deleteFeedback: (payload) => adminClient.from('feedback').delete().eq('id', payload.id),

  updateUserProfile: (payload) => adminClient.from('profiles').update(payload.updates).eq('id', payload.id),
  deleteUserProfile: (payload) => adminClient.from('profiles').delete().eq('id', payload.id),
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  if (!adminClient) {
    return res.status(500).json({
      ok: false,
      error: 'Server sozlanmagan: SUPABASE_SERVICE_ROLE_KEY yoki VITE_SUPABASE_URL topilmadi.',
    });
  }

  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!verifyToken(token)) {
    return res.status(401).json({ ok: false, error: "Ruxsat yo'q yoki administrator sessiyasi muddati tugagan." });
  }

  const { action, payload } = req.body || {};
  const run = ACTIONS[action];
  if (!run) {
    return res.status(400).json({ ok: false, error: "Noma'lum amal." });
  }

  try {
    const { error } = await run(payload || {});
    if (error) {
      return res.status(400).json({ ok: false, error: error.message });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
}
