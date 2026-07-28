import { isNotFoundError } from "@/data/firestore/firestoreClientOperations";
import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: (failureCount, error) => !isNotFoundError(error) && failureCount < 3
    }
  }
});