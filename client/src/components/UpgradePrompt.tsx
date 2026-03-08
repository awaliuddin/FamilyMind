import { Sparkles } from "lucide-react";
import { useLocation } from "wouter";

interface UpgradePromptProps {
  message: string;
}

export function UpgradePrompt({ message }: UpgradePromptProps) {
  const [, navigate] = useLocation();

  return (
    <div className="flex items-start gap-3 rounded-lg border border-purple-200 bg-purple-50 p-4 text-sm dark:border-purple-800 dark:bg-purple-950">
      <Sparkles className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-purple-800 dark:text-purple-200">{message}</p>
        <button
          onClick={() => navigate("/premium")}
          className="mt-2 text-purple-700 dark:text-purple-300 font-medium underline underline-offset-2 hover:text-purple-900 dark:hover:text-purple-100"
        >
          View Premium plans
        </button>
      </div>
    </div>
  );
}
