
"use client";

import { AppLayout } from "@/components/app-layout";
import { RoutineCard, RoutineSkeleton } from "@/components/routine-card";
import { Frown } from "lucide-react";
import type { Routine } from "@/types/routine";

const mockRoutines: Routine[] = [
    {
      id: '1',
      title: "Tren Superior de Acero",
      category: "Gimnasio",
      duration: "60 min",
      level: "Avanzado",
      img_url: "https://placehold.co/600x400.png",
      aiHint: "man lifting weights gym"
    },
    {
      id: '2',
      title: "Día de Pierna",
      category: "Gimnasio",
      duration: "75 min",
      level: "Intermedio",
      img_url: "https://placehold.co/600x400.png",
      aiHint: "person doing squats"
    },
];

export default function RoutinesGymPage() {
  // Replace with actual data fetching later
  const loading = false;
  const error = null;
  const routines = mockRoutines;

  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Rutinas de Gimnasio</h1>
          <p className="text-muted-foreground">
            Lleva tu entrenamiento al siguiente nivel en el gimnasio.
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
