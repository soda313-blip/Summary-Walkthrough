export type SkillCategory =
  | 'Character & Emotion'
  | 'Cause & Effect'
  | 'Setting & Clues'
  | 'Plot & Action';

export interface VocabWord {
  word: string; // Exact surface word in the paragraph (e.g., "neglected")
  baseWord: string; // Dictionary headword (e.g., "neglect")
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase';
  definition: string; // Simple CEFR A1+/A2 friendly definition
  contextSentence: string; // Easy-to-understand example sentence
  visualClue: string; // How to spot or picture this in the scene
}

export interface SceneVisualMeta {
  caption: string; // Short caption of what is shown in this scene's illustration
  focusWord: string; // Key vocabulary item highlighted when tapping the illustration
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase';
  focusDefinition: string; // Instant definition shown when tapping the scene image
  focusContext: string; // Context sentence connecting the image to the paragraph
  motif:
    | 'key'
    | 'robin'
    | 'door'
    | 'sprout'
    | 'wheelchair'
    | 'bloom'
    | 'map'
    | 'spyglass'
    | 'ship'
    | 'barrel'
    | 'island'
    | 'compass'
    | 'watch'
    | 'potion'
    | 'teacup'
    | 'roses'
    | 'crown'
    | 'cards'
    | 'clock'
    | 'train'
    | 'elephant'
    | 'steamer'
    | 'balloon'
    | 'trophy'
    | 'wolf'
    | 'panther'
    | 'bear'
    | 'monkey'
    | 'fire'
    | 'river';
}

export interface Scene {
  id: number; // 1..15
  title: string;
  skillTag: SkillCategory;
  sceneVisual: SceneVisualMeta;
  paragraph: string; // Paragraph leading up to the blank concluding sentence
  vocabWords: VocabWord[];
  choices: [string, string, string]; // 3 text-only sentence choices
  correctIndex: 0 | 1 | 2;
  hint: string; // Helpful hint shown on red flash if student picks wrong sentence
  explanation: string; // Confirmation shown on green flash when student picks right sentence
}

export interface DiscussionPromptOption {
  id: string;
  focusCategory: SkillCategory | 'Overall Mastery';
  triggerType: 'strength' | 'growth' | 'overall';
  performanceSummary: string;
  question: string;
  thinkingStarters: string[];
}

export interface Story {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  cefrLevel: string;
  gradeRange: string;
  estimatedMinutes: number;
  coverImage: string;
  spineBg: string;
  spineBorder: string;
  spineText: string;
  accentHex: string;
  synopsis: string;
  scenes: Scene[];
  discussionPrompts: DiscussionPromptOption[];
}

export interface SceneAttemptRecord {
  sceneId: number;
  skillTag: SkillCategory;
  attemptsCount: number;
  firstTryCorrect: boolean;
  completed: boolean;
}
