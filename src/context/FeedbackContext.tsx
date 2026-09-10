import React, { createContext, useContext, useState, useEffect } from 'react';
import { FeedbackMessage, FeedbackStatus } from '../types';
import { playNotificationSound } from '../utils/audio';
import {
  saveFeedbackToFirestore,
  updateFeedbackInFirestore,
  deleteFeedbackFromFirestore,
  subscribeToFirebaseFeedbacks,
} from '../lib/firebase';
import { isSupabaseConfigured, upsertSupabaseFeedback, updateSupabaseFeedback, deleteSupabaseFeedback, fetchSupabaseFeedback } from '../lib/supabase';

interface FeedbackContextType {
  feedbacks: FeedbackMessage[];
  unreadFeedbacksCount: number;
  sendFeedback: (data: {
    userName: string;
    userEmail?: string;
    userPhone?: string;
    userTelegram?: string;
    type: FeedbackMessage['type'];
    subject: string;
    message: string;
    rating?: number;
    userId?: string;
  }) => Promise<void>;
  updateFeedbackStatus: (id: string, status: FeedbackStatus) => void;
  replyToFeedback: (id: string, replyText: string) => void;
  deleteFeedback: (id: string) => void;
  clearAllFeedbacks: () => void;
}

const INITIAL_FEEDBACKS: FeedbackMessage[] = [];

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [feedbacks, setFeedbacks] = useState<FeedbackMessage[]>(() => {
    const saved = localStorage.getItem('eduplatform-feedbacks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out old demo feedbacks if present
          return parsed.filter((fb: FeedbackMessage) => !['fb-1', 'fb-2', 'fb-3'].includes(fb.id));
        }
      } catch (e) {
        console.error('Failed to parse saved feedbacks', e);
      }
    }
    return INITIAL_FEEDBACKS;
  });

  // Subscribe to real Firestore feedbacks
  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchSupabaseFeedback().then((items) => {
        if (items) setFeedbacks(items);
      });
      return;
    }
    const unsubscribe = subscribeToFirebaseFeedbacks((firestoreFeedbacks) => {
      if (firestoreFeedbacks && firestoreFeedbacks.length > 0) {
        setFeedbacks(firestoreFeedbacks);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('eduplatform-feedbacks', JSON.stringify(feedbacks));
  }, [feedbacks]);

  // Listen to storage event for multi-tab notification sound when user submits feedback
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'eduplatform-feedbacks' && e.newValue) {
        try {
          const updated: FeedbackMessage[] = JSON.parse(e.newValue);
          setFeedbacks((curr) => {
            if (updated.length > curr.length) {
              playNotificationSound('alert');
            }
            return updated;
          });
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const sendFeedback = async (data: {
    userName: string;
    userEmail?: string;
    userPhone?: string;
    userTelegram?: string;
    type: FeedbackMessage['type'];
    subject: string;
    message: string;
    rating?: number;
    userId?: string;
  }) => {
    const newFeedback: FeedbackMessage = {
      id: crypto.randomUUID(),
      userName: data.userName.trim(),
      userEmail: data.userEmail?.trim() || undefined,
      userPhone: data.userPhone?.trim() || undefined,
      userTelegram: data.userTelegram?.trim() || undefined,
      type: data.type,
      subject: data.subject.trim(),
      message: data.message.trim(),
      rating: data.rating,
      userId: data.userId,
      status: 'new',
      createdAt: new Date().toLocaleDateString('uz-UZ', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setFeedbacks((prev) => [newFeedback, ...prev]);
    saveFeedbackToFirestore(newFeedback).catch((e) => {
      console.warn('Feedback Firestore save note:', e);
    });
    if (isSupabaseConfigured) upsertSupabaseFeedback(newFeedback).catch((e) => console.warn('Feedback Supabase save note:', e));

    // Play pleasant success audio chime
    playNotificationSound('success');
  };

  const updateFeedbackStatus = (id: string, status: FeedbackStatus) => {
    setFeedbacks((prev) =>
      prev.map((fb) => (fb.id === id ? { ...fb, status } : fb))
    );
    updateFeedbackInFirestore(id, { status }).catch((e) => {
      console.warn('Feedback status Firestore update note:', e);
    });
    if (isSupabaseConfigured) updateSupabaseFeedback(id, { status }).catch((e) => console.warn('Feedback Supabase update note:', e));
  };

  const replyToFeedback = (id: string, replyText: string) => {
    const replyDate = new Date().toLocaleDateString('uz-UZ', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
    setFeedbacks((prev) =>
      prev.map((fb) =>
        fb.id === id
          ? {
              ...fb,
              adminReply: replyText.trim(),
              adminRepliedAt: replyDate,
              status: 'resolved',
            }
          : fb
      )
    );
    updateFeedbackInFirestore(id, {
      adminReply: replyText.trim(),
      adminRepliedAt: replyDate,
      status: 'resolved',
    }).catch((e) => {
      console.warn('Feedback reply Firestore update note:', e);
    });
    if (isSupabaseConfigured) updateSupabaseFeedback(id, { adminReply: replyText.trim(), adminRepliedAt: replyDate, status: 'resolved' }).catch((e) => console.warn('Feedback Supabase reply note:', e));
    playNotificationSound('chime');
  };

  const deleteFeedback = (id: string) => {
    setFeedbacks((prev) => prev.filter((fb) => fb.id !== id));
    deleteFeedbackFromFirestore(id).catch((e) => {
      console.warn('Feedback delete Firestore note:', e);
    });
    if (isSupabaseConfigured) deleteSupabaseFeedback(id).catch((e) => console.warn('Feedback Supabase delete note:', e));
  };

  const clearAllFeedbacks = () => {
    feedbacks.forEach((fb) => {
      deleteFeedbackFromFirestore(fb.id).catch(() => {});
    });
    setFeedbacks([]);
    localStorage.removeItem('eduplatform-feedbacks');
  };

  const unreadFeedbacksCount = feedbacks.filter((fb) => fb.status === 'new').length;

  return (
    <FeedbackContext.Provider
      value={{
        feedbacks,
        unreadFeedbacksCount,
        sendFeedback,
        updateFeedbackStatus,
        replyToFeedback,
        deleteFeedback,
        clearAllFeedbacks,
      }}
    >
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
}
