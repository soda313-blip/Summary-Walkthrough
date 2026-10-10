import React, { useState } from 'react';
import { Volume2, X } from 'lucide-react';
import { Story } from '../types/story';
import { soundManager } from '../utils/soundEffects';

interface VocabularyBankModalProps {
  isOpen: boolean;
  stories: Story[];
  initialStoryId: string;
  onClose: () => void;
}

export const VocabularyBankModal: React.FC<VocabularyBankModalProps> = ({
  isOpen,
  stories,
  initialStoryId,
  onClose,
}) => {
  const [filterStoryId, setFilterStoryId] = useState<string>(initialStoryId);

  if (!isOpen) return null;

  const activeStory =
    stories.find((s) => s.id === filterStoryId) || stories[0];

  const allWords = activeStory.scenes.flatMap((scene) =>
    scene.vocabWords.map((vw) => ({
      ...vw,
      sceneId: scene.id,
      sceneTitle: scene.title,
    }))
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vocab-bank-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs text-slate-500">
              CEFR A1+ to A2 Sight &amp; Story Words · {allWords.length} Words in Book
            </p>
            <h2
              id="vocab-bank-title"
              className="font-serif-display text-2xl font-bold text-slate-900"
            >
              Story Vocabulary Bank
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            aria-label="Close vocabulary bank"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Interactive Filter Tabs by Book */}
        <div className="mt-3 flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-xl">
          {stories.map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setFilterStoryId(st.id)}
              className={`min-h-[38px] px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeStory.id === st.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st.title}
            </button>
          ))}
        </div>

        {/* Scrollable Vocabulary List */}
        <div className="mt-4 flex-1 overflow-y-auto pr-1 divide-y divide-slate-100">
          {allWords.map((item, idx) => (
            <div
              key={`${item.word}-${idx}`}
              className="py-3.5 flex items-start justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-900 text-sm">
                    {item.word}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{item.partOfSpeech}</span>
                  <span aria-hidden="true">·</span>
                  <span>Scene {item.sceneId}</span>
                </div>
                <p className="mt-1 text-sm text-slate-800">{item.definition}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  &ldquo;{item.contextSentence}&rdquo;
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  soundManager.speakWord(`${item.word}. ${item.definition}`)
                }
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Volume2 className="h-3.5 w-3.5 text-amber-600" />
                <span>Listen</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
