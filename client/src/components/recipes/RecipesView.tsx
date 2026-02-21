import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UtensilsCrossed, Plus, Trash2, Clock, Users, ShoppingCart, X } from "lucide-react";
import { useRecipes, useRecipeMutations } from "@/hooks/useRecipes";
import { useGroceryLists } from "@/hooks/useGroceryLists";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

interface Ingredient {
  name: string;
  quantity?: string;
  unit?: string;
}

const CATEGORIES = ["breakfast", "lunch", "dinner", "snack", "dessert"];

export default function RecipesView() {
  const { recipes, isLoading } = useRecipes();
  const { createRecipe, deleteRecipe, addToGroceryList } = useRecipeMutations();
  const { groceryLists } = useGroceryLists();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [ingName, setIngName] = useState("");
  const [ingQuantity, setIngQuantity] = useState("");
  const [ingUnit, setIngUnit] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [category, setCategory] = useState("dinner");

  const addIngredient = () => {
    if (ingName.trim()) {
      setIngredients([...ingredients, {
        name: ingName.trim(),
        quantity: ingQuantity.trim() || undefined,
        unit: ingUnit.trim() || undefined,
      }]);
      setIngName("");
      setIngQuantity("");
      setIngUnit("");
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    if (title.trim() && ingredients.length > 0) {
      createRecipe.mutate(
        {
          title: title.trim(),
          description: description.trim() || undefined,
          instructions: instructions.trim() || undefined,
          ingredients,
          prepTime: prepTime ? parseInt(prepTime) : undefined,
          cookTime: cookTime ? parseInt(cookTime) : undefined,
          servings: servings ? parseInt(servings) : undefined,
          category,
        },
        {
          onSuccess: () => {
            setTitle("");
            setDescription("");
            setInstructions("");
            setIngredients([]);
            setPrepTime("");
            setCookTime("");
            setServings("");
            setCategory("dinner");
          },
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <UtensilsCrossed className="h-6 w-6 text-orange-500" />
          Family Recipes
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Save recipes and send ingredients straight to your grocery lists
        </p>
      </div>

      {/* Create Recipe Form */}
      <Card className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="text-lg text-orange-800 dark:text-orange-200">Add New Recipe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              placeholder="Recipe title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            placeholder="Short description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              placeholder="Prep (min)"
              type="number"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
            />
            <Input
              placeholder="Cook (min)"
              type="number"
              value={cookTime}
              onChange={(e) => setCookTime(e.target.value)}
            />
            <Input
              placeholder="Servings"
              type="number"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
            />
          </div>

          {/* Ingredient builder */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ingredients</p>
            <div className="flex gap-2">
              <Input
                placeholder="Qty"
                value={ingQuantity}
                onChange={(e) => setIngQuantity(e.target.value)}
                className="w-20"
              />
              <Input
                placeholder="Unit"
                value={ingUnit}
                onChange={(e) => setIngUnit(e.target.value)}
                className="w-24"
              />
              <Input
                placeholder="Ingredient name"
                value={ingName}
                onChange={(e) => setIngName(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={addIngredient}
                disabled={!ingName.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {ingredients.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {ingredients.map((ing, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200"
                  >
                    {[ing.quantity, ing.unit, ing.name].filter(Boolean).join(' ')}
                    <button onClick={() => removeIngredient(i)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Textarea
            placeholder="Instructions (optional)"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={3}
          />

          <Button
            onClick={handleCreate}
            disabled={!title.trim() || ingredients.length === 0 || createRecipe.isPending}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {createRecipe.isPending ? "Saving..." : "Save Recipe"}
          </Button>
        </CardContent>
      </Card>

      {/* Recipe Cards */}
      {recipes.length === 0 ? (
        <EmptyState
          icon={<UtensilsCrossed className="h-12 w-12 text-orange-400" />}
          title="No recipes yet"
          description="Add your family's favorite recipes and send ingredients to your grocery lists with one tap."
          action={{ label: "Add First Recipe", onClick: () => document.querySelector<HTMLInputElement>('input[placeholder="Recipe title"]')?.focus() }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                groceryLists={groceryLists}
                onDelete={(id) => deleteRecipe.mutate(id)}
                onAddToList={(recipeId, listId) => addToGroceryList.mutate({ recipeId, listId })}
                isAddingToList={addToGroceryList.isPending}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function RecipeCard({
  recipe,
  groceryLists,
  onDelete,
  onAddToList,
  isAddingToList,
}: {
  recipe: any;
  groceryLists: any[];
  onDelete: (id: string) => void;
  onAddToList: (recipeId: string, listId: string) => void;
  isAddingToList: boolean;
}) {
  const [selectedList, setSelectedList] = useState("");
  const ingredients = (recipe.ingredients as Ingredient[]) || [];
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{recipe.title}</CardTitle>
              {recipe.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{recipe.description}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(recipe.id)}
              className="text-gray-400 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap mt-2">
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              {recipe.category || "dinner"}
            </Badge>
            {totalTime > 0 && (
              <Badge variant="outline" className="text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                {totalTime} min
              </Badge>
            )}
            {recipe.servings && (
              <Badge variant="outline" className="text-gray-500">
                <Users className="h-3 w-3 mr-1" />
                {recipe.servings}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Ingredients */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ingredients ({ingredients.length})
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-0.5">
              {ingredients.slice(0, 6).map((ing, i) => (
                <li key={i} className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-orange-400 shrink-0" />
                  {[ing.quantity, ing.unit, ing.name].filter(Boolean).join(' ')}
                </li>
              ))}
              {ingredients.length > 6 && (
                <li className="text-orange-500">+{ingredients.length - 6} more</li>
              )}
            </ul>
          </div>

          {/* Instructions preview */}
          {recipe.instructions && (
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {recipe.instructions}
            </p>
          )}

          {/* Add to grocery list */}
          {groceryLists.length > 0 && (
            <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <Select value={selectedList} onValueChange={setSelectedList}>
                <SelectTrigger className="flex-1 h-9 text-sm">
                  <SelectValue placeholder="Select a grocery list..." />
                </SelectTrigger>
                <SelectContent>
                  {groceryLists.map((list: any) => (
                    <SelectItem key={list.id} value={list.id}>{list.store}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (selectedList) {
                    onAddToList(recipe.id, selectedList);
                    setSelectedList("");
                  }
                }}
                disabled={!selectedList || isAddingToList}
                className="text-orange-600 border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
