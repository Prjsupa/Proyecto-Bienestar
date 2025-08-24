
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/app-layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, Settings, ClipboardList } from "lucide-react";
import type { UserWithRole } from "@/types/community";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type RegistrationLink = {
    id: 'professional' | 'moderator';
    is_active: boolean;
};

function RegistrationControlCard({
    type,
    links,
    onToggle,
    loading
}: {
    type: 'professional' | 'moderator',
    links: RegistrationLink[],
    onToggle: (id: string, currentState: boolean) => void,
    loading: boolean
}) {
    const [registrationUrl, setRegistrationUrl] = useState('');
    
    useEffect(() => {
        // This code runs only on the client, so window is available.
        setRegistrationUrl(`${window.location.origin}/register/${type}`);
    }, [type]);

    const link = links.find(l => l.id === type);
    const title = type === 'professional' ? 'Registro de Profesionales' : 'Registro de Moderadores';
    const description = `Controla si el enlace de registro para ${type === 'professional' ? 'profesionales' : 'moderadores'} está activo.`;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {loading ? <Skeleton className="h-10 w-1/2" /> : (
                    <div className="flex items-center space-x-4 rounded-md border p-4">
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                                {link?.is_active ? 'Registro Abierto' : 'Registro Cerrado'}
                            </p>
                             {registrationUrl ? (
                                <a href={registrationUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground underline hover:text-primary break-all">
                                    {registrationUrl}
                                </a>
                             ) : (
                                <Skeleton className="h-5 w-full mt-1" />
                             )}
                        </div>
                        <Switch
                            checked={link?.is_active}
                            onCheckedChange={(newState) => onToggle(type, newState)}
                            aria-readonly
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function ManageRegistrationsPage() {
    const [links, setLinks] = useState<RegistrationLink[]>([]);
    const [users, setUsers] = useState<UserWithRole[]>([]);
    const [loadingLinks, setLoadingLinks] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const supabase = createClient();
    const { toast } = useToast();

    const fetchLinks = useCallback(async () => {
        setLoadingLinks(true);
        const { data, error } = await supabase.from('registration_links').select('*');
        if (error) {
            console.error("Error fetching links status:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar el estado de los registros.' });
        } else {
            setLinks(data as RegistrationLink[]);
        }
        setLoadingLinks(false);
    }, [supabase, toast]);

    const fetchUsers = useCallback(async () => {
        setLoadingUsers(true);
        // Replace RPC with a direct select call
        const { data, error } = await supabase
            .from('usuarios')
            .select('*');

        if (error) {
            console.error("Error fetching users:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar la lista de usuarios.' });
        } else {
            setUsers(data as UserWithRole[]);
        }
        setLoadingUsers(false);
    }, [supabase, toast]);

    useEffect(() => {
        fetchLinks();
        fetchUsers();
    }, [fetchLinks, fetchUsers]);

    const handleToggle = async (id: string, newState: boolean) => {
        const originalState = links.find(l => l.id === id)?.is_active;
        // Optimistic UI update
        setLinks(links.map(l => l.id === id ? { ...l, is_active: newState } : l));

        const { error } = await supabase
            .from('registration_links')
            .update({ is_active: newState })
            .eq('id', id);

        if (error) {
            toast({
                variant: 'destructive',
                title: 'Error al actualizar',
                description: 'No se pudo cambiar el estado del registro.',
            });
            // Revert UI on error
            setLinks(links.map(l => l.id === id ? { ...l, is_active: originalState! } : l));
        } else {
            toast({
                title: 'Estado actualizado',
                description: `El registro ahora está ${newState ? 'activo' : 'inactivo'}.`,
            });
        }
    };
    
    const professionals = users.filter(u => u.rol === 1);
    const moderators = users.filter(u => u.rol === 2);

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
                        <UserPlus className="w-8 h-8" />
                        Gestión de Registros
                    </h1>
                    <p className="text-muted-foreground">
                        Activa o desactiva los enlaces de registro y visualiza a los usuarios registrados.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <RegistrationControlCard type="professional" links={links} onToggle={handleToggle} loading={loadingLinks}/>
                    <RegistrationControlCard type="moderator" links={links} onToggle={handleToggle} loading={loadingLinks} />
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardList />
                            Historial de Registros
                        </CardTitle>
                        <CardDescription>
                            Lista de usuarios con roles especiales registrados.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Profesionales ({professionals.length})</h3>
                            <div className="border rounded-lg">
                               <UserHistoryTable users={professionals} loading={loadingUsers} />
                            </div>
                        </div>
                         <div>
                            <h3 className="text-lg font-semibold mb-2">Moderadores ({moderators.length})</h3>
                            <div className="border rounded-lg">
                               <UserHistoryTable users={moderators} loading={loadingUsers} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function UserHistoryTable({ users, loading }: { users: UserWithRole[], loading: boolean }) {
    if (loading) {
        return (
            <div className="p-4">
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-8 w-full" />
            </div>
        );
    }
    
    return (
         <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Correo Electrónico</TableHead>
                    <TableHead>Fecha de Ingreso</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.length > 0 ? (
                    users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name} {user.last_name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{format(new Date(user.created_at), "dd/MM/yyyy HH:mm", { locale: es })}</TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                            No hay usuarios en esta categoría.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}

    