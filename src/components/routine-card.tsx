
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Wrench } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import type { Routine } from "@/types/routine";

interface RoutineCardProps {
  routine: Routine;
}

export function RoutineCard({ routine }: RoutineCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col group h-full transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-lg">{routine.titulo}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <p className="text-sm text-muted-foreground line-clamp-3 flex-grow">{routine.descripcion}</p>
         <div className="flex items-center text-sm text-muted-foreground gap-2 pt-4">
            <Wrench className="w-4 h-4" />
            <span className="font-semibold">Equipo:</span>
            <span className="truncate">{routine.equipo}</span>
        </div>
      </CardContent>
      <CardFooter>
         <Badge variant="outline" className="w-full justify-center">
            <Dumbbell className="w-4 h-4 mr-2 text-primary" />
            Ver Rutina
        </Badge>
      </CardFooter>
    </Card>
  );
}

export function RoutineSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col">
       <CardHeader>
        <Skeleton className="h-5 w-3/4" />
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="pt-4">
            <Skeleton className="h-5 w-1/2" />
        </div>
      </CardContent>
      <CardFooter>
         <Skeleton className="h-8 w-full" />
      </CardFooter>
    </Card>
  )
}
