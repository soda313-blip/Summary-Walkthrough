import {
  DiscussionPromptOption,
  SceneAttemptRecord,
  SkillCategory,
  Story,
} from '../types/story';
import { storySecretGarden } from './storySecretGarden';
import { storyTreasureIsland } from './storyTreasureIsland';
import { storyAliceWonderland } from './storyAliceWonderland';
import { storyAroundWorld } from './storyAroundWorld';
import { storyJungleBook } from './storyJungleBook';

export const STORIES: Story[] = [
  storySecretGarden,
  storyTreasureIsland,
  storyAliceWonderland,
  storyAroundWorld,
  storyJungleBook,
];

export type StoryMode = 'quiz' | 'read';

export interface PersonalizedReflectionResult {
  selectedPrompt: DiscussionPromptOption;
  firstTryScore: number;
  totalScenes: number;
  tailoredExplanation: string;
  strongestSkill: SkillCategory;
  focusSkill: SkillCategory | 'Overall Mastery';
  missedSceneTitles: string[];
  strongSceneTitles: string[];
}

export function generatePersonalizedReflection(
  story: Story,
  records: SceneAttemptRecord[],
  mode: StoryMode = 'quiz'
): PersonalizedReflectionResult {
  const totalScenes = story.scenes.length;
  const firstTryCorrectRecords = records.filter((r) => r.firstTryCorrect);
  const missedRecords = records.filter((r) => !r.firstTryCorrect);
  const firstTryScore = firstTryCorrectRecords.length;

  const categories: SkillCategory[] = [
    'Character & Emotion',
    'Cause & Effect',
    'Setting & Clues',
    'Plot & Action',
  ];

  const missesBySkill: Record<SkillCategory, number> = {
    'Character & Emotion': 0,
    'Cause & Effect': 0,
    'Setting & Clues': 0,
    'Plot & Action': 0,
  };

  const hitsBySkill: Record<SkillCategory, number> = {
    'Character & Emotion': 0,
    'Cause & Effect': 0,
    'Setting & Clues': 0,
    'Plot & Action': 0,
  };

  records.forEach((rec) => {
    if (rec.firstTryCorrect) {
      hitsBySkill[rec.skillTag] = (hitsBySkill[rec.skillTag] || 0) + 1;
    } else {
      missesBySkill[rec.skillTag] = (missesBySkill[rec.skillTag] || 0) + 1;
    }
  });

  let strongestSkill: SkillCategory = 'Character & Emotion';
  let maxHits = -1;
  categories.forEach((cat) => {
    if (hitsBySkill[cat] > maxHits) {
      maxHits = hitsBySkill[cat];
      strongestSkill = cat;
    }
  });

  let mostMissedSkill: SkillCategory | null = null;
  let maxMisses = 0;
  categories.forEach((cat) => {
    if (missesBySkill[cat] > maxMisses) {
      maxMisses = missesBySkill[cat];
      mostMissedSkill = cat;
    }
  });

  const missedSceneTitles = missedRecords
    .map(
      (r) =>
        story.scenes.find((s) => s.id === r.sceneId)?.title ||
        `Scene ${r.sceneId}`
    )
    .slice(0, 2);

  const strongSceneTitles = firstTryCorrectRecords
    .map(
      (r) =>
        story.scenes.find((s) => s.id === r.sceneId)?.title ||
        `Scene ${r.sceneId}`
    )
    .slice(0, 2);

  let selectedPrompt: DiscussionPromptOption | undefined;
  let focusSkill: SkillCategory | 'Overall Mastery' = 'Overall Mastery';

  if (mode === 'quiz' && mostMissedSkill && maxMisses >= 1 && firstTryScore <= 8) {
    focusSkill = mostMissedSkill;
    selectedPrompt =
      story.discussionPrompts.find((p) => p.focusCategory === mostMissedSkill) ||
      story.discussionPrompts[0];
  } else {
    focusSkill = 'Overall Mastery';
    selectedPrompt =
      story.discussionPrompts.find(
        (p) => p.focusCategory === 'Overall Mastery'
      ) || story.discussionPrompts[story.discussionPrompts.length - 1];
  }

  let tailoredExplanation = '';
  if (mode === 'read') {
    tailoredExplanation = `You read all ${totalScenes} scenes of ${story.title}! Now think about this question in your head.`;
  } else if (missedRecords.length === 0) {
    tailoredExplanation = `You got all ${totalScenes}/${totalScenes} scenes right on your first try! Here is a big-idea question to think about.`;
  } else {
    tailoredExplanation = `You got ${firstTryScore}/${totalScenes} scenes right on the first try and used a hint on ${missedSceneTitles.join(' and ')}. Here is a question to help you reflect on the story.`;
  }

  return {
    selectedPrompt,
    firstTryScore,
    totalScenes,
    tailoredExplanation,
    strongestSkill,
    focusSkill,
    missedSceneTitles,
    strongSceneTitles,
  };
}
