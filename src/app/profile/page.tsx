
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { AppLayout } from "@/components/app-layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { HealthFormData } from "@/types/health-form";
import { HealthFormModal } from "@/components/profile/health-form-modal";
import { FileText } from "lucide-react";

function ProfileSkeleton() {
    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto">
                <div className="space-y-2 mb-8">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-4 w-2/5" />
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="flex items-center gap-6">
                            <Skeleton className="h-24 w-24 rounded-full" />
                            <div className="space-y-2">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-48" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
      </AppLayout>
    )
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [title, setTitle] = useState("");
  const [role, setRole] = useState<number | null>(null);
  const [healthData, setHealthData] = useState<HealthFormData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  
  const fetchHealthData = async (userId: string) => {
    const { data: formData, error: formError } = await supabase
        .from('formulario')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
    
    if (formError) {
        console.error('Error fetching health form:', formError);
    } else {
        setHealthData(formData);
    }
  }

  useEffect(() => {
    setLoading(true);
    const getUserData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUser(user);
            
            const { data: profileData, error: profileError } = await supabase
              .from('usuarios')
              .select('name, last_name, rol, titulo')
              .eq('id', user.id)
              .single();

            if (profileError) {
              console.error('Error fetching user profile:', profileError);
              toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar tu perfil.' });
            } else if (profileData) {
              setName(profileData.name || user.user_metadata?.name || "");
              setLastName(profileData.last_name || user.user_metadata?.last_name || "");
              setTitle(profileData.titulo || "");
              setRole(profileData.rol || 0);

              if(profileData.rol === 0) {
                await fetchHealthData(user.id);
              }
            }
        } else {
            router.push('/login');
        }
        setLoading(false);
    };
    
    getUserData();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session?.user) {
          router.push("/login");
        }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase, toast]);

  const getInitials = (name: string, lastName: string) => {
    if (name && lastName) return `${name[0]}${lastName[0]}`.toUpperCase();
    if (name) return name.substring(0, 2).toUpperCase();
    return "US";
  }

  const handleSaveChanges = async () => {
    if (!user) return;
    setIsSaving(true);
    
    const profileDataToUpdate: { [key: string]: any } = { 
        name: name, 
        last_name: lastName,
    };

    if (role === 1) {
        profileDataToUpdate.titulo = title;
    }

    const { error } = await supabase
      .from('usuarios')
      .update(profileDataToUpdate)
      .eq('id', user.id);

    if (error) {
      toast({
        title: "Error al actualizar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      await supabase.auth.updateUser({
        data: { name, last_name: lastName }
      });
      
      toast({
        title: "Perfil Actualizado",
        description: "Tu información ha sido guardada correctamente.",
      });
      router.refresh();
    }
    setIsSaving(false);
  };

  const displayName = name && lastName ? `${name} ${lastName}` : name || user?.email || "Usuario";

  if (loading) {
    return <ProfileSkeleton />;
  }
  
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold font-headline">Mi Perfil</h1>
            <p className="text-muted-foreground">
                Gestiona la información de tu cuenta y tu plan de bienestar.
            </p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>Estos datos se mostrarán en tu perfil público.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <Avatar className="h-24 w-24">
                            <AvatarFallback className="text-3xl">{getInitials(name, lastName)}</AvatarFallback>
                        </Avatar>
                    </div>
                    <div>
                        <p className="text-xl font-semibold">{displayName}</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">Nombre</Label>
                        <Input id="firstName" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Apellido</Label>
                        <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                </div>
                {role === 1 && (
                    <div className="space-y-2">
                        <Label htmlFor="title">Título Profesional</Label>
                        <Input id="title" placeholder="Ej. Entrenador Personal, Nutricionista" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                )}
                <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input id="email" type="email" defaultValue={user?.email} disabled />
                </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
                 <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleSaveChanges} disabled={isSaving}>
                    {isSaving ? "Guardando..." : "Guardar Cambios"}
                </Button>
                {role === 0 && (
                    <Button variant="outline" onClick={() => setIsFormOpen(true)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Cuestionario de Salud
                    </Button>
                )}
            </CardFooter>
        </Card>
      </div>

       {user && role === 0 && (
            <HealthFormModal 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                userId={user.id}
                initialData={healthData}
                onSuccess={() => fetchHealthData(user.id)}
            />
        )}
    </AppLayout>
  );
}
