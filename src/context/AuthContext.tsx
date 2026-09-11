import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, UserStatus } from '../types';
import { INITIAL_USERS } from '../data/mockData';
import {
  supabase,
  isSupabaseConfigured,
  upsertSupabaseProfile,
  fetchSupabaseProfiles,
} from '../lib/supabase';

export interface ProfileData {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  avatar_url?: string;
}

interface AuthContextType {
  currentUser: User | null;
  user: User | null;
  profile: ProfileData | null;
  users: User[];
  isAuthenticated: boolean;
  isSupabaseActive: boolean;
  isFirebaseActive: boolean;
  login: (identifier: string) => boolean;
  loginWithCredentials: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (email?: string, fullName?: string, phone?: string) => Promise<boolean>;
  loginWithFirebaseGoogle: (intent?: 'login' | 'register') => Promise<boolean>;
  loginWithGmail: (gmail: string, fullName?: string, phone?: string) => Promise<boolean>;
  loginWithTelegram: (telegramHandle: string, fullName?: string, phone?: string) => Promise<boolean>;
  loginAsAdmin: () => boolean;
  loginAsAdminWithCredentials: (loginInput: string, passwordInput: string) => { success: boolean; error?: string };
  register: (
    firstName: string,
    lastName: string,
    phoneNumber: string,
    emailOrIdentifier?: string,
    provider?: 'email' | 'phone' | 'google' | 'gmail' | 'telegram',
    telegramHandle?: string
  ) => Promise<boolean>;
  logout: () => void;
  signOut: () => void;
  updateCurrentUser: (updates: Partial<User>) => void;
  updateAnyUser: (userId: string, updates: Partial<User>) => void;
  addUser: (userData: Omit<User, 'id' | 'joinedDate'>) => void;
  deleteUser: (userId: string) => void;
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;
  switchUserRoleOrStatus: (userId: string, status: UserStatus, role?: UserRole) => void;
  refreshUsers: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearDemoUsers: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const CANONICAL_ADMIN_ID = '00000000-0000-0000-0000-000000000001';

function normalizeUsers(source: User[]): User[] {
  const seen = new Set<string>();
  let admin: User | null = null;
  const result: User[] = [];

  for (const item of source) {
    const isAdmin = item.role === 'admin';
    if (isAdmin) {
      if (!admin) {
        admin = { ...item, id: CANONICAL_ADMIN_ID, role: 'admin', status: 'approved' };
      }
      continue;
    }

    const identity = item.id || item.email?.toLowerCase() || item.phoneNumber || `${item.firstName}-${item.lastName}`;
    if (!seen.has(identity)) {
      seen.add(identity);
      result.push(item);
    }
  }

  return admin ? [admin, ...result] : result;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('aifuture-users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const adminIdx = parsed.findIndex((u: User) => u.role === 'admin');
        if (adminIdx !== -1) {
          parsed[adminIdx] = {
            ...parsed[adminIdx],
            id: '00000000-0000-0000-0000-000000000001',
          };
          return normalizeUsers(parsed.filter((u: User) => !u.id.startsWith('demo-')));
        }
        return normalizeUsers([INITIAL_USERS[0], ...parsed.filter((u: User) => !u.id.startsWith('demo-'))]);
      } catch (e) {
        console.error('Failed to parse saved users', e);
      }
    }
    return INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    const saved = localStorage.getItem('aifuture-current-user-id');
    if (saved === 'admin-aslonbek' || saved === 'admin-1') {
      return '00000000-0000-0000-0000-000000000001';
    }
    return saved || null;
  });

  // Sync users with Supabase on mount if configured
  const refreshUsers = useCallback(async () => {
    if (isSupabaseConfigured) {
      try {
        const remoteProfiles = await fetchSupabaseProfiles();
        if (remoteProfiles && remoteProfiles.length > 0) {
          setUsers((prev) => {
            const admin = prev.find((u) => u.role === 'admin') || INITIAL_USERS[0];
            const remoteIds = new Set(remoteProfiles.map((u) => u.id));
            const localOnlyUsers = prev.filter((u) => !remoteIds.has(u.id) && !u.id.startsWith('demo-'));
            const combined = [...remoteProfiles, ...localOnlyUsers];
            if (!combined.some((u) => u.role === 'admin')) {
              combined.unshift(admin);
            }
            return normalizeUsers(combined);
          });
        }
      } catch (err) {
        console.warn('Supabase fetch error:', err);
      }
    }
  }, []);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  // Listen to Supabase Auth state changes if active
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const sUser = session.user;
        const meta = sUser.user_metadata || {};
        const oauthIntent = localStorage.getItem('eduplatform-google-auth-intent') || 'login';
        localStorage.removeItem('eduplatform-google-auth-intent');
        const remoteProfiles = await fetchSupabaseProfiles();
        const matchedUser = (remoteProfiles || users).find((u) => u.id === sUser.id || u.email === sUser.email);

        if (matchedUser) {
          setUsers((prev) => normalizeUsers([matchedUser, ...prev.filter((u) => u.id !== matchedUser.id)]));
          setCurrentUserId(matchedUser.id);
        } else if (oauthIntent === 'login') {
          await supabase.auth.signOut();
          window.dispatchEvent(new CustomEvent('google_auth_rejected'));
        } else {
          // Create profile from Supabase session
          const parts = (meta.full_name || meta.name || 'Foydalanuvchi').trim().split(' ');
          const fName = meta.first_name || parts[0] || 'Foydalanuvchi';
          const lName = meta.last_name || parts.slice(1).join(' ') || '';
          const newUser: User = {
            id: sUser.id,
            firstName: fName,
            lastName: lName,
            phoneNumber: meta.phone || sUser.phone || '',
            email: sUser.email || '',
            role: 'student',
            status: 'pending', // pending by default
            authProvider: 'google',
            joinedDate: new Date().toISOString().split('T')[0],
            avatarUrl: meta.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          };
          setUsers((prev) => [newUser, ...prev]);
          setCurrentUserId(newUser.id);
          upsertSupabaseProfile(newUser);
        }
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [users]);

  useEffect(() => {
    localStorage.setItem('aifuture-users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem('aifuture-current-user-id', currentUserId);
    } else {
      localStorage.removeItem('aifuture-current-user-id');
    }
  }, [currentUserId]);

  const currentUser = users.find((u) => u.id === currentUserId) || null;
  const isAuthenticated = currentUser !== null;

  const login = (identifier: string): boolean => {
    const cleanInput = identifier.trim().toLowerCase();
    const cleanDigits = cleanInput.replace(/\D/g, '');
    const user = users.find(
      (u) =>
        (u.email && u.email.toLowerCase() === cleanInput) ||
        (u.telegramHandle && u.telegramHandle.replace(/^@/, '').toLowerCase() === cleanInput.replace(/^@/, '')) ||
        (u.firstName && u.firstName.toLowerCase() === cleanInput) ||
        (`${u.firstName} ${u.lastName}`.toLowerCase() === cleanInput) ||
        (u.id === cleanInput) ||
        (cleanDigits.length >= 7 && u.phoneNumber && u.phoneNumber.replace(/\D/g, '').includes(cleanDigits))
    );
    if (user) {
      setCurrentUserId(user.id);
      return true;
    }
    return false;
  };

  const loginWithCredentials = async (identifier: string, password: string) => {
    if (!isSupabaseConfigured) {
      return login(identifier)
        ? { success: true }
        : { success: false, error: 'Foydalanuvchi topilmadi.' };
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const cleanDigits = cleanIdentifier.replace(/\D/g, '');
    const matchedUser = users.find(
      (u) =>
        u.email?.toLowerCase() === cleanIdentifier ||
        (cleanDigits.length >= 7 && u.phoneNumber?.replace(/\D/g, '').includes(cleanDigits))
    );
    const email = matchedUser?.email || (cleanIdentifier.includes('@') ? cleanIdentifier : '');

    if (!email) {
      return { success: false, error: 'Telefon raqamiga mos hisob topilmadi.' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      return { success: false, error: error?.message || 'Kirish ma’lumotlari noto‘g‘ri.' };
    }

    const user = users.find((item) => item.id === data.user.id || item.email?.toLowerCase() === email);
    if (user) setCurrentUserId(user.id);
    return { success: true };
  };

  const loginWithFirebaseGoogle = async (intent: 'login' | 'register' = 'login'): Promise<boolean> => {
    try {
      if (!isSupabaseConfigured) return false;
      localStorage.setItem('eduplatform-google-auth-intent', intent);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      return !error;
    } catch (err) {
      console.warn('Supabase Google Sign-in note:', err);
      return false;
    }
  };

  const loginWithGoogle = async (email?: string, fullName?: string, phone?: string): Promise<boolean> => {
    // If no email provided, direct to Firebase Google popup
    if (!email) {
      return loginWithFirebaseGoogle('register');
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (!error) return true;
      } catch (e) {
        console.warn('Supabase Google OAuth fallback to local profile:', e);
      }
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = users.find((u) => u.email?.toLowerCase() === cleanEmail);

    if (!user) {
      const parts = (fullName || 'Google Foydalanuvchisi').trim().split(' ');
      const fName = parts[0] || 'Google';
      const lName = parts.slice(1).join(' ') || 'Foydalanuvchisi';
      const isAdmin = cleanEmail === 'muxtorovaslonbek@gmail.com';
      const newUser: User = {
        id: crypto.randomUUID(),
        firstName: fName,
        lastName: lName,
        phoneNumber: phone || '+998 90 000 00 00',
        email: cleanEmail,
        role: isAdmin ? 'admin' : 'student',
        status: isAdmin ? 'approved' : 'pending',
        authProvider: 'google',
        joinedDate: new Date().toISOString().split('T')[0],
        avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      };
      setUsers((prev) => [newUser, ...prev]);
      setCurrentUserId(newUser.id);
      upsertSupabaseProfile(newUser);
      return true;
    }

    setCurrentUserId(user.id);
    return true;
  };

  const loginWithGmail = async (gmail: string, fullName?: string, phone?: string): Promise<boolean> => {
    return loginWithGoogle(gmail, fullName, phone);
  };

  const loginWithTelegram = async (telegramHandle: string, fullName?: string, phone?: string): Promise<boolean> => {
    let cleanHandle = telegramHandle.trim().replace(/^@/, '').toLowerCase();
    let user = users.find(
      (u) =>
        (u.telegramHandle && u.telegramHandle.replace(/^@/, '').toLowerCase() === cleanHandle) ||
        (cleanHandle && u.email && u.email.toLowerCase().startsWith(cleanHandle))
    );

    if (!user) {
      const parts = (fullName || cleanHandle || 'Telegram').trim().split(' ');
      const fName = parts[0] || `@${cleanHandle}`;
      const lName = parts.slice(1).join(' ') || 'Foydalanuvchisi';
      const newUser: User = {
        id: crypto.randomUUID(),
        firstName: fName,
        lastName: lName,
        phoneNumber: phone || '+998 90 000 00 00',
        telegramHandle: `@${cleanHandle}`,
        email: `${cleanHandle}@telegram.user`,
        role: 'student',
        status: 'pending',
        authProvider: 'telegram',
        joinedDate: new Date().toISOString().split('T')[0],
        avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      };
      setUsers((prev) => [newUser, ...prev]);
      setCurrentUserId(newUser.id);
      upsertSupabaseProfile(newUser);
      return true;
    }

    setCurrentUserId(user.id);
    return true;
  };

  const register = async (
    firstName: string,
    lastName: string,
    phoneNumber: string,
    emailOrIdentifier?: string,
    provider: 'email' | 'phone' | 'google' | 'gmail' | 'telegram' = 'email',
    telegramHandle?: string,
    password = ''
  ): Promise<boolean> => {
    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();
    const cleanPhone = phoneNumber.trim();
    const resolvedEmail =
      emailOrIdentifier && emailOrIdentifier.trim()
        ? emailOrIdentifier.trim().toLowerCase()
        : `${cleanFirst.toLowerCase().replace(/\s+/g, '')}.${cleanLast.toLowerCase().replace(/\s+/g, '')}@student.edu`;

    let generatedId: string = crypto.randomUUID();

    // If Supabase is configured and provider is email, register Supabase user
    if (isSupabaseConfigured && provider === 'email') {
      try {
        const { data: suData, error } = await supabase.auth.signUp({
          email: resolvedEmail,
          password,
          options: {
            data: {
              first_name: cleanFirst,
              last_name: cleanLast,
              phone: cleanPhone,
            },
          },
        });
        if (error) throw error;
        if (suData?.user?.id) {
          generatedId = suData.user.id;
        }
      } catch (err) {
        console.warn('Supabase signUp notice:', err);
        return false;
      }
    }

    const newUser: User = {
      id: generatedId,
      firstName: cleanFirst,
      lastName: cleanLast,
      phoneNumber: cleanPhone,
      email: resolvedEmail,
      telegramHandle: telegramHandle ? (telegramHandle.startsWith('@') ? telegramHandle : `@${telegramHandle}`) : undefined,
      authProvider: provider,
      role: 'student',
      status: 'pending', // Strict requirement: Default status is pending until Admin approves!
      joinedDate: new Date().toISOString().split('T')[0],
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    };

    setUsers((prev) => [newUser, ...prev.filter((u) => u.id !== newUser.id)]);
    setCurrentUserId(newUser.id);
    const profileResult = await upsertSupabaseProfile(newUser);
    if (!profileResult.success) {
      setUsers((prev) => prev.filter((u) => u.id !== newUser.id));
      setCurrentUserId(null);
      return false;
    }
    return true;
  };

  const clearDemoUsers = () => {
    setUsers((prev) => {
      const filtered = prev.filter((u) => u.role === 'admin' || !u.id.startsWith('demo-'));
      return filtered.length > 0 ? filtered : INITIAL_USERS;
    });
  };

  const loginAsAdmin = (): boolean => {
    let admin = users.find((u) => u.role === 'admin');
    if (!admin) {
      const defaultAdmin = INITIAL_USERS[0];
      setUsers((prev) => [defaultAdmin, ...prev]);
      admin = defaultAdmin;
    }
    setCurrentUserId(admin.id);
    return true;
  };

  const loginAsAdminWithCredentials = (
    loginInput: string,
    passwordInput: string
  ): { success: boolean; error?: string } => {
    const cleanLogin = loginInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    // The user strictly requested: admin login: aslonbek0722, parol: aslonbek2207
    const isValid =
      (cleanLogin === 'aslonbek0722' || cleanLogin === 'muxtorovaslonbek@gmail.com') &&
      cleanPass === 'aslonbek2207';

    if (!isValid) {
      return {
        success: false,
        error: "Noto'g'ri administrator login yoki parol kiritildi!",
      };
    }

    const existingAdmin = users.find((u) => u.role === 'admin');
    const adminUser: User = existingAdmin
      ? { ...existingAdmin, id: CANONICAL_ADMIN_ID, role: 'admin', status: 'approved' }
      : {
          id: CANONICAL_ADMIN_ID,
          firstName: 'Aslonbek',
          lastName: 'Muxtorov',
          phoneNumber: '+998 90 123 45 67',
          email: 'muxtorovaslonbek@gmail.com',
          role: 'admin',
          status: 'approved',
          joinedDate: '2026-01-01',
          bio: "AI Future platformasi asoschisi va bosh ma'muri.",
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          authProvider: 'email',
        };

    setUsers((prev) => [adminUser, ...prev.filter((u) => u.id !== adminUser.id && u.role !== 'admin')]);
    setCurrentUserId(adminUser.id);
    upsertSupabaseProfile(adminUser).catch(() => {});
    return { success: true };
  };

  const addUser = (userData: Omit<User, 'id' | 'joinedDate'>) => {
    const newUser: User = {
      ...userData,
      id: crypto.randomUUID(),
      joinedDate: new Date().toISOString().split('T')[0],
      avatarUrl: userData.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    };
    setUsers((prev) => [newUser, ...prev]);
    upsertSupabaseProfile(newUser);
  };

  const deleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    if (currentUserId === userId) {
      setCurrentUserId(null);
    }
    if (isSupabaseConfigured) {
      supabase.from('profiles').delete().eq('id', userId).then();
    }
  };

  const logout = () => {
    if (isSupabaseConfigured) {
      supabase.auth.signOut().catch(() => {});
    }
    setCurrentUserId(null);
  };

  const updateCurrentUser = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? updated : u))
    );
    upsertSupabaseProfile(updated).then((result) => {
      if (!result.success) {
        console.warn('Profil Supabase ga saqlanmadi:', result.error);
      }
    });
  };

  const updateAnyUser = (userId: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, ...updates };
          upsertSupabaseProfile(updated);
          return updated;
        }
        return u;
      })
    );
  };

  const approveUser = (userId: string) => {
    if (currentUser?.role !== 'admin') {
      console.warn("Faqat administrator foydalanuvchini tasdiqlashi mumkin!");
      return;
    }
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, status: 'approved' as UserStatus };
          upsertSupabaseProfile(updated);
          return updated;
        }
        return u;
      })
    );
  };

  const rejectUser = (userId: string) => {
    if (currentUser?.role !== 'admin') {
      console.warn("Faqat administrator foydalanuvchini rad etishi mumkin!");
      return;
    }
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, status: 'rejected' as UserStatus };
          upsertSupabaseProfile(updated);
          return updated;
        }
        return u;
      })
    );
  };

  const switchUserRoleOrStatus = (userId: string, status: UserStatus, role?: UserRole) => {
    if (currentUser?.role !== 'admin') {
      console.warn("Faqat administrator foydalanuvchi holatini o'zgartirishi mumkin!");
      return;
    }
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, status, ...(role ? { role } : {}) };
          upsertSupabaseProfile(updated);
          return updated;
        }
        return u;
      })
    );
  };

  const profile: ProfileData | null = currentUser
    ? {
        first_name: currentUser.firstName,
        last_name: currentUser.lastName,
        phone_number: currentUser.phoneNumber,
        avatar_url: currentUser.avatarUrl,
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        user: currentUser,
        profile,
        users,
        isAuthenticated,
        isSupabaseActive: isSupabaseConfigured,
        isFirebaseActive: false,
        login,
        loginWithCredentials,
        loginWithGoogle,
        loginWithFirebaseGoogle,
        loginWithGmail,
        loginWithTelegram,
        loginAsAdmin,
        loginAsAdminWithCredentials,
        register,
        logout,
        signOut: logout,
        updateCurrentUser,
        updateAnyUser,
        addUser,
        deleteUser,
        approveUser,
        rejectUser,
        switchUserRoleOrStatus,
        refreshUsers,
        refreshProfile: refreshUsers,
        clearDemoUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
