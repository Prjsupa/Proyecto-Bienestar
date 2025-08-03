
"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UtensilsCrossed } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import type { Recipe } from "@/types/recipe";

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col group h-full transition-shadow hover:shadow-lg">
      <CardHeader className="p-0 relative">
        <Image
          src={recipe.img_url || "https://placehold.co/600x400.png"}
          alt={recipe.titulo}
          width={600}
          height={400}
          className="object-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-300"
          data-ai-hint="recipe food"
        />
        <Badge className="absolute top-2 right-2 bg-primary/80 backdrop-blur-sm text-primary-foreground">
          {recipe.categoria}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col">
        <CardTitle className="font-headline text-lg mb-2">{recipe.titulo}</CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2 flex-grow">{recipe.descripcion}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-2">
         <Badge variant="outline" className="w-full justify-center">
            <UtensilsCrossed className="w-3 h-3 mr-2 text-primary" />
            Ver Receta
        </Badge>
      </CardFooter>
    </Card>
  );
}

export function RecipeSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHeader className="p-0">
        <Skeleton className="w-full aspect-[4/3]" />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6 mt-1" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
         <Skeleton className="h-6 w-full" />
      </CardFooter>
    </Card>
  )
}
