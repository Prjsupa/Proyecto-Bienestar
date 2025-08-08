
"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Users, UtensilsCrossed, ArrowRight, Dumbbell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Recipe } from "@/types/recipe";
import type { Routine } from "@/types/routine";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [greeting, setGreeting] = useState("¡Bienvenido!");
  const [loading, setLoading] = useState(true);
  const [dailyRecipe, setDailyRecipe] = useState<Recipe | null>(null);
  const [recipeLoading, setRecipeLoading] = useState(true);
  const [dailyRoutine, setDailyRoutine] = useState<Routine | null>(null);
  const [routineLoading, setRoutineLoading] = useState(true);


  useEffect(() => {
    const supabase = createClient();
    const getUserAndData = async () => {
      setLoading(true);
      setRecipeLoading(true);
      setRoutineLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const name = user.user_metadata?.name || 'Usuario';
        const lastName = user.user_metadata?.last_name || '';
        const fullName = `${name} ${lastName}`.trim();
        
        const hours = new Date().getHours();
        if (hours < 12) setGreeting(`¡Buenos días, ${fullName}!`);
        else if (hours < 18) setGreeting(`¡Buenas tardes, ${fullName}!`);
        else setGreeting(`¡Buenas noches, ${fullName}!`);
      }
      setLoading(false);

      // Fetch Recipe
      const { data: recipeData, error: recipeError } = await supabase
        .from('recetas')
        .select('*')
        .eq('visible', true)
        .order('fecha_publicada', { ascending: false })
        .limit(1)
        .single();
      
      if (recipeError) {
        console.error("Error fetching daily recipe:", recipeError.message);
      } else {
        setDailyRecipe(recipeData);
      }
      setRecipeLoading(false);

      // Fetch Routine
      const { data: routineData, error: routineError } = await supabase
        .from('rutinas')
        .select('*')
        .eq('visible', true)
        .order('fecha', { ascending: false })
        .limit(1)
        .single();

      if (routineError) {
        console.error("Error fetching daily routine:", routineError.message);
      } else {
        setDailyRoutine(routineData);
      }
      setRoutineLoading(false);
    };

    getUserAndData();
  }, []);
  
  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card><CardHeader className="h-24"></CardHeader><CardContent className="h-20"></CardContent></Card>
              <Card><CardHeader className="h-24"></CardHeader><CardContent className="h-20"></CardContent></Card>
            </div>
             <div className="grid gap-6 lg:grid-cols-2">
                <Card><CardContent className="h-40"></CardContent></Card>
                <Card><CardContent className="h-40"></CardContent></Card>
             </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">{greeting}</h1>
          <p className="text-muted-foreground">Aquí tienes tu resumen de bienestar para hoy.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Dumbbell className="w-5 h-5" /> Rutina del Día</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {routineLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                  ) : dailyRoutine ? (
                       <div className="space-y-2">
                          <h3 className="font-semibold font-headline">{dailyRoutine.titulo}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{dailyRoutine.descripcion}</p>
                          <Button asChild variant="link" className="p-0 h-auto">
                              <Link href="/routines/home">Ver Todas las Rutinas <ArrowRight className="w-4 h-4 ml-1" /></Link>
                          </Button>
                      </div>
                  ) : (
                     <p className="text-sm text-muted-foreground">No hay rutinas nuevas hoy. ¡Vuelve mañana!</p>
                  )}
                </CardContent>
            </Card>
          
           <Card className="bg-gradient-to-tr from-primary/80 to-accent/80 text-primary-foreground lg:col-span-2">
              <CardHeader>
                  <CardTitle className="font-headline">Coaching Personalizado</CardTitle>
                  <CardDescription className="text-primary-foreground/80">Tu coach está disponible para ayudarte.</CardDescription>
              </CardHeader>
              <CardContent>
                  <p className="text-sm">{`"¡Recuerda mantenerte hidratado durante tu entrenamiento de hoy, ${user?.user_metadata?.name || 'campeón'}!" - Coach Sarah`}</p>
              </CardContent>
              <CardFooter>
                  <Button variant="secondary" className="bg-background/20 hover:bg-background/30 text-primary-foreground">Chatear con el Coach</Button>
              </CardFooter>
           </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><UtensilsCrossed className="w-5 h-5" /> Receta del Día</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4">
                  {recipeLoading ? (
                    <>
                      <Skeleton className="w-[150px] h-[100px] rounded-lg" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </>
                  ) : dailyRecipe ? (
                    <>
                      <Image 
                          src={dailyRecipe.img_url || "https://placehold.co/400x300.png"}
                          alt={dailyRecipe.titulo}
                          width={150}
                          height={100}
                          className="rounded-lg object-cover"
                          data-ai-hint="recipe food"
                      />
                      <div className="space-y-2">
                          <h3 className="font-semibold font-headline">{dailyRecipe.titulo}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{dailyRecipe.descripcion}</p>
                          <Button asChild variant="link" className="p-0 h-auto">
                              <Link href="/recipes">Ver Todas las Recetas <ArrowRight className="w-4 h-4 ml-1" /></Link>
                          </Button>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No hay recetas nuevas hoy. ¡Vuelve mañana!</p>
                  )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Users className="w-5 h-5" /> Novedades de la Comunidad</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Image src="https://placehold.co/40x40.png" alt="Avatar de usuario" width={40} height={40} className="rounded-full" data-ai-hint="person smiling" />
                        <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Mark R.</span> compartió una nueva técnica de peso muerto.</p>
                    </div>
                     <div className="flex items-center gap-3">
                        <Image src="https://placehold.co/40x40.png" alt="Avatar de usuario" width={40} height={40} className="rounded-full" data-ai-hint="woman jogging" />
                        <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Jane D.</span> está buscando un compañero para correr.</p>
                    </div>
                     <Button asChild variant="link" className="p-0 h-auto">
                        <Link href="/community">Únete a la Conversación <ArrowRight className="w-4 h-4 ml-1" /></Link>
                    </Button>
                </CardContent>
            </Card>
        </div>

      </div>
    </AppLayout>
  );
}
