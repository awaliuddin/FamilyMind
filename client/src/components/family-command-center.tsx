import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSwipeable } from "react-swipeable";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { MobileBottomNav } from "@/components/shared/MobileBottomNav";
import AIChat from "./ai-chat";
import { FamilyManagement } from "./family-management";
import GroceryView from "./grocery/GroceryView";

// Lazy load other views for better performance
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

const CalendarView = lazy(() => import("./calendar/CalendarView").catch(() => import("./grocery/GroceryView")));
const IdeasView = lazy(() => import("./ideas/IdeasView").catch(() => import("./grocery/GroceryView")));
const VisionView = lazy(() => import("./vision/VisionView").catch(() => import("./grocery/GroceryView")));
const WishlistView = lazy(() => import("./wishlist/WishlistView").catch(() => import("./grocery/GroceryView")));
const DashboardView = lazy(() => import("./dashboard/DashboardView").catch(() => import("./grocery/GroceryView")));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
  </div>
);

export default function FamilyCommandCenter() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [chatOpen, setChatOpen] = useState(false);
  const { user } = useAuth();

  const tabs = ['dashboard', 'grocery', 'calendar', 'ideas', 'vision', 'wishlist'];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Alt+Number for tab navigation
      if (e.altKey && e.key >= '1' && e.key <= '6') {
        e.preventDefault();
        setActiveTab(tabs[parseInt(e.key) - 1]);
      }

      // Alt+A for AI chat
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        setChatOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Swipe gestures for mobile
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1]);
      }
    },
    onSwipedRight: () => {
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex > 0) {
        setActiveTab(tabs[currentIndex - 1]);
      }
    },
    trackMouse: false,
    trackTouch: true,
  });

  const handleCommandAction = (action: string) => {
    switch (action) {
      case 'create-grocery-list':
        setActiveTab('grocery');
        setTimeout(() => {
          document.querySelector<HTMLInputElement>('input[placeholder*="Store name"]')?.focus();
        }, 100);
        break;
      case 'create-event':
        setActiveTab('calendar');
        break;
      case 'create-idea':
        setActiveTab('ideas');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 pb-20 md:pb-6">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <Card className="mb-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg border border-gray-200 dark:border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-gray-800 dark:text-gray-100">FamilyMind</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">AI-Powered Family Assistant</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <ThemeToggle />

                <Button
                  onClick={() => setChatOpen(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  size="sm"
                >
                  <Bot className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Ask AI</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/api/logout'}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                  size="sm"
                >
                  Logout
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content with Swipe Support */}
        <div {...handlers}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <Card className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
              {/* Desktop Tabs - Hidden on Mobile */}
              <TabsList className="hidden md:grid grid-cols-6 bg-gray-50 dark:bg-gray-800/50 w-full">
                <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="grocery" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  Grocery
                </TabsTrigger>
                <TabsTrigger value="calendar" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  Calendar
                </TabsTrigger>
                <TabsTrigger value="ideas" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  Ideas
                </TabsTrigger>
                <TabsTrigger value="vision" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  Vision
                </TabsTrigger>
                <TabsTrigger value="wishlist" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  Wishlist
                </TabsTrigger>
              </TabsList>

              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="m-0">
                <Suspense fallback={<LoadingFallback />}>
                  <DashboardView user={user as any} />
                </Suspense>
              </TabsContent>

              {/* Grocery Tab */}
              <TabsContent value="grocery" className="m-0">
                <GroceryView />
              </TabsContent>

              {/* Calendar Tab */}
              <TabsContent value="calendar" className="m-0">
                <Suspense fallback={<LoadingFallback />}>
                  <CalendarView />
                </Suspense>
              </TabsContent>

              {/* Ideas Tab */}
              <TabsContent value="ideas" className="m-0">
                <Suspense fallback={<LoadingFallback />}>
                  <IdeasView />
                </Suspense>
              </TabsContent>

              {/* Vision Tab */}
              <TabsContent value="vision" className="m-0">
                <Suspense fallback={<LoadingFallback />}>
                  <VisionView />
                </Suspense>
              </TabsContent>

              {/* Wishlist Tab */}
              <TabsContent value="wishlist" className="m-0">
                <Suspense fallback={<LoadingFallback />}>
                  <WishlistView />
                </Suspense>
              </TabsContent>
            </Card>
          </Tabs>
        </div>

        {/* AI Chat Component */}
        <AIChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />

        {/* Command Palette (⌘K) */}
        <CommandPalette
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAction={handleCommandAction}
        />

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}
