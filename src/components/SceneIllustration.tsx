import React, { useState } from 'react';
import { Scene, Story } from '../types/story';

interface SceneIllustrationProps {
  story: Story;
  scene: Scene;
  totalScenes: number;
  onTapIllustration: () => void;
}

// Camera focal positions across 15 scenes so each scene frames a distinct part of the artwork
const SCENE_FOCAL_POSITIONS: string[] = [
  'center 50%',
  'left 35%',
  'right 40%',
  'center 25%',
  'left 65%',
  'center 55%',
  'right 60%',
  'center 40%',
  'left 45%',
  'right 30%',
  'center 70%',
  'left 25%',
  'right 55%',
  'center 35%',
  'center 50%',
];

export const SceneIllustration: React.FC<SceneIllustrationProps> = ({
  story,
  scene,
  onTapIllustration,
}) => {
  const [imgError, setImgError] = useState(false);
  const focalPos = SCENE_FOCAL_POSITIONS[(scene.id - 1) % SCENE_FOCAL_POSITIONS.length];

  const renderMotifSvg = (motif: Scene['sceneVisual']['motif']) => {
    switch (motif) {
      case 'key':
        return (
          <svg viewBox="0 0 48 48" className="w-8 h-8 text-amber-200" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="16" cy="24" r="8" />
            <path d="M24 24h18M36 24v6M42 24v8" strokeLinecap="round" />
          </svg>
        );
      case 'robin':
        return (
          <svg viewBox="0 0 48 48" className="w-8 h-8 text-amber-200" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 30c0-8 7-14 15-14 5 0 9 3 11 7l4 2-4 2c-1 6-6 10-13 10H12z" />
            <path d="M20 37v6M28 37v6" strokeLinecap="round" />
            <circle cx="30" cy="22" r="1.5" fill="currentColor" />
          </svg>
        );
      case 'sprout':
      case 'bloom':
      case 'roses':
        return (
          <svg viewBox="0 0 48 48" className="w-8 h-8 text-emerald-200" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M24 40V20" strokeLinecap="round" />
            <path d="M24 28c-8 0-12-6-12-12 8 0 12 6 12 12z" />
            <path d="M24 22c8 0 12-6 12-12-8 0-12 6-12 12z" />
          </svg>
        );
      case 'map':
      case 'island':
        return (
          <svg viewBox="0 0 48 48" className="w-8 h-8 text-amber-200" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M8 12l10-4 12 4 10-4v28l-10 4-12-4-10 4V12z" strokeLinejoin="round" />
            <path d="M22 20l6 6M28 20l-6 6" strokeLinecap="round" />
          </svg>
        );
      case 'ship':
      case 'steamer':
        return (
          <svg viewBox="0 0 48 48" className="w-8 h-8 text-sky-200" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M8 32h32l-4 8H12l-4-8z" strokeLinejoin="round" />
            <path d="M24 10v22M24 12l12 16H24" strokeLinejoin="round" />
          </svg>
        );
      case 'watch':
      case 'clock':
      case 'compass':
        return (
          <svg viewBox="0 0 48 48" className="w-8 h-8 text-amber-200" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="24" cy="26" r="14" />
            <path d="M24 18v8l5 4M20 8h8" strokeLinecap="round" />
          </svg>
        );
      case 'train':
        return (
          <svg viewBox="0 0 48 48" className="w-8 h-8 text-amber-200" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="8" y="16" width="32" height="16" rx="3" />
            <circle cx="16" cy="36" r="4" />
            <circle cx="32" cy="36" r="4" />
            <path d="M32 16V10h6" strokeLinecap="round" />
          </svg>
        );
      case 'fire':
        return (
          <svg viewBox="0 0 48 48" className="w-8 h-8 text-orange-200" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M24 8c6 8 12 13 12 21a12 12 0 01-24 0c0-8 6-13 12-21z" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 48 48" className="w-8 h-8 text-amber-200" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M10 12h28v24H10z" />
            <path d="M16 20h16M16 26h10" strokeLinecap="round" />
          </svg>
        );
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={onTapIllustration}
        className="group relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 text-left shadow-sm transition-transform duration-150 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 cursor-pointer"
        aria-label={`Scene illustration: ${scene.sceneVisual.caption}. Tap to open vocabulary definition for ${scene.sceneVisual.focusWord}.`}
      >
        <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-slate-800">
          {!imgError ? (
            <img
              src={story.coverImage}
              alt={scene.sceneVisual.caption}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              style={{
                objectPosition: focalPos,
                transform: `scale(${1.04 + ((scene.id % 4) * 0.03)})`,
              }}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-6 text-center text-white">
              {renderMotifSvg(scene.sceneVisual.motif)}
              <p className="mt-2 font-serif-display text-lg font-semibold">
                {scene.title}
              </p>
            </div>
          )}

          {/* Measured contrast scrim for 4.5:1 text legibility */}
          <div className=" inset-0 absolute bg-gradient-to-t from-black/85 via-black/35 to-black/15" />

          {/* Top-right interactive vocabulary hint affordance */}
          <div className="absolute top-3 right-3 flex items-center gap-2 rounded-lg bg-slate-950/75 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md border border-white/15">
            <span className="underline decoration-amber-400 decoration-2 underline-offset-2">
              Tap picture for word clue: &ldquo;{scene.sceneVisual.focusWord}&rdquo;
            </span>
          </div>

          {/* Bottom scene illustration caption & custom motif vignette */}
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-4 p-4 sm:p-5">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-amber-300/95">
                {scene.title}
              </p>
              <p className="mt-0.5 text-sm sm:text-base font-medium text-white leading-snug">
                {scene.sceneVisual.caption}
              </p>
            </div>
            <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
              {renderMotifSvg(scene.sceneVisual.motif)}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
};
