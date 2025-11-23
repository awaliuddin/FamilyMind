import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { FamilyIdea } from "@shared/schema";

const QUERY_KEY = ['/api/family-ideas'];

export function useFamilyIdeas() {
  const { data = [], isLoading } = useQuery<(FamilyIdea & { userLiked: boolean })[]>({
    queryKey: QUERY_KEY,
    retry: false,
  });

  return { familyIdeas: data, isLoading };
}

export function useFamilyIdeaMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleUnauthorizedError = (error: Error) => {
    if (isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return true;
    }
    return false;
  };

  const createIdea = useMutation({
    mutationFn: async (idea: { title: string; author: string }) => {
      const response = await apiRequest('POST', '/api/family-ideas', idea);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: "Idea created successfully!" });
    },
    onError: handleUnauthorizedError,
  });

  const likeIdea = useMutation({
    mutationFn: async (ideaId: string) => {
      const response = await apiRequest('POST', `/api/family-ideas/${ideaId}/like`, {});
      return response.json();
    },
    onMutate: async (ideaId) => {
      // Optimistic update for instant feedback
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });

      const previousIdeas = queryClient.getQueryData(QUERY_KEY);

      queryClient.setQueryData(QUERY_KEY, (old: any) => {
        return old.map((idea: any) => {
          if (idea.id === ideaId) {
            return {
              ...idea,
              userLiked: !idea.userLiked,
              likes: idea.userLiked ? idea.likes - 1 : idea.likes + 1,
            };
          }
          return idea;
        });
      });

      return { previousIdeas };
    },
    onError: (err, variables, context) => {
      if (context?.previousIdeas) {
        queryClient.setQueryData(QUERY_KEY, context.previousIdeas);
      }
      handleUnauthorizedError(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  return {
    createIdea,
    likeIdea,
  };
}
