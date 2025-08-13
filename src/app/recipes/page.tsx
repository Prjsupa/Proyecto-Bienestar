
"use client";

import { useState, useEffect, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { AppLayout } from "@/components/app-layout";
import { createClient } from "@/utils/supabase/client";
import { RecipeCard, RecipeSkeleton } from "@/components/recipe-card";
import { RecipeDetailModal } from "@/components/recipe-detail-modal";
import { RecipeFormModal } from "@/components/recipe-form-modal";
import { Frown, PlusCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import type { Recipe } from "@/types/recipe";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<number | null>(null);

  const supabase = createClient();
  const { toast } = useToast();

  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      // La RLS se encarga de filtrar qué recetas se devuelven
      // según el rol del usuario (profesionales ven todo, usuarios solo las visibles).
      const { data, error } = await supabase
        .from("recetas")
        .select("*")
        .order("fecha", { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (err: any) {
      console.error("Error fetching recipes:", err);
      setError("No se pudieron cargar las recetas. Por favor, inténtalo de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    const fetchUserAndData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      if (user) {
        const { data: profile } = await supabase.from('usuarios').select('rol').eq('id', user.id).single();
        if (profile) setUserRole(profile.rol);
      }
      fetchRecipes();
    };
    fetchUserAndData();
  }, [fetchRecipes, supabase]);

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedRecipe(null);
  };
  
  const handleOpenFormModal = (recipe: Recipe | null = null) => {
    setEditingRecipe(recipe);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingRecipe(null);
  };
  
  const handleDeleteRecipe = async (recipeId: string) => {
    const { error } = await supabase.from('recetas').delete().eq('id', recipeId);
    if (error) {
      toast({ variant: 'destructive', title: 'Error al eliminar', description: error.message });
    } else {
      toast({ title: 'Receta eliminada' });
      fetchRecipes();
    }
  };
  
  const isProfessional = userRole === 1;

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold font-headline">Recetas</h1>
            <p className="text-muted-foreground">
              Descubre comidas deliciosas y saludables para energizar tu día.
            </p>
          </div>
          {isProfessional && (
            <Button onClick={() => handleOpenFormModal()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Receta
            </Button>
          )}
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
              <div key={recipe.id} className="relative group/card">
                 <div onClick={() => handleRecipeClick(recipe)} className="cursor-pointer h-full">
                    <RecipeCard recipe={recipe} isProfessional={isProfessional} />
                 </div>
                 {isProfessional && (
                    <div className="absolute top-2 left-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full">
                                  <MoreHorizontal className="h-4 w-4" />
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleOpenFormModal(recipe)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Editar</span>
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      <span>Eliminar</span>
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                        <AlertDialogDescription>Esta acción no se puede deshacer. Esto eliminará permanentemente la receta.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteRecipe(recipe.id)}>
                                            Continuar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                          </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
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
      <RecipeDetailModal recipe={selectedRecipe} isOpen={isDetailModalOpen} onClose={handleCloseDetailModal} />
      {isProfessional && currentUser && (
        <RecipeFormModal 
            isOpen={isFormModalOpen}
            onClose={handleCloseFormModal}
            onSuccess={() => {
                fetchRecipes();
                handleCloseFormModal();
            }}
            recipe={editingRecipe}
            userId={currentUser.id}
        />
      )}
    </AppLayout>
  );
}
