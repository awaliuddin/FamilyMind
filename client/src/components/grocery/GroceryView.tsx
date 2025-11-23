import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Trash2, Edit3, Check, Loader2 } from "lucide-react";
import { useGroceryLists, useGroceryMutations } from "@/hooks/useGroceryLists";
import { GroceryListSkeleton } from "@/components/shared/SkeletonLoaders";
import { EmptyState } from "@/components/shared/EmptyState";
import { motion, AnimatePresence } from "framer-motion";

export default function GroceryView() {
  const { groceryLists, isLoading } = useGroceryLists();
  const { createList, deleteList, addItem, updateItem, deleteItem } = useGroceryMutations();

  const [newStore, setNewStore] = useState("");
  const [newStoreTip, setNewStoreTip] = useState("");
  const [itemInputs, setItemInputs] = useState<Record<string, string>>({});

  const handleCreateList = () => {
    if (newStore.trim()) {
      createList.mutate(
        { store: newStore.trim(), storeTip: newStoreTip.trim() || undefined },
        {
          onSuccess: () => {
            setNewStore("");
            setNewStoreTip("");
          },
        }
      );
    }
  };

  const handleAddItem = (listId: string) => {
    const itemName = itemInputs[listId]?.trim();
    if (itemName) {
      addItem.mutate(
        { listId, name: itemName },
        {
          onSuccess: () => {
            setItemInputs(prev => ({ ...prev, [listId]: "" }));
          },
        }
      );
    }
  };

  const handleToggleItem = (id: string, completed: boolean) => {
    updateItem.mutate({ id, data: { completed: !completed } });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Smart Grocery Lists</h2>
          <p className="text-gray-600 dark:text-gray-400">AI-powered shopping with store-specific optimization</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <GroceryListSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Smart Grocery Lists</h2>
        <p className="text-gray-600 dark:text-gray-400">AI-powered shopping with store-specific optimization</p>
      </div>

      {/* Create New List */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800 mb-6">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center">
            <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
            Create New Store List
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            <Input
              placeholder="Store name (e.g., Whole Foods, Target)"
              value={newStore}
              onChange={(e) => setNewStore(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateList()}
              className="dark:bg-blue-900/30"
            />
            <Input
              placeholder="Store tip (optional)"
              value={newStoreTip}
              onChange={(e) => setNewStoreTip(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateList()}
              className="dark:bg-blue-900/30"
            />
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              onClick={handleCreateList}
              disabled={!newStore.trim() || createList.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createList.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Create List
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grocery Lists */}
      {groceryLists.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart className="h-12 w-12 text-blue-500" />}
          title="No grocery lists yet"
          description="Create your first grocery list to start organizing your shopping by store. FamilyMind will help you optimize your trips!"
          action={{
            label: "Create Your First List",
            onClick: () => document.querySelector<HTMLInputElement>('input[placeholder*="Store name"]')?.focus(),
          }}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {groceryLists.map((list) => (
              <motion.div
                key={list.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <ShoppingCart className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-blue-800 dark:text-blue-300">{list.store}</CardTitle>
                          {list.storeTip && (
                            <p className="text-blue-600 dark:text-blue-400 text-sm">💡 {list.storeTip}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteList.mutate(list.id)}
                        disabled={deleteList.isPending}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <AnimatePresence>
                        {list.items.map((item) => (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-900"
                          >
                            <div className="flex items-center space-x-2 flex-1">
                              <motion.button
                                whileTap={{ scale: 1.2 }}
                                onClick={() => handleToggleItem(item.id, item.completed || false)}
                                className="focus:outline-none"
                              >
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                  item.completed
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}>
                                  {item.completed && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                    >
                                      <Check className="h-3 w-3 text-white" />
                                    </motion.div>
                                  )}
                                </div>
                              </motion.button>
                              <motion.span
                                animate={{
                                  opacity: item.completed ? 0.5 : 1,
                                  textDecoration: item.completed ? 'line-through' : 'none',
                                }}
                                transition={{ duration: 0.2 }}
                                className="text-gray-800 dark:text-gray-200"
                              >
                                {item.name}
                              </motion.span>
                              {item.autoAdded && (
                                <Badge variant="secondary" className="text-xs">AI</Badge>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              onClick={() => deleteItem.mutate(item.id)}
                              disabled={deleteItem.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add item..."
                        value={itemInputs[list.id] || ''}
                        onChange={(e) => setItemInputs(prev => ({ ...prev, [list.id]: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddItem(list.id)}
                        className="dark:bg-blue-900/30"
                      />
                      <Button
                        onClick={() => handleAddItem(list.id)}
                        disabled={!itemInputs[list.id]?.trim() || addItem.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4" />
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
