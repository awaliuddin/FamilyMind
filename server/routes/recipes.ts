import type { Express, RequestHandler } from "express";
import type { IStorage } from "../storage";
import { insertRecipeSchema } from "@shared/schema";

export function registerRecipeRoutes(app: Express, isAuthenticated: RequestHandler, storage: IStorage) {
  app.get('/api/recipes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.auth.userId;
      const user = await storage.getUser(userId);
      if (!user?.familyId) return res.json([]);
      const items = await storage.getRecipes(user.familyId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      res.status(500).json({ message: "Failed to fetch recipes" });
    }
  });

  app.post('/api/recipes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.auth.userId;
      const user = await storage.getUser(userId);
      if (!user?.familyId) {
        return res.status(400).json({ message: "Must be part of a family to create recipes" });
      }
      const recipeData = insertRecipeSchema.parse({ ...req.body, familyId: user.familyId });
      const recipe = await storage.createRecipe(recipeData);
      res.json(recipe);
    } catch (error) {
      console.error("Error creating recipe:", error);
      res.status(500).json({ message: "Failed to create recipe" });
    }
  });

  app.patch('/api/recipes/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { id: _id, familyId: _familyId, createdAt: _createdAt, updatedAt: _updatedAt, ...cleanData } = req.body;
      const recipe = await storage.updateRecipe(id, cleanData);
      res.json(recipe);
    } catch (error) {
      console.error("Error updating recipe:", error);
      res.status(500).json({ message: "Failed to update recipe" });
    }
  });

  app.delete('/api/recipes/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteRecipe(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting recipe:", error);
      res.status(500).json({ message: "Failed to delete recipe" });
    }
  });

  app.post('/api/recipes/:id/to-grocery-list', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { listId } = req.body;
      const userId = req.auth.userId;
      const user = await storage.getUser(userId);

      if (!user?.familyId) {
        return res.status(400).json({ message: "Must be part of a family" });
      }

      const recipesList = await storage.getRecipes(user.familyId);
      const recipe = recipesList.find(r => r.id === id);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      const ingredients = (recipe.ingredients as Array<{ name: string; quantity?: string; unit?: string }>) || [];
      const created = await Promise.all(
        ingredients.map(ing => {
          const label = [ing.quantity, ing.unit, ing.name].filter(Boolean).join(' ');
          return storage.addGroceryItem({ listId, name: label, autoAdded: true });
        })
      );

      res.json({ added: created.length });
    } catch (error) {
      console.error("Error adding recipe to grocery list:", error);
      res.status(500).json({ message: "Failed to add ingredients to grocery list" });
    }
  });
}
