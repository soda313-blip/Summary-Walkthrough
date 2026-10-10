import React from 'react';
import { Scene, Story } from '../types/story';

interface SceneIllustrationProps {
  story: Story;
  scene: Scene;
  totalScenes: number;
  onTapIllustration: () => void;
}

type Quadrant = 'tl' | 'tr' | 'bl' | 'br' | 'full';

interface SceneArtworkConfig {
  src: string;
  quadrant: Quadrant;
}

const SCENE_ARTWORK_MAP: Record<string, SceneArtworkConfig> = {
  // =========================================================================
  // STORY 1: THE SECRET GARDEN (Scenes 1-10)
  // =========================================================================
  'secret-garden-1': {
    src: '/images/sg_scenes_1_to_4_1791605449548.jpg',
    quadrant: 'tl',
  },
  'secret-garden-2': {
    src: '/images/sg_scenes_1_to_4_1791605449548.jpg',
    quadrant: 'tr',
  },
  'secret-garden-3': {
    src: '/images/sg_scenes_1_to_4_1791605449548.jpg',
    quadrant: 'bl',
  },
  'secret-garden-4': {
    src: '/images/sg_scenes_1_to_4_1791605449548.jpg',
    quadrant: 'br',
  },
  'secret-garden-5': {
    src: '/images/sg_ti_extra_scenes_1791605755739.jpg',
    quadrant: 'tl',
  },
  'secret-garden-6': {
    src: '/images/sg_scenes_6_to_9_1791605463145.jpg',
    quadrant: 'tl',
  },
  'secret-garden-7': {
    src: '/images/sg_scenes_6_to_9_1791605463145.jpg',
    quadrant: 'tr',
  },
  'secret-garden-8': {
    src: '/images/sg_scenes_6_to_9_1791605463145.jpg',
    quadrant: 'bl',
  },
  'secret-garden-9': {
    src: '/images/sg_scenes_6_to_9_1791605463145.jpg',
    quadrant: 'br',
  },
  'secret-garden-10': {
    src: '/images/sg_ti_extra_scenes_1791605755739.jpg',
    quadrant: 'tr',
  },

  // =========================================================================
  // STORY 2: TREASURE ISLAND (Scenes 1-10)
  // =========================================================================
  'treasure-island-1': {
    src: '/images/ti_scenes_1_3_4_6_1791605484213.jpg',
    quadrant: 'tl',
  },
  'treasure-island-2': {
    src: '/images/sg_ti_extra_scenes_1791605755739.jpg',
    quadrant: 'bl',
  },
  'treasure-island-3': {
    src: '/images/ti_scenes_1_3_4_6_1791605484213.jpg',
    quadrant: 'tr',
  },
  'treasure-island-4': {
    src: '/images/ti_scenes_1_3_4_6_1791605484213.jpg',
    quadrant: 'bl',
  },
  'treasure-island-5': {
    src: '/images/sg_ti_extra_scenes_1791605755739.jpg',
    quadrant: 'br',
  },
  'treasure-island-6': {
    src: '/images/ti_scenes_1_3_4_6_1791605484213.jpg',
    quadrant: 'br',
  },
  'treasure-island-7': {
    src: '/images/ti_scenes_7_to_10_1791605500326.jpg',
    quadrant: 'tl',
  },
  'treasure-island-8': {
    src: '/images/ti_scenes_7_to_10_1791605500326.jpg',
    quadrant: 'tr',
  },
  'treasure-island-9': {
    src: '/images/ti_scenes_7_to_10_1791605500326.jpg',
    quadrant: 'bl',
  },
  'treasure-island-10': {
    src: '/images/ti_scenes_7_to_10_1791605500326.jpg',
    quadrant: 'br',
  },

  // =========================================================================
  // STORY 3: ALICE IN WONDERLAND (Scenes 1-10)
  // =========================================================================
  'alice-wonderland-1': {
    src: '/images/aw_scenes_1_to_4_1791605512045.jpg',
    quadrant: 'tl',
  },
  'alice-wonderland-2': {
    src: '/images/aw_scenes_1_to_4_1791605512045.jpg',
    quadrant: 'tr',
  },
  'alice-wonderland-3': {
    src: '/images/aw_scenes_1_to_4_1791605512045.jpg',
    quadrant: 'bl',
  },
  'alice-wonderland-4': {
    src: '/images/aw_scenes_1_to_4_1791605512045.jpg',
    quadrant: 'br',
  },
  'alice-wonderland-5': {
    src: '/images/aw_scenes_5_6_9_10_1791605523956.jpg',
    quadrant: 'tl',
  },
  'alice-wonderland-6': {
    src: '/images/aw_scenes_5_6_9_10_1791605523956.jpg',
    quadrant: 'tr',
  },
  'alice-wonderland-7': {
    src: '/images/aw_atw_extra_scenes_1791605769045.jpg',
    quadrant: 'tl',
  },
  'alice-wonderland-8': {
    src: '/images/aw_atw_extra_scenes_1791605769045.jpg',
    quadrant: 'tr',
  },
  'alice-wonderland-9': {
    src: '/images/aw_scenes_5_6_9_10_1791605523956.jpg',
    quadrant: 'bl',
  },
  'alice-wonderland-10': {
    src: '/images/aw_scenes_5_6_9_10_1791605523956.jpg',
    quadrant: 'br',
  },

  // =========================================================================
  // STORY 4: AROUND THE WORLD IN 80 DAYS (Scenes 1-10)
  // =========================================================================
  'around-world-1': {
    src: '/images/atw_scenes_1_to_4_1791605538862.jpg',
    quadrant: 'tl',
  },
  'around-world-2': {
    src: '/images/atw_scenes_1_to_4_1791605538862.jpg',
    quadrant: 'tr',
  },
  'around-world-3': {
    src: '/images/atw_scenes_1_to_4_1791605538862.jpg',
    quadrant: 'bl',
  },
  'around-world-4': {
    src: '/images/atw_scenes_1_to_4_1791605538862.jpg',
    quadrant: 'br',
  },
  'around-world-5': {
    src: '/images/atw_scenes_5_7_8_9_1791605550224.jpg',
    quadrant: 'tl',
  },
  'around-world-6': {
    src: '/images/aw_atw_extra_scenes_1791605769045.jpg',
    quadrant: 'bl',
  },
  'around-world-7': {
    src: '/images/atw_scenes_5_7_8_9_1791605550224.jpg',
    quadrant: 'tr',
  },
  'around-world-8': {
    src: '/images/atw_scenes_5_7_8_9_1791605550224.jpg',
    quadrant: 'bl',
  },
  'around-world-9': {
    src: '/images/jb_scenes_7_10_1791605854792.jpg',
    quadrant: 'br',
  },
  'around-world-10': {
    src: '/images/aw_atw_extra_scenes_1791605769045.jpg',
    quadrant: 'br',
  },

  // =========================================================================
  // STORY 5: THE JUNGLE BOOK (Scenes 1-10)
  // =========================================================================
  'jungle-book-1': {
    src: '/images/jb_scenes_1_to_4_1791605833571.jpg',
    quadrant: 'tl',
  },
  'jungle-book-2': {
    src: '/images/jb_scenes_1_to_4_1791605833571.jpg',
    quadrant: 'tr',
  },
  'jungle-book-3': {
    src: '/images/jb_scenes_1_to_4_1791605833571.jpg',
    quadrant: 'bl',
  },
  'jungle-book-4': {
    src: '/images/jb_scenes_1_to_4_1791605833571.jpg',
    quadrant: 'br',
  },
  'jungle-book-5': {
    src: '/images/jb_scenes_5_6_8_9_1791605893782.jpg',
    quadrant: 'tl',
  },
  'jungle-book-6': {
    src: '/images/jb_scenes_5_6_8_9_1791605893782.jpg',
    quadrant: 'tr',
  },
  'jungle-book-7': {
    src: '/images/jb_scenes_7_10_1791605854792.jpg',
    quadrant: 'tl',
  },
  'jungle-book-8': {
    src: '/images/jb_scenes_5_6_8_9_1791605893782.jpg',
    quadrant: 'bl',
  },
  'jungle-book-9': {
    src: '/images/jb_scenes_5_6_8_9_1791605893782.jpg',
    quadrant: 'br',
  },
  'jungle-book-10': {
    src: '/images/jb_scenes_7_10_1791605854792.jpg',
    quadrant: 'tr',
  },
};

const QUADRANT_POSITION_CLASSES: Record<Quadrant, string> = {
  tl: 'w-[208%] h-[208%] max-w-none -top-[2%] -left-[2%]',
  tr: 'w-[208%] h-[208%] max-w-none -top-[2%] -right-[2%]',
  bl: 'w-[208%] h-[208%] max-w-none -bottom-[2%] -left-[2%]',
  br: 'w-[208%] h-[208%] max-w-none -bottom-[2%] -right-[2%]',
  full: 'w-full h-full inset-0 object-cover',
};

export const SceneIllustration: React.FC<SceneIllustrationProps> = ({
  story,
  scene,
  onTapIllustration,
}) => {
  const sceneKey = `${story.id}-${scene.id}`;
  const artwork: SceneArtworkConfig = SCENE_ARTWORK_MAP[sceneKey] || {
    src: story.coverImage,
    quadrant: 'full',
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={onTapIllustration}
        aria-label={`Scene illustration: ${scene.sceneVisual.caption}. Tap to see definition for ${scene.sceneVisual.focusWord}`}
        className="group relative w-full overflow-hidden rounded-xl border-2 border-amber-300/90 bg-amber-950 text-left shadow-md transition-all hover:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-700"
      >
        {/* 16:9 Cartoon Storybook Scene Canvas */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-amber-100">
          <img
            src={artwork.src}
            alt={scene.sceneVisual.caption}
            referrerPolicy="no-referrer"
            className={`
              pointer-events-none absolute select-none transition-transform duration-300 group-hover:scale-[1.02]
              ${QUADRANT_POSITION_CLASSES[artwork.quadrant]}
            `}
          />
        </div>

        {/* Bottom Caption Bar with Tap-to-Define Prompt */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-amber-200 bg-[#FFFDF7] px-3.5 py-2.5">
          <p className="text-xs sm:text-sm font-medium text-amber-950 leading-snug">
            {scene.sceneVisual.caption}
          </p>
          <span className="shrink-0 rounded-md border border-amber-300 bg-amber-100/90 px-2.5 py-1 text-xs font-bold text-amber-950 group-hover:bg-amber-800 group-hover:text-white group-hover:border-amber-800 transition-colors">
            Tap picture: &ldquo;{scene.sceneVisual.focusWord}&rdquo;
          </span>
        </div>
      </button>
    </div>
  );
};
