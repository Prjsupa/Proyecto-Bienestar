
"use client";

import Image from "next/image";
import { AppLayout } from "@/components/app-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap } from 'lucide-react';

const recipes = [
  {
    title: "Tostada de Aguacate con Huevo",
    category: "Desayuno",
    time: "10 min",
    availability: "Disponible por 30 días",
    image: "https://placehold.co/600x400.png",
    aiHint: "avocado toast",
  },
  {
    title: "Ensalada de Pollo a la Parrilla",
    category: "Almuerzo",
    time: "25 min",
    availability: "Disponible por 30 días",
    image: "https://placehold.co/600x400.png",
    aiHint: "chicken salad",
  },
  {
    title: "Salmón con Espárragos",
    category: "Cena",
    time: "30 min",
    availability: "Disponible por 30 días",
    image: "https://placehold.co/600x400.png",
    aiHint: "salmon asparagus",
  },
  {
    title: "Tazón de Batido de Bayas",
    category: "Desayuno",
    time: "5 min",
    availability: "Disponible por 30 días",
    image: "https://placehold.co/600x400.png",
    aiHint: "smoothie bowl",
  },
  {
    title: "Tazón de Quinoa Energético",
    category: "Almuerzo",
    time: "20 min",
    availability: "Disponible por 30 días",
    image: "https://placehold.co/600x400.png",
    aiHint: "quinoa bowl",
  },
  {
    title: "Sopa de Lentejas",
    category: "Cena",
    time: "45 min",
    availability: "Disponible por 30 días",
    image: "https://placehold.co/600x400.png",
    aiHint: "lentil soup",
  },
];

export default function RecipesPage() {
  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
            <h1 className="text-3xl font-bold font-headline">Recetas</h1>
            <p className="text-muted-foreground">
                Descubre comidas deliciosas y saludables para energizar tu día.
            </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recipes.map((recipe, index) => (
            <Card key={index} className="overflow-hidden flex flex-col group">
              <CardHeader className="p-0 relative">
                <Image
                  src={recipe.image}
                  alt={recipe.title}
                  width={600}
                  height={400}
                  className="object-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-300"
                  data-ai-hint={recipe.aiHint}
                />
                 <Badge className="absolute top-2 right-2 bg-primary/80 backdrop-blur-sm text-primary-foreground">{recipe.category}</Badge>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <CardTitle className="font-headline text-lg mb-2">{recipe.title}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground gap-4">
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{recipe.time}</span>
                    </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Badge variant="outline" className="w-full justify-center">
                    <Zap className="w-3 h-3 mr-2 text-primary" />
                    {recipe.availability}
                </Badge>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
