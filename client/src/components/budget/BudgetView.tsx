import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useBudgets, useBudgetMutations, type BudgetWithExpenses } from "@/hooks/useBudgets";
import { DollarSign, Plus, Trash2, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "groceries", label: "Groceries" },
  { value: "dining", label: "Dining Out" },
  { value: "transport", label: "Transport" },
  { value: "utilities", label: "Utilities" },
  { value: "entertainment", label: "Entertainment" },
];

function BudgetProgressBar({ spent, total }: { spent: number; total: number }) {
  const pct = total > 0 ? Math.min((spent / total) * 100, 100) : 0;
  const isOver = spent > total;

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600 dark:text-gray-400">
          ${spent.toFixed(2)} spent
        </span>
        <span className={isOver ? "text-red-600 dark:text-red-400 font-medium" : "text-gray-600 dark:text-gray-400"}>
          {isOver ? "Over by $" + (spent - total).toFixed(2) : "$" + (total - spent).toFixed(2) + " left"}
        </span>
      </div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            isOver
              ? "bg-red-500"
              : pct > 75
                ? "bg-amber-500"
                : "bg-emerald-500"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function ExpenseForm({ budgetId, onClose }: { budgetId: string; onClose: () => void }) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const { createExpense } = useBudgetMutations();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;
    createExpense.mutate(
      {
        budgetId,
        amount,
        description,
        date: new Date().toISOString().split("T")[0],
      },
      { onSuccess: () => { setAmount(""); setDescription(""); onClose(); } },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-3">
      <Input
        placeholder="Amount"
        type="number"
        step="0.01"
        min="0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-28"
      />
      <Input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" size="sm" disabled={createExpense.isPending}>
        Add
      </Button>
    </form>
  );
}

function BudgetCard({ budget }: { budget: BudgetWithExpenses }) {
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const { deleteBudget, deleteExpense } = useBudgetMutations();
  const spent = budget.expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const total = parseFloat(budget.amount);
  const categoryLabel = CATEGORIES.find((c) => c.value === budget.category)?.label || budget.category;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{budget.name}</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {categoryLabel} &middot; {budget.period}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xl font-bold text-gray-800 dark:text-gray-100">
                ${total.toFixed(2)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteBudget.mutate(budget.id)}
                className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <BudgetProgressBar spent={spent} total={total} />

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Expenses ({budget.expenses.length})
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExpenseForm(!showExpenseForm)}
                className="h-7 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Expense
              </Button>
            </div>

            {showExpenseForm && (
              <ExpenseForm
                budgetId={budget.id}
                onClose={() => setShowExpenseForm(false)}
              />
            )}

            {budget.expenses.length > 0 && (
              <div className="space-y-1 mt-2 max-h-40 overflow-y-auto">
                {budget.expenses.slice(0, 5).map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
                  >
                    <div>
                      <span className="text-gray-800 dark:text-gray-200">{expense.description}</span>
                      <span className="text-gray-400 ml-2 text-xs">{expense.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        ${parseFloat(expense.amount).toFixed(2)}
                      </span>
                      <button
                        onClick={() => deleteExpense.mutate(expense.id)}
                        className="text-gray-400 hover:text-red-500 p-0.5"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
                {budget.expenses.length > 5 && (
                  <p className="text-xs text-gray-400 text-center pt-1">
                    +{budget.expenses.length - 5} more
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function BudgetView() {
  const { budgets, isLoading } = useBudgets();
  const { createBudget } = useBudgetMutations();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState("monthly");
  const [category, setCategory] = useState("general");

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  const totalBudgeted = budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0);
  const totalSpent = budgets.reduce(
    (sum, b) => sum + b.expenses.reduce((s, e) => s + parseFloat(e.amount), 0),
    0,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;
    createBudget.mutate(
      { name, amount, period, category },
      {
        onSuccess: () => {
          setName("");
          setAmount("");
          setPeriod("monthly");
          setCategory("general");
          setShowForm(false);
        },
      },
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Wallet className="h-6 w-6 text-emerald-500" />
            Budget Tracking
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track spending and stay on top of family finances
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Budget
        </Button>
      </div>

      {/* Overview Cards */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">Total Budgeted</p>
                <p className="text-xl font-bold text-emerald-800 dark:text-emerald-200">
                  ${totalBudgeted.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Total Spent</p>
                <p className="text-xl font-bold text-blue-800 dark:text-blue-200">
                  ${totalSpent.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className={`bg-gradient-to-r ${
            totalBudgeted - totalSpent >= 0
              ? "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800"
              : "from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-800"
          }`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                totalBudgeted - totalSpent >= 0
                  ? "bg-green-100 dark:bg-green-900/50"
                  : "bg-red-100 dark:bg-red-900/50"
              }`}>
                <TrendingUp className={`h-5 w-5 ${
                  totalBudgeted - totalSpent >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`} />
              </div>
              <div>
                <p className={`text-sm ${
                  totalBudgeted - totalSpent >= 0
                    ? "text-green-700 dark:text-green-300"
                    : "text-red-700 dark:text-red-300"
                }`}>Remaining</p>
                <p className={`text-xl font-bold ${
                  totalBudgeted - totalSpent >= 0
                    ? "text-green-800 dark:text-green-200"
                    : "text-red-800 dark:text-red-200"
                }`}>
                  ${(totalBudgeted - totalSpent).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Budget Form */}
      {showForm && (
        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder="Budget name (e.g., Groceries)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  placeholder="Amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createBudget.isPending}>
                  Create Budget
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Budgets Grid */}
      {budgets.length === 0 ? (
        <EmptyState
          icon={<Wallet className="h-12 w-12 text-emerald-500" />}
          title="No Budgets Yet"
          description="Create your first budget to start tracking family spending"
          action={{
            label: "Create Budget",
            onClick: () => setShowForm(true),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {budgets.map((budget) => (
              <BudgetCard key={budget.id} budget={budget} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
