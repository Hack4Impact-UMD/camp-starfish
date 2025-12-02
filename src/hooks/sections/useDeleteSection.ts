import { deleteSection } from "@/data/firestore/sections";
import useNotifications from "@/features/notifications/useNotifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseDeleteSectionVariables {
  sessionId: string;
  sectionId: string;
}

export default function useDeleteSection() {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation({
    mutationFn: ({ sessionId, sectionId }: UseDeleteSectionVariables) => deleteSection(sessionId, sectionId),
    onSuccess: (_, { sessionId, sectionId }) => {
      queryClient.removeQueries({ queryKey: ['sessions', sessionId, 'sections', sectionId], exact: true });
      queryClient.invalidateQueries({ queryKey: ['sessions', sessionId] });
      notifications.success('Section deleted successfully!');
    },
    onError: () => {
      notifications.error("Failed to delete section. Please try again.");
    }
  });
}
