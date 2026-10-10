import React, { useEffect, useState } from 'react';
import { Award, Volume2, RefreshCw } from 'lucide-react';
import { SceneAttemptRecord, Story } from '../types/story';
import { generatePersonalizedReflection } from '../data/stories';
import { soundManager } from '../utils/soundEffects';

interface FinalReflectionScreenProps {
  story: Story;
  attemptRecords: SceneAttemptRecord[];
  onChooseAnotherStory: () => void;
  onReplayStory: () => void;
}

export const FinalReflectionScreen: React.FC<FinalReflectionScreenProps> = ({
  story,
  attemptRecords,
  onChooseAnotherStory,
  onReplayStory,
}) => {
  const reflection = generatePersonalizedReflection(story, attemptRecords);
  const [promptIndex, setPromptIndex] = useState<number>(() => {
    const idx = story.discussionPrompts.findIndex(
      (p) => p.id === reflection.selectedPrompt.id
    );
    return idx >= 0 ? idx : 0;
  });

  useEffect(() => {
    // Play celebratory trumpet fanfare when entering the Final Reflection Screen
    soundManager.playTrumpetFanfare();
  }, [story.id]);

  const currentPrompt =
    story.discussionPrompts[promptIndex] || reflection.selectedPrompt;

  const handleCyclePrompt = () => {
    setPromptIndex((prev) => (prev + 1) % story.discussionPrompts.length);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-6 pb-20">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        {/* Top Row: Story Complete Badge & Trumpet Fanfare Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 border border-amber-200">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-700">
                {story.title} · {reflection.totalScenes} Scenes Finished
              </p>
              <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-slate-900">
                Story Complete!
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => soundManager.playTrumpetFanfare()}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Volume2 className="h-4 w-4 text-amber-600" />
            <span>Play Trumpet Fanfare</span>
          </button>
        </div>

        {/* Quiz Performance Summary connecting right/wrong answers to the question */}
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-mono tabular-nums">
            <span className="font-semibold text-slate-900">
              First-Try Score: {reflection.firstTryScore}/{reflection.totalScenes}
            </span>
            <span aria-hidden="true">·</span>
            <span>Strongest Skill: {reflection.strongestSkill}</span>
            <span aria-hidden="true">·</span>
            <span>Question Focus: {currentPrompt.focusCategory}</span>
          </div>
          <p className="mt-2 text-sm text-slate-700 leading-relaxed">
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
              All you need to do is think about this question in your head—or share your opinion aloud in class.
            </span>
          </div>
        </div>

        {/* Large Critical Thinking & Reading Comprehension Question */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-500">
              Critical Thinking &amp; Discussion Question
            </p>
            <button
              type="button"
              onClick={handleCyclePrompt}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Try Another Question ({promptIndex + 1}/{story.discussionPrompts.length})</span>
            </button>
          </div>

          <h2
            className="mt-3 font-serif-display text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 leading-snug"
            style={{ textWrap: 'balance' }}
          >
            &ldquo;{currentPrompt.question}&rdquo;
          </h2>

          {/* Helpful Thinking Clues */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-2">
              Ideas to help you think about your answer:
            </p>
            <ul className="space-y-1.5 text-sm text-slate-700">
              {currentPrompt.thinkingStarters.map((starter, idx) => (
                <li key={idx} className="leading-relaxed">
                  • {starter}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* [Choose Another Story] Button below the discussion question */}
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
            Replay {story.title}
          </button>
        </div>
      </div>
    </div>
  );
};
