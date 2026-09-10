import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  where,
  deleteDoc,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { User, Course, Announcement, FeedbackMessage, TestResult } from '../types';

// Initialize Firebase App
const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Error handling as mandated by Firebase Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection Validation as mandated by Firebase Skill
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network is limited:', error);
    } else {
      console.warn('Firebase connection check note:', error);
    }
    return false;
  }
}

// Immediately run connection validation on boot
testFirebaseConnection();

// Sign In With Google Popup
export async function signInWithGoogle(): Promise<{ user: FirebaseUser } | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user };
  } catch (error: any) {
    const code = error?.code || '';
    // Gracefully handle popup closed or cancelled by user without spamming error console
    if (
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/cancelled-popup-request' ||
      code === 'auth/user-cancelled'
    ) {
      console.warn('Firebase Google Sign-in was dismissed or closed by user.');
      return null;
    }
    if (code === 'auth/popup-blocked') {
      console.warn('Firebase Google Sign-in popup was blocked by browser.');
      throw new Error("Brauzeringiz Google oynasini blokladi. Iltimos, qalqib chiquvchi oynalarga (popups) ruxsat bering.");
    }
    console.warn('Firebase Google Sign-in note:', error?.message || error);
    throw error;
  }
}

// Sign Out
export async function signOutFirebase(): Promise<void> {
  await firebaseSignOut(auth);
}

// Helper to recursively remove undefined properties before saving to Firestore
export function cleanFirestoreData<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        clean[key] = cleanFirestoreData(value);
      } else {
        clean[key] = value;
      }
    }
  }
  return clean;
}

// Firestore User Document operations
export async function getFirebaseUserProfile(userId: string): Promise<User | null> {
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      return snap.data() as User;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function upsertFirebaseUserProfile(user: User): Promise<void> {
  const path = `users/${user.id}`;
  try {
    await setDoc(doc(db, 'users', user.id), cleanFirestoreData(user), { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function updateFirebaseUserProfile(userId: string, updates: Partial<User>): Promise<void> {
  const path = `users/${userId}`;
  try {
    await updateDoc(doc(db, 'users', userId), cleanFirestoreData(updates));
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteFirebaseUserProfile(userId: string): Promise<void> {
  const path = `users/${userId}`;
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export function subscribeToFirebaseUsers(onUsersUpdated: (users: User[]) => void): () => void {
  const usersCol = collection(db, 'users');
  return onSnapshot(
    usersCol,
    (snapshot) => {
      const list: User[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as User);
      });
      onUsersUpdated(list);
    },
    (err) => {
      console.warn('Firestore users subscription note:', err);
    }
  );
}

export async function fetchFirebaseUsers(): Promise<User[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const list: User[] = [];
    snap.forEach((d) => list.push(d.data() as User));
    return list;
  } catch (err) {
    console.warn('Fetch users note:', err);
    return [];
  }
}

// Firestore Feedbacks operations
export async function saveFeedbackToFirestore(feedback: FeedbackMessage): Promise<void> {
  const path = `feedbacks/${feedback.id}`;
  try {
    await setDoc(doc(db, 'feedbacks', feedback.id), cleanFirestoreData(feedback));
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateFeedbackInFirestore(feedbackId: string, updates: Partial<FeedbackMessage>): Promise<void> {
  const path = `feedbacks/${feedbackId}`;
  try {
    await updateDoc(doc(db, 'feedbacks', feedbackId), cleanFirestoreData(updates));
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteFeedbackFromFirestore(feedbackId: string): Promise<void> {
  const path = `feedbacks/${feedbackId}`;
  try {
    await deleteDoc(doc(db, 'feedbacks', feedbackId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export function subscribeToFirebaseFeedbacks(onFeedbacksUpdated: (feedbacks: FeedbackMessage[]) => void): () => void {
  const feedbacksCol = collection(db, 'feedbacks');
  return onSnapshot(
    feedbacksCol,
    (snapshot) => {
      const list: FeedbackMessage[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as FeedbackMessage);
      });
      // Sort newest first by created timestamp or id
      list.sort((a, b) => b.id.localeCompare(a.id));
      onFeedbacksUpdated(list);
    },
    (err) => {
      console.warn('Firestore feedbacks subscription note:', err);
    }
  );
}

// Firestore Announcements operations
export async function saveAnnouncementToFirestore(announcement: Announcement): Promise<void> {
  const path = `announcements/${announcement.id}`;
  try {
    await setDoc(doc(db, 'announcements', announcement.id), cleanFirestoreData(announcement));
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateAnnouncementInFirestore(announcementId: string, updates: Partial<Announcement>): Promise<void> {
  const path = `announcements/${announcementId}`;
  try {
    await updateDoc(doc(db, 'announcements', announcementId), cleanFirestoreData(updates));
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteAnnouncementFromFirestore(announcementId: string): Promise<void> {
  const path = `announcements/${announcementId}`;
  try {
    await deleteDoc(doc(db, 'announcements', announcementId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export function subscribeToFirebaseAnnouncements(onAnnouncementsUpdated: (announcements: Announcement[]) => void): () => void {
  const annCol = collection(db, 'announcements');
  return onSnapshot(
    annCol,
    (snapshot) => {
      const list: Announcement[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Announcement);
      });
      list.sort((a, b) => b.id.localeCompare(a.id));
      onAnnouncementsUpdated(list);
    },
    (err) => {
      console.warn('Firestore announcements subscription note:', err);
    }
  );
}

// Firestore Test Results operations
export async function saveTestResultToFirestore(result: TestResult): Promise<void> {
  const path = `test_results/${result.id}`;
  try {
    await setDoc(doc(db, 'test_results', result.id), cleanFirestoreData(result));
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export { onAuthStateChanged };
