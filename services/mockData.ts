
import { TestHistoryEntry, User, TestInputMethod, QuestionStatus, Question, TimeSettings, NegativeMarkingSettings } from '../types';

// Helper to create a user
const createUser = (id: string, name: string, email: string): User => ({
  name,
  email,
  initials: name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase(),
});

// Mock users
export const mockUsers: User[] = [
  createUser('user-1', 'Alex Ryder', 'alex.r@example.com'),
  createUser('user-2', 'Bethany Shaw', 'beth.s@example.com'),
  createUser('user-3', 'Carlos Diaz', 'carlos.d@example.com'),
  createUser('user-4', 'Diana Prince', 'diana.p@example.com'),
  createUser('user-5', 'Ethan Hunt', 'ethan.h@example.com'),
  createUser('user-6', 'Fiona Glenanne', 'fiona.g@example.com'),
  createUser('user-7', 'Gus Fring', 'gus.f@example.com'),
  createUser('user-8', 'Haley Smith', 'haley.s@example.com'),
  createUser('user-9', 'Iris West', 'iris.w@example.com'),
  createUser('user-10', 'Jack Sparrow', 'jack.s@example.com'),
  createUser('user-11', 'Kara Danvers', 'kara.d@example.com'),
  createUser('user-12', 'Luke Skywalker', 'luke.s@example.com'),
  createUser('user-13', 'Mia Smoak', 'mia.s@example.com'),
  createUser('user-14', 'Nora Allen', 'nora.a@example.com'),
  createUser('user-15', 'Oliver Queen', 'oliver.q@example.com'),
  createUser('user-16', 'Peter Parker', 'peter.p@example.com'),
  createUser('user-17', 'Quinn Fabray', 'quinn.f@example.com'),
  createUser('user-18', 'Rachel Green', 'rachel.g@example.com'),
  createUser('user-19', 'Steve Rogers', 'steve.r@example.com'),
  createUser('user-20', 'Tony Stark', 'tony.s@example.com'),
  createUser('user-21', 'User TwentyOne', 'u21@example.com'),
];

// Helper to generate random number in range
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to create a single question
const createQuestion = (isCorrect: boolean): Question => {
  const correctAnswerIndex = rand(0, 3);
  const userAnswerIndex = isCorrect ? correctAnswerIndex : (correctAnswerIndex + 1) % 4;
  return {
    id: `q-${Math.random()}`,
    questionText: 'Mock question text',
    options: ['A', 'B', 'C', 'D'],
    correctAnswerIndex,
    userAnswerIndex,
    status: QuestionStatus.ATTEMPTED,
  };
};

// Helper to generate a single test history entry
const createHistoryEntry = (testIndex: number, userIndex: number): TestHistoryEntry => {
  const totalQuestions = rand(10, 50);
  const correctAnswers = rand(Math.floor(totalQuestions * 0.4), Math.floor(totalQuestions * 0.95)); // score between 40% and 95%
  const incorrectAnswers = totalQuestions - correctAnswers;

  const questions: Question[] = [
    ...Array.from({ length: correctAnswers }, () => createQuestion(true)),
    ...Array.from({ length: incorrectAnswers }, () => createQuestion(false)),
  ];

  return {
    id: `hist-${userIndex}-${testIndex}-${Math.random()}`,
    testName: `Mock Test ${testIndex + 1}`,
    dateCompleted: Date.now() - rand(1, 30) * 24 * 60 * 60 * 1000, // within last 30 days
    scorePercentage: (correctAnswers / totalQuestions) * 100,
    totalQuestions,
    correctAnswers,
    attemptedQuestions: totalQuestions, // assume all attempted for simplicity
    negativeMarkingSettings: { enabled: false, marksPerQuestion: 0 },
    originalConfig: {
      inputMethod: TestInputMethod.TOPIC,
      content: 'Mock Topic',
      numQuestions: totalQuestions,
      timeSettings: { type: 'untimed' } as TimeSettings,
      negativeMarking: { enabled: false, marksPerQuestion: 0 } as NegativeMarkingSettings,
      testName: `Mock Test ${testIndex + 1}`,
    },
    questions,
  };
};

// Generate history for all mock users
export const mockUserHistories: Record<string, TestHistoryEntry[]> = mockUsers.reduce((acc, user, index) => {
  const numTests = rand(2, 25); // each user has taken between 2 and 25 tests
  acc[user.email] = Array.from({ length: numTests }, (_, i) => createHistoryEntry(i, index));
  return acc;
}, {} as Record<string, TestHistoryEntry[]>);
