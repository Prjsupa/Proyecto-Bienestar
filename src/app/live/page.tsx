"use client";

import Image from "next/image";
import { AppLayout } from "@/components/app-layout";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Zap } from 'lucide-react';

const liveSessions = [
  {
    title: "HIIT a máxima intensidad",
    instructor: "Coach Sarah",
    date: "Lunes 18:00",
    availability: "Disponible por 7 días",
    image: "https://placehold.co/600x400.png",
    aiHint: "woman doing HIIT",
  },
  {
    title: "Yoga para la flexibilidad",
    instructor: "Jane Doe",
    date: "Martes 08:00",
    availability: "Disponible por 7 días",
    image: "https://placehold.co/600x400.png",
    aiHint: "woman doing yoga",
  },
  {
    title: "Taller de Nutrición: Meal Prep",
    instructor: "Dr. Emily Carter",
    date: "Miércoles 12:00",
    availability: "Disponible por 7 días",
    image: "https://placehold.co/600x400.png",
    aiHint: "healthy meal prep",
  },
  {
    title: "Fuerza y Acondicionamiento",
    instructor: "Carlos Rodriguez",
    date: "Jueves 19:00",
    availability: "Disponible por 7 días",
    image: "https://placehold.co/600x400.png",
    aiHint: "man lifting weights",
  },
];

export default function LivePage() {
  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
            <h1 className="text-3xl font-bold font-headline">Clases en Vivo</h1>
            <p className="text-muted-foreground">
                Únete a nuestras sesiones en vivo o ponte al día con las grabaciones.
            </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {liveSessions.map((session, index) => (
            <Card key={index} className="overflow-hidden flex flex-col group">
              <CardHeader className="p-0 relative">
                <Image
                  src={session.image}
                  alt={session.title}
                  width={600}
                  height={400}
                  className="object-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-300"
                  data-ai-hint={session.aiHint}
                />
                 <Badge className="absolute top-2 right-2 bg-destructive/80 backdrop-blur-sm text-destructive-foreground animate-pulse">EN VIVO</Badge>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <CardTitle className="font-headline text-lg mb-2">{session.title}</CardTitle>
                <div className="flex flex-col text-sm text-muted-foreground gap-2">
                    <p className="font-semibold text-primary">{session.instructor}</p>
                    <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{session.date}</span>
                    </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Badge variant="outline" className="w-full justify-center">
                    <Zap className="w-3 h-3 mr-2 text-primary" />
                    {session.availability}
                </Badge>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
