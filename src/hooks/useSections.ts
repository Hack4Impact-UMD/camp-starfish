import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getSectionsBySession, 
  getSectionById, 
  setSection, 
  updateSection, 
  deleteSection 
} from "@/data/firestore/sections";
import { Section, SectionID } from "@/types/sessionTypes";

/**
 * Query hook to fetch all sections for a session
 */
export function useSections(sessionId: string) {
  return useQuery({
    queryKey: ['sections', sessionId],
    queryFn: () => getSectionsBySession(sessionId),
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Query hook to fetch a single section by ID
 */
export function useSection(sessionId: string, sectionId: string) {
  return useQuery({
    queryKey: ['sections', sessionId, sectionId],
    queryFn: () => getSectionById(sessionId, sectionId),
    enabled: !!sessionId && !!sectionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Mutation hook to create a new section
 */
export function useCreateSection(sessionId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sectionData: Section) => setSection(sessionId, sectionData),
    onSuccess: () => {
      // Invalidate and refetch sections list
      queryClient.invalidateQueries({ queryKey: ['sections', sessionId] });
    },
    onError: (error) => {
      console.error('Error creating section:', error);
    }
  });
}

/**
 * Mutation hook to update an existing section
 */
export function useUpdateSection(sessionId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sectionId, updates }: { sectionId: string; updates: Partial<Section> }) =>
      updateSection(sessionId, sectionId, updates),
    onSuccess: (_, variables) => {
      // Invalidate both the list and the specific section
      queryClient.invalidateQueries({ queryKey: ['sections', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['sections', sessionId, variables.sectionId] });
    },
    onError: (error) => {
      console.error('Error updating section:', error);
    }
  });
}

/**
 * Mutation hook to delete a section
 */
export function useDeleteSection(sessionId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sectionId: string) => deleteSection(sessionId, sectionId),
    onSuccess: () => {
      // Invalidate sections list
      queryClient.invalidateQueries({ queryKey: ['sections', sessionId] });
    },
    onError: (error) => {
      console.error('Error deleting section:', error);
    }
  });
}
