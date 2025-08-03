
"use client";

import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Recipe } from '@/types/recipe';
import { List, ChefHat } from 'lucide-react';

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RecipeDetailModal({ recipe, isOpen, onClose }: RecipeDetailModalProps) {
  if (!recipe) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-1">
            <div className="relative w-full h-64 md:h-80 rounded-t-lg overflow-hidden">
                <Image
                src={recipe.img_url || "https://placehold.co/800x600.png"}
                alt={recipe.titulo}
                layout="fill"
                objectFit="cover"
                className="object-cover"
                data-ai-hint="delicious recipe"
                />
            </div>
            <div className="p-6">
                <DialogHeader className="mb-4">
                    <Badge variant="secondary" className="w-fit mb-2">{recipe.categoria}</Badge>
                    <DialogTitle className="text-3xl font-headline text-left">{recipe.titulo}</DialogTitle>
                    <p className="text-sm text-muted-foreground pt-2 text-left">{recipe.descripcion}</p>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 my-6">
                    <div className="md:col-span-2">
                        <h3 className="font-headline text-xl mb-3 flex items-center gap-2">
                            <List className="w-5 h-5 text-primary"/>
                            Ingredientes
                        </h3>
                        <p className="text-muted-foreground whitespace-pre-wrap">{recipe.ingredientes}</p>
                    </div>
                    <div className="md:col-span-3">
                        <h3 className="font-headline text-xl mb-3 flex items-center gap-2">
                            <ChefHat className="w-5 h-5 text-primary"/>
                            Instrucciones
                        </h3>
                        <div className="text-muted-foreground whitespace-pre-wrap prose prose-sm prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 dark:prose-invert" dangerouslySetInnerHTML={{ __html: recipe.instrucciones }} />
                    </div>
                </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
