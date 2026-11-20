/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  LogIn,
  LogOut,
  GraduationCap,
  X,
} from 'lucide-react';
import { STORIES, StoryMode } from './data/stories';
import { SceneAttemptRecord, Story } from './types/story';
import { BookshelfScreen } from './components/BookshelfScreen';
import { InteractiveStoryScreen } from './components/InteractiveStoryScreen';
import {
  FinalReflectionScreen,
  ResultSaveStatus,
} from './components/FinalReflectionScreen';
import { TeacherDashboard } from './components/TeacherDashboard';
import { VocabularyBankModal } from './components/VocabularyBankModal';
import { ReadingGuideModal } from './components/ReadingGuideModal';
import { soundManager } from './utils/soundEffects';
import {
  auth,
  isTeacherEmail,
  onAuthStateChanged,
  saveQuizResult,
  signInWithGoogle,
  signOutUser,
  type User,
} from './lib/firebase';

type AppScreen = 'shelf' | 'story' | 'reflection' | 'teacher';

export default function App() {
  const [selectedStoryId, setSelectedStoryId] = useState<string>('secret-garden');
  const [selectedMode, setSelectedMode] = useState<StoryMode>('quiz');
  const [screen, setScreen] = useState<AppScreen>('shelf');
  const [sceneIndex, setSceneIndex] = useState<number>(0);

  const [attemptsByStory, setAttemptsByStory] = useState<
    Record<string, SceneAttemptRecord[]>
  >(() => {
    try {
      const saved = localStorage.getItem('sw_attempts_v2');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [completedStories, setCompletedStories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sw_completed_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isVocabBankOpen, setIsVocabBankOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Firebase Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [authBusy, setAuthBusy] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Elapsed timer & completion persistence state
  const storyStartTimeRef = useRef<number>(Date.now());
  const attemptsRef = useRef<Record<string, SceneAttemptRecord[]>>(attemptsByStory);
  const [lastDurationSeconds, setLastDurationSeconds] = useState<number | null>(
    null
  );
  const [resultSaveStatus, setResultSaveStatus] =
    useState<ResultSaveStatus>('idle');

  const isTeacher = isTeacherEmail(currentUser?.email);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Ensure non-teachers cannot stay on the Teacher Dashboard after sign-out
  useEffect(() => {
    if (screen === 'teacher' && !isTeacher) {
      setScreen('shelf');
    }
  }, [screen, isTeacher]);

  useEffect(() => {
    attemptsRef.current = attemptsByStory;
    try {
      localStorage.setItem('sw_attempts_v2', JSON.stringify(attemptsByStory));
    } catch {
      // Ignore storage errors
    }
  }, [attemptsByStory]);

  useEffect(() => {
    try {
      localStorage.setItem('sw_completed_v2', JSON.stringify(completedStories));
    } catch {
      // Ignore storage errors
    }
  }, [completedStories]);

  const activeStory: Story =
    STORIES.find((s) => s.id === selectedStoryId) || STORIES[0];

  const storyProgressMap: Record<string, number> = {};
  STORIES.forEach((st) => {
    const records = attemptsByStory[st.id] || [];
    storyProgressMap[st.id] = records.length;
  });

  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    soundManager.enabled = nextState;
    if (!nextState) {
      soundManager.stopSpeaking();
    }
  };

  const handleSignIn = async () => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code?: string }).code)
          : '';
      if (
        code !== 'auth/popup-closed-by-user' &&
        code !== 'auth/cancelled-popup-request'
      ) {
        setAuthError(
          err instanceof Error
            ? err.message
            : 'Unable to sign in with Google right now.'
        );
      }
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      await signOutUser();
      if (screen === 'teacher') {
        setScreen('shelf');
      }
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'Unable to sign out right now.'
      );
    } finally {
      setAuthBusy(false);
    }
  };

  const handleStartStory = (story: Story, mode: StoryMode) => {
    soundManager.stopSpeaking();
    setSelectedStoryId(story.id);
    setSelectedMode(mode);
    storyStartTimeRef.current = Date.now();
    setLastDurationSeconds(null);
    setResultSaveStatus('idle');

    if (mode === 'quiz') {
      const existingRecords = attemptsRef.current[story.id] || [];
      if (
        existingRecords.length > 0 &&
        existingRecords.length < story.scenes.length
      ) {
        setSceneIndex(existingRecords.length);
      } else {
        const nextAttempts = {
          ...attemptsRef.current,
          [story.id]: [],
        };
        attemptsRef.current = nextAttempts;
        setAttemptsByStory(nextAttempts);
        setSceneIndex(0);
      }
    } else {
      setSceneIndex(0);
    }

    setScreen('story');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRecordSceneOutcome = (
    sceneId: number,
    attemptsCount: number,
    firstTryCorrect: boolean
  ) => {
    const sceneObj = activeStory.scenes.find((s) => s.id === sceneId);
    if (!sceneObj) return;

    const newRecord: SceneAttemptRecord = {
      sceneId,
      skillTag: sceneObj.skillTag,
      attemptsCount,
      firstTryCorrect,
      completed: true,
    };

    const currentList = attemptsRef.current[activeStory.id] || [];
    const filtered = currentList.filter((r) => r.sceneId !== sceneId);
    const updatedMap = {
      ...attemptsRef.current,
      [activeStory.id]: [...filtered, newRecord],
    };
    attemptsRef.current = updatedMap;
    setAttemptsByStory(updatedMap);
  };

  const handlePreviousScene = () => {
    soundManager.stopSpeaking();
    if (sceneIndex > 0) {
      setSceneIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setScreen('shelf');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextScene = () => {
    soundManager.stopSpeaking();
    if (sceneIndex + 1 < activeStory.scenes.length) {
      setSceneIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const durationSeconds = Math.max(
        1,
        Math.round((Date.now() - storyStartTimeRef.current) / 1000)
      );
      setLastDurationSeconds(durationSeconds);

      if (!completedStories.includes(activeStory.id)) {
        setCompletedStories((prev) => [...prev, activeStory.id]);
      }

      const latestRecords = attemptsRef.current[activeStory.id] || [];
      const firstTryCorrectCount = latestRecords.filter(
        (r) => r.firstTryCorrect
      ).length;
      const totalQuestions = activeStory.scenes.length;
      const score = selectedMode === 'quiz' ? firstTryCorrectCount : 0;
      const storyTitle =
        selectedMode === 'read'
          ? `${activeStory.title} (Read)`
          : activeStory.title;

      setResultSaveStatus('saving');
      void saveQuizResult({
        studentName: currentUser?.displayName || 'Guest Student',
        studentEmail: currentUser?.email || '',
        storyId: activeStory.id,
        storyTitle,
        score,
        totalQuestions,
        durationSeconds,
      })
        .then(() => {
          setResultSaveStatus('saved');
        })
        .catch(() => {
          setResultSaveStatus('error');
        });

      setScreen('reflection');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReplayStory = () => {
    soundManager.stopSpeaking();
    storyStartTimeRef.current = Date.now();
    setLastDurationSeconds(null);
    setResultSaveStatus('idle');

    const nextAttempts = {
      ...attemptsRef.current,
      [activeStory.id]: [],
    };
    attemptsRef.current = nextAttempts;
    setAttemptsByStory(nextAttempts);
    setSceneIndex(0);
    setScreen('story');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8EE] text-stone-900">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 sm:gap-6 px-3 sm:px-6 py-2.5 border-b border-amber-200/80 bg-[#FFFDF8]/95 backdrop-blur-md">
        <button
          type="button"
          onClick={() => {
            soundManager.stopSpeaking();
            setScreen('shelf');
          }}
          className="font-serif-display text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
        >
          Summary Walkthrough
        </button>

        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => {
              soundManager.stopSpeaking();
              setScreen('shelf');
            }}
            className={`hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              screen === 'shelf' ? 'text-slate-900 font-semibold underline' : ''
            }`}
          >
            Bookshelf
          </button>
          <button
            type="button"
            onClick={() => {
              if (screen !== 'story') {
                storyStartTimeRef.current = Date.now();
              }
              setScreen('story');
            }}
            className={`hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              screen === 'story' ? 'text-slate-900 font-semibold underline' : ''
            }`}
          >
            Current Story
          </button>
          <button
            type="button"
            onClick={() => setIsVocabBankOpen(true)}
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Vocabulary
          </button>
          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Reading Guide
          </button>
          {isTeacher && (
            <button
              type="button"
              onClick={() => {
                soundManager.stopSpeaking();
                setScreen('teacher');
              }}
              className={`inline-flex items-center gap-1.5 hover:text-amber-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                screen === 'teacher'
                  ? 'text-amber-900 font-semibold underline'
                  : 'text-amber-800'
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>Teacher Dashboard</span>
            </button>
          )}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          {isTeacher && (
            <button
              type="button"
              onClick={() => {
                soundManager.stopSpeaking();
                setScreen('teacher');
              }}
              aria-label="Open Teacher Dashboard"
              title="Teacher Dashboard"
              className="md:hidden inline-flex h-9 items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 text-xs font-semibold text-amber-950 hover:bg-amber-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Teacher Dashboard</span>
            </button>
          )}

          {/* Sound Toggle Icon Button */}
          <button
            type="button"
            onClick={handleToggleSound}
            aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            title={soundEnabled ? 'Sound On (click to mute)' : 'Sound Off (click to unmute)'}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-amber-200/80 bg-white text-stone-800 hover:bg-amber-50 transition-colors shrink-0 cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 text-amber-700" />
            ) : (
              <VolumeX className="h-4 w-4 text-stone-400" />
            )}
          </button>

          {/* Google Sign-In / Sign-Out Control */}
          {authReady &&
            (currentUser ? (
              <div className="flex items-center gap-2">
                <div
                  className="hidden sm:flex items-center gap-2 max-w-[150px]"
                  title={currentUser.email || currentUser.displayName || 'Signed in'}
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      referrerPolicy="no-referrer"
                      className="h-7 w-7 rounded-full border border-amber-200 object-cover shrink-0"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-900 shrink-0">
                      {(
                        currentUser.displayName?.[0] ||
                        currentUser.email?.[0] ||
                        'U'
                      ).toUpperCase()}
                    </div>
                  )}
                  <span className="truncate text-xs font-semibold text-stone-700">
                    {currentUser.displayName?.split(' ')[0] ||
                      currentUser.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  disabled={authBusy}
                  aria-label="Sign out"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 sm:px-3 text-xs font-semibold text-stone-800 hover:bg-stone-100 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => void handleSignIn()}
                disabled={authBusy}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-stone-900 px-3 text-xs font-semibold text-amber-50 hover:bg-stone-800 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>{authBusy ? 'Signing In...' : 'Sign In'}</span>
              </button>
            ))}
        </div>
      </header>

      {/* Inline Auth Error Notice (dismissible) */}
      {authError && (
        <div
          role="alert"
          className="border-b border-rose-200 bg-rose-50 px-4 py-2 text-xs sm:text-sm text-rose-900"
        >
          <div className="mx-auto max-w-6xl flex items-center justify-between gap-3">
            <span>{authError}</span>
            <button
              type="button"
              onClick={() => setAuthError(null)}
              aria-label="Dismiss sign-in error"
              className="rounded p-1 hover:bg-rose-100 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <main className="flex-1">
        {screen === 'shelf' && (
          <BookshelfScreen
            stories={STORIES}
            selectedStoryId={selectedStoryId}
            selectedMode={selectedMode}
            completedStoryIds={completedStories}
            storyProgressMap={storyProgressMap}
            onSelectStory={(id) => setSelectedStoryId(id)}
            onSelectMode={(mode) => setSelectedMode(mode)}
            onStartStory={handleStartStory}
          />
        )}

        {screen === 'story' && (
          <InteractiveStoryScreen
            story={activeStory}
            sceneIndex={sceneIndex}
            mode={selectedMode}
            onRecordSceneOutcome={handleRecordSceneOutcome}
            onPreviousScene={handlePreviousScene}
            onNextScene={handleNextScene}
            onBackToShelf={() => {
              soundManager.stopSpeaking();
              setScreen('shelf');
            }}
          />
        )}

        {screen === 'reflection' && (
          <FinalReflectionScreen
            story={activeStory}
            mode={selectedMode}
            attemptRecords={attemptsByStory[activeStory.id] || []}
            durationSeconds={lastDurationSeconds}
            resultSaveStatus={resultSaveStatus}
            onBackToLastScene={() => {
              soundManager.stopSpeaking();
              setSceneIndex(activeStory.scenes.length - 1);
              setScreen('story');
            }}
            onChooseAnotherStory={() => {
              soundManager.stopSpeaking();
              setScreen('shelf');
            }}
            onReplayStory={handleReplayStory}
          />
        )}

        {screen === 'teacher' && isTeacher && (
          <TeacherDashboard
            stories={STORIES}
            teacherEmail={currentUser?.email || ''}
            onBackToShelf={() => setScreen('shelf')}
          />
        )}
      </main>

      <VocabularyBankModal
        isOpen={isVocabBankOpen}
        stories={STORIES}
        initialStoryId={selectedStoryId}
        onClose={() => setIsVocabBankOpen(false)}
      />

      <ReadingGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
