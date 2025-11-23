import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Plus, Heart, Users, Loader2 } from "lucide-react";
import { useFamilyIdeas, useFamilyIdeaMutations } from "@/hooks/useFamilyIdeas";
import { IdeaCardSkeleton } from "@/components/shared/SkeletonLoaders";
import { EmptyState } from "@/components/shared/EmptyState";
import { motion, AnimatePresence } from "framer-motion";

export default function IdeasView() {
  const { familyIdeas, isLoading } = useFamilyIdeas();
  const { createIdea, likeIdea } = useFamilyIdeaMutations();
  const [newIdea, setNewIdea] = useState("");

  const handleCreate = () => {
    if (newIdea.trim()) {
      createIdea.mutate(
        { title: newIdea.trim(), author: "You" },
        {
          onSuccess: () => {
            setNewIdea("");
          },
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Family Idea Board</h2>
          <p className="text-gray-600 dark:text-gray-400">Share and vote on family activities and projects</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <IdeaCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Family Idea Board</h2>
        <p className="text-gray-600 dark:text-gray-400">Share and vote on family activities and projects</p>
      </div>

      {/* Add Idea */}
      <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800 mb-6">
        <CardContent className="p-6">
          <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-3 flex items-center">
            <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2" />
            Share a New Idea
          </h3>
          <div className="flex space-x-3">
            <Input
              placeholder="What fun family activity should we try?"
              value={newIdea}
              onChange={(e) => setNewIdea(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
            />
            <Button
              onClick={handleCreate}
              disabled={!newIdea.trim() || createIdea.isPending}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {createIdea.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Idea
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ideas Grid */}
      {familyIdeas.length === 0 ? (
        <EmptyState
          icon={<Lightbulb className="h-12 w-12 text-amber-500" />}
          title="No family ideas yet"
          description="Share your first family activity idea and start voting on what to do together!"
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <AnimatePresence>
            {familyIdeas.map((idea) => (
              <motion.div
                key={idea.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800 hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">{idea.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
                          Suggested by {idea.author}
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => likeIdea.mutate(idea.id)}
                        disabled={likeIdea.isPending}
                        className={`flex items-center space-x-1 transition-colors ${
                          idea.userLiked ? 'text-red-600' : 'text-red-500 hover:text-red-700'
                        }`}
                      >
                        <Heart className={`h-5 w-5 ${idea.userLiked ? 'fill-current' : ''}`} />
                        <span className="font-medium">{idea.likes}</span>
                      </motion.button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex space-x-2">
                        {idea.tags?.map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {idea.createdAt ? new Date(idea.createdAt).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
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
