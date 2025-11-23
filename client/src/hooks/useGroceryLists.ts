import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { GroceryList, GroceryItem } from "@shared/schema";

const QUERY_KEY = ['/api/grocery-lists'];

export function useGroceryLists() {
  const { data = [], isLoading } = useQuery<(GroceryList & { items: GroceryItem[] })[]>({
    queryKey: QUERY_KEY,
    retry: false,
  });

  return { groceryLists: data, isLoading };
}

export function useGroceryMutations() {
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

  const createList = useMutation({
    mutationFn: async ({ store, storeTip }: { store: string; storeTip?: string }) => {
      const response = await apiRequest('POST', '/api/grocery-lists', { store, storeTip });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: "Grocery list created successfully!" });
    },
    onError: handleUnauthorizedError,
  });

  const updateList = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<GroceryList> }) => {
      const response = await apiRequest('PATCH', `/api/grocery-lists/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: "Grocery list updated successfully!" });
    },
    onError: handleUnauthorizedError,
  });

  const deleteList = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/grocery-lists/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: "Grocery list deleted successfully!" });
    },
    onError: handleUnauthorizedError,
  });

  const addItem = useMutation({
    mutationFn: async ({ listId, name }: { listId: string; name: string }) => {
      const response = await apiRequest('POST', '/api/grocery-items', { listId, name });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: handleUnauthorizedError,
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<GroceryItem> }) => {
      const response = await apiRequest('PATCH', `/api/grocery-items/${id}`, data);
      return response.json();
    },
    onMutate: async ({ id, data }) => {
      // Optimistic update for instant UI feedback
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });

      const previousLists = queryClient.getQueryData(QUERY_KEY);

      queryClient.setQueryData(QUERY_KEY, (old: any) => {
        return old.map((list: any) => ({
          ...list,
          items: list.items.map((item: any) =>
            item.id === id ? { ...item, ...data } : item
          ),
        }));
      });

      return { previousLists };
    },
    onError: (err, variables, context) => {
      if (context?.previousLists) {
        queryClient.setQueryData(QUERY_KEY, context.previousLists);
      }
      handleUnauthorizedError(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/grocery-items/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: "Item deleted successfully!" });
    },
    onError: handleUnauthorizedError,
  });

  return {
    createList,
    updateList,
    deleteList,
    addItem,
    updateItem,
    deleteItem,
  };
}
