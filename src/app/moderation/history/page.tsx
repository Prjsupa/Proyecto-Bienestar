
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AppLayout } from "@/components/app-layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert } from "lucide-react";
import type { ModerationActionWithNames } from "@/types/community";

export default function ModerationHistoryPage() {
    const [actions, setActions] = useState<ModerationActionWithNames[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const { toast } = useToast();

    const fetchActions = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('accion_moderador')
            .select(`
                *,
                moderador:moderador_id ( name, last_name ),
                usuario_afectado:user_id ( name, last_name )
            `)
            .order('fecha', { ascending: false });
        
        if (error) {
            console.error("Error fetching moderation actions:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar el historial.' });
        } else {
            setActions(data as any[]);
        }
        setLoading(false);
    }, [supabase, toast]);

    useEffect(() => {
        fetchActions();
    }, [fetchActions]);

    const renderSkeletons = () => (
        <TableBody>
            {[...Array(10)].map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                </TableRow>
            ))}
        </TableBody>
    );

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto">
                <div className="space-y-2 mb-8">
                    <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
                        <ShieldAlert className="w-8 h-8" />
                        Historial de Moderación
                    </h1>
                    <p className="text-muted-foreground">
                        Registro de todas las acciones de moderación realizadas en la plataforma.
                    </p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Acciones Recientes</CardTitle>
                        <CardDescription>
                            Mostrando las últimas {actions.length} acciones de moderación.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Moderador</TableHead>
                                        <TableHead>Usuario Afectado</TableHead>
                                        <TableHead>Acción</TableHead>
                                        <TableHead>Sección</TableHead>
                                        <TableHead>Razón</TableHead>
                                        <TableHead>Fecha</TableHead>
                                    </TableRow>
                                </TableHeader>
                                {loading ? renderSkeletons() : (
                                    <TableBody>
                                        {actions.length > 0 ? (
                                            actions.map((action) => {
                                                const moderatorName = action.moderador ? `${action.moderador.name} ${action.moderador.last_name}` : 'N/A';
                                                const userName = action.usuario_afectado ? `${action.usuario_afectado.name} ${action.usuario_afectado.last_name}` : 'N/A';
                                                
                                                return (
                                                    <TableRow key={action.id}>
                                                        <TableCell className="font-medium">{moderatorName}</TableCell>
                                                        <TableCell>{userName}</TableCell>
                                                        <TableCell>{action.accion}</TableCell>
                                                        <TableCell>{action.seccion}</TableCell>
                                                        <TableCell className="max-w-xs truncate">{action.razon}</TableCell>
                                                        <TableCell>{format(new Date(action.fecha), "dd/MM/yyyy HH:mm", { locale: es })}</TableCell>
                                                    </TableRow>
                                                )
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                                    No hay acciones de moderación registradas.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                )}
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
