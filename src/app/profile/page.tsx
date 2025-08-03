
"use client";

import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { AppLayout } from "@/components/app-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Camera } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const supabase = createClient();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      if (error || !data.user) {
        router.push("/login");
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };

    fetchUser();
  }, [router]);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Effect to create and revoke avatar preview URL
  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(avatarFile);
    setAvatarPreviewUrl(objectUrl);

    // Free memory when ever this component is unmounted
    return () => URL.revokeObjectURL(objectUrl);
  }, [avatarFile]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setAvatarFile(file);
  };

  const handleAvatarUpload = async () => {
    if (!user || !avatarFile) return;

    setIsUploading(true);

    const fileExt = avatarFile.name.split(".").pop();
    const uniqueFileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}.${fileExt}`;
    const filePath = `avatars/${user.id}/${uniqueFileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, avatarFile, {
        cacheControl: "3600",
        upsert: true, // Upsert in case the user uploads a new picture later
      });

    if (uploadError) {
      console.error("Error uploading avatar:", uploadError);
      toast({
        title: "Error al subir la foto de perfil",
        description: uploadError.message,
        variant: "destructive",
      });
    } else {
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
      const avatarUrl = publicUrlData.publicUrl;

      // Update user profile in 'usuarios' table
      const { error: updateError } = await supabase
        .from("usuarios")
        .update({ avatar_url: avatarUrl })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error updating user profile with avatar URL:", updateError);
        toast({
          title: "Error al guardar la URL del avatar",
          description: updateError.message,
          variant: "destructive",
        });
      } else {
        // Update local user state to reflect the new avatar URL
        setUser((currentUser) => {
          if (!currentUser) return null;
          return {
            ...currentUser,
            user_metadata: {
              ...currentUser.user_metadata,
              avatar_url: avatarUrl,
            },
          };
        });
        toast({
          title: "Foto de perfil actualizada",
          description: "Tu nueva foto de perfil ha sido guardada.",
        });
        setAvatarFile(null); // Clear selected file after successful upload
        setAvatarPreviewUrl(null); // Clear preview
      }
    }

    setIsUploading(false);
  };

  // Fetch user's profile data including avatar_url
  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user) {
         router.push("/login");
         return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('usuarios')
        .select('name, last_name, avatar_url')
        .eq('id', userData.user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      } else {
         setUser({...userData.user, user_metadata: profileData}); // Combine auth user data with profile data
      }
      setLoading(false);
    };
    fetchProfile();
  }, [router]);

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  const displayName = user?.user_metadata?.name && user?.user_metadata?.last_name
    ? `${user.user_metadata.name} ${user.user_metadata.last_name}` 
    : user?.user_metadata?.name ?? "Usuario";

  if (loading) {
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
                        <Skeleton className="h-10 w-32" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
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
                           <AvatarImage src={avatarPreviewUrl || user?.user_metadata?.avatar_url} alt={displayName} />
                           <AvatarFallback className="text-3xl">{getInitials(displayName)}</AvatarFallback>
                        </Avatar>
                       <input
                         type="file"
                         accept="image/*"
                         onChange={handleAvatarChange}
                         className="absolute inset-0 opacity-0 cursor-pointer"
                         disabled={isUploading}
                       />
                       <Button
                         size="icon"
                         className="absolute bottom-0 right-0 rounded-full h-8 w-8 pointer-events-none" // Disable pointer events on the button itself
                       >
                         {isUploading ? (
                           <span className="loader w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> // Simple loader
                         ) : (
                           <Camera className="h-4 w-4" />
                         )}
                         <span className="sr-only">Cambiar foto</span>
                       </Button>
                    </div>

                    <div>
                         <p className="text-xl font-semibold">{displayName}</p>
                         <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">Nombre</Label>
                        <Input id="firstName" defaultValue={user?.user_metadata?.name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Apellido</Label>
                        <Input id="lastName" defaultValue={user?.user_metadata?.last_name} />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input id="email" type="email" defaultValue={user?.email} disabled />
                </div>
                <Button onClick={handleAvatarUpload} disabled={!avatarFile || isUploading} className="bg-accent text-accent-foreground hover:bg-accent/90">
                   {isUploading ? "Subiendo..." : "Actualizar Foto de Perfil"}
                </Button>
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
