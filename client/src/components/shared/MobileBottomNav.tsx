import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  ShoppingCart,
  Calendar,
  Lightbulb,
  Heart,
  Gift,
} from "lucide-react";

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'dashboard', label: 'Home', icon: TrendingUp },
  { id: 'grocery', label: 'Grocery', icon: ShoppingCart },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'ideas', label: 'Ideas', icon: Lightbulb },
  { id: 'vision', label: 'Vision', icon: Heart },
  { id: 'wishlist', label: 'Wishlist', icon: Gift },
];

export function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 pb-safe"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-6 h-16">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={cn(
                "flex flex-col items-center justify-center transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset",
                isActive
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              )}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="text-xs mt-1">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
