import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, Volume2, Square } from 'lucide-react';
import { Story } from '../types/story';
import { StoryMode } from '../data/stories';
import { resolveArtworkUrl } from '../data/embeddedArtwork';
import { soundManager } from '../utils/soundEffects';

interface BookshelfScreenProps {
  stories: Story[];
  selectedStoryId: string | null;
  selectedMode: StoryMode;
  completedStoryIds: string[];
  storyProgressMap: Record<string, number>;
  onSelectStory: (storyId: string) => void;
  onSelectMode: (mode: StoryMode) => void;
  onStartStory: (story: Story, mode: StoryMode) => void;
}

export const BookshelfScreen: React.FC<BookshelfScreenProps> = ({
  stories,
  selectedStoryId,
  selectedMode,
  completedStoryIds,
  storyProgressMap,
  onSelectStory,
  onSelectMode,
  onStartStory,
}) => {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [isSpeaking, setIsSpeaking] = useState(false);

  const selectedStory =
    stories.find((s) => s.id === selectedStoryId) || stories[0];

  useEffect(() => {
    soundManager.stopSpeaking();
    setIsSpeaking(false);
    return () => {
      soundManager.stopSpeaking();
    };
  }, [selectedStoryId]);

  const handleBookClick = (storyId: string) => {
    soundManager.playBookPull();
    onSelectStory(storyId);
  };

  const handleReadAloud = () => {
    if (!selectedStory) return;
    if (isSpeaking) {
      soundManager.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      soundManager.speakWord(
        `${selectedStory.title}. ${selectedStory.synopsis}`,
        () => setIsSpeaking(false)
      );
    }
  };

  const topShelfStories = stories.slice(0, 3);
  const bottomShelfStories = stories.slice(3, 5);

  const renderShelfBook = (story: Story) => {
    const isPulledOut = selectedStory?.id === story.id;
    const isCompleted = completedStoryIds.includes(story.id);
    const savedScene = storyProgressMap[story.id] || 0;

    return (
      <button
        key={story.id}
        type="button"
        onClick={() => handleBookClick(story.id)}
        aria-pressed={isPulledOut}
        className={`group relative flex flex-col justify-between rounded-t-xl rounded-b-sm border-2 text-left transition-all duration-200 cursor-pointer select-none min-h-[175px] sm:min-h-[200px] p-3 ${
          story.spineBg
        } ${story.spineBorder} ${story.spineText} ${
          isPulledOut
            ? '-translate-y-5 scale-[1.04] shadow-2xl ring-3 ring-amber-400 z-20'
            : 'translate-y-0 hover:-translate-y-2 shadow-md opacity-95 hover:opacity-100 z-10'
        }`}
      >
        {isCompleted && (
          <div className="mb-1 flex items-center justify-end">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
          </div>
        )}

        <div className="my-1 relative h-20 sm:h-24 w-full overflow-hidden rounded-md border border-white/20 bg-black/30">
          {!imgErrors[story.id] ? (
            <img
              src={resolveArtworkUrl(story.coverImage)}
              alt={story.title}
              referrerPolicy="no-referrer"
              onError={() =>
                setImgErrors((prev) => ({ ...prev, [story.id]: true }))
              }
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-800">
              <BookOpen className="h-6 w-6 text-amber-200" />
            </div>
          )}
        </div>

        <div className="mt-auto pt-1">
          <h3 className="font-serif-display text-sm sm:text-base font-bold leading-snug text-white line-clamp-2">
            {story.title}
          </h3>
          {savedScene > 0 && !isCompleted && (
            <p className="mt-1 font-mono text-[10px] text-amber-300 tabular-nums">
              {savedScene}/10
            </p>
          )}
        </div>

        <div className="mt-2 h-1 w-full rounded-full bg-amber-300/35" />
      </button>
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-5 pb-32">
      {/* Clean Single Heading + Read Aloud */}
      <div className="mb-5 flex items-center justify-between gap-4">
        <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-slate-900">
          Choose a Book
        </h1>
        <button
          type="button"
          onClick={handleReadAloud}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-800 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap shrink-0"
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
      </div>

      {/* Main Layout: Left = Wooden Bookshelf, Right = Selected Book Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Wooden Bookshelf */}
        <div className="lg:col-span-7 rounded-2xl border-4 border-[#5C3A21] bg-[#3E2412] p-4 sm:p-6 shadow-xl">
          {/* Top Shelf Tier (3 Books) */}
          <div className="relative pt-6 px-2 sm:px-4 bg-gradient-to-b from-[#2A170B] to-[#3B2211] rounded-t-lg">
            <div className="grid grid-cols-3 gap-3 sm:gap-5 items-end">
              {topShelfStories.map((story) => renderShelfBook(story))}
            </div>
          </div>
          <div className="h-5 w-full rounded-sm bg-gradient-to-b from-[#8B5A2B] via-[#6E4720] to-[#4A2E12] border-t border-amber-300/25 shadow-md mb-4" />

          {/* Bottom Shelf Tier (2 Books) */}
          <div className="relative pt-6 px-2 sm:px-4 bg-gradient-to-b from-[#2A170B] to-[#3B2211]">
            <div className="grid grid-cols-3 gap-3 sm:gap-5 items-end">
              {bottomShelfStories.map((story) => renderShelfBook(story))}
            </div>
          </div>
          <div className="h-5 w-full rounded-sm bg-gradient-to-b from-[#8B5A2B] via-[#6E4720] to-[#4A2E12] border-t border-amber-300/25 shadow-md" />
        </div>

        {/* Pulled-Out Book Card (Minimal & Clean) */}
        <div className="lg:col-span-5">
          {selectedStory && (
            <div className="rounded-2xl border border-amber-200/80 bg-[#FFFDF9] p-5 sm:p-6 shadow-xs">
              <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900">
                {selectedStory.title}
              </h2>

              <div className="mt-4 overflow-hidden rounded-xl border border-amber-200/70 bg-stone-900 aspect-[4/3]">
                {!imgErrors[selectedStory.id] ? (
                  <img
                    src={resolveArtworkUrl(selectedStory.coverImage)}
                    alt={selectedStory.title}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setImgErrors((prev) => ({
                        ...prev,
                        [selectedStory.id]: true,
                      }))
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-stone-800 text-white">
                    <BookOpen className="h-10 w-10 text-amber-300" />
                  </div>
                )}
              </div>

              <p className="mt-4 text-base text-stone-700 leading-relaxed">
                {selectedStory.synopsis}
              </p>

              {/* Mode Selector: Quiz Yourself or Simply Read */}
              <div className="mt-5 grid grid-cols-2 gap-2.5 p-1.5 bg-[#F5ECD9] rounded-xl">
                <button
                  type="button"
                  onClick={() => onSelectMode('quiz')}
                  className={`min-h-[44px] rounded-lg px-3 py-2 text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedMode === 'quiz'
                      ? 'bg-stone-900 text-amber-50 shadow-xs'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  Quiz Yourself
                </button>
                <button
                  type="button"
                  onClick={() => onSelectMode('read')}
                  className={`min-h-[44px] rounded-lg px-3 py-2 text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedMode === 'read'
                      ? 'bg-stone-900 text-amber-50 shadow-xs'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  Simply Read
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Centered Bottom [Start] Bar with Mode Option */}
      {selectedStory && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-amber-200/80 bg-[#FFFDF8]/95 backdrop-blur-md py-3 px-4">
          <div className="mx-auto max-w-md flex items-center gap-3">
            <button
              type="button"
              onClick={() => onStartStory(selectedStory, selectedMode)}
              className="w-full min-h-[52px] rounded-xl bg-stone-900 px-8 py-3 text-base font-bold text-amber-50 shadow-lg hover:bg-stone-800 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
            >
              Start ({selectedMode === 'quiz' ? 'Quiz Yourself' : 'Simply Read'})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
