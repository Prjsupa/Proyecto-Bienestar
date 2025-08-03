
import Link from 'next/link';
import Image from 'next/image';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { AppLayout } from "@/components/app-layout";
import { createClient } from '@/utils/supabase/server';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, UtensilsCrossed, Dumbbell, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const workoutProgress = 60;
const mealProgress = 57;

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile, error: profileError } = await supabase
    .from('usuarios')
    .select('name, last_name')
    .eq('id', user.id)
    .single();

  if (profileError && !profile) {
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

  const userName = profile?.name || user.email;
  const userLastName = profile?.last_name || '';
  const hours = new Date().getHours();
  let greeting = "¡Bienvenido!";
  if (hours < 12) greeting = `¡Buenos días, ${userName} ${userLastName}!`;
  else if (hours < 18) greeting = `¡Buenas tardes, ${userName} ${userLastName}!`;
  else greeting = `¡Buenas noches, ${userName} ${userLastName}!`;

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
              <CardTitle className="font-headline">Progreso Semanal</CardTitle>
              <CardDescription>¡Lo estás haciendo genial esta semana!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                    <span>Entrenamientos</span>
                    <span>3/5</span>
                </div>
                <Progress value={workoutProgress} aria-label={`${workoutProgress}% de los entrenamientos completados`} />
                <div className="flex justify-between text-sm font-medium pt-2">
                    <span>Comidas Saludables</span>
                    <span>12/21</span>
                </div>
                <Progress value={mealProgress} aria-label={`${mealProgress}% de las comidas saludables`} />
            </CardContent>
          </Card>
          
           <Card className="bg-gradient-to-tr from-primary/80 to-accent/80 text-primary-foreground lg:col-span-2">
              <CardHeader>
                  <CardTitle className="font-headline">Coaching Personalizado</CardTitle>
                  <CardDescription className="text-primary-foreground/80">Tu coach está disponible para ayudarte.</CardDescription>
              </CardHeader>
              <CardContent>
                  <p className="text-sm">"¡Recuerda mantenerte hidratado durante tu entrenamiento de hoy, {userName}!" - Coach Sarah</p>
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
                    <Image 
                        src="https://placehold.co/400x300.png"
                        alt="Receta"
                        width={150}
                        height={100}
                        className="rounded-lg object-cover"
                        data-ai-hint="quinoa salad"
                    />
                    <div className="space-y-2">
                        <h3 className="font-semibold font-headline">Ensalada de Quinoa y Aguacate</h3>
                        <p className="text-sm text-muted-foreground">Una comida refrescante y llena de proteínas, perfecta para el almuerzo.</p>
                        <Button asChild variant="link" className="p-0 h-auto">
                            <Link href="/recipes">Ver Receta <ArrowRight className="w-4 h-4 ml-1" /></Link>
                        </Button>
                    </div>
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
