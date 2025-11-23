import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { WishListItem } from "@shared/schema";

const QUERY_KEY = ['/api/wishlist-items'];

export function useWishlistItems() {
  const { data = [], isLoading } = useQuery<WishListItem[]>({
    queryKey: QUERY_KEY,
    retry: false,
  });

  return { wishlistItems: data, isLoading };
}

export function useWishlistMutations() {
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

  const createWishlistItem = useMutation({
    mutationFn: async (item: {
      item: string;
      person: string;
      occasion: string;
      store?: string;
      price?: string;
    }) => {
      const response = await apiRequest('POST', '/api/wishlist-items', item);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: "Wishlist item created successfully!" });
    },
    onError: handleUnauthorizedError,
  });

  const updateWishlistItem = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<WishListItem> }) => {
      const response = await apiRequest('PATCH', `/api/wishlist-items/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: "Wishlist item updated successfully!" });
    },
    onError: handleUnauthorizedError,
  });

  const deleteWishlistItem = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/wishlist-items/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: "Wishlist item deleted successfully!" });
    },
    onError: handleUnauthorizedError,
  });

  return {
    createWishlistItem,
    updateWishlistItem,
    deleteWishlistItem,
  };
}
