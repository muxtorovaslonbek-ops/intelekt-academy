import crypto from 'crypto';

// MUHIM: Bu qiymatlar endi faqat Vercel muhit o'zgaruvchilarida (Environment
// Variables) saqlanadi — brauzerga yuboriladigan JS bundle ichida EMAS.
// Standart qiymatlar avvalgi hardcoded login/parol bilan bir xil qilib
// qo'yilgan (hech narsa buzilmasligi uchun), lekin Vercel loyihangiz
// sozlamalarida ADMIN_LOGIN, ADMIN_PASSWORD va ADMIN_TOKEN_SECRET larni
// albatta o'zingizga xos qilib o'zgartiring.
const ADMIN_LOGIN = (process.env.ADMIN_LOGIN || 'aslonbek0722').trim().toLowerCase();
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'muxtorovaslonbek@gmail.com').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'aslonbek2207';

// Token imzolash uchun maxfiy kalit. Agar alohida sozlanmagan bo'lsa,
// SUPABASE_SERVICE_ROLE_KEY dan foydalaniladi (u ham faqat serverda mavjud).
const TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 soat amal qiladi

function signToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(body).digest('base64url');
  return `${body}.${signature}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  if (!TOKEN_SECRET) {
    return res.status(500).json({
      ok: false,
      error: 'Server sozlanmagan: ADMIN_TOKEN_SECRET yoki SUPABASE_SERVICE_ROLE_KEY topilmadi.',
    });
  }

  const { login, password } = req.body || {};
  const cleanLogin = String(login || '').trim().toLowerCase();
  const cleanPassword = String(password || '').trim();

  const validLogin = cleanLogin === ADMIN_LOGIN || cleanLogin === ADMIN_EMAIL;
  const validPassword = cleanPassword === ADMIN_PASSWORD;

  if (!validLogin || !validPassword) {
    return res.status(401).json({ ok: false, error: "Noto'g'ri administrator login yoki parol kiritildi!" });
  }

  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const token = signToken({ role: 'admin', exp: expiresAt });

  return res.status(200).json({ ok: true, token, expiresAt });
}
