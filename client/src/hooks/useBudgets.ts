import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Budget, Expense } from "@shared/schema";

const BUDGETS_KEY = ['/api/budgets'];

export type BudgetWithExpenses = Budget & { expenses: Expense[] };

export function useBudgets() {
  const { data = [], isLoading } = useQuery<BudgetWithExpenses[]>({
    queryKey: BUDGETS_KEY,
    retry: false,
  });
  return { budgets: data, isLoading };
}

export function useBudgetSummary(month: string) {
  const { data, isLoading } = useQuery<{
    budgets: Array<{
      id: string;
      name: string;
      category: string;
      budgeted: number;
      spent: number;
      remaining: number;
    }>;
    totalBudgeted: number;
    totalSpent: number;
  }>({
    queryKey: ['/api/budgets/summary', month],
    retry: false,
  });
  return { summary: data, isLoading };
}

export function useBudgetMutations() {
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

  const createBudget = useMutation({
    mutationFn: async (data: {
      name: string;
      amount: string;
      period?: string;
      category?: string;
    }) => {
      const response = await apiRequest('POST', '/api/budgets', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_KEY });
      toast({ title: "Budget created!" });
    },
    onError: handleUnauthorizedError,
  });

  const updateBudget = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Budget> }) => {
      const response = await apiRequest('PATCH', `/api/budgets/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_KEY });
      toast({ title: "Budget updated!" });
    },
    onError: handleUnauthorizedError,
  });

  const deleteBudget = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/budgets/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_KEY });
      toast({ title: "Budget deleted!" });
    },
    onError: handleUnauthorizedError,
  });

  const createExpense = useMutation({
    mutationFn: async (data: {
      budgetId: string;
      amount: string;
      description: string;
      date: string;
      category?: string;
    }) => {
      const response = await apiRequest('POST', '/api/expenses', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_KEY });
      toast({ title: "Expense added!" });
    },
    onError: handleUnauthorizedError,
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/expenses/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_KEY });
      toast({ title: "Expense deleted!" });
    },
    onError: handleUnauthorizedError,
  });

  return { createBudget, updateBudget, deleteBudget, createExpense, deleteExpense };
}
