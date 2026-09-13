// Administrator uchun xavfsiz backend (/api/admin/*) bilan ishlash uchun
// yordamchi funksiyalar. Haqiqiy imtiyozli (yozish/o'chirish) amallar endi
// bevosita Supabase'ga emas, shu fayl orqali serverga yuboriladi — chunki
// server SUPABASE_SERVICE_ROLE_KEY bilan ishlaydi va bu kalit hech qachon
// brauzerga chiqarilmaydi.

const TOKEN_KEY = 'eduplatform-admin-token';

export function getAdminToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string | null): void {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // sessionStorage mavjud bo'lmasa (masalan SSR), jim o'tkazib yuboramiz
  }
}

export function isAdminSessionActive(): boolean {
  return Boolean(getAdminToken());
}

export async function adminLogin(login: string, password: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      setAdminToken(null);
      return { ok: false, error: data?.error || "Administrator sifatida kirib bo'lmadi." };
    }
    setAdminToken(data.token);
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
}

export function adminLogout(): void {
  setAdminToken(null);
}

export async function adminAction(
  action: string,
  payload: Record<string, any>
): Promise<{ ok: boolean; error?: string }> {
  const token = getAdminToken();
  if (!token) {
    return { ok: false, error: 'Administrator sessiyasi topilmadi. Iltimos, admin sifatida qayta kiring.' };
  }

  try {
    const res = await fetch('/api/admin/action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action, payload }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      return { ok: false, error: data?.error || "Amalni bajarib bo'lmadi." };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
}
