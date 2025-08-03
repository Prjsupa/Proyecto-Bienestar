
"use client";

import { AppLayout } from "@/components/app-layout";
import { RoutineCard, RoutineSkeleton } from "@/components/routine-card";
import { Frown } from "lucide-react";
import type { Routine } from "@/types/routine";

const mockRoutines: Routine[] = [
    {
      id: '1',
      title: "Full Body en Casa",
      category: "Casa",
      duration: "45 min",
      level: "Intermedio",
      img_url: "https://placehold.co/600x400.png",
      aiHint: "woman doing home workout"
    },
    {
      id: '2',
      title: "Yoga para Principiantes",
      category: "Casa",
      duration: "30 min",
      level: "Principiante",
      img_url: "https://placehold.co/600x400.png",
      aiHint: "person doing yoga at home"
    },
];


export default function RoutinesHomePage() {
  // Replace with actual data fetching later
  const loading = false;
  const error = null;
  const routines = mockRoutines;

  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Rutinas en Casa</h1>
          <p className="text-muted-foreground">
            Entrenamientos que puedes hacer en la comodidad de tu hogar.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <RoutineSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
           <div className="flex flex-col items-center justify-center text-center py-16">
              <Frown className="w-16 h-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">¡Oh, no!</h2>
              <p className="text-muted-foreground">{error}</p>
            </div>
        ) : routines.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {routines.map((routine) => (
              <div key={routine.id} className="cursor-pointer">
                <RoutineCard routine={routine} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <Frown className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No hay rutinas nuevas</h2>
            <p className="text-muted-foreground">
              Parece que no hay rutinas nuevas en este momento. ¡Vuelve a consultar pronto!
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
