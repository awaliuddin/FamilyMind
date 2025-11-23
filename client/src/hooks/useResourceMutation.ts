import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface UseResourceMutationOptions {
  endpoint: string;
  queryKey: string[];
  createSuccessMessage?: string;
  updateSuccessMessage?: string;
  deleteSuccessMessage?: string;
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

export function useResourceMutation<T = any>(options: UseResourceMutationOptions) {
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

  const create = useMutation({
    mutationFn: async (data: Partial<T>) => {
      const response = await apiRequest('POST', options.endpoint, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: options.queryKey });
      if (options.createSuccessMessage) {
        toast({ title: options.createSuccessMessage });
      }
      options.onCreateSuccess?.();
    },
    onError: handleUnauthorizedError,
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<T> }) => {
      const response = await apiRequest('PATCH', `${options.endpoint}/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: options.queryKey });
      if (options.updateSuccessMessage) {
        toast({ title: options.updateSuccessMessage });
      }
      options.onUpdateSuccess?.();
    },
    onError: handleUnauthorizedError,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `${options.endpoint}/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: options.queryKey });
      if (options.deleteSuccessMessage) {
        toast({ title: options.deleteSuccessMessage });
      }
      options.onDeleteSuccess?.();
    },
    onError: handleUnauthorizedError,
  });

  return {
    create,
    update,
    remove,
    isCreating: create.isPending,
    isUpdating: update.isPending,
    isDeleting: remove.isPending,
  };
}
