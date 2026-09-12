import React, { createContext, useContext, useState, useEffect } from 'react';
import { FeedbackMessage, FeedbackStatus, FeedbackChatMessage } from '../types';
import { playNotificationSound } from '../utils/audio';
import {
  supabase,
  isSupabaseConfigured,
  upsertSupabaseFeedback,
  updateSupabaseFeedback,
  deleteSupabaseFeedback,
  fetchSupabaseFeedback,
} from '../lib/supabase';
import { useAuth } from './AuthContext';

const formatNow = () =>
  new Date().toLocaleDateString('uz-UZ', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

// Older murojaat records were created before the chat thread existed, so
// they only have a single `message` (+ maybe `adminReply`). This turns any
// feedback item into a reliable list of chat messages regardless of when it
// was created, so the UI always has something consistent to render.
export function ensureThreadMessages(fb: FeedbackMessage): FeedbackChatMessage[] {
  if (fb.messages && fb.messages.length > 0) return fb.messages;
  const seeded: FeedbackChatMessage[] = [
    { id: `${fb.id}-orig`, sender: 'user', text: fb.message, createdAt: fb.createdAt },
  ];
  if (fb.adminReply) {
    seeded.push({
      id: `${fb.id}-reply`,
      sender: 'admin',
      text: fb.adminReply,
      createdAt: fb.adminRepliedAt || fb.createdAt,
    });
  }
  return seeded;
}

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
  }) => Promise<FeedbackMessage>;
  updateFeedbackStatus: (id: string, status: FeedbackStatus) => void;
  replyToFeedback: (id: string, replyText: string) => void;
  sendUserMessage: (id: string, text: string) => void;
  deleteFeedback: (id: string) => void;
  clearAllFeedbacks: () => void;
  getUserConversations: (userId?: string) => FeedbackMessage[];
  markThreadSeenByUser: (id: string) => void;
  getUnseenCountForUser: (fb: FeedbackMessage) => number;
}

const INITIAL_FEEDBACKS: FeedbackMessage[] = [];

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();

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

  // Real-time sync: poll regularly and (when Supabase is configured) also
  // subscribe to live postgres changes, so a new murojaat or a new chat
  // message shows up for both the user and the admin without a refresh.
  useEffect(() => {
    let active = true;
    const refreshFeedbacks = async () => {
      const items = await fetchSupabaseFeedback();
      if (active && items) setFeedbacks(items);
    };

    refreshFeedbacks();
    const refreshTimer = window.setInterval(refreshFeedbacks, 10000);
    const channel = isSupabaseConfigured
      ? supabase
          .channel('public-feedback')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback' }, refreshFeedbacks)
          .subscribe()
      : null;

    return () => {
      active = false;
      window.clearInterval(refreshTimer);
      if (channel) supabase.removeChannel(channel);
    };
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

  // Per-user "seen" tracker so the user's own chat badge only counts admin
  // messages they haven't opened yet (mirrors AnnouncementContext's readIds).
  const seenStorageKey = `eduplatform-feedback-seen:${currentUser?.id || 'guest'}`;
  const [seenCounts, setSeenCounts] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem(seenStorageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {};
  });

  useEffect(() => {
    const saved = localStorage.getItem(seenStorageKey);
    if (saved) {
      try {
        setSeenCounts(JSON.parse(saved));
        return;
      } catch {
        // fallthrough
      }
    }
    setSeenCounts({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seenStorageKey]);

  useEffect(() => {
    localStorage.setItem(seenStorageKey, JSON.stringify(seenCounts));
  }, [seenCounts, seenStorageKey]);

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
  }): Promise<FeedbackMessage> => {
    const nowLabel = formatNow();
    const trimmedMessage = data.message.trim();
    const newFeedback: FeedbackMessage = {
      id: crypto.randomUUID(),
      userId: data.userId,
      userName: data.userName.trim(),
      userEmail: data.userEmail?.trim() || undefined,
      userPhone: data.userPhone?.trim() || undefined,
      userTelegram: data.userTelegram?.trim() || undefined,
      type: data.type,
      subject: data.subject.trim(),
      message: trimmedMessage,
      rating: data.rating,
      status: 'new',
      createdAt: nowLabel,
      messages: [{ id: crypto.randomUUID(), sender: 'user', text: trimmedMessage, createdAt: nowLabel }],
    };

    setFeedbacks((prev) => [newFeedback, ...prev]);
    upsertSupabaseFeedback(newFeedback).then((res) => {
      if (!res.ok) {
        alert(`Murojaat serverga saqlanmadi.\nXatolik: ${res.error || 'noma\'lum xatolik'}\n\nIltimos, internetni tekshiring va qayta urinib ko'ring.`);
      }
    });

    // Play pleasant success audio chime
    playNotificationSound('success');

    return newFeedback;
  };

  const updateFeedbackStatus = (id: string, status: FeedbackStatus) => {
    setFeedbacks((prev) =>
      prev.map((fb) => (fb.id === id ? { ...fb, status } : fb))
    );
    updateSupabaseFeedback(id, { status });
  };

  // Admin sends a chat message to the user for this murojaat.
  const replyToFeedback = (id: string, replyText: string) => {
    const trimmed = replyText.trim();
    if (!trimmed) return;
    const replyDate = formatNow();

    setFeedbacks((prev) =>
      prev.map((fb) => {
        if (fb.id !== id) return fb;
        const newMsg: FeedbackChatMessage = { id: crypto.randomUUID(), sender: 'admin', text: trimmed, createdAt: replyDate };
        const updatedMessages = [...ensureThreadMessages(fb), newMsg];
        updateSupabaseFeedback(id, {
          messages: updatedMessages,
          adminReply: trimmed,
          adminRepliedAt: replyDate,
          status: 'reviewed',
        }).then((res) => {
          if (!res.ok) {
            alert(`Javobingiz saqlanmadi va foydalanuvchiga yetib bormaydi.\nXatolik: ${res.error || 'noma\'lum xatolik'}\n\nIltimos, screenshot olib dasturchiga yuboring.`);
          }
        });
        return {
          ...fb,
          messages: updatedMessages,
          adminReply: trimmed,
          adminRepliedAt: replyDate,
          status: 'reviewed',
        };
      })
    );
    playNotificationSound('chime');
  };

  // User sends a chat message back to the admin for this murojaat. Sending a
  // message re-opens the thread (status -> 'new') so it re-surfaces in the
  // admin's unread queue.
  const sendUserMessage = (id: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const sentAt = formatNow();
    let messageCountAfterSend = 0;

    setFeedbacks((prev) =>
      prev.map((fb) => {
        if (fb.id !== id) return fb;
        const newMsg: FeedbackChatMessage = { id: crypto.randomUUID(), sender: 'user', text: trimmed, createdAt: sentAt };
        const updatedMessages = [...ensureThreadMessages(fb), newMsg];
        messageCountAfterSend = updatedMessages.length;
        updateSupabaseFeedback(id, { messages: updatedMessages, status: 'new' }).then((res) => {
          if (!res.ok) {
            alert(`Xabaringiz yuborilmadi.\nXatolik: ${res.error || 'noma\'lum xatolik'}\n\nIltimos, internetni tekshirib qayta yuboring.`);
          }
        });
        return { ...fb, messages: updatedMessages, status: 'new' };
      })
    );

    // The user has obviously "seen" everything up to their own message.
    setSeenCounts((prev) => ({ ...prev, [id]: messageCountAfterSend }));
  };

  const deleteFeedback = (id: string) => {
    setFeedbacks((prev) => prev.filter((fb) => fb.id !== id));
    deleteSupabaseFeedback(id).catch((e) => console.warn('Feedback Supabase delete note:', e));
  };

  const clearAllFeedbacks = () => {
    feedbacks.forEach((fb) => {
      deleteSupabaseFeedback(fb.id).catch(() => {});
    });
    setFeedbacks([]);
    localStorage.removeItem('eduplatform-feedbacks');
  };

  const getUserConversations = (userId?: string) => {
    if (!userId) return [];
    return feedbacks.filter((fb) => fb.userId === userId);
  };

  const markThreadSeenByUser = (id: string) => {
    const fb = feedbacks.find((f) => f.id === id);
    const count = fb ? ensureThreadMessages(fb).length : 0;
    setSeenCounts((prev) => ({ ...prev, [id]: count }));
  };

  const getUnseenCountForUser = (fb: FeedbackMessage) => {
    const total = ensureThreadMessages(fb).length;
    const seen = seenCounts[fb.id] || 0;
    return Math.max(0, total - seen);
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
        sendUserMessage,
        deleteFeedback,
        clearAllFeedbacks,
        getUserConversations,
        markThreadSeenByUser,
        getUnseenCountForUser,
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
