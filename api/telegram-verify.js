import { isTelegramStoreConfigured, telegramStoreFetch } from './_telegramStore.js';

// Frontend saytga kiritilgan 6 xonali kodni shu endpointga yuboradi.
// Kod faqat Supabase'dagi (server tomonidan yozilgan) yozuv bilan solishtiriladi
// — brauzerdagi localStorage'ga hech qanday ishonch yo'q, shuning uchun
// foydalanuvchi kodni "soxtalashtira" olmaydi.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  if (!isTelegramStoreConfigured()) {
    return res.status(503).json({
      ok: false,
      error: "Tasdiqlash tizimi sozlanmagan. Administrator bilan bog'laning.",
    });
  }

  try {
    const { code } = req.body || {};
    const clean = String(code || '').trim().replace(/\s+/g, '');

    if (!/^\d{6}$/.test(clean)) {
      return res.status(400).json({ ok: false, error: "Iltimos, 6 xonali kodni to'liq kiriting." });
    }

    const nowIso = new Date().toISOString();
    const query =
      `telegram_verification_codes?code=eq.${clean}&consumed=eq.false` +
      `&expires_at=gt.${encodeURIComponent(nowIso)}&order=created_at.desc&limit=1`;

    const lookupResponse = await telegramStoreFetch(query, { method: 'GET' });
    if (!lookupResponse.ok) {
      const errText = await lookupResponse.text();
      console.error('Kodni qidirishda xatolik:', errText);
      return res.status(500).json({ ok: false, error: 'Serverda xatolik yuz berdi.' });
    }

    const rows = await lookupResponse.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({
        ok: false,
        error: "Kiritilgan 6 xonali kod noto'g'ri yoki muddati tugagan. Botdan yangi kod so'rang.",
      });
    }

    const record = rows[0];

    // Kod faqat bir marta ishlatilishi mumkin — darhol "consumed" belgilaymiz.
    await telegramStoreFetch(`telegram_verification_codes?id=eq.${record.id}`, {
      method: 'PATCH',
      prefer: 'return=minimal',
      body: { consumed: true },
    });

    return res.status(200).json({
      ok: true,
      chatId: record.chat_id,
      telegramUsername: record.telegram_username || undefined,
      firstName: record.first_name || undefined,
      lastName: record.last_name || undefined,
    });
  } catch (error) {
    console.error('Telegram verify error:', error);
    return res.status(500).json({ ok: false, error: 'Serverda xatolik yuz berdi.' });
  }
}
