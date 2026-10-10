import React from 'react';
import { Volume2, X } from 'lucide-react';
import { Scene, VocabWord } from '../types/story';
import { soundManager } from '../utils/soundEffects';

export interface ActiveDefinitionItem {
  word: string;
  baseWord: string;
  partOfSpeech: string;
  definition: string;
  contextSentence: string;
  visualClue: string;
  source: 'word' | 'illustration';
}

interface DefinitionModalProps {
  item: ActiveDefinitionItem | null;
  scene: Scene;
  onSelectWord: (vocab: VocabWord) => void;
  onSelectIllustrationWord: () => void;
  onClose: () => void;
}

export const DefinitionModal: React.FC<DefinitionModalProps> = ({
  item,
  scene,
  onSelectWord,
  onSelectIllustrationWord,
  onClose,
}) => {
  if (!item) return null;

  const handleSpeak = () => {
    soundManager.speakWord(`${item.word}. ${item.definition}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/55 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vocab-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-xl transition-transform duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{item.source === 'illustration' ? 'Picture Vocabulary Clue' : 'Underlined Story Word'}</span>
              <span aria-hidden="true">·</span>
              <span>{item.partOfSpeech}</span>
              {item.baseWord.toLowerCase() !== item.word.toLowerCase() && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Root: {item.baseWord}</span>
                </>
              )}
            </div>
            <h3
              id="vocab-modal-title"
              className="mt-1 font-serif-display text-2xl sm:text-3xl font-bold text-slate-900"
            >
              {item.word}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSpeak}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer"
              aria-label={`Listen to pronunciation of ${item.word}`}
            >
              <Volume2 className="h-4 w-4 text-amber-600" />
              <span>Listen</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              aria-label="Close definition box"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main Definition */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-xs font-semibold text-slate-500">
            Meaning
          </p>
          <p className="mt-1 text-base sm:text-lg font-medium text-slate-900 leading-relaxed">
            {item.definition}
          </p>
        </div>

        {/* Example Sentence in Context */}
        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500">
            In a Sentence
          </p>
          <p className="mt-1 text-sm sm:text-base text-slate-700 leading-relaxed">
            &ldquo;{item.contextSentence}&rdquo;
          </p>
          {item.visualClue && (
            <p className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
              Scene clue: {item.visualClue}
            </p>
          )}
        </div>

        {/* Switcher for all words in this scene */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-500 mb-2">
            Other words in {scene.title}:
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onSelectIllustrationWord}
              className={`min-h-[40px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                item.word.toLowerCase() === scene.sceneVisual.focusWord.toLowerCase()
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Picture: {scene.sceneVisual.focusWord}
            </button>
            {scene.vocabWords.map((vw) => {
              const isCurrent = item.word.toLowerCase() === vw.word.toLowerCase();
              return (
                <button
                  key={vw.word}
                  type="button"
                  onClick={() => onSelectWord(vw)}
                  className={`min-h-[40px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isCurrent
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {vw.word}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[46px] rounded-xl bg-slate-900 py-2.5 px-4 text-sm font-semibold text-white hover:bg-slate-800 active:scale-[0.99] transition-all cursor-pointer"
          >
            Back to Story
          </button>
        </div>
      </div>
    </div>
  );
};
