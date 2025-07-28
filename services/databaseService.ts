import { supabase } from '../lib/supabase';
import { TestHistoryEntry, SavedTestState, PendingTestConfig, Question } from '../types';

export class DatabaseService {
  // Test History Methods
  static async getTestHistory(userId: string): Promise<TestHistoryEntry[]> {
    try {
      const { data, error } = await supabase
        .from('test_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching test history:', error);
        return [];
      }

      return data.map(session => ({
        id: session.id,
        testName: session.test_name,
        dateCompleted: new Date(session.completed_at).getTime(),
        scorePercentage: session.score_percentage,
        totalQuestions: session.total_questions,
        correctAnswers: session.correct_answers,
        attemptedQuestions: session.attempted_questions,
        negativeMarkingSettings: session.questions_data.negativeMarkingSettings || { enabled: false, marksPerQuestion: 0 },
        originalConfig: session.questions_data.originalConfig,
        questions: session.questions_data.questions || [],
        wasCorrectedByUser: session.was_corrected_by_user
      }));
    } catch (error) {
      console.error('Error in getTestHistory:', error);
      return [];
    }
  }

  static async saveTestSession(
    userId: string,
    testName: string,
    scorePercentage: number,
    totalQuestions: number,
    correctAnswers: number,
    attemptedQuestions: number,
    questions: Question[],
    originalConfig: PendingTestConfig,
    wasCorrectedByUser: boolean = false,
    sessionId?: string
  ): Promise<string | null> {
    try {
      const questionsData = {
        questions,
        originalConfig,
        negativeMarkingSettings: originalConfig.negativeMarking
      };

      if (sessionId) {
        // Update existing session
        const { error } = await supabase
          .from('test_sessions')
          .update({
            test_name: testName,
            score_percentage: scorePercentage,
            total_questions: totalQuestions,
            correct_answers: correctAnswers,
            attempted_questions: attemptedQuestions,
            questions_data: questionsData,
            was_corrected_by_user: wasCorrectedByUser,
            completed_at: new Date().toISOString()
          })
          .eq('id', sessionId)
          .eq('user_id', userId);

        if (error) {
          console.error('Error updating test session:', error);
          return null;
        }
        return sessionId;
      } else {
        // Create new session
        const { data, error } = await supabase
          .from('test_sessions')
          .insert({
            user_id: userId,
            test_name: testName,
            score_percentage: scorePercentage,
            total_questions: totalQuestions,
            correct_answers: correctAnswers,
            attempted_questions: attemptedQuestions,
            questions_data: questionsData,
            was_corrected_by_user: wasCorrectedByUser
          })
          .select('id')
          .single();

        if (error) {
          console.error('Error saving test session:', error);
          return null;
        }
        return data.id;
      }
    } catch (error) {
      console.error('Error in saveTestSession:', error);
      return null;
    }
  }

  static async deleteTestSession(userId: string, sessionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('test_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting test session:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error in deleteTestSession:', error);
      return false;
    }
  }

  static async clearTestHistory(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('test_sessions')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error clearing test history:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error in clearTestHistory:', error);
      return false;
    }
  }

  // Saved Tests Methods
  static async getSavedTests(userId: string): Promise<SavedTestState[]> {
    try {
      const { data, error } = await supabase
        .from('saved_tests')
        .select('*')
        .eq('user_id', userId)
        .order('saved_at', { ascending: false });

      if (error) {
        console.error('Error fetching saved tests:', error);
        return [];
      }

      return data.map(saved => ({
        id: saved.id,
        questions: saved.questions_data,
        currentQuestionIndex: saved.current_question_index,
        timeRemainingSeconds: saved.time_remaining_seconds,
        testDurationSeconds: saved.test_duration_seconds,
        currentSetupConfig: saved.config_data,
        currentTestSessionId: saved.session_id,
        savedAt: new Date(saved.saved_at).getTime()
      }));
    } catch (error) {
      console.error('Error in getSavedTests:', error);
      return [];
    }
  }

  static async saveSavedTest(userId: string, savedTest: SavedTestState): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('saved_tests')
        .insert({
          id: savedTest.id,
          user_id: userId,
          test_name: savedTest.currentSetupConfig.testName,
          questions_data: savedTest.questions,
          current_question_index: savedTest.currentQuestionIndex,
          time_remaining_seconds: savedTest.timeRemainingSeconds,
          test_duration_seconds: savedTest.testDurationSeconds,
          config_data: savedTest.currentSetupConfig,
          session_id: savedTest.currentTestSessionId
        });

      if (error) {
        console.error('Error saving test:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error in saveSavedTest:', error);
      return false;
    }
  }

  static async deleteSavedTest(userId: string, testId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('saved_tests')
        .delete()
        .eq('id', testId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting saved test:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error in deleteSavedTest:', error);
      return false;
    }
  }

  // Leaderboard Methods
  static async getLeaderboardData(): Promise<{
    users: Array<{ id: string; name: string; email: string; initials: string }>;
    histories: Record<string, TestHistoryEntry[]>;
  }> {
    try {
      // Get all users
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, name, email, initials');

      if (usersError) {
        console.error('Error fetching users:', usersError);
        return { users: [], histories: {} };
      }

      // Get all test sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('test_sessions')
        .select('*')
        .order('completed_at', { ascending: false });

      if (sessionsError) {
        console.error('Error fetching sessions:', sessionsError);
        return { users: users || [], histories: {} };
      }

      // Group sessions by user
      const histories: Record<string, TestHistoryEntry[]> = {};
      
      (sessions || []).forEach(session => {
        const user = users?.find(u => u.id === session.user_id);
        if (user) {
          if (!histories[user.email]) {
            histories[user.email] = [];
          }
          
          histories[user.email].push({
            id: session.id,
            testName: session.test_name,
            dateCompleted: new Date(session.completed_at).getTime(),
            scorePercentage: session.score_percentage,
            totalQuestions: session.total_questions,
            correctAnswers: session.correct_answers,
            attemptedQuestions: session.attempted_questions,
            negativeMarkingSettings: session.questions_data.negativeMarkingSettings || { enabled: false, marksPerQuestion: 0 },
            originalConfig: session.questions_data.originalConfig,
            questions: session.questions_data.questions || [],
            wasCorrectedByUser: session.was_corrected_by_user
          });
        }
      });

      return {
        users: users || [],
        histories
      };
    } catch (error) {
      console.error('Error in getLeaderboardData:', error);
      return { users: [], histories: {} };
    }
  }
}