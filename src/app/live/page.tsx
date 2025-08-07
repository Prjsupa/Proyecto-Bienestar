
"use client";

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AppLayout } from "@/components/app-layout";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, Frown } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import type { ClaseEnVivo } from '@/types/community';

function LiveSessionSkeleton() {
    return (
        <Card className="overflow-hidden flex flex-col group">
            <CardHeader className="p-0 relative">
                <Skeleton className="w-full aspect-[16/9]" />
            </CardHeader>
            <CardContent className="p-4 flex-grow space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full mt-2" />
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Skeleton className="h-6 w-full" />
            </CardFooter>
        </Card>
    )
}

export default function LivePage() {
    const [sessions, setSessions] = useState<ClaseEnVivo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSessions = async () => {
            const supabase = createClient();
            setLoading(true);
            const { data, error } = await supabase
                .from('clases_en_vivo')
                .select('*')
                .order('fecha_hora', { ascending: true });
            
            if (error) {
                console.error("Error fetching live sessions:", error);
                setError("No se pudieron cargar las sesiones en vivo.");
            } else {
                setSessions(data);
            }
            setLoading(false);
        }

        fetchSessions();
    }, []);


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
          {loading ? (
             [...Array(4)].map((_, i) => <LiveSessionSkeleton key={i} />)
          ) : error ? (
            <div className="col-span-full flex flex-col items-center justify-center text-center py-16">
              <Frown className="w-16 h-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">¡Oh, no!</h2>
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : sessions.length === 0 ? (
             <div className="col-span-full flex flex-col items-center justify-center text-center py-16">
              <Video className="w-16 h-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No hay clases programadas</h2>
              <p className="text-muted-foreground">
                Vuelve a consultar pronto para ver nuevas sesiones en vivo.
              </p>
            </div>
          ) : (
            sessions.map((session) => {
                const isLive = new Date() >= new Date(session.fecha_hora) && new Date() <= new Date(session.disponible_hasta);

                return (
                    <Link key={session.id} href={session.link || '#'} target="_blank" rel="noopener noreferrer" className="flex">
                        <Card className="overflow-hidden flex flex-col group w-full transition-all duration-300 hover:shadow-primary/20 hover:shadow-lg hover:-translate-y-1">
                            <CardHeader className="p-0 relative">
                                <Image
                                src={session.miniatura || "https://placehold.co/600x400.png"}
                                alt={session.titulo}
                                width={600}
                                height={400}
                                className="object-cover aspect-video group-hover:scale-105 transition-transform duration-300"
                                />
                                {isLive && <Badge className="absolute top-2 right-2 bg-destructive/90 backdrop-blur-sm text-destructive-foreground animate-pulse">EN VIVO</Badge>}
                            </CardHeader>
                            <CardContent className="p-4 flex-grow">
                                <CardTitle className="font-headline text-lg mb-2">{session.titulo}</CardTitle>
                                {session.descripcion && <p className="text-sm text-muted-foreground line-clamp-2">{session.descripcion}</p>}
                                <div className="flex flex-col text-sm text-muted-foreground gap-2 pt-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        <span>{format(new Date(session.fecha_hora), "dd 'de' MMMM, yyyy", { locale: es })}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-primary" />
                                        <span>{format(new Date(session.fecha_hora), "HH:mm 'hrs'", { locale: es })}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="p-4 pt-0">
                                <p className="text-xs text-muted-foreground">
                                    Repetición hasta: {format(new Date(session.disponible_hasta), "dd/MM/yy", { locale: es })}
                                </p>
                            </CardFooter>
                        </Card>
                    </Link>
                )
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
