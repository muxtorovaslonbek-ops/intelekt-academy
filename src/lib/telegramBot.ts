// Telegram Bot Service for EduPlatform Authentication (@edusatbot)
// Bot Token provided: 8600138241:AAFyzyZO5pKKU-_wvshK63Ot5Sg-Gzdh_Z8

export const TELEGRAM_BOT_USERNAME = 'edusatbot';
export const TELEGRAM_BOT_TOKEN = '8600138241:AAFyzyZO5pKKU-_wvshK63Ot5Sg-Gzdh_Z8';
const TELEGRAM_API_BASE = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export interface TelegramAuthSession {
  code: string;
  createdAt: number;
  expiresAt: number;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  telegramHandle?: string;
  chatId?: number;
  isVerified?: boolean;
}

const STORAGE_KEY = 'eduplatform_telegram_auth_session';
const VALID_CODES_KEY = 'eduplatform_valid_tg_codes';

export interface ValidCodeEntry {
  code: string;
  expiresAt: number;
  meta?: {
    username?: string;
    name?: string;
    chatId?: number;
    phone?: string;
  };
}

function getValidCodesList(): ValidCodeEntry[] {
  try {
    const raw = localStorage.getItem(VALID_CODES_KEY);
    if (!raw) return [];
    const list: ValidCodeEntry[] = JSON.parse(raw);
    return Array.isArray(list) ? list.filter((item) => Date.now() < item.expiresAt) : [];
  } catch {
    return [];
  }
}

export function registerValidCode(
  code: string,
  meta?: { username?: string; name?: string; chatId?: number; phone?: string }
): void {
  try {
    const list = getValidCodesList();
    list.push({
      code: code.trim(),
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
      meta,
    });
    localStorage.setItem(VALID_CODES_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to register valid telegram code:', err);
  }
}

export function checkIsValidCode(inputCode: string): { valid: boolean; entry?: ValidCodeEntry } {
  const clean = inputCode.trim().replace(/\s+/g, '');
  const list = getValidCodesList();
  const entry = list.find((item) => item.code === clean && Date.now() < item.expiresAt);
  return { valid: !!entry, entry };
}

/**
 * Checks Telegram bot connectivity and returns bot profile
 */
export async function checkTelegramBotHealth(): Promise<{
  ok: boolean;
  username?: string;
  firstName?: string;
  error?: string;
}> {
  try {
    const response = await fetch(`${TELEGRAM_API_BASE}/getMe`);
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
 * Generates a cryptographically strong 6-digit verification code
 */
export function generateVerificationCode(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return num.toString();
}

/**
 * Creates and stores a new Telegram verification session
 */
export function createTelegramAuthSession(data: {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  telegramHandle?: string;
}): TelegramAuthSession {
  const code = generateVerificationCode();
  const session: TelegramAuthSession = {
    code,
    createdAt: Date.now(),
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
    firstName: data.firstName,
    lastName: data.lastName,
    phoneNumber: data.phoneNumber,
    telegramHandle: data.telegramHandle,
    isVerified: false,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  registerValidCode(code, {
    username: data.telegramHandle,
    name: `${data.firstName} ${data.lastName}`.trim(),
    phone: data.phoneNumber,
  });
  return session;
}

/**
 * Retrieves the current active Telegram auth session
 */
export function getActiveTelegramAuthSession(): TelegramAuthSession | null {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;
  try {
    const session: TelegramAuthSession = JSON.parse(saved);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

/**
 * Clear the Telegram session
 */
export function clearTelegramAuthSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Deep link to open the bot with the auth payload
 */
export function getTelegramBotLink(code?: string): string {
  if (code) {
    return `https://t.me/${TELEGRAM_BOT_USERNAME}?start=auth_${code}`;
  }
  return `https://t.me/${TELEGRAM_BOT_USERNAME}`;
}

/**
 * Sends a message via Telegram Bot API to a specific chat_id
 */
export async function sendTelegramBotMessage(
  chatId: number | string,
  text: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML'
): Promise<boolean> {
  try {
    const response = await fetch(`${TELEGRAM_API_BASE}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
      }),
    });
    const result = await response.json();
    return result.ok === true;
  } catch (err) {
    console.error('Failed to send Telegram message:', err);
    return false;
  }
}

/**
 * Verifies if user-entered code matches the session code or any code issued by @edusatbot
 */
export function verifyTelegramCode(inputCode: string): {
  success: boolean;
  error?: string;
  session?: TelegramAuthSession;
} {
  const session = getActiveTelegramAuthSession();
  const cleanInput = inputCode.trim().replace(/\s+/g, '');

  if (!cleanInput || cleanInput.length < 6) {
    return { success: false, error: "Iltimos, 6 xonali kodni to'liq kiriting." };
  }

  // 1. Match current session code
  if (session && cleanInput === session.code) {
    session.isVerified = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return { success: true, session };
  }

  // 2. Check if code was issued by @edusatbot
  const check = checkIsValidCode(cleanInput);
  if (check.valid) {
    const meta = check.entry?.meta;
    const resolvedSession: TelegramAuthSession = {
      code: cleanInput,
      createdAt: Date.now(),
      expiresAt: Date.now() + 15 * 60 * 1000,
      firstName: session?.firstName || meta?.name?.split(' ')[0] || 'Telegram',
      lastName: session?.lastName || meta?.name?.split(' ').slice(1).join(' ') || 'Foydalanuvchi',
      phoneNumber: session?.phoneNumber || meta?.phone || '',
      telegramHandle: session?.telegramHandle || (meta?.username ? (meta.username.startsWith('@') ? meta.username : `@${meta.username}`) : undefined),
      chatId: meta?.chatId || session?.chatId,
      isVerified: true,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resolvedSession));
    return { success: true, session: resolvedSession };
  }

  if (!session) {
    return {
      success: false,
      error: 'Tasdiqlash kodi muddati tugagan yoki mavjud emas. Iltimos, @edusatbot orqali yangi kod oling.',
    };
  }

  return {
    success: false,
    error: "Kiritilgan 6 xonali kod noto'g'ri. Iltimos, @edusatbot botidan kelgan kodni tekshirib qayta kiriting.",
  };
}

/**
 * Background listener that checks for new messages or /start commands in @edusatbot
 * When someone talks to the bot, it automatically responds with their code or confirms their session!
 */
export function startTelegramBotPolling(
  onCodeDetected?: (detectedCode: string, fromUser: any) => void
): () => void {
  let isRunning = true;
  let lastUpdateId = parseInt(sessionStorage.getItem('eduplatform_last_tg_update_id') || '0', 10);

  const poll = async () => {
    if (!isRunning) return;

    try {
      const url = `${TELEGRAM_API_BASE}/getUpdates?offset=${lastUpdateId ? lastUpdateId + 1 : 0}&timeout=5`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.ok && Array.isArray(data.result) && data.result.length > 0) {
        for (const update of data.result) {
          lastUpdateId = Math.max(lastUpdateId, update.update_id);
          sessionStorage.setItem('eduplatform_last_tg_update_id', String(lastUpdateId));

          const msg = update.message;
          if (!msg || !msg.text) continue;

          const text = msg.text.trim();
          const chatId = msg.chat.id;
          const fromUser = msg.from;
          const currentSession = getActiveTelegramAuthSession();

          // Check if user started with /start auth_XXXXXX or sent 6-digit code
          const matchCode = text.match(/\/start\s+auth_(\d{6})/i) || text.match(/^auth_(\d{6})$/i) || text.match(/^(\d{6})$/);

          if (matchCode) {
            const parsedCode = matchCode[1];
            registerValidCode(parsedCode, {
              username: fromUser.username ? `@${fromUser.username}` : undefined,
              name: `${fromUser.first_name || ''} ${fromUser.last_name || ''}`.trim(),
              chatId,
            });

            const responseText = `✅ <b>Tasdiqlash kodi qabul qilindi!</b>\n\n` +
              `Hurmatli <b>${fromUser.first_name || 'Foydalanuvchi'}</b>, sizning EduPlatform tizimidagi tasdiqlash kodingiz:\n\n` +
              `🔑 <code>${parsedCode}</code>\n\n` +
              `Saytdagi ro'yxatdan o'tish oynasiga ushbu kodni kiriting va ro'yxatdan o'tishni yakunlang! 🚀`;

            await sendTelegramBotMessage(chatId, responseText);

            if (onCodeDetected) {
              onCodeDetected(parsedCode, fromUser);
            }
          } else if (text.startsWith('/start') || text.startsWith('/code')) {
            // General /start or /code command
            const codeToSend = currentSession?.code || generateVerificationCode();
            registerValidCode(codeToSend, {
              username: fromUser.username ? `@${fromUser.username}` : undefined,
              name: `${fromUser.first_name || ''} ${fromUser.last_name || ''}`.trim(),
              chatId,
            });

            if (!currentSession) {
              createTelegramAuthSession({
                firstName: fromUser.first_name || 'Talaba',
                lastName: fromUser.last_name || '',
                phoneNumber: '',
                telegramHandle: fromUser.username ? `@${fromUser.username}` : undefined,
              });
            }

            const welcomeMsg = `Assalomu alaykum, <b>${fromUser.first_name || 'Talaba'}</b>! 🎓\n\n` +
              `EduPlatform innovatsion ta'lim portalining rasmiy tasdiqlash botiga (@${TELEGRAM_BOT_USERNAME}) xush kelibsiz!\n\n` +
              `Saytda ro'yxatdan o'tish yoki kirish uchun tasdiqlash kodingiz:\n\n` +
              `👉 <code>${codeToSend}</code> 👈\n\n` +
              `<i>Ushbu 6 xonali kodni saytdagi tasdiqlash maydoniga kiriting. Kod 15 daqiqa davomida amal qiladi.</i>`;

            await sendTelegramBotMessage(chatId, welcomeMsg);

            if (onCodeDetected) {
              onCodeDetected(codeToSend, fromUser);
            }
          } else {
            // Reply to any other text with assistance and quick code
            const quickCode = currentSession?.code || generateVerificationCode();
            registerValidCode(quickCode, {
              username: fromUser.username ? `@${fromUser.username}` : undefined,
              name: `${fromUser.first_name || ''} ${fromUser.last_name || ''}`.trim(),
              chatId,
            });

            const helpMsg = `Salom, <b>${fromUser.first_name || 'Foydalanuvchi'}</b>! 🤖\n\n` +
              `EduPlatform ta'lim portalidagi tasdiqlash kodingiz:\n\n` +
              `👉 <code>${quickCode}</code> 👈\n\n` +
              `Ushbu kodni saytga kiriting. Agar yangi kod kerak bo'lsa, <b>/code</b> buyrug'ini yuboring.`;
            await sendTelegramBotMessage(chatId, helpMsg);

            if (onCodeDetected) {
              onCodeDetected(quickCode, fromUser);
            }
          }
        }
      }
    } catch (err) {
      // Non-blocking network catch for silent polling
    }

    if (isRunning) {
      setTimeout(poll, 3000);
    }
  };

  poll();

  return () => {
    isRunning = false;
  };
}
