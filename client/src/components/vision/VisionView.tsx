import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, Plus, Trash2, Calendar, Loader2 } from "lucide-react";
import { useVisionItems, useVisionMutations } from "@/hooks/useVisionBoard";
import { VisionCardSkeleton } from "@/components/shared/SkeletonLoaders";
import { EmptyState } from "@/components/shared/EmptyState";
import { motion, AnimatePresence } from "framer-motion";

export default function VisionView() {
  const { visionItems, isLoading } = useVisionItems();
  const { createVision, deleteVision } = useVisionMutations();
  const [newVision, setNewVision] = useState("");

  const handleCreate = () => {
    if (newVision.trim()) {
      const colors = ['pink', 'blue', 'green', 'yellow', 'purple', 'indigo'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      createVision.mutate(
        {
          title: newVision.trim(),
          description: "New family goal",
          author: "You",
          color: randomColor,
          icon: "star",
        },
        {
          onSuccess: () => {
            setNewVision("");
          },
        }
      );
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      pink: 'from-pink-100 to-pink-200 border-pink-300 text-pink-800 dark:from-pink-900/20 dark:to-pink-800/20 dark:border-pink-800',
      blue: 'from-blue-100 to-blue-200 border-blue-300 text-blue-800 dark:from-blue-900/20 dark:to-blue-800/20 dark:border-blue-800',
      green: 'from-green-100 to-green-200 border-green-300 text-green-800 dark:from-green-900/20 dark:to-green-800/20 dark:border-green-800',
      yellow: 'from-yellow-100 to-yellow-200 border-yellow-300 text-yellow-800 dark:from-yellow-900/20 dark:to-yellow-800/20 dark:border-yellow-800',
      purple: 'from-purple-100 to-purple-200 border-purple-300 text-purple-800 dark:from-purple-900/20 dark:to-purple-800/20 dark:border-purple-800',
      indigo: 'from-indigo-100 to-indigo-200 border-indigo-300 text-indigo-800 dark:from-indigo-900/20 dark:to-indigo-800/20 dark:border-indigo-800',
    };
    return colorMap[color] || colorMap.blue;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Family Vision Board</h2>
          <p className="text-gray-600 dark:text-gray-400">Dream big together - your family's goals and aspirations</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <VisionCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Family Vision Board</h2>
        <p className="text-gray-600 dark:text-gray-400">Dream big together - your family's goals and aspirations</p>
      </div>

      {/* Add Vision */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 mb-6">
        <CardContent className="p-6">
          <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-3 flex items-center">
            <Heart className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
            Add a Family Dream or Goal
          </h3>
          <div className="flex space-x-3">
            <Input
              placeholder="What does your family dream of achieving?"
              value={newVision}
              onChange={(e) => setNewVision(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
            />
            <Button
              onClick={handleCreate}
              disabled={!newVision.trim() || createVision.isPending}
              className="bg-purple-500 hover:bg-purple-600"
            >
              {createVision.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Dream
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vision Cards */}
      {visionItems.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-12 w-12 text-purple-500" />}
          title="No family dreams yet"
          description="Add your first family goal or dream and start working towards it together!"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {visionItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card className={`bg-gradient-to-br ${getColorClasses(item.color)} border-2 hover:shadow-lg transition-all text-center`}>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <Heart className={`h-8 w-8 mx-auto ${item.color === 'pink' ? 'text-pink-600 dark:text-pink-400' : 'text-blue-600 dark:text-blue-400'}`} />
                    </div>
                    <h3 className="font-semibold mb-2 dark:text-gray-100">{item.title}</h3>
                    <p className="text-sm mb-3 opacity-80 dark:text-gray-300">{item.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary" className="text-xs">
                        by {item.author}
                      </Badge>
                      <div className="flex items-center space-x-1 text-xs">
                        <Calendar className="h-3 w-3" />
                        <span>{item.targetDate || 'Ongoing'}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteVision.mutate(item.id)}
                      disabled={deleteVision.isPending}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
