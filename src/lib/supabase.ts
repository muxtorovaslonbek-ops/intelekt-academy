import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Course, Lesson } from '../types';
import { FeedbackMessage, Announcement } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('placeholder')
);

// Real client or safe fallback placeholder
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createClient('https://aifuture-placeholder.supabase.co', 'placeholder-anon-key', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

// Helper: Upsert profile to Supabase `profiles` table
export async function upsertSupabaseProfile(user: User): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    // Graceful offline/local mode
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        first_name: user.firstName,
        last_name: user.lastName,
        phone_number: user.phoneNumber,
        email: user.email,
        telegram_handle: user.telegramHandle,
        role: user.role,
        status: user.status,
        avatar_url: user.avatarUrl,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase profile sync warning:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('Supabase upsert error:', message);
    return { success: false, error: message };
  }
}

// Helper: Fetch profiles from Supabase
export async function fetchSupabaseProfiles(): Promise<User[] | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return null;
    }

    return data.map((p) => ({
      id: p.id,
      firstName: p.first_name || 'Foydalanuvchi',
      lastName: p.last_name || '',
      phoneNumber: p.phone_number || '',
      email: p.email || '',
      telegramHandle: p.telegram_handle || '',
      role: (p.role === 'admin' ? 'admin' : 'student') as 'admin' | 'student',
      status: (p.status === 'approved' ? 'approved' : p.status === 'rejected' ? 'rejected' : 'pending') as 'pending' | 'approved' | 'rejected',
      avatarUrl: p.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      joinedDate: (p.created_at ? p.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
      bio: p.bio || '',
    }));
  } catch (err) {
    console.warn('Could not fetch Supabase profiles:', err);
    return null;
  }
}

// Helper: Save/Sync course to Supabase `courses` table
export async function upsertSupabaseCourse(course: Course): Promise<boolean> {
  if (!isSupabaseConfigured) return true;

  try {
    const { error } = await supabase.from('courses').upsert({
      id: course.id,
      title: course.title,
      category: course.category,
      level: course.level,
      duration: course.duration,
      lessons_count: course.lessonsCount,
      rating: course.rating,
      instructor: course.instructor,
      description: course.description,
      thumbnail: course.thumbnail,
      status: course.status,
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch (err) {
    console.warn('Course sync error:', err);
    return false;
  }
}

// Helper: Save lesson into Supabase `lessons` table
export async function upsertSupabaseLesson(courseId: string, courseName: string, lesson: Lesson): Promise<boolean> {
  if (!isSupabaseConfigured) return true;

  try {
    const { error } = await supabase.from('lessons').upsert({
      id: lesson.id,
      course_id: courseId,
      course_name: courseName,
      title: lesson.title,
      description: lesson.description || '',
      duration: lesson.duration,
      bunny_video_id: lesson.bunnyVideoId || '',
      library_id: lesson.libraryId || '',
      video_url: lesson.videoUrl || null,
      video_name: lesson.videoName || null,
      pdf_url: lesson.pdfUrl || null,
      pdf_name: lesson.pdfName || null,
      image_url: lesson.imageUrl || null,
      image_name: lesson.imageName || null,
      attachments: lesson.attachments || [],
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch (err) {
    console.warn('Lesson sync error:', err);
    return false;
  }
}

export async function upsertSupabaseFeedback(feedback: FeedbackMessage): Promise<boolean> {
  if (!isSupabaseConfigured) return true;

  try {
    const { error } = await supabase.from('feedback').upsert({
      id: feedback.id,
      user_name: feedback.userName,
      user_email: feedback.userEmail || null,
      user_phone: feedback.userPhone || null,
      user_telegram: feedback.userTelegram || null,
      subject: feedback.subject,
      message: feedback.message,
      rating: feedback.rating || null,
      status: feedback.status,
      admin_reply: feedback.adminReply || null,
      admin_replied_at: feedback.adminRepliedAt || null,
    });
    return !error;
  } catch (err) {
    console.warn('Feedback sync error:', err);
    return false;
  }
}

export async function updateSupabaseFeedback(feedbackId: string, updates: Partial<FeedbackMessage>): Promise<boolean> {
  if (!isSupabaseConfigured) return true;

  const payload = {
    ...(updates.status ? { status: updates.status } : {}),
    ...(updates.adminReply !== undefined ? { admin_reply: updates.adminReply } : {}),
    ...(updates.adminRepliedAt !== undefined ? { admin_replied_at: updates.adminRepliedAt } : {}),
  };
  const { error } = await supabase.from('feedback').update(payload).eq('id', feedbackId);
  return !error;
}

export async function deleteSupabaseFeedback(feedbackId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  const { error } = await supabase.from('feedback').delete().eq('id', feedbackId);
  return !error;
}

export async function fetchSupabaseFeedback(): Promise<FeedbackMessage[] | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
  if (error || !data) return null;
  return data.map((item) => ({
    id: item.id,
    userName: item.user_name || '',
    userEmail: item.user_email || undefined,
    userPhone: item.user_phone || undefined,
    userTelegram: item.user_telegram || undefined,
    type: 'comment' as FeedbackMessage['type'],
    subject: item.subject || '',
    message: item.message || '',
    rating: item.rating || undefined,
    status: item.status || 'new',
    adminReply: item.admin_reply || undefined,
    adminRepliedAt: item.admin_replied_at || undefined,
    createdAt: item.created_at || new Date().toISOString(),
  }));
}

export async function upsertSupabaseAnnouncement(announcement: Announcement): Promise<boolean> {
  if (!isSupabaseConfigured) return true;

  const { error } = await supabase.from('announcements').upsert({
    id: announcement.id,
    title: announcement.title,
    message: announcement.message,
    category: announcement.category,
    author: announcement.author,
    is_pinned: announcement.isPinned || false,
  });
  return !error;
}

export async function updateSupabaseAnnouncement(id: string, updates: Partial<Announcement>): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  const payload = {
    ...(updates.title !== undefined ? { title: updates.title } : {}),
    ...(updates.message !== undefined ? { message: updates.message } : {}),
    ...(updates.category !== undefined ? { category: updates.category } : {}),
    ...(updates.isPinned !== undefined ? { is_pinned: updates.isPinned } : {}),
  };
  const { error } = await supabase.from('announcements').update(payload).eq('id', id);
  return !error;
}

export async function deleteSupabaseAnnouncement(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  const { error } = await supabase.from('announcements').delete().eq('id', id);
  return !error;
}

export async function fetchSupabaseAnnouncements(): Promise<Announcement[] | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
  if (error || !data) return null;
  return data.map((item) => ({
    id: item.id,
    title: item.title,
    message: item.message,
    category: item.category || 'important',
    author: item.author || 'Administrator',
    createdAt: item.created_at || new Date().toISOString(),
    isPinned: Boolean(item.is_pinned),
  }));
}

export async function uploadPublicMedia(file: File, folder = 'lesson-media'): Promise<string> {
  if (!isSupabaseConfigured) throw new Error('Supabase sozlanmagan.');
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${folder}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage.from('media').upload(path, file, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from('media').getPublicUrl(path);
  if (!data.publicUrl) throw new Error('Media public URL yaratilmadi.');
  return data.publicUrl;
}

// Helper: Fetch live courses from Supabase
export async function fetchSupabaseCourses(): Promise<Course[] | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data: coursesData, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (coursesError || !coursesData || coursesData.length === 0) return null;

    const { data: lessonsData } = await supabase
      .from('lessons')
      .select('*');

    return coursesData.map((c) => {
      const courseLessons: Lesson[] = (lessonsData || [])
        .filter((l) => l.course_id === c.id)
        .map((l) => ({
          id: l.id,
          title: l.title,
          duration: l.duration || '15 daqiqa',
          isCompleted: false,
          bunnyVideoId: l.bunny_video_id || undefined,
          libraryId: l.library_id || undefined,
          videoUrl: l.video_url || undefined,
          videoName: l.video_name || undefined,
          pdfUrl: l.pdf_url || undefined,
          pdfName: l.pdf_name || undefined,
          imageUrl: l.image_url || undefined,
          imageName: l.image_name || undefined,
          attachments: l.attachments || undefined,
          description: l.description || '',
          courseName: c.title,
        }));

      return {
        id: c.id,
        title: c.title,
        category: c.category || 'Dasturlash',
        level: c.level || 'Boshlang\'ich',
        duration: c.duration || '20 soat',
        lessonsCount: courseLessons.length || c.lessons_count || 1,
        studentsCount: c.students_count || 0,
        rating: Number(c.rating) || 5.0,
        instructor: c.instructor || 'AI Future Mentor',
        description: c.description || '',
        thumbnail: c.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        status: c.status || 'active',
        lessons: courseLessons.length > 0 ? courseLessons : [
          {
            id: `l-${c.id}-1`,
            title: '1-Dars: Kirish va Asosiy tushunchalar',
            duration: '20 daqiqa',
            isCompleted: false,
            bunnyVideoId: 'b-vid-intro',
            libraryId: '384729',
            description: `${c.title} kursi bo'yicha kirish darsi.`,
            courseName: c.title,
          }
        ],
      };
    });
  } catch (err) {
    console.warn('Could not fetch Supabase courses:', err);
    return null;
  }
}

// Profil rasmini (Avatar) Supabase Storage'ga yuklash
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  if (isSupabaseConfigured) {
    try {
      const form = new FormData();
      form.append('file', file, `${userId}-${file.name}`);
      const apiBase = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:4000/api');
      const mediaResponse = await fetch(`${apiBase.replace(/\/$/, '')}/upload-media`, {
        method: 'POST',
        body: form,
      });
      if (mediaResponse.ok) {
        const media = await mediaResponse.json();
        if (media.publicUrl || media.url) return media.publicUrl || media.url;
      }

      try {
        return await uploadPublicMedia(file, `avatars/${userId}`);
      } catch (storageError) {
        console.warn('Supabase media avatar upload error:', storageError);
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (!uploadError) {
        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        if (data?.publicUrl) {
          return data.publicUrl;
        }
      } else {
        console.warn('Supabase storage upload error:', uploadError.message);
      }
    } catch (e) {
      console.warn('Supabase storage upload exception:', e);
    }
  }

  if (import.meta.env.PROD) {
    throw new Error('Profil rasmi serverga saqlanmadi. Storage yoki Bunny sozlamalarini tekshiring.');
  }

  // Graceful local base64 fallback agar Supabase storage bucket ulanmagan bo'lsa
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
}

// Profil ma'lumotlarini bazada yangilash
export async function updateUserProfile(
  userId: string, 
  updates: { first_name?: string; last_name?: string; phone_number?: string; avatar_url?: string }
) {
  if (isSupabaseConfigured) {
    try {
      // upsert: agar profil hali mavjud bo'lmasa yaratadi, mavjud bo'lsa yangilaydi.
      // Oldingi .update() faqat yozuv mavjud bo'lgandagina ishlardi, aks holda
      // hech narsa saqlanmasdi (jim xato).
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: userId, ...updates })
        .select()
        .single();

      if (!error && data) return data;
      if (error) {
        console.warn('Supabase profile update warning:', error.message);
      }
    } catch (e) {
      console.warn('Supabase profile update exception:', e);
    }
  }

  return { id: userId, ...updates };
}

