
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { AppLayout } from "@/components/app-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/utils/supabase/client";
import { Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        router.push("/login");
        setLoading(false);
        return;
      }
      
      setUser(session.user);
      
      // Fetch profile details from 'usuarios' table
      const { data: profileData, error: profileError } = await supabase
        .from('usuarios')
        .select('name, last_name, avatar_url')
        .eq('id', session.user.id)
        .single();
        
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        toast({
            title: "Error al cargar el perfil",
            description: "No se pudieron obtener los detalles de tu perfil.",
            variant: "destructive",
        });
      } else if (profileData) {
        // Combine auth data with profile data
        setUser(currentUser => currentUser ? {
            ...currentUser,
            user_metadata: {
                ...currentUser.user_metadata,
                ...profileData,
            }
        } : null);
      }
      
      setLoading(false);
    });

    // Initial check in case the auth state is already settled
    const checkInitialUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if(!user) {
            router.push('/login');
        }
    }
    
    checkInitialUser();

    return () => subscription.unsubscribe();
  }, [router, toast]);

  const getInitials = (name: string) => {
    if(!name) return "";
    const names = name.split(' ');
    if (names.length > 1 && names[1]) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  const displayName = user?.user_metadata?.name && user?.user_metadata?.last_name 
    ? `${user.user_metadata.name} ${user.user_metadata.last_name}` 
    : user?.user_metadata?.name ?? "Usuario";

  if (loading || !user) {
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
                <CardContent className="space-y-6">
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
  
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold font-headline">Perfil</h1>
            <p className="text-muted-foreground">
                Gestiona la información de tu cuenta.
            </p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>Estos datos se mostrarán en tu perfil público.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                     <div className="relative">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={user.user_metadata?.avatar_url} alt={displayName} />
                            <AvatarFallback className="text-3xl">{getInitials(displayName)}</AvatarFallback>
                        </Avatar>
                        <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8">
                            <Camera className="h-4 w-4"/>
                            <span className="sr-only">Cambiar foto</span>
                        </Button>
                    </div>
                    <div>
                         <p className="text-xl font-semibold">{displayName}</p>
                         <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">Nombre</Label>
                        <Input id="firstName" defaultValue={user.user_metadata?.name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Apellido</Label>
                        <Input id="lastName" defaultValue={user.user_metadata?.last_name} />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input id="email" type="email" defaultValue={user.email} disabled />
                </div>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Guardar Cambios</Button>
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
