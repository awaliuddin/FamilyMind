import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { VisionItem } from "@shared/schema";

const QUERY_KEY = ['/api/vision-items'];

export function useVisionItems() {
  const { data = [], isLoading } = useQuery<VisionItem[]>({
    queryKey: QUERY_KEY,
    retry: false,
  });

  return { visionItems: data, isLoading };
}

export function useVisionMutations() {
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

  const createVision = useMutation({
    mutationFn: async (vision: {
      title: string;
      description: string;
      author: string;
      color: string;
      icon: string;
    }) => {
      const response = await apiRequest('POST', '/api/vision-items', vision);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: "Vision item created successfully!" });
    },
    onError: handleUnauthorizedError,
  });

  const updateVision = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<VisionItem> }) => {
      const response = await apiRequest('PATCH', `/api/vision-items/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: "Vision item updated successfully!" });
    },
    onError: handleUnauthorizedError,
  });

  const deleteVision = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/vision-items/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: "Vision item deleted successfully!" });
    },
    onError: handleUnauthorizedError,
  });

  return {
    createVision,
    updateVision,
    deleteVision,
  };
}
