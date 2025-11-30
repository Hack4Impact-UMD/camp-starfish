import { setSection } from "@/data/firestore/sections";
import useNotifications from "@/features/notifications/useNotifications";
import { Section } from "@/types/sessionTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useCreateSection(sessionId: string) {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation({
    mutationFn: (sectionData: Section) => setSection(sessionId, sectionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', sessionId, 'sections'] });
    },
    onError: () => {
      notifications.error('Unable to create section. Please try again.');
    }
  });
}