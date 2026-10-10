import React, { useEffect, useState } from 'react';
import { Award, Volume2, Square, RefreshCw, ArrowLeft } from 'lucide-react';
import { SceneAttemptRecord, Story } from '../types/story';
import {
  generatePersonalizedReflection,
  StoryMode,
} from '../data/stories';
import { soundManager } from '../utils/soundEffects';

interface FinalReflectionScreenProps {
  story: Story;
  mode: StoryMode;
  attemptRecords: SceneAttemptRecord[];
  onBackToLastScene: () => void;
  onChooseAnotherStory: () => void;
  onReplayStory: () => void;
}

export const FinalReflectionScreen: React.FC<FinalReflectionScreenProps> = ({
  story,
  mode,
  attemptRecords,
  onBackToLastScene,
  onChooseAnotherStory,
  onReplayStory,
}) => {
  const reflection = generatePersonalizedReflection(
    story,
    attemptRecords,
    mode
  );
  const [promptIndex, setPromptIndex] = useState<number>(() => {
    const idx = story.discussionPrompts.findIndex(
      (p) => p.id === reflection.selectedPrompt.id
    );
    return idx >= 0 ? idx : 0;
  });
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    soundManager.playTrumpetFanfare();
    return () => {
      soundManager.stopSpeaking();
    };
  }, [story.id]);

  const currentPrompt =
    story.discussionPrompts[promptIndex] || reflection.selectedPrompt;

  const handleCyclePrompt = () => {
    soundManager.stopSpeaking();
    setIsSpeaking(false);
    setPromptIndex((prev) => (prev + 1) % story.discussionPrompts.length);
  };

  const handleToggleReadAloud = () => {
    if (isSpeaking) {
      soundManager.stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    soundManager.speakWord(
      `Story Complete! No writing needed. Discussion question: ${currentPrompt.question}`,
      () => setIsSpeaking(false)
    );
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-5 pb-20">
      {/* Top Row: Back Button & Read Aloud */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackToLastScene}
          className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-800 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleReadAloud}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-800 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            {isSpeaking ? (
              <>
                <Square className="h-4 w-4 text-rose-600 fill-rose-600" />
                <span>Stop Reading</span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 text-amber-600" />
                <span>Read Aloud</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => soundManager.playTrumpetFanfare()}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Trumpet</span>
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200/80 bg-[#FFFDF9] p-6 sm:p-8 shadow-xs">
        {/* Story Complete Badge */}
        <div className="flex items-center gap-3 border-b border-amber-100 pb-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 border border-amber-200">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-700">
              {story.title}
            </p>
            <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900">
              Story Complete!
            </h1>
          </div>
        </div>

        {/* Short Performance Summary */}
        <div className="mt-5 rounded-xl border border-amber-200/70 bg-[#FDF8EC] p-4">
          {mode === 'quiz' && (
            <p className="text-xs font-mono font-semibold text-slate-900 tabular-nums mb-1">
              Score: {reflection.firstTryScore}/{reflection.totalScenes}
            </p>
          )}
          <p className="text-sm text-slate-700 leading-relaxed">
            {reflection.tailoredExplanation}
          </p>
        </div>

        {/* Notice Banner: "No writing needed!" */}
        <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50/90 px-4 py-3.5 text-amber-950">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-sm font-bold tracking-tight">
              No writing needed!
            </span>
            <span className="text-xs sm:text-sm text-amber-900">
              Just think about this question in your head—no writing required.
            </span>
          </div>
        </div>

        {/* Critical Thinking Discussion Question */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-500">
              Discussion Question
            </p>
            <button
              type="button"
              onClick={handleCyclePrompt}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Another Question</span>
            </button>
          </div>

          <h2
            className="mt-3 font-serif-display text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 leading-snug"
            style={{ textWrap: 'balance' }}
          >
            &ldquo;{currentPrompt.question}&rdquo;
          </h2>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <ul className="space-y-1.5 text-sm text-slate-700">
              {currentPrompt.thinkingStarters.map((starter, idx) => (
                <li key={idx} className="leading-relaxed">
                  • {starter}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* [Choose Another Story] Button */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={onChooseAnotherStory}
            className="w-full sm:flex-1 min-h-[52px] rounded-xl bg-slate-900 px-6 py-3.5 text-base font-bold text-white shadow-sm hover:bg-slate-800 active:scale-[0.99] transition-all cursor-pointer whitespace-nowrap"
          >
            Choose Another Story
          </button>
          <button
            type="button"
            onClick={onReplayStory}
            className="w-full sm:w-auto min-h-[52px] rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:scale-[0.99] transition-all cursor-pointer whitespace-nowrap"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
};
