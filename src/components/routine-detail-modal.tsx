
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Routine } from '@/types/routine';
import { Dumbbell, Wrench, ListChecks } from 'lucide-react';

interface RoutineDetailModalProps {
  routine: Routine | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RoutineDetailModal({ routine, isOpen, onClose }: RoutineDetailModalProps) {
  if (!routine) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-1">
            <DialogHeader className="p-6">
                <DialogTitle className="text-3xl font-headline">{routine.titulo}</DialogTitle>
                <p className="text-sm text-muted-foreground pt-2">{routine.descripcion}</p>
            </DialogHeader>

            <div className="px-6 pb-6 space-y-6">
                <div>
                    <h3 className="font-headline text-xl mb-3 flex items-center gap-2">
                        <Wrench className="w-5 h-5 text-primary"/>
                        Equipo Necesario
                    </h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{routine.equipo}</p>
                </div>
                <div>
                    <h3 className="font-headline text-xl mb-3 flex items-center gap-2">
                        <ListChecks className="w-5 h-5 text-primary"/>
                        Ejercicios
                    </h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{routine.ejercicios}</p>
                </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
