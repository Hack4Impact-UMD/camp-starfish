import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSessionDoc } from "@/data/firestore/sessions";

export function useDeleteSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (sessionId: string) => deleteSessionDoc(sessionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sessions"] });
        },
        onError: (error) => {
            console.error("Error deleting session:", error);
        }
    });
}