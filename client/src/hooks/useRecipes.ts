import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Recipe } from "@shared/schema";

const QUERY_KEY = ['/api/recipes'];

export function useRecipes() {
  const { data = [], isLoading } = useQuery<Recipe[]>({
    queryKey: QUERY_KEY,
    retry: false,
  });
  return { recipes: data, isLoading };
}

export function useRecipeMutations() {
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

  const createRecipe = useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      ingredients: Array<{ name: string; quantity?: string; unit?: string }>;
      instructions?: string;
      prepTime?: number;
      cookTime?: number;
      servings?: number;
      category?: string;
    }) => {
      const response = await apiRequest('POST', '/api/recipes', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: "Recipe created!" });
    },
    onError: handleUnauthorizedError,
  });

  const updateRecipe = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Recipe> }) => {
      const response = await apiRequest('PATCH', `/api/recipes/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: "Recipe updated!" });
    },
    onError: handleUnauthorizedError,
  });

  const deleteRecipe = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/recipes/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: "Recipe deleted!" });
    },
    onError: handleUnauthorizedError,
  });

  const addToGroceryList = useMutation({
    mutationFn: async ({ recipeId, listId }: { recipeId: string; listId: string }) => {
      const response = await apiRequest('POST', `/api/recipes/${recipeId}/to-grocery-list`, { listId });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/grocery-lists'] });
      toast({ title: `${data.added} ingredients added to grocery list!` });
    },
    onError: handleUnauthorizedError,
  });

  return { createRecipe, updateRecipe, deleteRecipe, addToGroceryList };
}
