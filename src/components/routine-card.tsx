
"use client";

import Image from "next/image";
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
      <CardHeader className="p-0 relative">
        <Image
          src={routine.img_url || "https://placehold.co/600x400.png"}
          alt={routine.titulo}
          width={600}
          height={400}
          className="object-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-300"
          data-ai-hint={`${routine.entorno} workout`}
        />
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col">
        <CardTitle className="font-headline text-lg mb-2">{routine.titulo}</CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2 flex-grow">{routine.descripcion}</p>
        
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-2 flex-col items-start gap-2">
         <div className="flex items-center text-sm text-muted-foreground gap-2">
            <Wrench className="w-4 h-4" />
            <span className="font-semibold">Equipo:</span>
            <span>{routine.equipo}</span>
        </div>
         <Badge variant="outline" className="w-full justify-center mt-2">
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
