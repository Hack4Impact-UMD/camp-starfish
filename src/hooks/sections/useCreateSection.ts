import { createSection } from "@/data/firestore/sections";
import useNotifications from "@/features/notifications/useNotifications";
import { Section } from "@/types/sessions/sessionTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseCreateSectionVariables {
  sessionId: string;
  section: Section;
}

export default function useCreateSection() {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation({
    mutationFn: ({ sessionId, section }: UseCreateSectionVariables) => createSection(sessionId, section),
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', sessionId, 'sections'] });
      notifications.success('Section created successfully!')
    },
    onError: () => {
      notifications.error('Unable to create section. Please try again.');
    }
  });
}