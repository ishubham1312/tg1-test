// This file is deprecated - functionality moved to DatabaseService
// Keeping for backward compatibility during migration

import { SavedTestState } from '../types';

export function getSavedTests(): SavedTestState[] {
  console.warn('getSavedTests is deprecated. Use DatabaseService.getSavedTests instead.');
  return [];
}

export function addSavedTest(test: SavedTestState) {
  console.warn('addSavedTest is deprecated. Use DatabaseService.saveSavedTest instead.');
}

export function removeSavedTest(id: string) {
  console.warn('removeSavedTest is deprecated. Use DatabaseService.deleteSavedTest instead.');
}

export function clearSavedTests() {
  console.warn('clearSavedTests is deprecated.');
}

export function findSavedTestById(id: string): SavedTestState | undefined {
  console.warn('findSavedTestById is deprecated.');
  return undefined;
}

export function updateSavedTest(updated: SavedTestState) {
  console.warn('updateSavedTest is deprecated.');
}