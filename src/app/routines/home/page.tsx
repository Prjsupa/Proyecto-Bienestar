
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { AppLayout } from "@/components/app-layout";
import { RoutineCard, RoutineSkeleton } from "@/components/routine-card";
import { RoutineDetailModal } from "@/components/routine-detail-modal";
import { RoutineFormModal } from "@/components/routine-form-modal";
import { Frown, PlusCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Routine } from "@/types/routine";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";

type VisibilityFilter = 'all' | 'visible' | 'not-visible';

export default function RoutinesHomePage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<number | null>(null);
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');
  
  const supabase = createClient();
  const { toast } = useToast();

  const fetchRoutines = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("rutinas")
        .select("*")
        .ilike("entorno", "casa")
        .order("fecha", { ascending: false });

      if (error) throw error;
      setRoutines(data || []);
    } catch (err: any) {
      console.error("Error fetching home routines:", err);
      setError("No se pudieron cargar las rutinas. Por favor, inténtalo de nuevo más tarde.");
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
      await fetchRoutines();
    };
    fetchUserAndData();
  }, [fetchRoutines, supabase]);

  const filteredRoutines = useMemo(() => {
    if (visibilityFilter === 'all' || userRole !== 1) {
      return routines;
    }
    if (visibilityFilter === 'visible') {
      return routines.filter(r => r.visible);
    }
    return routines.filter(r => !r.visible);
  }, [routines, visibilityFilter, userRole]);

  const handleRoutineClick = (routine: Routine) => {
    setSelectedRoutine(routine);
    setIsDetailModalOpen(true);
  };
  
  const handleOpenFormModal = (routine: Routine | null = null) => {
    setEditingRoutine(routine);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingRoutine(null);
  };

  const handleDeleteRoutine = async (routineId: string) => {
    const { error } = await supabase.from('rutinas').delete().eq('id', routineId);
    if (error) {
      toast({ variant: 'destructive', title: 'Error al eliminar', description: error.message });
    } else {
      toast({ title: 'Rutina eliminada' });
      await fetchRoutines();
    }
  };
  
  const isProfessional = userRole === 1;

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold font-headline">Rutinas en Casa</h1>
            <p className="text-muted-foreground">
              Entrenamientos que puedes hacer en la comodidad de tu hogar.
            </p>
          </div>
           {isProfessional && (
            <div className="flex flex-col-reverse sm:flex-row items-end sm:items-center gap-4 w-full sm:w-auto">
                <Tabs value={visibilityFilter} onValueChange={(value) => setVisibilityFilter(value as VisibilityFilter)}>
                    <TabsList>
                        <TabsTrigger value="all">Todas</TabsTrigger>
                        <TabsTrigger value="visible">Visibles</TabsTrigger>
                        <TabsTrigger value="not-visible">No Visibles</TabsTrigger>
                    </TabsList>
                </Tabs>
                <Button onClick={() => handleOpenFormModal()} className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Rutina
                </Button>
            </div>
          )}
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
        ) : filteredRoutines.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRoutines.map((routine) => (
              <div key={routine.id} className="relative group/card">
                <div onClick={() => handleRoutineClick(routine)} className="cursor-pointer h-full">
                  <RoutineCard routine={routine} isProfessional={isProfessional} />
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
                              <DropdownMenuItem onClick={() => handleOpenFormModal(routine)}>
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
                                        <AlertDialogDescription>Esta acción no se puede deshacer. Esto eliminará permanentemente la rutina.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteRoutine(routine.id)}>
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
            <h2 className="text-xl font-semibold mb-2">No hay rutinas nuevas</h2>
            <p className="text-muted-foreground">
              Parece que no hay rutinas nuevas en este momento. ¡Vuelve a consultar pronto!
            </p>
          </div>
        )}
      </div>
      <RoutineDetailModal routine={selectedRoutine} isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} />
      {isProfessional && currentUser && (
        <RoutineFormModal
            isOpen={isFormModalOpen}
            onClose={handleCloseFormModal}
            onSuccess={() => {
                fetchRoutines();
                handleCloseFormModal();
            }}
            routine={editingRoutine}
            userId={currentUser.id}
            environment="casa"
        />
      )}
    </AppLayout>
  );
}
