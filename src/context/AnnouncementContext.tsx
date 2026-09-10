import React, { createContext, useContext, useState, useEffect } from 'react';
import { Announcement } from '../types';
import { INITIAL_ANNOUNCEMENTS } from '../data/mockData';
import { playNotificationSound } from '../utils/audio';
import {
  saveAnnouncementToFirestore,
  updateAnnouncementInFirestore,
  deleteAnnouncementFromFirestore,
  subscribeToFirebaseAnnouncements,
} from '../lib/firebase';
import { isSupabaseConfigured, upsertSupabaseAnnouncement, updateSupabaseAnnouncement, deleteSupabaseAnnouncement, fetchSupabaseAnnouncements } from '../lib/supabase';

interface AnnouncementContextType {
  announcements: Announcement[];
  readIds: string[];
  unreadCount: number;
  addAnnouncement: (title: string, message: string, category?: Announcement['category'], isPinned?: boolean) => void;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
  togglePinAnnouncement: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAllAnnouncements: () => void;
  playNotificationSound: () => void;
}

const AnnouncementContext = createContext<AnnouncementContextType | undefined>(undefined);

export function AnnouncementProvider({ children }: { children: React.ReactNode }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('eduplatform-announcements');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out dummy "salom" announcements
          return parsed.filter(
            (a: Announcement) =>
              !a.title.toLowerCase().includes('salom') &&
              !a.message.toLowerCase().includes('salom')
          );
        }
      } catch (e) {
        console.error('Failed to parse announcements', e);
      }
    }
    return INITIAL_ANNOUNCEMENTS;
  });

  // Subscribe to real Firestore announcements
  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchSupabaseAnnouncements().then((items) => {
        if (items) setAnnouncements(items);
      });
      return;
    }
    const unsubscribe = subscribeToFirebaseAnnouncements((firestoreList) => {
      if (firestoreList && firestoreList.length > 0) {
        const filtered = firestoreList.filter(
          (a) => !a.title.toLowerCase().includes('salom') && !a.message.toLowerCase().includes('salom')
        );
        setAnnouncements(filtered);
      }
    });
    return () => unsubscribe();
  }, []);

  const [readIds, setReadIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('eduplatform-read-announcements');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse read announcements', e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('eduplatform-announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('eduplatform-read-announcements', JSON.stringify(readIds));
  }, [readIds]);

  // Listen for announcements added in other tabs or background to play chime
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'eduplatform-announcements' && e.newValue) {
        try {
          const updated: Announcement[] = JSON.parse(e.newValue);
          setAnnouncements((current) => {
            if (updated.length > current.length) {
              playNotificationSound('chime');
            }
            return updated;
          });
        } catch (err) {
          console.error(err);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const addAnnouncement = (
    title: string,
    message: string,
    category: Announcement['category'] = 'important',
    isPinned: boolean = false
  ) => {
    const newAnn: Announcement = {
      id: crypto.randomUUID(),
      title: title.trim(),
      message: message.trim(),
      category,
      author: 'Administrator',
      createdAt: new Date().toLocaleDateString('uz-UZ', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      }),
      isPinned,
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    saveAnnouncementToFirestore(newAnn).catch((e) => {
      console.warn('Announcement Firestore save note:', e);
    });
    if (isSupabaseConfigured) upsertSupabaseAnnouncement(newAnn).catch((e) => console.warn('Announcement Supabase save note:', e));
    // Play sound notification immediately when announcement is sent/arrives
    playNotificationSound();
  };

  const updateAnnouncement = (id: string, updates: Partial<Announcement>) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
    updateAnnouncementInFirestore(id, updates).catch((e) => {
      console.warn('Announcement Firestore update note:', e);
    });
    if (isSupabaseConfigured) updateSupabaseAnnouncement(id, updates).catch((e) => console.warn('Announcement Supabase update note:', e));
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    setReadIds((prev) => prev.filter((item) => item !== id));
    deleteAnnouncementFromFirestore(id).catch((e) => {
      console.warn('Announcement Firestore delete note:', e);
    });
    if (isSupabaseConfigured) deleteSupabaseAnnouncement(id).catch((e) => console.warn('Announcement Supabase delete note:', e));
  };

  const clearAllAnnouncements = () => {
    announcements.forEach((a) => {
      deleteAnnouncementFromFirestore(a.id).catch(() => {});
    });
    setAnnouncements([]);
    setReadIds([]);
    localStorage.removeItem('eduplatform-announcements');
    localStorage.removeItem('eduplatform-read-announcements');
  };

  const togglePinAnnouncement = (id: string) => {
    setAnnouncements((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, isPinned: !a.isPinned } : a));
      const target = updated.find((a) => a.id === id);
      if (target) {
        updateAnnouncementInFirestore(id, { isPinned: target.isPinned }).catch(() => {});
      }
      return updated;
    });
  };

  const markAsRead = (id: string) => {
    if (!readIds.includes(id)) {
      setReadIds((prev) => [...prev, id]);
    }
  };

  const markAllAsRead = () => {
    setReadIds(announcements.map((a) => a.id));
  };

  const unreadCount = announcements.filter((a) => !readIds.includes(a.id)).length;

  return (
    <AnnouncementContext.Provider
      value={{
        announcements,
        readIds,
        unreadCount,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        togglePinAnnouncement,
        markAsRead,
        markAllAsRead,
        clearAllAnnouncements,
        playNotificationSound,
      }}
    >
      {children}
    </AnnouncementContext.Provider>
  );
}

export function useAnnouncements() {
  const context = useContext(AnnouncementContext);
  if (!context) {
    throw new Error('useAnnouncements must be used within an AnnouncementProvider');
  }
  return context;
}
