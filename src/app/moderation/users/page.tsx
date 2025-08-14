
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AppLayout } from "@/components/app-layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, UserCog } from "lucide-react";
import type { UserWithRole } from "@/types/community";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

function UserTable({ users, loading }: { users: UserWithRole[], loading: boolean }) {
    if (loading) {
        return (
            <TableBody>
                {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        )
    }

    return (
        <TableBody>
            {users.length > 0 ? (
                users.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.last_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{format(new Date(user.created_at), "dd/MM/yyyy HH:mm", { locale: es })}</TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                        No hay usuarios en esta categoría.
                    </TableCell>
                </TableRow>
            )}
        </TableBody>
    )
}


export default function ManageUsersPage() {
    const [users, setUsers] = useState<UserWithRole[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const { toast } = useToast();

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.rpc('get_all_users_with_details');

        if (error) {
            console.error("Error fetching users:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar la lista de usuarios.' });
        } else {
            setUsers(data as UserWithRole[]);
        }
        setLoading(false);
    }, [supabase, toast]);

    useEffect(() => {
        // We need a Supabase function to join public.usuarios with auth.users to get created_at
        // This is a security-conscious way to do it.
        // You'll need to run the SQL provided in the chat to create this function.
        fetchUsers();
    }, [fetchUsers]);

    const usersByRole = useMemo(() => {
        return {
            regular: users.filter(u => u.rol === 0),
            professional: users.filter(u => u.rol === 1),
            moderator: users.filter(u => u.rol === 2),
        }
    }, [users]);

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto">
                <div className="space-y-2 mb-8">
                    <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
                        <Users className="w-8 h-8" />
                        Gestión de Usuarios
                    </h1>
                    <p className="text-muted-foreground">
                        Visualiza a todos los usuarios de la plataforma, separados por su rol.
                    </p>
                </div>
                <Tabs defaultValue="users" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="users">
                            <Users className="w-4 h-4 mr-2"/>
                            Usuarios ({loading ? '...' : usersByRole.regular.length})
                        </TabsTrigger>
                        <TabsTrigger value="professionals">
                            <UserCheck className="w-4 h-4 mr-2"/>
                            Profesionales ({loading ? '...' : usersByRole.professional.length})
                        </TabsTrigger>
                        <TabsTrigger value="moderators">
                            <UserCog className="w-4 h-4 mr-2"/>
                            Moderadores ({loading ? '...' : usersByRole.moderator.length})
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="users">
                         <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Lista de Usuarios Regulares</CardTitle>
                                <CardDescription>Usuarios con rol 0.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="border rounded-lg">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nombre</TableHead>
                                                <TableHead>Apellido</TableHead>
                                                <TableHead>Correo Electrónico</TableHead>
                                                <TableHead>Fecha de Ingreso</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <UserTable users={usersByRole.regular} loading={loading} />
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="professionals">
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Lista de Profesionales</CardTitle>
                                <CardDescription>Usuarios con rol 1.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="border rounded-lg">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nombre</TableHead>
                                                <TableHead>Apellido</TableHead>
                                                <TableHead>Correo Electrónico</TableHead>
                                                <TableHead>Fecha de Ingreso</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <UserTable users={usersByRole.professional} loading={loading} />
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="moderators">
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Lista de Moderadores</CardTitle>
                                <CardDescription>Usuarios con rol 2.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="border rounded-lg">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nombre</TableHead>
                                                <TableHead>Apellido</TableHead>
                                                <TableHead>Correo Electrónico</TableHead>
                                                <TableHead>Fecha de Ingreso</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                       <UserTable users={usersByRole.moderator} loading={loading} />
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    )
}
