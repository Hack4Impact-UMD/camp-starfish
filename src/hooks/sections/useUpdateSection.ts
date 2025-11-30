import { updateSection } from "@/data/firestore/sections";
import useNotifications from "@/features/notifications/useNotifications";
import { Section } from "@/types/sessionTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseUpdateSectionVariables {
  sessionId: string;
  sectionId: string;
  updates: Partial<Section>; 
}

export default function useUpdateSection() {
  const queryClient = useQueryClient();
  const notifications = useNotifications();
  
  return useMutation({
    mutationFn: ({ sessionId, sectionId, updates }: UseUpdateSectionVariables) =>
      updateSection(sessionId, sectionId, updates),
    onSuccess: (_, { sectionId, sessionId }) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['sessions', sessionId, 'sections', sectionId] });
      notifications.success('Section updated successfully!')
    },
    onError: () => {
      notifications.error('Failed to update section. Please try again.');
    }
  });
}