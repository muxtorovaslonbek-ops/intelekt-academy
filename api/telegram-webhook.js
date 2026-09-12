import crypto from 'crypto';
import { isTelegramStoreConfigured, telegramStoreFetch } from './_telegramStore.js';

// ============================================================================
// XAVFSIZ TELEGRAM WEBHOOK
// ----------------------------------------------------------------------------
// Eski usulda (client-side polling) tasdiqlash kodi brauzerda generatsiya
// qilinib, localStorage'da saqlanardi — buni har qanday foydalanuvchi
// DevTools orqali ko'rib/o'zgartirib, o'zini istalgan hisob sifatida
// "tasdiqlashi" mumkin edi. Bu yerda esa:
//   1. Kod FAQAT serverda (bu faylda) generatsiya qilinadi;
//   2. Kod Telegram foydalanuvchisining shaxsiy chatiga to'g'ridan-to'g'ri
//      Telegram API orqali yuboriladi;
//   3. Kod Supabase'da (SERVICE ROLE kaliti bilan, brauzerga ochilmaydigan
//      jadvalda) saqlanadi va bir marta ishlatilgach darhol "consumed"
//      deb belgilanadi;
//   4. Bu endpointni faqat Telegramning o'zi chaqira olishi uchun
//      "secret token" bilan himoyalangan (TELEGRAM_WEBHOOK_SECRET).
// ============================================================================

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || '';
const SITE_URL = process.env.APP_URL || process.env.VITE_APP_URL || 'https://intelekt-academy.vercel.app/';
const CODE_TTL_MS = 5 * 60 * 1000; // 5 daqiqa

function generateSecureSixDigitCode() {
  // Math.random() o'rniga crypto.randomInt — taxmin qilib bo'lmaydigan,
  // kriptografik jihatdan xavfsiz tasodifiy son.
  return crypto.randomInt(100000, 1000000).toString();
}

async function sendTelegramMessage(chatId, text) {
  if (!BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
      disable_web_page_preview: false,
    }),
  }).catch((err) => console.error('sendTelegramMessage error:', err));
}

export default async function handler(req, res) {
  // Telegram doim POST bilan yuboradi; boshqa metodlarga oddiy 200 qaytaramiz.
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true });
  }

  // Faqat Telegramning o'zi chaqirganini tekshiramiz (setWebhook chaqirilganda
  // secret_token parametri bilan birga o'rnatiladi — pastdagi qo'llanmaga qarang).
  if (WEBHOOK_SECRET) {
    const incomingSecret = req.headers['x-telegram-bot-api-secret-token'];
    if (incomingSecret !== WEBHOOK_SECRET) {
      return res.status(401).json({ ok: false, description: 'Unauthorized' });
    }
  }

  if (!BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN sozlanmagan');
    return res.status(200).json({ ok: true });
  }

  try {
    const update = req.body || {};
    const message = update.message || update.edited_message;

    if (!message || !message.chat) {
      // Boshqa turdagi update (masalan, callback_query) — e'tiborsiz qoldiramiz.
      return res.status(200).json({ ok: true });
    }

    const chatId = message.chat.id;
    const fromUser = message.from || {};
    const firstName = fromUser.first_name || '';
    const lastName = fromUser.last_name || '';
    const username = fromUser.username ? `@${fromUser.username}` : null;

    const code = generateSecureSixDigitCode();
    const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString();

    if (isTelegramStoreConfigured()) {
      // Shu chat uchun avval berilgan, hali ishlatilmagan kodlarni bekor
      // qilamiz — bir vaqtning o'zida faqat bitta amaldagi kod bo'lsin.
      await telegramStoreFetch(
        `telegram_verification_codes?chat_id=eq.${chatId}&consumed=eq.false`,
        { method: 'PATCH', prefer: 'return=minimal', body: { consumed: true } }
      ).catch((err) => console.warn('Eski kodlarni bekor qilishda xatolik:', err));

      const insertResponse = await telegramStoreFetch('telegram_verification_codes', {
        method: 'POST',
        prefer: 'return=minimal',
        body: {
          code,
          chat_id: chatId,
          telegram_username: username,
          first_name: firstName,
          last_name: lastName,
          expires_at: expiresAt,
        },
      });
      if (!insertResponse.ok) {
        const errText = await insertResponse.text();
        console.error('Kodni saqlashda xatolik:', errText);
      }
    } else {
      console.warn(
        'Supabase (SUPABASE_SERVICE_ROLE_KEY) sozlanmagan — kod faqat Telegramda ko\'rinadi, saytda tekshirib bo\'lmaydi.'
      );
    }

    const text =
      `👋 *Intellekt Academy* ga xush kelibsiz!\n\n` +
      `🔐 Sizning ro'yxatdan o'tish kodingiz:\n\n` +
      `*${code}*\n\n` +
      `Saytga qayting va shu kodni kiriting.\n` +
      `⏰ Kod 5 daqiqa amal qiladi.\n\n` +
      `[AI Future - Zamonaviy Ta'lim Portali](${SITE_URL})`;

    await sendTelegramMessage(chatId, text);

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    // Telegramga har doim 200 qaytaramiz — aks holda Telegram bir xil
    // update'ni qayta-qayta jo'natishga urinaveradi.
    return res.status(200).json({ ok: true });
  }
}
