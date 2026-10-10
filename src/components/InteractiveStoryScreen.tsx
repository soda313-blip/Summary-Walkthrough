import React, { useState, useEffect } from 'react';
import { Volume2, Square, ArrowLeft } from 'lucide-react';
import { Scene, Story, VocabWord } from '../types/story';
import { StoryMode } from '../data/stories';
import { SceneIllustration } from './SceneIllustration';
import { ActiveDefinitionItem, DefinitionModal } from './DefinitionModal';
import { soundManager } from '../utils/soundEffects';

interface InteractiveStoryScreenProps {
  story: Story;
  sceneIndex: number;
  mode: StoryMode;
  onRecordSceneOutcome: (
    sceneId: number,
    attemptsCount: number,
    firstTryCorrect: boolean
  ) => void;
  onPreviousScene: () => void;
  onNextScene: () => void;
  onBackToShelf: () => void;
}

export const InteractiveStoryScreen: React.FC<InteractiveStoryScreenProps> = ({
  story,
  sceneIndex,
  mode,
  onRecordSceneOutcome,
  onPreviousScene,
  onNextScene,
  onBackToShelf,
}) => {
  const scene: Scene = story.scenes[sceneIndex];
  const totalScenes = story.scenes.length;

  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(
    null
  );
  const [wrongIndices, setWrongIndices] = useState<number[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [attemptsOnScene, setAttemptsOnScene] = useState<number>(0);
  const [flashKey, setFlashKey] = useState<number>(0);
  const [activeDefinition, setActiveDefinition] =
    useState<ActiveDefinitionItem | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Reset local state & stop speech when moving between scenes
  useEffect(() => {
    soundManager.stopSpeaking();
    setIsSpeaking(false);
    setSelectedChoiceIndex(null);
    setWrongIndices([]);
    setIsCorrect(false);
    setAttemptsOnScene(0);
    setFlashKey(0);
    setActiveDefinition(null);
    return () => {
      soundManager.stopSpeaking();
    };
  }, [scene.id, story.id, mode]);

  const handleToggleReadAloud = () => {
    if (isSpeaking) {
      soundManager.stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const endingText =
      mode === 'read' || isCorrect
        ? ` ${scene.choices[scene.correctIndex]}`
        : '';
    const fullTextToRead = `${scene.title}. ${scene.paragraph}${endingText}`;

    setIsSpeaking(true);
    soundManager.speakWord(fullTextToRead, () => {
      setIsSpeaking(false);
    });
  };

  const handleOpenWordDefinition = (vocab: VocabWord) => {
    setActiveDefinition({
      word: vocab.word,
      baseWord: vocab.baseWord,
      partOfSpeech: vocab.partOfSpeech,
      definition: vocab.definition,
      contextSentence: vocab.contextSentence,
      visualClue: vocab.visualClue,
      source: 'word',
    });
  };

  const handleOpenIllustrationDefinition = () => {
    setActiveDefinition({
      word: scene.sceneVisual.focusWord,
      baseWord: scene.sceneVisual.focusWord,
      partOfSpeech: scene.sceneVisual.partOfSpeech,
      definition: scene.sceneVisual.focusDefinition,
      contextSentence: scene.sceneVisual.focusContext,
      visualClue: scene.sceneVisual.caption,
      source: 'illustration',
    });
  };

  const handleSelectChoice = (index: number) => {
    if (isCorrect) return;

    const nextAttempts = attemptsOnScene + 1;
    setAttemptsOnScene(nextAttempts);
    setSelectedChoiceIndex(index);
    setFlashKey((prev) => prev + 1);

    if (index === scene.correctIndex) {
      soundManager.playCorrectChime();
      setIsCorrect(true);
      onRecordSceneOutcome(scene.id, nextAttempts, nextAttempts === 1);
    } else {
      soundManager.playIncorrectNudge();
      if (!wrongIndices.includes(index)) {
        setWrongIndices((prev) => [...prev, index]);
      }
    }
  };

  const handlePressNext = () => {
    if (mode === 'quiz' && !isCorrect) {
      onRecordSceneOutcome(scene.id, Math.max(attemptsOnScene, 1), false);
    }
    onNextScene();
  };

  const renderInteractiveParagraph = () => {
    const text = scene.paragraph;
    if (!scene.vocabWords || scene.vocabWords.length === 0) {
      return <span>{text}</span>;
    }

    const escapedWords = scene.vocabWords.map((vw) =>
      vw.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    const pattern = new RegExp(`(\\b(?:${escapedWords.join('|')})\\b)`, 'gi');
    const parts = text.split(pattern);

    return parts.map((part, idx) => {
      const matchedVocab = scene.vocabWords.find(
        (vw) => vw.word.toLowerCase() === part.toLowerCase()
      );
      if (matchedVocab) {
        return (
          <button
            key={`${part}-${idx}`}
            type="button"
            onClick={() => handleOpenWordDefinition(matchedVocab)}
            className="inline underline decoration-2 decoration-amber-600 underline-offset-4 font-semibold text-slate-900 hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-amber-600 rounded px-0.5 transition-colors cursor-pointer"
            title={`Tap to see definition of "${matchedVocab.word}"`}
          >
            {part}
          </button>
        );
      }
      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-4 pb-20">
      {/* Top Row: Progress Counter (Progress 1/10), Read Aloud, and Back Button */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onPreviousScene}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-800 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{sceneIndex === 0 ? 'Back to Shelf' : 'Back'}</span>
          </button>

          <span className="font-mono text-sm sm:text-base font-semibold text-slate-900 tabular-nums">
            Progress {sceneIndex + 1}/{totalScenes}
          </span>
        </div>

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
            onClick={onBackToShelf}
            className="min-h-[42px] px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Bookshelf
          </button>
        </div>
      </div>

      {/* Slim Progress Bar */}
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-amber-200/70">
        <div
          className="h-full bg-amber-800 transition-transform duration-300 origin-left"
          style={{
            transform: `scaleX(${(sceneIndex + 1) / totalScenes})`,
          }}
        />
      </div>

      {/* Main Story Card */}
      <div className="rounded-2xl border border-amber-200/80 bg-[#FFFDF9] p-4 sm:p-6 shadow-xs">
        {/* 1. Scene Illustration (Shown above the paragraph; tappable for definition) */}
        <SceneIllustration
          story={story}
          scene={scene}
          totalScenes={totalScenes}
          onTapIllustration={handleOpenIllustrationDefinition}
        />

        {/* 2. Story Paragraph */}
        <div className="mt-4 rounded-xl border border-amber-200/70 bg-[#FDF8EC] p-4 sm:p-5">
          <p className="text-base sm:text-lg leading-relaxed text-slate-900">
            {renderInteractiveParagraph()}{' '}
            {mode === 'read' ? (
              <span>{scene.choices[scene.correctIndex]}</span>
            ) : isCorrect ? (
              <span className="inline rounded-md bg-emerald-100/90 px-2 py-0.5 font-semibold text-emerald-950 underline decoration-emerald-600 decoration-2 underline-offset-4">
                {scene.choices[scene.correctIndex]}
              </span>
            ) : (
              <span className="inline-block rounded-md border border-dashed border-slate-400 bg-white px-3 py-0.5 text-sm font-semibold text-slate-500">
                [ Choose the ending sentence below ]
              </span>
            )}
          </p>
        </div>

        {/* 3A. Simply Read Mode Navigation Controls */}
        {mode === 'read' && (
          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onPreviousScene}
              className="min-h-[48px] rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
            >
              {sceneIndex === 0 ? 'Back to Shelf' : 'Back'}
            </button>

            <button
              type="button"
              onClick={handlePressNext}
              className="min-h-[48px] rounded-xl bg-slate-900 px-8 py-2.5 text-sm sm:text-base font-bold text-white shadow-xs hover:bg-slate-800 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
            >
              {sceneIndex + 1 === totalScenes ? 'Next (Finish Story)' : 'Next'}
            </button>
          </div>
        )}

        {/* 3B. Quiz Mode: Feedback Banner & 3 Text-Only Answer Options */}
        {mode === 'quiz' && (
          <>
            {selectedChoiceIndex !== null && (
              <div
                key={`feedback-${flashKey}`}
                role="status"
                aria-live="polite"
                className={`mt-4 rounded-xl border p-4 ${
                  isCorrect
                    ? 'animate-flash-correct border-emerald-300 bg-emerald-50 text-emerald-950'
                    : 'animate-flash-incorrect border-rose-300 bg-rose-50 text-rose-950'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-bold">
                      {isCorrect ? 'Correct!' : 'Not quite — Hint:'}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed">
                      {isCorrect ? scene.explanation : scene.hint}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={onPreviousScene}
                      className="min-h-[46px] px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-800 hover:bg-slate-50 transition-all whitespace-nowrap cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handlePressNext}
                      className={`min-h-[46px] px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-xs transition-all active:scale-[0.98] whitespace-nowrap cursor-pointer ${
                        isCorrect
                          ? 'bg-emerald-700 hover:bg-emerald-800'
                          : 'bg-slate-900 hover:bg-slate-800'
                      }`}
                    >
                      {sceneIndex + 1 === totalScenes
                        ? 'Next (Finish Story)'
                        : 'Next'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5">
              <div className="flex flex-col gap-3">
                {scene.choices.map((choiceText, idx) => {
                  const isThisSelected = selectedChoiceIndex === idx;
                  const isThisWrong = wrongIndices.includes(idx);
                  const isThisRightAndFound =
                    isCorrect && idx === scene.correctIndex;

                  let buttonStyle =
                    'border-slate-200 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50';
                  let statePrefix = `${String.fromCharCode(65 + idx)}. `;

                  if (isThisRightAndFound) {
                    buttonStyle =
                      'animate-flash-correct border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-600/20 font-semibold';
                    statePrefix = `Correct (${String.fromCharCode(65 + idx)}): `;
                  } else if (isThisSelected && !isCorrect) {
                    buttonStyle =
                      'animate-flash-incorrect border-rose-500 bg-rose-50 text-rose-950 font-medium';
                    statePrefix = `Try Again (${String.fromCharCode(65 + idx)}): `;
                  } else if (isThisWrong) {
                    buttonStyle =
                      'border-rose-200 bg-rose-50/40 text-slate-500';
                    statePrefix = `Not quite (${String.fromCharCode(65 + idx)}): `;
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectChoice(idx)}
                      disabled={isCorrect}
                      className={`w-full min-h-[54px] rounded-xl border px-4 py-3.5 text-left text-sm sm:text-base leading-snug transition-all duration-150 active:scale-[0.99] cursor-pointer disabled:cursor-default ${buttonStyle}`}
                    >
                      <span className="font-mono text-xs font-semibold mr-1.5">
                        {statePrefix}
                      </span>
                      <span>{choiceText}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Instant Definition Pop-Up Modal */}
      <DefinitionModal
        item={activeDefinition}
        scene={scene}
        onSelectWord={handleOpenWordDefinition}
        onSelectIllustrationWord={handleOpenIllustrationDefinition}
        onClose={() => setActiveDefinition(null)}
      />
    </div>
  );
};
