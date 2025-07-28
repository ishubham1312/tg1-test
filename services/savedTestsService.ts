import { LOCAL_STORAGE_SAVED_TESTS_KEY } from '../constants';
import { SavedTestState } from '../types';

export function getSavedTests(): SavedTestState[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_SAVED_TESTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addSavedTest(test: SavedTestState) {
  const tests = getSavedTests();
  tests.unshift(test); // Add to the start
  localStorage.setItem(LOCAL_STORAGE_SAVED_TESTS_KEY, JSON.stringify(tests));
}

export function removeSavedTest(id: string) {
  const tests = getSavedTests().filter(t => t.id !== id);
  localStorage.setItem(LOCAL_STORAGE_SAVED_TESTS_KEY, JSON.stringify(tests));
}

export function clearSavedTests() {
  localStorage.removeItem(LOCAL_STORAGE_SAVED_TESTS_KEY);
}

export function findSavedTestById(id: string): SavedTestState | undefined {
  return getSavedTests().find(t => t.id === id);
}

export function updateSavedTest(updated: SavedTestState) {
  const tests = getSavedTests().map(t => t.id === updated.id ? updated : t);
  localStorage.setItem(LOCAL_STORAGE_SAVED_TESTS_KEY, JSON.stringify(tests));
} 