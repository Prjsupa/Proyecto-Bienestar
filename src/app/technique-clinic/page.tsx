
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
import { Upload, Dumbbell, Send, Annoyed, Video, MoreHorizontal, Edit, Trash2, MessageSquare, Check, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { createClient } from "@/utils/supabase/client";
import type { TechniquePost, TechniqueReply } from "@/types/fitness";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const postSchema = z.object({
  nota: z.string().optional(),
  video: z.any().refine(file => file?.length == 1, "El video es requerido."),
});

const editSchema = z.object({
  nota: z.string().optional(),
});

const replySchema = z.object({
  mensaje: z.string().min(1, "La respuesta no puede estar vacía.").max(1000),
});

const editReplySchema = z.object({
  mensaje: z.string().min(1, "La respuesta no puede estar vacía.").max(1000),
});


export default function TechniqueClinicPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<number | null>(null);
  const [posts, setPosts] = useState<TechniquePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [editingPost, setEditingPost] = useState<TechniquePost | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<TechniqueReply | null>(null);
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clinica_tecnica')
      .select(`
        *, 
        usuarios:user_id(*),
        clinica_tecnica_respuesta (
            *,
            usuarios:user_id(*)
        )
      `)
      .order('fecha', { ascending: false })
      .order('fecha', { referencedTable: 'clinica_tecnica_respuesta', ascending: true });

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
        if (user) {
          const { data: profile } = await supabase.from('usuarios').select('rol').eq('id', user.id).single();
          if (profile) setUserRole(profile.rol);
        }
        await fetchPosts();
        setIsClient(true);
    }
    fetchUserAndData();
  }, [fetchPosts, supabase]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        toast({ variant: "destructive", title: "Tipo de Archivo Inválido", description: "Por favor, selecciona un archivo de video." });
        form.setValue("video", null);
        return;
      }
      form.setValue("video", event.target.files);
      setVideoPreview(URL.createObjectURL(file));
    }
  };
  
  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: { nota: "" },
  });

  const editForm = useForm<z.infer<typeof editSchema>>({
    resolver: zodResolver(editSchema),
  });

  const replyFormHook = useForm<z.infer<typeof replySchema>>({
    resolver: zodResolver(replySchema),
    defaultValues: { mensaje: "" }
  });
  
  const editReplyForm = useForm<z.infer<typeof editReplySchema>>({
    resolver: zodResolver(editReplySchema),
    defaultValues: { mensaje: "" }
  });


  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (values: z.infer<typeof postSchema>) => {
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
  
  const handleEditClick = (post: TechniquePost) => {
    setEditingPost(post);
    editForm.setValue("nota", post.nota || "");
  };

  const handleUpdatePost = async (values: z.infer<typeof editSchema>) => {
    if (!editingPost) return;

    const { error } = await supabase
      .from('clinica_tecnica')
      .update({ nota: values.nota })
      .eq('id', editingPost.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Error al actualizar', description: error.message });
    } else {
      toast({ title: 'Publicación actualizada' });
      setEditingPost(null);
      await fetchPosts();
    }
  };

  const handleDeletePost = async (postId: string) => {
    const { error } = await supabase
      .from('clinica_tecnica')
      .delete()
      .eq('id', postId);

    if (error) {
      toast({ variant: 'destructive', title: 'Error al eliminar', description: error.message });
    } else {
      toast({ title: 'Publicación eliminada' });
      await fetchPosts();
    }
  };

  const onReplySubmit = async (values: z.infer<typeof replySchema>, postId: string) => {
    if (!currentUser) {
        toast({ variant: 'destructive', title: 'Debes iniciar sesión para responder' });
        return;
    }
    const { error } = await supabase.from('clinica_tecnica_respuesta').insert({
        post_id: postId,
        user_id: currentUser.id,
        mensaje: values.mensaje,
    });
    if (error) {
        toast({ variant: 'destructive', title: 'Error al responder', description: error.message });
    } else {
        replyFormHook.reset();
        setReplyingTo(null);
        await fetchPosts();
    }
  };
  
  const handleEditReplyClick = (reply: TechniqueReply) => {
    setEditingReply(reply);
    editReplyForm.setValue("mensaje", reply.mensaje);
  };
  
  const handleUpdateReply = async (values: z.infer<typeof editReplySchema>) => {
    if (!editingReply) return;
    const { error } = await supabase
      .from('clinica_tecnica_respuesta')
      .update({ mensaje: values.mensaje })
      .eq('id', editingReply.id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error al actualizar', description: error.message });
    } else {
      toast({ title: 'Respuesta actualizada' });
      setEditingReply(null);
      await fetchPosts();
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    const { error } = await supabase
      .from('clinica_tecnica_respuesta')
      .delete()
      .eq('id', replyId);
    if (error) {
      toast({ variant: 'destructive', title: 'Error al eliminar', description: error.message });
    } else {
      toast({ title: 'Respuesta eliminada' });
      await fetchPosts();
    }
  };


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
                    const isAuthor = currentUser?.id === post.user_id;
                    const canReply = userRole === 1 || isAuthor;

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
                              {isAuthor && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleEditClick(post)}>
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
                                          <AlertDialogDescription>
                                            Esta acción no se puede deshacer. Esto eliminará permanentemente tu publicación.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDeletePost(post.id)}>
                                            Continuar
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </CardHeader>
                            <CardContent>
                                {post.nota && <p className="whitespace-pre-wrap mb-4">{post.nota}</p>}
                                {post.video_url && (
                                    <div className="mt-2 rounded-lg overflow-hidden">
                                        <video src={post.video_url} className="w-full aspect-video" controls />
                                    </div>
                                )}
                            </CardContent>
                             <CardFooter className="flex-col items-start gap-4">
                                {canReply && (
                                    <div className="w-full">
                                        <button onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)} className="flex items-center gap-2 text-sm hover:text-primary">
                                            <MessageSquare className="w-4 h-4" />
                                            <span>{post.clinica_tecnica_respuesta?.length || 0}</span>
                                            <span>Responder</span>
                                        </button>
                                        {replyingTo === post.id && (
                                            <Form {...replyFormHook}>
                                                <form onSubmit={replyFormHook.handleSubmit((values) => onReplySubmit(values, post.id))} className="w-full flex items-start gap-4 pt-4 mt-4 border-t">
                                                    <Avatar className="h-9 w-9 mt-1">
                                                        <AvatarFallback>{getInitials(currentUser?.user_metadata?.name, currentUser?.user_metadata?.last_name)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 space-y-2">
                                                        <FormField
                                                            control={replyFormHook.control}
                                                            name="mensaje"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormControl>
                                                                        <Textarea placeholder="Escribe tu respuesta..." className="resize-none" rows={2} {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <Button type="submit" size="sm" disabled={replyFormHook.formState.isSubmitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
                                                            {replyFormHook.formState.isSubmitting ? 'Enviando...' : 'Enviar Respuesta'}
                                                        </Button>
                                                    </div>
                                                </form>
                                            </Form>
                                        )}
                                    </div>
                                )}

                                {post.clinica_tecnica_respuesta && post.clinica_tecnica_respuesta.length > 0 && (
                                    <div className="w-full space-y-4 pt-4 border-t">
                                        {post.clinica_tecnica_respuesta.map((reply: TechniqueReply) => {
                                            const replyAuthor = reply.usuarios;
                                            const replyAuthorName = replyAuthor ? `${replyAuthor.name} ${replyAuthor.last_name}`.trim() : "Usuario";
                                            const replyAuthorInitials = getInitials(replyAuthor?.name, replyAuthor?.last_name);
                                            const isReplyAuthor = currentUser?.id === reply.user_id;

                                            return (
                                                <div key={reply.id} className="flex items-start gap-3 group">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback>{replyAuthorInitials}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 bg-secondary p-3 rounded-lg">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-2">
                                                                    <p className="font-semibold text-sm">{replyAuthorName}</p>
                                                                    {replyAuthor?.rol === 1 && (
                                                                        <Badge variant="outline" className="border-primary/50 text-primary h-5 text-xs">
                                                                            <Check className="w-3 h-3 mr-1" />
                                                                            Profesional
                                                                        </Badge>
                                                                    )}
                                                                    {replyAuthor?.rol === 2 && (
                                                                        <Badge variant="outline" className="border-yellow-500/50 text-yellow-500 h-5 text-xs">
                                                                            <Shield className="w-3 h-3 mr-1" />
                                                                            Moderador
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                {replyAuthor?.rol === 1 && replyAuthor.titulo && <p className="text-xs text-primary">{replyAuthor.titulo}</p>}
                                                            </div>
                                                            {isClient && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    {formatDistanceToNow(new Date(reply.fecha), { addSuffix: true, locale: es })}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{reply.mensaje}</p>
                                                    </div>
                                                    {isReplyAuthor && (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <MoreHorizontal className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent>
                                                                <DropdownMenuItem onClick={() => handleEditReplyClick(reply)}>
                                                                    <Edit className="mr-2 h-4 w-4" /><span>Editar</span>
                                                                </DropdownMenuItem>
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                                            <Trash2 className="mr-2 h-4 w-4" /><span>Eliminar</span>
                                                                        </DropdownMenuItem>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                                            <AlertDialogDescription>Esta acción no se puede deshacer. Esto eliminará permanentemente tu respuesta.</AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                            <AlertDialogAction onClick={() => handleDeleteReply(reply.id)}>Continuar</AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardFooter>
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

        <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Nota</DialogTitle>
                </DialogHeader>
                <Form {...editForm}>
                    <form onSubmit={editForm.handleSubmit(handleUpdatePost)} className="space-y-4">
                        <FormField
                            control={editForm.control}
                            name="nota"
                            render={({ field }) => (
                                <FormItem>
                                    <Label htmlFor="edit-nota" className="sr-only">Nota</Label>
                                    <Textarea id="edit-nota" rows={5} {...field} placeholder="Añade una nota o pregunta para el coach..."/>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">Cancelar</Button>
                            </DialogClose>
                            <Button type="submit" disabled={editForm.formState.isSubmitting}>
                                {editForm.formState.isSubmitting ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
        
        <Dialog open={!!editingReply} onOpenChange={() => setEditingReply(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Respuesta</DialogTitle>
                </DialogHeader>
                <Form {...editReplyForm}>
                    <form onSubmit={editReplyForm.handleSubmit(handleUpdateReply)} className="space-y-4">
                        <FormField
                            control={editReplyForm.control}
                            name="mensaje"
                            render={({ field }) => (
                                <FormItem>
                                    <Textarea id="edit-reply" rows={4} {...field} />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">Cancelar</Button>
                            </DialogClose>
                            <Button type="submit" disabled={editReplyForm.formState.isSubmitting}>
                                {editReplyForm.formState.isSubmitting ? "Guardando..." : "Guardar"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>

      </div>
    </AppLayout>
  );
}
