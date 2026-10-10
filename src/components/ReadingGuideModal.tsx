import React from 'react';
import { X } from 'lucide-react';

interface ReadingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReadingGuideModal: React.FC<ReadingGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reading-guide-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs text-slate-500">
              Student Self-Quiz Guide · Grades 5–6
            </p>
            <h2
              id="reading-guide-title"
              className="font-serif-display text-2xl font-bold text-slate-900"
            >
              How Summary Walkthrough Works
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            aria-label="Close reading guide"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-sm text-slate-700 leading-relaxed">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">
              01. Pull Any Book from the Shelf
            </p>
            <p className="mt-1">
              You can complete a walkthrough whether you have read the full book before or not! Tap a book on the wooden shelf to pull it out, then press Start.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">
              02. Tap Pictures &amp; Underlined Words
            </p>
            <p className="mt-1">
              In each of the 15 scenes, tap the scene picture or any underlined word in the paragraph to open an instant definition and listen to the word aloud.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">
              03. Choose the Best Ending Sentence &amp; Reflect
            </p>
            <p className="mt-1">
              Pick the text sentence that best completes the paragraph. At the end of Scene 15, think about the open discussion question in your head—no writing required!
            </p>
          </div>
        </div>

        <div className="mt-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[46px] rounded-xl bg-slate-900 py-2.5 px-4 text-sm font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};
