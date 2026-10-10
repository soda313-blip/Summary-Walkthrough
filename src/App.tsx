/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { STORIES } from './data/stories';
import { SceneAttemptRecord, Story } from './types/story';
import { BookshelfScreen } from './components/BookshelfScreen';
import { InteractiveStoryScreen } from './components/InteractiveStoryScreen';
import { FinalReflectionScreen } from './components/FinalReflectionScreen';
import { VocabularyBankModal } from './components/VocabularyBankModal';
import { ReadingGuideModal } from './components/ReadingGuideModal';
import { soundManager } from './utils/soundEffects';

type AppScreen = 'shelf' | 'story' | 'reflection';

export default function App() {
  const [selectedStoryId, setSelectedStoryId] = useState<string>('secret-garden');
  const [screen, setScreen] = useState<AppScreen>('shelf');
  const [sceneIndex, setSceneIndex] = useState<number>(0);

  // Track scene attempt outcomes per story for the personalized discussion prompt generator
  const [attemptsByStory, setAttemptsByStory] = useState<
    Record<string, SceneAttemptRecord[]>
  >(() => {
    try {
      const saved = localStorage.getItem('sw_attempts_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [completedStories, setCompletedStories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sw_completed_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isVocabBankOpen, setIsVocabBankOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('sw_attempts_v1', JSON.stringify(attemptsByStory));
    } catch {
      // Ignore storage quota errors
    }
  }, [attemptsByStory]);

  useEffect(() => {
    try {
      localStorage.setItem('sw_completed_v1', JSON.stringify(completedStories));
    } catch {
      // Ignore storage quota errors
    }
  }, [completedStories]);

  const activeStory: Story =
    STORIES.find((s) => s.id === selectedStoryId) || STORIES[0];

  // Calculate how many scenes have been completed in each story for shelf progress display
  const storyProgressMap: Record<string, number> = {};
  STORIES.forEach((st) => {
    const records = attemptsByStory[st.id] || [];
    storyProgressMap[st.id] = records.length;
  });

  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    soundManager.enabled = nextState;
  };

  const handleStartStory = (story: Story) => {
    setSelectedStoryId(story.id);
    const existingRecords = attemptsByStory[story.id] || [];
    // If partially completed (and not all 15 done), resume at the next unfinished scene; otherwise start fresh at Scene 1
    if (existingRecords.length > 0 && existingRecords.length < story.scenes.length) {
      setSceneIndex(existingRecords.length);
    } else {
      // Starting fresh walkthrough
      setAttemptsByStory((prev) => ({
        ...prev,
        [story.id]: [],
      }));
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

    setAttemptsByStory((prev) => {
      const currentList = prev[activeStory.id] || [];
      const filtered = currentList.filter((r) => r.sceneId !== sceneId);
      return {
        ...prev,
        [activeStory.id]: [...filtered, newRecord],
      };
    });
  };

  const handleNextScene = () => {
    if (sceneIndex + 1 < activeStory.scenes.length) {
      setSceneIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Completed all 15 scenes!
      if (!completedStories.includes(activeStory.id)) {
        setCompletedStories((prev) => [...prev, activeStory.id]);
      }
      setScreen('reflection');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReplayStory = () => {
    setAttemptsByStory((prev) => ({
      ...prev,
      [activeStory.id]: [],
    }));
    setSceneIndex(0);
    setScreen('story');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {/* Strict 3-Zone Top Navigation Bar Contract */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => setScreen('shelf')}
          className="font-serif-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
        >
          Summary Walkthrough
        </button>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setScreen('shelf')}
            className={`hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              screen === 'shelf' ? 'text-slate-900 font-semibold underline' : ''
            }`}
          >
            Bookshelf
          </button>
          <button
            type="button"
            onClick={() => setScreen('story')}
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
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleToggleSound}
            className="min-h-[40px] px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {soundEnabled ? 'Sound: On' : 'Sound: Off'}
          </button>
        </div>
      </header>

      {/* Main Screen Content */}
      <main className="flex-1">
        {screen === 'shelf' && (
          <BookshelfScreen
            stories={STORIES}
            selectedStoryId={selectedStoryId}
            completedStoryIds={completedStories}
            storyProgressMap={storyProgressMap}
            onSelectStory={(id) => setSelectedStoryId(id)}
            onStartStory={handleStartStory}
          />
        )}

        {screen === 'story' && (
          <InteractiveStoryScreen
            story={activeStory}
            sceneIndex={sceneIndex}
            onRecordSceneOutcome={handleRecordSceneOutcome}
            onNextScene={handleNextScene}
            onBackToShelf={() => setScreen('shelf')}
          />
        )}

        {screen === 'reflection' && (
          <FinalReflectionScreen
            story={activeStory}
            attemptRecords={attemptsByStory[activeStory.id] || []}
            onChooseAnotherStory={() => setScreen('shelf')}
            onReplayStory={handleReplayStory}
          />
        )}
      </main>

      {/* Supporting Modals */}
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
