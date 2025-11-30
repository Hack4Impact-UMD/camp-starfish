import { setSection } from "@/data/firestore/sections";
import useNotifications from "@/features/notifications/useNotifications";
import { Section } from "@/types/sessionTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseCreateSectionVariables {
  sessionId: string;
  section: Section;
}

export default function useCreateSection() {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation({
    mutationFn: ({ sessionId, section }: UseCreateSectionVariables) => setSection(sessionId, section),
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', sessionId, 'sections'] });
    },
    onError: () => {
      notifications.error('Unable to create section. Please try again.');
    }
  });
}