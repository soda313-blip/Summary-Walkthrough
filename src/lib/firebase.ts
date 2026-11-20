import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCW5GTVWnXJBI1UXQe8HZ4a2IXbstzDf4c',
  authDomain: 'logintest-cdb5c.firebaseapp.com',
  projectId: 'logintest-cdb5c',
  storageBucket: 'logintest-cdb5c.firebasestorage.app',
  messagingSenderId: '81133945062',
  appId: '1:81133945062:web:dc0089765f878c708cbb27',
  measurementId: 'G-7FB8F10KK5',
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Safely initialize Analytics only in supported browser contexts
if (typeof window !== 'undefined') {
  isAnalyticsSupported()
    .then((supported) => {
      if (supported) {
        getAnalytics(app);
      }
    })
    .catch(() => {
      // Ignore analytics initialization errors in restricted environments
    });
}

export const auth = getAuth(app);
export const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export async function signInWithGoogle(): Promise<User> {
  const credential = await signInWithPopup(auth, googleProvider);
  return credential.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export function getAllowedTeacherEmails(): string[] {
  const raw = (import.meta.env.VITE_TEACHER_EMAILS as string | undefined) || '';
  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isTeacherEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return getAllowedTeacherEmails().includes(normalized);
}

export interface SaveQuizResultInput {
  studentName: string;
  studentEmail: string;
  storyId: string;
  storyTitle: string;
  score: number;
  totalQuestions: number;
  durationSeconds: number;
}

export interface QuizResultRecord extends SaveQuizResultInput {
  id: string;
  completedAt: Date | null;
}

export function formatDurationMMSS(totalSeconds: number): string {
  const safe = Number.isFinite(totalSeconds) ? Math.max(0, Math.round(totalSeconds)) : 0;
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function parseCompletedAt(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === 'object' && value !== null && 'seconds' in value) {
    const secs = (value as { seconds?: number }).seconds;
    if (typeof secs === 'number') {
      return new Date(secs * 1000);
    }
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

export async function saveQuizResult(
  payload: SaveQuizResultInput
): Promise<string> {
  const docRef = await addDoc(collection(db, 'quizResults'), {
    studentName: payload.studentName,
    studentEmail: payload.studentEmail,
    storyId: payload.storyId,
    storyTitle: payload.storyTitle,
    score: payload.score,
    totalQuestions: payload.totalQuestions,
    durationSeconds: payload.durationSeconds,
    completedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function fetchQuizResults(): Promise<QuizResultRecord[]> {
  const colRef = collection(db, 'quizResults');
  let snapshot;
  try {
    snapshot = await getDocs(query(colRef, orderBy('completedAt', 'desc')));
  } catch {
    snapshot = await getDocs(colRef);
  }

  const results: QuizResultRecord[] = snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      studentName:
        typeof data.studentName === 'string' && data.studentName.trim()
          ? data.studentName
          : 'Unknown Student',
      studentEmail:
        typeof data.studentEmail === 'string' ? data.studentEmail : '',
      storyId: typeof data.storyId === 'string' ? data.storyId : '',
      storyTitle:
        typeof data.storyTitle === 'string' && data.storyTitle.trim()
          ? data.storyTitle
          : typeof data.storyId === 'string'
            ? data.storyId
            : 'Untitled Story',
      score: typeof data.score === 'number' ? data.score : 0,
      totalQuestions:
        typeof data.totalQuestions === 'number' ? data.totalQuestions : 0,
      durationSeconds:
        typeof data.durationSeconds === 'number' ? data.durationSeconds : 0,
      completedAt: parseCompletedAt(data.completedAt),
    };
  });

  results.sort((a, b) => {
    const aTime = a.completedAt ? a.completedAt.getTime() : 0;
    const bTime = b.completedAt ? b.completedAt.getTime() : 0;
    return bTime - aTime;
  });

  return results;
}

export { onAuthStateChanged, type User };
