import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, ShoppingCart, Lightbulb, Heart, Clock, Loader2 } from "lucide-react";
import { useGroceryLists } from "@/hooks/useGroceryLists";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { useFamilyIdeas } from "@/hooks/useFamilyIdeas";
import { useVisionItems } from "@/hooks/useVisionBoard";
import { FamilyManagement } from "@/components/family-management";
import { DashboardStatSkeleton } from "@/components/shared/SkeletonLoaders";
import { motion } from "framer-motion";

interface DashboardViewProps {
  user: any;
}

export default function DashboardView({ user }: DashboardViewProps) {
  const { groceryLists, isLoading: loadingGrocery } = useGroceryLists();
  const { calendarEvents, isLoading: loadingEvents } = useCalendarEvents();
  const { familyIdeas, isLoading: loadingIdeas } = useFamilyIdeas();
  const { visionItems, isLoading: loadingVision } = useVisionItems();

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const isLoading = loadingGrocery || loadingEvents || loadingIdeas || loadingVision;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Family Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-400">Your family's intelligent command center</p>
      </div>

      {/* Family Management */}
      {user && (
        <div className="mb-8">
          <FamilyManagement user={user} />
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          <>
            <DashboardStatSkeleton />
            <DashboardStatSkeleton />
            <DashboardStatSkeleton />
            <DashboardStatSkeleton />
          </>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800 cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">This Week</p>
                      <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">{calendarEvents.length}</p>
                      <p className="text-blue-600 dark:text-blue-400 text-xs">Family Events</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800 cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 dark:text-green-400 text-sm font-medium">Grocery Items</p>
                      <p className="text-2xl font-bold text-green-800 dark:text-green-300">
                        {groceryLists.reduce((acc, list) => acc + list.items.length, 0)}
                      </p>
                      <p className="text-green-600 dark:text-green-400 text-xs">Auto-managed</p>
                    </div>
                    <ShoppingCart className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800 cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-600 dark:text-amber-400 text-sm font-medium">Active Ideas</p>
                      <p className="text-2xl font-bold text-amber-800 dark:text-amber-300">{familyIdeas.length}</p>
                      <p className="text-amber-600 dark:text-amber-400 text-xs">Family voted</p>
                    </div>
                    <Lightbulb className="h-8 w-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border-pink-200 dark:border-pink-800 cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-pink-600 dark:text-pink-400 text-sm font-medium">Dreams</p>
                      <p className="text-2xl font-bold text-pink-800 dark:text-pink-300">{visionItems.length}</p>
                      <p className="text-pink-600 dark:text-pink-400 text-xs">Vision board</p>
                    </div>
                    <Heart className="h-8 w-8 text-pink-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800 dark:text-gray-100">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {loadingEvents ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) : calendarEvents.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No upcoming events</p>
              ) : (
                <div className="space-y-3">
                  {calendarEvents.slice(0, 5).map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700"
                    >
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 dark:text-gray-100">{event.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(event.startTime)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800 dark:text-gray-100">
              <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2" />
              Top Family Ideas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {loadingIdeas ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                </div>
              ) : familyIdeas.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No family ideas yet</p>
              ) : (
                <div className="space-y-3">
                  {familyIdeas.slice(0, 5).map((idea) => (
                    <motion.div
                      key={idea.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 dark:text-gray-100">{idea.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">by {idea.author}</p>
                      </div>
                      <div className="flex items-center space-x-1 text-red-500">
                        <Heart className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium">{idea.likes}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
