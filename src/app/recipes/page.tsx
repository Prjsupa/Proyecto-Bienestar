
"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app-layout";
import { createClient } from "@/utils/supabase/client";
import { RecipeCard, RecipeSkeleton } from "@/components/recipe-card";
import { RecipeDetailModal } from "@/components/recipe-detail-modal";
import { Frown } from "lucide-react";
import type { Recipe } from "@/types/recipe";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchRecipes = async () => {
      const supabase = createClient();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("recetas")
          .select("*")
          .eq("visible", true)
          .gte("fecha", thirtyDaysAgo.toISOString())
          .order("fecha", { ascending: false });

        if (error) {
          throw error;
        }

        setRecipes(data || []);
      } catch (err: any) {
        console.error("Error fetching recipes:", err);
        setError("No se pudieron cargar las recetas. Por favor, inténtalo de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsModalOpen(true);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecipe(null);
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Recetas</h1>
          <p className="text-muted-foreground">
            Descubre comidas deliciosas y saludables para energizar tu día.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <RecipeSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
           <div className="flex flex-col items-center justify-center text-center py-16">
              <Frown className="w-16 h-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">¡Oh, no!</h2>
              <p className="text-muted-foreground">{error}</p>
            </div>
        ) : recipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map((recipe) => (
              <div key={recipe.id} onClick={() => handleRecipeClick(recipe)} className="cursor-pointer">
                <RecipeCard recipe={recipe} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <Frown className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No hay recetas nuevas</h2>
            <p className="text-muted-foreground">
              Parece que no hay recetas nuevas en este momento. ¡Vuelve a consultar pronto!
            </p>
          </div>
        )}
      </div>
      <RecipeDetailModal recipe={selectedRecipe} isOpen={isModalOpen} onClose={handleCloseModal} />
    </AppLayout>
  );
}
