
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
import { Users, UserCheck, UserCog, MoreVertical, Edit, Home, Dumbbell } from "lucide-react";
import type { UserWithRole } from "@/types/community";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";

function UserTable({
  users,
  loading,
  allowEdit = false,
  onEnvironmentChange,
}: {
  users: UserWithRole[],
  loading: boolean,
  allowEdit?: boolean,
  onEnvironmentChange?: (userId: string, newEnv: 'casa' | 'gimnasio') => void,
}) {

  const renderSkeletons = () => (
    [...Array(5)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        {allowEdit && <>
          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
          <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
        </>}
      </TableRow>
    ))
  );

  return (
    <TableBody>
      {loading ? renderSkeletons() : users.length > 0 ? (
        users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.last_name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{format(new Date(user.created_at), "dd/MM/yyyy HH:mm", { locale: es })}</TableCell>
            {allowEdit && (
              <>
                <TableCell>
                  {user.entorno ? (
                    <Badge variant="outline" className="capitalize">
                      {user.entorno === 'casa' ? <Home className="w-3 h-3 mr-1" /> : <Dumbbell className="w-3 h-3 mr-1" />}
                      {user.entorno}
                    </Badge>
                  ) : <span className="text-muted-foreground">N/A</span>}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Cambiar Entorno</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => onEnvironmentChange?.(user.id, 'casa')}>
                              <Home className="mr-2 h-4 w-4" />
                              <span>Casa</span>
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => onEnvironmentChange?.(user.id, 'gimnasio')}>
                              <Dumbbell className="mr-2 h-4 w-4" />
                              <span>Gimnasio</span>
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </>
            )}
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={allowEdit ? 6 : 4} className="text-center h-24 text-muted-foreground">
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
    setLoading(false);
  }, [supabase, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEnvironmentChange = async (userId: string, newEnv: 'casa' | 'gimnasio') => {
    // Optimistic UI update
    setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, entorno: newEnv } : u));
    
    const { error } = await supabase
      .from('usuarios')
      .update({ entorno: newEnv })
      .eq('id', userId);
      
    if (error) {
      toast({ variant: 'destructive', title: 'Error al actualizar', description: 'No tienes permiso para realizar esta acción.' });
      // Revert UI on error
      fetchUsers();
    } else {
      toast({ title: 'Entorno actualizado', description: 'El entorno del usuario ha sido cambiado.' });
    }
  };

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
              <Users className="w-4 h-4 mr-2" />
              Usuarios ({loading ? '...' : usersByRole.regular.length})
            </TabsTrigger>
            <TabsTrigger value="professionals">
              <UserCheck className="w-4 h-4 mr-2" />
              Profesionales ({loading ? '...' : usersByRole.professional.length})
            </TabsTrigger>
            <TabsTrigger value="moderators">
              <UserCog className="w-4 h-4 mr-2" />
              Moderadores ({loading ? '...' : usersByRole.moderator.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="users">
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Lista de Usuarios Regulares</CardTitle>
                <CardDescription>Usuarios con rol 0. Desde aquí puedes cambiar su entorno de entrenamiento.</CardDescription>
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
                        <TableHead>Entorno</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <UserTable
                      users={usersByRole.regular}
                      loading={loading}
                      allowEdit={true}
                      onEnvironmentChange={handleEnvironmentChange}
                    />
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

    