import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Gift, Plus, Trash2, Loader2 } from "lucide-react";
import { useWishlistItems, useWishlistMutations } from "@/hooks/useWishlist";
import { WishlistCardSkeleton } from "@/components/shared/SkeletonLoaders";
import { EmptyState } from "@/components/shared/EmptyState";
import { motion, AnimatePresence } from "framer-motion";

export default function WishlistView() {
  const { wishlistItems, isLoading } = useWishlistItems();
  const { createWishlistItem, deleteWishlistItem } = useWishlistMutations();

  const [formData, setFormData] = useState({
    item: "",
    person: "",
    occasion: "",
    store: "Amazon",
    price: "$0",
  });

  const handleCreate = () => {
    if (formData.item.trim() && formData.person.trim() && formData.occasion.trim()) {
      createWishlistItem.mutate(formData, {
        onSuccess: () => {
          setFormData({
            item: "",
            person: "",
            occasion: "",
            store: "Amazon",
            price: "$0",
          });
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Family Wish Lists</h2>
          <p className="text-gray-600 dark:text-gray-400">Track gifts and purchases for special occasions</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <WishlistCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Family Wish Lists</h2>
        <p className="text-gray-600 dark:text-gray-400">Track gifts and purchases for special occasions</p>
      </div>

      {/* Add Wishlist Item */}
      <Card className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-800 mb-6">
        <CardContent className="p-6">
          <h3 className="font-semibold text-red-800 dark:text-red-300 mb-3 flex items-center">
            <Gift className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
            Add a Wish List Item
          </h3>
          <div className="grid md:grid-cols-4 gap-3">
            <Input
              placeholder="Item name"
              value={formData.item}
              onChange={(e) => setFormData({ ...formData, item: e.target.value })}
            />
            <Input
              placeholder="For whom?"
              value={formData.person}
              onChange={(e) => setFormData({ ...formData, person: e.target.value })}
            />
            <Input
              placeholder="Occasion"
              value={formData.occasion}
              onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
            />
            <Button
              onClick={handleCreate}
              disabled={!formData.item.trim() || !formData.person.trim() || !formData.occasion.trim() || createWishlistItem.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {createWishlistItem.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Wishlist Items */}
      {wishlistItems.length === 0 ? (
        <EmptyState
          icon={<Gift className="h-12 w-12 text-red-500" />}
          title="No wishlist items yet"
          description="Add your first wishlist item to start tracking gifts for birthdays, holidays, and special occasions!"
        />
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {wishlistItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <Gift className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-lg">{item.item}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            for {item.person} • {item.occasion}
                          </p>
                          <div className="flex items-center space-x-3">
                            <Badge variant="secondary">{item.store || 'Store TBD'}</Badge>
                            <span className="font-semibold text-green-600 dark:text-green-400">
                              {item.price || 'Price TBD'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        onClick={() => deleteWishlistItem.mutate(item.id)}
                        disabled={deleteWishlistItem.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
