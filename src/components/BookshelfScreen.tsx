import React, { useState } from 'react';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import { Story } from '../types/story';
import { soundManager } from '../utils/soundEffects';

interface BookshelfScreenProps {
  stories: Story[];
  selectedStoryId: string | null;
  completedStoryIds: string[];
  storyProgressMap: Record<string, number>;
  onSelectStory: (storyId: string) => void;
  onStartStory: (story: Story) => void;
}

export const BookshelfScreen: React.FC<BookshelfScreenProps> = ({
  stories,
  selectedStoryId,
  completedStoryIds,
  storyProgressMap,
  onSelectStory,
  onStartStory,
}) => {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const selectedStory = stories.find((s) => s.id === selectedStoryId) || null;

  const handleBookClick = (storyId: string) => {
    soundManager.playBookPull();
    onSelectStory(storyId);
  };

  // Split 5 books across two realistic wooden shelf tiers (3 on top shelf, 2 on bottom shelf, or 5 across on wide desktop)
  const topShelfStories = stories.slice(0, 3);
  const bottomShelfStories = stories.slice(3, 5);

  const renderShelfBook = (story: Story, index: number) => {
    const isPulledOut = selectedStoryId === story.id;
    const isCompleted = completedStoryIds.includes(story.id);
    const savedScene = storyProgressMap[story.id] || 0;

    return (
      <button
        key={story.id}
        type="button"
        onClick={() => handleBookClick(story.id)}
        aria-pressed={isPulledOut}
        className={`group relative flex flex-col justify-between rounded-t-xl rounded-b-sm border-2 text-left transition-all duration-200 cursor-pointer select-none min-h-[190px] sm:min-h-[220px] p-3 sm:p-4 ${
          story.spineBg
        } ${story.spineBorder} ${story.spineText} ${
          isPulledOut
            ? '-translate-y-5 sm:-translate-y-6 scale-[1.04] shadow-2xl ring-3 ring-amber-400 z-20'
            : 'translate-y-0 hover:-translate-y-2 shadow-md opacity-95 hover:opacity-100 z-10'
        }`}
      >
        {/* Top bookbinding foil trim */}
        <div className="w-full border-b border-amber-300/35 pb-2 flex items-center justify-between gap-1">
          <span className="font-mono text-[11px] text-amber-200/90 tabular-nums">
            0{index + 1}
          </span>
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Done
            </span>
          ) : isPulledOut ? (
            <span className="text-[11px] font-semibold text-amber-300">
              Pulled Out
            </span>
          ) : (
            <span className="text-[11px] text-white/65">
              15 Scenes
            </span>
          )}
        </div>

        {/* Miniature Cover Artwork Window on the Book */}
        <div className="my-2 relative h-20 sm:h-24 w-full overflow-hidden rounded-md border border-white/20 bg-black/30">
          {!imgErrors[story.id] ? (
            <img
              src={story.coverImage}
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

        {/* Book Spine / Front Title & Author */}
        <div className="mt-auto">
          <h3 className="font-serif-display text-sm sm:text-base font-bold leading-snug text-white line-clamp-2">
            {story.title}
          </h3>
          <p className="mt-1 text-[11px] text-white/75 truncate">
            {story.author}
          </p>
          {savedScene > 0 && !isCompleted && (
            <p className="mt-1 font-mono text-[10px] text-amber-300 tabular-nums">
              Progress {savedScene}/15
            </p>
          )}
        </div>

        {/* Bottom bookbinding gold bar */}
        <div className="mt-2 h-1 w-full rounded-full bg-amber-300/35" />
      </button>
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-5 pb-28">
      {/* Intro Heading */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Grades 5–6 Reading &amp; Vocabulary Self-Quiz · CEFR A1+ to A2 · 15 Scenes per Book
          </p>
          <h1
            className="mt-1 font-serif-display text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight"
            style={{ textWrap: 'balance' }}
          >
            Choose a Book from the Shelf
          </h1>
        </div>
        <p className="text-sm text-slate-600 max-w-md">
          Tap any book to pull it off the shelf. Read each short scene and choose the best sentence to finish the paragraph.
        </p>
      </div>

      {/* Two-Column Responsive Layout on Desktop: Left = Wooden Bookshelf, Right = Pulled-Out Book Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Realistic Wooden Bookshelf */}
        <div className="lg:col-span-7 rounded-2xl border-4 border-[#5C3A21] bg-[#3E2412] p-4 sm:p-6 shadow-xl">
          <div className="mb-3 flex items-center justify-between text-xs text-amber-100/80 px-1">
            <span className="font-semibold tracking-wide">
              Classroom Library Bookshelf
            </span>
            <span>
              {selectedStory
                ? `"${selectedStory.title}" pulled from shelf`
                : 'Tap a book to pull it out'}
            </span>
          </div>

          {/* Top Shelf Tier (3 Books) */}
          <div className="relative pt-6 px-2 sm:px-4 bg-gradient-to-b from-[#2A170B] to-[#3B2211] rounded-t-lg">
            <div className="grid grid-cols-3 gap-3 sm:gap-5 items-end">
              {topShelfStories.map((story, idx) => renderShelfBook(story, idx))}
            </div>
          </div>
          {/* Solid Timber Shelf Plank 1 */}
          <div className="h-5 w-full rounded-sm bg-gradient-to-b from-[#8B5A2B] via-[#6E4720] to-[#4A2E12] border-t border-amber-300/25 shadow-md mb-4" />

          {/* Bottom Shelf Tier (2 Books + Wooden Bookend) */}
          <div className="relative pt-6 px-2 sm:px-4 bg-gradient-to-b from-[#2A170B] to-[#3B2211]">
            <div className="grid grid-cols-3 gap-3 sm:gap-5 items-end">
              {bottomShelfStories.map((story, idx) =>
                renderShelfBook(story, idx + 3)
              )}
              {/* Decorative Library Reading Plaque on the 3rd slot */}
              <div className="flex flex-col justify-center items-center text-center rounded-t-lg border border-amber-200/15 bg-[#241309]/80 p-3 min-h-[170px] sm:min-h-[190px] text-amber-100/75">
                <BookOpen className="h-7 w-7 text-amber-300/80 mb-2" />
                <p className="font-serif-display text-xs sm:text-sm font-semibold text-amber-100">
                  Tip for Readers
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-amber-100/70">
                  Tap any picture or underlined word while reading for an instant definition!
                </p>
              </div>
            </div>
          </div>
          {/* Solid Timber Shelf Plank 2 */}
          <div className="h-5 w-full rounded-sm bg-gradient-to-b from-[#8B5A2B] via-[#6E4720] to-[#4A2E12] border-t border-amber-300/25 shadow-md" />
        </div>

        {/* Pulled-Out Book Inspection Card */}
        <div className="lg:col-span-5">
          {selectedStory ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-amber-700">Pulled from Shelf</span>
                <span aria-hidden="true">·</span>
                <span>{selectedStory.author}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedStory.cefrLevel}</span>
              </div>

              <h2 className="mt-1.5 font-serif-display text-2xl sm:text-3xl font-bold text-slate-900">
                {selectedStory.title}
              </h2>
              <p className="text-sm font-medium text-slate-600">
                {selectedStory.subtitle}
              </p>

              {/* Cover Illustration */}
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-900 aspect-[4/3]">
                {!imgErrors[selectedStory.id] ? (
                  <img
                    src={selectedStory.coverImage}
                    alt={`Cover illustration for ${selectedStory.title}`}
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
                  <div className="flex h-full w-full items-center justify-center bg-slate-800 text-white">
                    <BookOpen className="h-10 w-10 text-amber-300" />
                  </div>
                )}
              </div>

              {/* Clean Unboxed Metadata */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>{selectedStory.scenes.length} Interactive Scenes</span>
                <span aria-hidden="true">·</span>
                <span>{selectedStory.estimatedMinutes} min walkthrough</span>
                <span aria-hidden="true">·</span>
                <span>{selectedStory.gradeRange}</span>
              </div>

              <p className="mt-3 text-sm sm:text-base text-slate-700 leading-relaxed">
                {selectedStory.synopsis}
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Text-only sentence choices</span>
                <span aria-hidden="true">·</span>
                <span>Tap words &amp; pictures for definitions</span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-slate-400" />
              <h2 className="mt-3 font-serif-display text-xl font-semibold text-slate-900">
                Select a Story from the Bookshelf
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Tap any of the 5 classic books on the wooden bookshelf to pull it out and begin your walkthrough.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Large Centered [Start] Button at the bottom of the screen after selecting a story */}
      {selectedStory && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200/80 bg-white/95 backdrop-blur-md py-3 px-4">
          <div className="mx-auto max-w-md flex flex-col items-center">
            <button
              type="button"
              onClick={() => onStartStory(selectedStory)}
              className="w-full min-h-[52px] rounded-xl bg-slate-900 px-8 py-3 text-base font-bold text-white shadow-lg hover:bg-slate-800 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
            >
              Start — {selectedStory.title}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
