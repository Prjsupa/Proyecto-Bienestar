
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Dumbbell, Send, Annoyed, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { createClient } from "@/utils/supabase/client";
import type { TechniquePost } from "@/types/fitness";

const formSchema = z.object({
  nota: z.string().optional(),
  video: z.any().refine(file => file?.length == 1, "El video es requerido."),
});

export default function TechniqueClinicPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<TechniquePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clinica_tecnica')
      .select('*, usuarios!inner(name, last_name)')
      .order('fecha', { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error)
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar las publicaciones.' });
    } else {
      setPosts(data as any[]);
    }
    setLoading(false);
  }, [supabase, toast]);
  
  useEffect(() => {
    const fetchUserAndData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        await fetchPosts();
        setIsClient(true);
    }
    fetchUserAndData();
  }, [fetchPosts, supabase]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        toast({
          variant: "destructive",
          title: "Tipo de Archivo Inválido",
          description: "Por favor, selecciona un archivo de video.",
        });
        form.setValue("video", null);
        return;
      }
      form.setValue("video", event.target.files);
      setVideoPreview(URL.createObjectURL(file));
    }
  };
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { nota: "" },
  });

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!currentUser || !values.video?.[0]) {
      toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión y seleccionar un video.' });
      return;
    }
    
    const videoFile = values.video[0];
    const filePath = `${currentUser.id}/${Date.now()}_${videoFile.name}`;

    const { error: uploadError } = await supabase.storage
      .from('clinica.tecnica')
      .upload(filePath, videoFile);

    if (uploadError) {
      toast({ variant: 'destructive', title: 'Error al subir video', description: uploadError.message });
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('clinica.tecnica').getPublicUrl(filePath);

    const { error: insertError } = await supabase
      .from('clinica_tecnica')
      .insert({
        user_id: currentUser.id,
        nota: values.nota,
        video_url: publicUrl,
      });
      
    if (insertError) {
        toast({ variant: 'destructive', title: 'Error al crear la publicación', description: insertError.message });
    } else {
        toast({ title: '¡Video Enviado!', description: 'Tu video ha sido enviado para revisión.' });
        form.reset();
        setVideoPreview(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
        await fetchPosts();
    }
  }

  const getInitials = (name?: string | null, lastName?: string | null) => {
    if (name && lastName) return `${name[0]}${lastName[0]}`.toUpperCase();
    if (name) return name.substring(0, 2).toUpperCase();
    return "U";
  };
  
  const renderSkeletons = () => (
    <div className="space-y-6">
      {[...Array(2)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="w-full space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="aspect-video w-full rounded-lg" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <Dumbbell className="w-8 h-8" />
            Clínica de la Técnica
          </h1>
          <p className="text-muted-foreground">
            Sube un video de tu ejercicio para que un profesional lo revise y perfecciona tus movimientos.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 items-start">
            <Card className="mb-8">
                <CardHeader>
                <CardTitle>Analiza tu Técnica</CardTitle>
                <CardDescription>Sube un video corto de tu ejercicio para que un profesional lo revise.</CardDescription>
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="video"
                                render={() => (
                                    <FormItem>
                                        <div 
                                            className="border-2 border-dashed border-muted-foreground/30 rounded-lg aspect-video flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:border-primary transition-colors"
                                            onClick={handleUploadClick}
                                        >
                                            <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept="video/*"
                                            />
                                            {videoPreview ? (
                                            <video src={videoPreview} className="w-full h-full object-cover rounded-md" controls />
                                            ) : (
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <Upload className="w-8 h-8" />
                                                <span className="font-semibold">Haz clic para subir un video</span>
                                                <span className="text-xs">MP4, AVI, MOV hasta 50MB</span>
                                            </div>
                                            )}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        
                            <FormField
                                control={form.control}
                                name="nota"
                                render={({ field }) => (
                                    <FormItem>
                                        <Textarea placeholder="Añade una nota o pregunta para el coach (opcional)..." rows={3} {...field}/>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter>
                        <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={form.formState.isSubmitting}>
                            <Send className="w-4 h-4 mr-2"/>
                            {form.formState.isSubmitting ? 'Enviando...' : 'Enviar para Revisión'}
                        </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>

            <div className="space-y-6">
                 {loading ? renderSkeletons() : posts.length > 0 ? posts.map((post) => {
                    const authorProfile = post.usuarios;
                    const authorName = authorProfile ? `${authorProfile.name} ${authorProfile.last_name}`.trim() : "Usuario Anónimo";
                    const authorInitials = getInitials(authorProfile?.name, authorProfile?.last_name);

                    return (
                        <Card key={post.id}>
                            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
                            <Avatar>
                                <AvatarFallback>{authorInitials}</AvatarFallback>
                            </Avatar>
                            <div className="w-full">
                                <p className="font-semibold">{authorName}</p>
                                {isClient && (
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(post.fecha), { addSuffix: true, locale: es })}
                                    </p>
                                )}
                            </div>
                            </CardHeader>
                            <CardContent>
                                {post.nota && <p className="whitespace-pre-wrap mb-4">{post.nota}</p>}
                                {post.video_url && (
                                    <div className="mt-2 rounded-lg overflow-hidden">
                                        <video src={post.video_url} className="w-full aspect-video" controls />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )
                }) : (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                                <Video className="w-12 h-12 mb-4"/>
                                <h3 className="text-lg font-semibold">No hay videos para revisar</h3>
                                <p className="text-sm">¡Sube un video de tu técnica para que nuestros coaches lo analicen!</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

        </div>
      </div>
    </AppLayout>
  );
}
