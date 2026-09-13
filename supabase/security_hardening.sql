-- ============================================================================
-- XAVFSIZLIKNI KUCHAYTIRISH SKRIPTI
-- Supabase Dashboard -> SQL Editor -> New query -> shu faylni to'liq joylashtirib "Run" bosing.
--
-- NIMA UCHUN KERAK:
-- Avvalgi schema.sql faylida har bir jadval uchun:
--   using (true) with check (true)
-- siyosati bor edi — bu HAR KIMGA (hatto tizimga kirmagan mehmonga ham)
-- profiles, courses, lessons, announcements, feedback jadvallarini
-- TO'LIQ o'qish, yozish, o'zgartirish va O'CHIRISH huquqini berardi.
-- Bu orqali istalgan kishi saytni butunlay buzishi (barcha ma'lumotni
-- o'chirish) yoki o'zini administrator qilib tayinlashi (role='admin',
-- status='approved') mumkin edi.
--
-- BU SKRIPT NIMANI O'ZGARTIRADI:
--   1) courses, lessons, announcements: endi faqat O'QISH ochiq qoladi.
--      Yaratish/o'zgartirish/o'chirish endi FAQAT xavfsiz server (
--      /api/admin/action.js, SUPABASE_SERVICE_ROLE_KEY orqali) orqali
--      bajariladi. Bu operatsiyalar RLS'ni chetlab o'tadi, shuning uchun
--      bu jadvallarga alohida policy kerak emas.
--   2) feedback: O'QISH va YOZISH (fikr qoldirish) ochiq qoladi (talaba
--      fikr-mulohaza yuborishi kerak), lekin O'ZGARTIRISH (admin javobi)
--      va O'CHIRISH endi faqat server orqali.
--   3) profiles: O'QISH, YARATISH (ro'yxatdan o'tish) va O'ZGARTIRISH
--      (profilni tahrirlash) ochiq qoladi — chunki ilovada haqiqiy login
--      tizimi yo'q (telefon/telegram orqali ro'yxatdan o'tish), shuning
--      uchun buni to'liq yopib bo'lmaydi. LEKIN endi maxsus trigger orqali
--      "role" va "status" maydonlarini HECH KIM (faqat server/admin panel)
--      o'zgartira olmaydi — ya'ni talaba o'zini "admin" yoki "approved"
--      qilib qo'ya olmaydi, ismini/rasmini/bio'sini bemalol o'zgartira oladi.
--      O'CHIRISH endi faqat server orqali.
--
-- ILOVANING ISHLASHIGA TA'SIRI: YO'Q. Barcha admin-panel funksiyalari
-- (kurs qo'shish, o'chirish, e'lon berish, foydalanuvchini tasdiqlash,
-- fikrlarga javob berish) endi shunchaki server orqali ishlaydi — bu
-- o'zgarish kod tomonida allaqachon amalga oshirilgan (src/lib/supabase.ts
-- va src/context/AuthContext.tsx).
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1) profiles: role/status maydonlarini himoyalovchi trigger
-- ----------------------------------------------------------------------------
create or replace function public.guard_profile_privilege()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Bizning xavfsiz backend funksiyamiz SUPABASE_SERVICE_ROLE_KEY bilan
  -- ulanadi — bunday so'rovlarga cheklov qo'yilmaydi (admin CMS shu orqali
  -- foydalanuvchini tasdiqlaydi/rad etadi/rolini o'zgartiradi).
  if auth.role() = 'service_role' then
    return new;
  end if;

  -- Brauzerdan (anon yoki authenticated) kelayotgan har qanday so'rovda
  -- role va status maydonlariga tegilmaydi:
  if tg_op = 'INSERT' then
    new.role := 'student';
    new.status := 'pending';
  elsif tg_op = 'UPDATE' then
    new.role := old.role;
    new.status := old.status;
  end if;

  return new;
end;
$$;

drop trigger if exists guard_profile_privilege_trigger on public.profiles;
create trigger guard_profile_privilege_trigger
before insert or update on public.profiles
for each row execute function public.guard_profile_privilege();


-- ----------------------------------------------------------------------------
-- 2) profiles: eski "hammasi ochiq" siyosatini almashtirish
-- ----------------------------------------------------------------------------
drop policy if exists profiles_public_access on public.profiles;

create policy profiles_select on public.profiles
  for select to anon, authenticated using (true);

create policy profiles_insert on public.profiles
  for insert to anon, authenticated with check (true);

create policy profiles_update on public.profiles
  for update to anon, authenticated using (true) with check (true);

-- E'tibor bering: DELETE uchun policy yaratilmadi -> anon/authenticated
-- endi profiles jadvalidan hech narsani o'chira olmaydi.


-- ----------------------------------------------------------------------------
-- 3) courses: faqat o'qish ochiq
-- ----------------------------------------------------------------------------
drop policy if exists courses_public_access on public.courses;

create policy courses_select on public.courses
  for select to anon, authenticated using (true);

-- insert/update/delete uchun policy yo'q -> faqat service_role (server) yoza oladi.


-- ----------------------------------------------------------------------------
-- 4) lessons: faqat o'qish ochiq
-- ----------------------------------------------------------------------------
drop policy if exists lessons_public_access on public.lessons;

create policy lessons_select on public.lessons
  for select to anon, authenticated using (true);


-- ----------------------------------------------------------------------------
-- 5) announcements: faqat o'qish ochiq
-- ----------------------------------------------------------------------------
drop policy if exists announcements_public_access on public.announcements;

create policy announcements_select on public.announcements
  for select to anon, authenticated using (true);


-- ----------------------------------------------------------------------------
-- 6) feedback: o'qish + yozish (fikr qoldirish) ochiq, o'zgartirish/o'chirish yopiq
-- ----------------------------------------------------------------------------
drop policy if exists feedback_public_access on public.feedback;

create policy feedback_select on public.feedback
  for select to anon, authenticated using (true);

create policy feedback_insert on public.feedback
  for insert to anon, authenticated with check (true);

-- update/delete uchun policy yo'q -> faqat service_role (admin javobi/o'chirish
-- endi /api/admin/action.js orqali bajariladi).
