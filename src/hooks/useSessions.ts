import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createSession } from '@/data/firestore/sessions';
import moment from 'moment';

interface CreateSessionData {
  sessionName: string;
  startDate: moment.Moment;
  endDate: moment.Moment;
  driveFolderId?: string;
}

interface SessionData {
  name: string;
  startDate: string;
  endDate: string;
  driveFolderId: string;
}

// Hook for creating a session
export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSessionData) => {
      try {
        const session: SessionData = {
          name: data.sessionName,
          startDate: data.startDate.toISOString(),
          endDate: data.endDate.toISOString(),
          driveFolderId: data.driveFolderId || 'test-folder-id',
        };

        console.log('Creating session with data:', session);
        const sessionId = await createSession(session);
        console.log('Session created with ID:', sessionId);
        return { sessionId, sessionName: data.sessionName };
      } catch (error) {
        console.error('Detailed error in mutationFn:', error);
        // Re-throw with more context
        throw new Error(
          `Failed to create session: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch sessions list if you have one
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      console.log('Session created successfully:', data.sessionId);
    },
    onError: (error) => {
      console.error('Error creating session:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
    },
  });
}

// Example: Hook for fetching sessions (if you need it later)
export function useSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      // Replace with your actual fetch function
      // const sessions = await fetchSessions();
      // return sessions;
      return [];
    },
    // Optional: configure stale time, cache time, etc.
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}