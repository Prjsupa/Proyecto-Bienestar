
"use client";

import { useState, useEffect, useCallback } from 'react';
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
import { Calendar, Clock, Video, Frown, PlusCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { ClaseEnVivo } from '@/types/community';
import type { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { LiveSessionFormModal } from '@/components/live-session-form-modal';


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
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<number | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState<ClaseEnVivo | null>(null);

    const supabase = createClient();
    const { toast } = useToast();

    const fetchSessions = useCallback(async () => {
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
    }, [supabase]);

    useEffect(() => {
        const fetchUserAndData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
            if (user) {
                const { data: profile } = await supabase.from('usuarios').select('rol').eq('id', user.id).single();
                if (profile) setUserRole(profile.rol);
            }
            await fetchSessions();
        };
        fetchUserAndData();
    }, [fetchSessions, supabase]);

    const handleOpenFormModal = (session: ClaseEnVivo | null = null) => {
        setEditingSession(session);
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setEditingSession(null);
    };

    const handleDeleteSession = async (sessionId: string) => {
        const { error } = await supabase.from('clases_en_vivo').delete().eq('id', sessionId);
        if (error) {
            toast({ variant: 'destructive', title: 'Error al eliminar', description: error.message });
        } else {
            toast({ title: 'Clase eliminada' });
            await fetchSessions();
        }
    };
    
    const isProfessional = userRole === 1;

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
                <h1 className="text-3xl font-bold font-headline">Clases en Vivo</h1>
                <p className="text-muted-foreground">
                    Únete a nuestras sesiones en vivo o ponte al día con las grabaciones.
                </p>
            </div>
            {isProfessional && (
                <Button onClick={() => handleOpenFormModal()}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Clase
                </Button>
            )}
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
                    <div key={session.id} className="relative group/card flex">
                        <Link href={session.link || '#'} target="_blank" rel="noopener noreferrer" className="flex w-full">
                            <Card className="overflow-hidden flex flex-col group w-full transition-all duration-300 hover:shadow-primary/20 hover:shadow-lg hover:-translate-y-1">
                                <CardHeader className="p-0 relative">
                                    <Image
                                    src={session.miniatura || "https://placehold.co/600x400.png"}
                                    alt={session.titulo}
                                    width={600}
                                    height={400}
                                    className="object-cover aspect-video group-hover:scale-105 transition-transform duration-300"
                                    data-ai-hint="fitness class yoga"
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
                         {isProfessional && (
                            <div className="absolute top-2 left-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => handleOpenFormModal(session)}>
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
                                                    <AlertDialogDescription>Esta acción no se puede deshacer. Esto eliminará permanentemente la clase.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteSession(session.id)}>
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
                )
            })
          )}
        </div>
      </div>
       {isProfessional && currentUser && (
        <LiveSessionFormModal 
            isOpen={isFormModalOpen}
            onClose={handleCloseFormModal}
            onSuccess={() => {
                fetchSessions();
                handleCloseFormModal();
            }}
            session={editingSession}
            userId={currentUser.id}
        />
      )}
    </AppLayout>
  );
}
