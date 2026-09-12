// Telegram Bot Service for Intellekt Academy Authentication (@edusatbot)
//
// XAVFSIZLIK HAQIDA (nima o'zgardi):
// Avvalgi versiyada 6 xonali kod BRAUZERDA generatsiya qilinib, localStorage'da
// saqlanardi va bot javoblarini ham brauzerning o'zi (client-side polling)
// so'rab turardi. Bu degani — har qanday foydalanuvchi DevTools > Application
// > Local Storage bo'limini ochib, "eduplatform_valid_tg_codes" qiymatini
// o'zgartirib, o'zini xohlagan Telegram hisobi sifatida "tasdiqlashi" mumkin
// edi (kodni tasdiqlash butunlay klient tomonda bo'lgani uchun).
//
// Endi kod FAQAT serverda (Vercel Function: /api/telegram-webhook.js) Telegram
// webhook orqali generatsiya qilinadi, foydalanuvchining shaxsiy Telegram
// chatiga yuboriladi va Supabase'da (brauzerga umuman ochiq bo'lmagan
// jadvalda) saqlanadi. Sayt faqat kiritilgan kodni /api/telegram-verify orqali
// serverga tekshirtiradi — brauzerda hech qanday "to'g'ri kod"ning o'zi
// saqlanmaydi, shuning uchun uni soxtalashtirib bo'lmaydi.

export const TELEGRAM_BOT_USERNAME = 'edusatbot';
const TELEGRAM_API_BASE = '/api/telegram';
const TELEGRAM_VERIFY_ENDPOINT = '/api/telegram-verify';

export interface TelegramAuthSession {
  code?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  telegramHandle?: string;
  chatId?: number;
  isVerified?: boolean;
}

/**
 * Checks Telegram bot connectivity and returns bot profile.
 * (sof ma'lumot olish uchun — hech qanday maxfiy narsa oshkor qilmaydi)
 */
export async function checkTelegramBotHealth(): Promise<{
  ok: boolean;
  username?: string;
  firstName?: string;
  error?: string;
}> {
  try {
    const response = await fetch(`${TELEGRAM_API_BASE}?action=getMe`);
    const data = await response.json();
    if (data.ok && data.result) {
      return {
        ok: true,
        username: data.result.username,
        firstName: data.result.first_name,
      };
    }
    return { ok: false, error: data.description || 'Bot javob bermadi' };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Deep link to open the bot. Bot bilan suhbatni boshlagan zahoti (foydalanuvchi
 * "Start" tugmasini bosgan yoki istalgan xabar yozgan paytda) server avtomatik
 * ravishda yangi 6 xonali kodni o'sha foydalanuvchining shaxsiy chatiga
 * yuboradi — kod saytda emas, faqat Telegram'da ko'rinadi.
 */
export function getTelegramBotLink(): string {
  return `https://t.me/${TELEGRAM_BOT_USERNAME}`;
}

/**
 * Foydalanuvchi botdan olgan 6 xonali kodni saytga kiritganda chaqiriladi.
 * Kod FAQAT serverda (Supabase'dagi maxfiy jadvalda) tekshiriladi.
 */
export async function verifyTelegramCode(inputCode: string): Promise<{
  success: boolean;
  error?: string;
  session?: TelegramAuthSession;
}> {
  const cleanInput = inputCode.trim().replace(/\s+/g, '');

  if (!cleanInput || cleanInput.length < 6) {
    return { success: false, error: "Iltimos, 6 xonali kodni to'liq kiriting." };
  }

  try {
    const response = await fetch(TELEGRAM_VERIFY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: cleanInput }),
    });
    const data = await response.json();

    if (!response.ok || !data.ok) {
      return {
        success: false,
        error: data.error || "Kiritilgan 6 xonali kod noto'g'ri. Iltimos, @edusatbot botidan kelgan kodni tekshirib qayta kiriting.",
      };
    }

    const session: TelegramAuthSession = {
      code: cleanInput,
      firstName: data.firstName || 'Telegram',
      lastName: data.lastName || 'Foydalanuvchisi',
      telegramHandle: data.telegramUsername,
      chatId: data.chatId,
      isVerified: true,
    };

    return { success: true, session };
  } catch (err) {
    console.error('Telegram verify request failed:', err);
    return {
      success: false,
      error: "Serverga ulanishda xatolik yuz berdi. Internet aloqangizni tekshirib qayta urinib ko'ring.",
    };
  }
}
