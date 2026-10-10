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
  records: SceneAttemptRecord[]
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

  // Count misses and hits per skill category
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

  // Identify strongest skill
  let strongestSkill: SkillCategory = 'Character & Emotion';
  let maxHits = -1;
  categories.forEach((cat) => {
    if (hitsBySkill[cat] > maxHits) {
      maxHits = hitsBySkill[cat];
      strongestSkill = cat;
    }
  });

  // Identify skill with the most hints used (if any)
  let mostMissedSkill: SkillCategory | null = null;
  let maxMisses = 0;
  categories.forEach((cat) => {
    if (missesBySkill[cat] > maxMisses) {
      maxMisses = missesBySkill[cat];
      mostMissedSkill = cat;
    }
  });

  const missedSceneTitles = missedRecords
    .map((r) => story.scenes.find((s) => s.id === r.sceneId)?.title || `Scene ${r.sceneId}`)
    .slice(0, 3);

  const strongSceneTitles = firstTryCorrectRecords
    .map((r) => story.scenes.find((s) => s.id === r.sceneId)?.title || `Scene ${r.sceneId}`)
    .slice(0, 3);

  // Choose the most appropriate DiscussionPromptOption
  let selectedPrompt: DiscussionPromptOption | undefined;
  let focusSkill: SkillCategory | 'Overall Mastery' = 'Overall Mastery';

  if (mostMissedSkill && maxMisses >= 1 && firstTryScore <= 13) {
    focusSkill = mostMissedSkill;
    selectedPrompt =
      story.discussionPrompts.find((p) => p.focusCategory === mostMissedSkill) ||
      story.discussionPrompts[0];
  } else {
    focusSkill = 'Overall Mastery';
    selectedPrompt =
      story.discussionPrompts.find((p) => p.focusCategory === 'Overall Mastery') ||
      story.discussionPrompts[story.discussionPrompts.length - 1];
  }

  // Build a clear, encouraging student-facing explanation of why this question was chosen
  let tailoredExplanation = '';
  if (missedRecords.length === 0) {
    tailoredExplanation = `You got all ${totalScenes}/${totalScenes} scenes right on your very first try—especially shining in ${strongestSkill}! Since you mastered every paragraph clue, here is a deeper Big-Idea question to think about.`;
  } else if (missedRecords.length <= 2) {
    tailoredExplanation = `You got ${firstTryScore}/${totalScenes} scenes right on the first try (doing great on ${strongSceneTitles[0] || 'key scenes'}) and used a helpful hint on ${missedSceneTitles.join(' and ')}. This question connects what you did right with ${focusSkill.toLowerCase()}.`;
  } else {
    tailoredExplanation = `You did a solid job working through ${strongSceneTitles[0] || 'the story'} (${firstTryScore}/${totalScenes} first-try matches) and took a second look at ${missedSceneTitles.slice(0, 2).join(' and ')}. This reflection question focuses on ${focusSkill} to help the story stick in your mind!`;
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
