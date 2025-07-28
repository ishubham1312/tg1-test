

export enum TestInputMethod {
  DOCUMENT = 'document', // For .txt and images (OCR)
  SYLLABUS = 'syllabus', // For pasted text or .txt syllabus
  TOPIC = 'topic',
}

export enum QuestionStatus {
  UNVISITED = 'unvisited',
  ATTEMPTED = 'attempted',
  SKIPPED = 'skipped', // Marked skipped by navigating away without answering
}

export interface Question {
  id: string;
  passageText?: string; // Optional: Text/HTML passage preceding the question
  questionText: string;
  // For MCQs
  options?: string[];
  correctAnswerIndex?: number; 
  userAnswerIndex?: number;
  // For TITA (Type-In-The-Answer)
  correctAnswerText?: string;
  userAnswerText?: string;
  // Common
  status: QuestionStatus;
  explanation?: string; 
  wasCorrectedByUser?: boolean; // New flag for user override
  isMarkedForReview?: boolean; // Flag for questions marked for review
}

export interface GeneratedQuestionPayload {
  passageText?: string; // Optional: Text/HTML passage preceding the question
  questionText: string;
  // For MCQs
  options?: string[];
  correctAnswerIndex?: number; // 0-3
  // For TITA
  correctAnswerText?: string;
}

export interface TimeFormat {
  questions: number;
  hours: number;
  minutes: number;
}

export type TimeSettings = 
  | { type: 'timed'; totalSeconds: number }
  | { type: 'untimed' };

export interface NegativeMarkingSettings {
  enabled: boolean;
  marksPerQuestion: number; // Only relevant if enabled is true
}

export enum TestPhase {
  HOME = 'home', 
  SETUP = 'setup',
  CONFIRMATION = 'confirmation', 
  GENERATING = 'generating',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REVIEW = 'review',
  HISTORY = 'history', // New phase for viewing test history
  VIEW_HISTORY_DETAILS = 'view_history_details',
  PROFILE = 'profile',
  AUTH = 'auth',
  LEADERBOARD = 'leaderboard',
}

export interface AnswerKeyEntry {
  questionIndex: number; // 0-based
  correctAnswerIndex: number; // 0-3
}

export enum LanguageOption {
  ENGLISH = 'English',
  HINDI = 'Hindi',
}

// Data structure for holding test settings before final generation or for history
export interface PendingTestConfig {
  inputMethod: TestInputMethod;
  content: string; // Actual text or base64 data (for document uploads if not text)
  numQuestions: number; // Number requested or signal for AI to decide
  timeSettings: TimeSettings;
  negativeMarking: NegativeMarkingSettings;
  mimeType?: string; // For file uploads
  originalFileName?: string; // For defaulting test name
  selectedLanguage?: LanguageOption; // For PDF processing
  difficultyLevel?: number; // For Syllabus/Topic, scale 1-5
  customInstructions?: string; // For Syllabus/Topic - user provided AI guidelines
  testName: string; // Editable test name
  titaEnabled?: boolean; // New: Enable/disable TITA questions
}

export interface TestHistoryEntry {
  id: string; // Unique ID for the history entry (e.g., timestamp)
  testName: string;
  dateCompleted: number; // Timestamp of when the test was completed
  scorePercentage: number;
  totalQuestions: number;
  correctAnswers: number;
  attemptedQuestions: number;
  negativeMarkingSettings: NegativeMarkingSettings;
  originalConfig: PendingTestConfig; // The full configuration used for this test, for "Retake"
  questions: Question[]; // The questions for this test run
  wasCorrectedByUser?: boolean; // Indicates if the score reflects user-corrected answers for this entry
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini' | 'system';
  text: string;
  isLoading?: boolean;
  error?: boolean;
}

export interface InProgressTestState {
  questions: Question[];
  currentQuestionIndex: number;
  timeRemainingSeconds: number;
  testDurationSeconds: number;
  currentSetupConfig: PendingTestConfig;
  currentTestSessionId: string;
  testPhase: typeof TestPhase.IN_PROGRESS;
}

export interface ViewTransition {
  ready: Promise<void>;
  // Other properties like 'finished' and 'updateCallbackDone' can be added if needed.
}


// --- NEWLY ADDED ---

export enum AuthPhase {
  SIGN_IN = 'sign_in',
  SIGN_UP = 'sign_up',
  RESET_PASSWORD = 'reset_password',
}

export enum ProfileTab {
  PROFILE = 'profile',
  TEST_HISTORY = 'test_history',
  ANSWER_KEY_CHECK = 'answer_key_check',
  FEEDBACK = 'feedback',
  SETTINGS = 'settings',
  KNOW_THE_APP = 'know_the_app',
  SAVED_TESTS = 'saved_tests', // New tab for saved tests
}

// Saved test state (for multiple saved tests)
export interface SavedTestState {
  id: string;
  questions: Question[];
  currentQuestionIndex: number;
  timeRemainingSeconds: number;
  testDurationSeconds: number;
  currentSetupConfig: PendingTestConfig;
  currentTestSessionId: string;
  savedAt: number; // timestamp
}

export interface User {
  name: string;
  email: string;
  initials: string;
}