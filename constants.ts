

import { LanguageOption } from "./types";

export const APP_NAME = "TestGenius";
export const GEMINI_TEXT_MODEL = "gemini-2.5-flash";
export const DEFAULT_NUM_QUESTIONS = 5;
export const MIN_QUESTIONS = 1;
export const MAX_QUESTIONS = 50; // Max questions to request from AI
export const MAX_FILE_SIZE_MB = 10; // Max file size for uploads in MB (adjusted for base64 encoding)
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const SUPPORTED_TEXT_TYPES = ['text/plain'];
export const SUPPORTED_PDF_MIME_TYPE = 'application/pdf';

export const NUM_QUESTIONS_AI_DECIDES = 0; // Signal for AI to determine the number of questions
export const AUTO_SUGGESTED_MIN_QUESTIONS_PDF = 5; // Suggested min for AI if it decides for PDF
export const AUTO_SUGGESTED_MAX_QUESTIONS_PDF = 15; // Suggested max for AI if it decides for PDF

export const DEFAULT_LANGUAGE_OPTION = LanguageOption.ENGLISH;
export const DEFAULT_TIME_PER_QUESTION_SECONDS = 90; // 1.5 minutes

export const DEFAULT_NEGATIVE_MARKS = 0.25;
export const MIN_NEGATIVE_MARKS = 0.01;

export const LOCAL_STORAGE_HISTORY_KEY = 'testGeniusHistory';
export const LOCAL_STORAGE_IN_PROGRESS_KEY = 'testGeniusInProgressTest';
export const LOCAL_STORAGE_SAVED_TESTS_KEY = 'testGeniusSavedTests';