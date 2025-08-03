
"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app-layout";
import { RoutineCard, RoutineSkeleton } from "@/components/routine-card";
import { Frown } from "lucide-react";
import type { Routine } from "@/types/routine";
import { createClient } from "@/utils/supabase/client";


export default function RoutinesHomePage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoutines = async () => {
      const supabase = createClient();
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("rutinas")
          .select("*")
          .eq("visible", true)
          .eq("entorno", "Casa");

        if (error) {
          throw error;
        }

        setRoutines(data || []);
      } catch (err: any) {
        console.error("Error fetching home routines:", err);
        setError("No se pudieron cargar las rutinas. Por favor, inténtalo de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoutines();
  }, []);

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
            {[...Array(4)].map((_, index) => (
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
