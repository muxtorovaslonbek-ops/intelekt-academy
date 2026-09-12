// Bu fayl faqat serverda (Vercel Function) ishlaydi va hech qachon brauzerga
// yuborilmaydi. Shu sababli bu yerda SUPABASE_SERVICE_ROLE_KEY kabi maxfiy
// kalitlardan foydalanish xavfsiz — ular VITE_ prefiksi bilan emas, oddiy
// Environment Variable sifatida Vercel loyihasiga qo'shilishi kerak.

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export function isTelegramStoreConfigured() {
  return Boolean(SUPABASE_URL && SERVICE_KEY);
}

// Supabase PostgREST'ga to'g'ridan-to'g'ri so'rov yuborish uchun kichik yordamchi.
// path — jadval nomi + (kerak bo'lsa) filtr query-string, masalan:
//   "telegram_verification_codes?code=eq.123456&consumed=eq.false"
export async function telegramStoreFetch(path, { method = 'GET', body, prefer } = {}) {
  if (!isTelegramStoreConfigured()) {
    throw new Error('Supabase sozlanmagan (SUPABASE_URL yoki SUPABASE_SERVICE_ROLE_KEY yo\'q)');
  }
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: prefer || 'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return response;
}
