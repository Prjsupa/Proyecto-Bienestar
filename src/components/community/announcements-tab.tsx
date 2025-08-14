
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Annoyed, Image as ImageIcon, Paperclip, X, MoreHorizontal, Trash2, Edit, Megaphone, Send, Check, Shield } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { AnnouncementPost } from "@/types/community";
import { Label } from "../ui/label";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const postSchema = z.object({
  mensaje: z.string().min(10, "El anuncio debe tener al menos 10 caracteres.").max(1000, "El anuncio no puede exceder los 1000 caracteres."),
  file: z.any().optional(),
});

const editSchema = z.object({
  mensaje: z.string().min(10, "El anuncio debe tener al menos 10 caracteres.").max(1000, "El anuncio no puede exceder los 1000 caracteres."),
});

export function AnnouncementsTab() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<number | null>(null);
  const [announcements, setAnnouncements] = useState<AnnouncementPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingPost, setEditingPost] = useState<AnnouncementPost | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const supabase = createClient();

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('anuncio_profesional')
      .select('*, usuarios:user_id(*)')
      .order('fecha', { ascending: false });

    if (error) {
      console.error("Error fetching announcements:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los anuncios.' });
    } else {
      setAnnouncements(data as any[]);
    }
    setLoading(false);
  }, [supabase, toast]);

  useEffect(() => {
    const fetchUserAndData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        const { data: profile } = await supabase
            .from('usuarios')
            .select('rol')
            .eq('id', user.id)
            .single();
        if (profile) setUserRole(profile.rol);
      }

      await fetchAnnouncements();
      setIsClient(true);
    };
    fetchUserAndData();
  }, [fetchAnnouncements, supabase]);
  
  const postForm = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: { mensaje: "" },
  });

  const editForm = useForm<z.infer<typeof editSchema>>({
    resolver: zodResolver(editSchema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({ variant: "destructive", title: "Archivo inválido", description: "Solo se permiten imágenes." });
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast({ variant: "destructive", title: "Archivo demasiado grande", description: `La imagen no puede exceder ${MAX_FILE_SIZE / 1024 / 1024}MB.` });
        return;
      }
      setSelectedFile(file);
    }
  };

  async function onPostSubmit(values: z.infer<typeof postSchema>) {
    if (!currentUser) return;
    let imageUrl: string | null = null;
    if (selectedFile) {
        const filePath = `${currentUser.id}/${Date.now()}_${selectedFile.name}`;
        const { error: uploadError } = await supabase.storage
            .from('anuncio.profesional')
            .upload(filePath, selectedFile);
        if (uploadError) {
            toast({ variant: 'destructive', title: 'Error al subir imagen', description: uploadError.message });
            return;
        }
        const { data: { publicUrl } } = supabase.storage.from('anuncio.profesional').getPublicUrl(filePath);
        imageUrl = publicUrl;
    }

    const { error } = await supabase.from('anuncio_profesional').insert({ 
        mensaje: values.mensaje, 
        user_id: currentUser.id, 
        img_url: imageUrl 
    });

    if (error) {
        toast({ variant: "destructive", title: "Error al publicar", description: error.message });
    } else {
        toast({ title: "Anuncio Publicado", description: "Tu anuncio ahora es visible para todos." });
        postForm.reset();
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        await fetchAnnouncements();
    }
  }

  const handleEditClick = (post: AnnouncementPost) => {
    setEditingPost(post);
    editForm.setValue("mensaje", post.mensaje);
  };
  
  const handleUpdatePost = async (values: z.infer<typeof editSchema>) => {
    if (!editingPost) return;
    const { error } = await supabase
      .from('anuncio_profesional')
      .update({ mensaje: values.mensaje })
      .eq('id', editingPost.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Error al actualizar', description: error.message });
    } else {
      toast({ title: 'Anuncio actualizado' });
      setEditingPost(null);
      await fetchAnnouncements();
    }
  };

  const handleDeletePost = async (postId: string) => {
    const { error } = await supabase
      .from('anuncio_profesional')
      .delete()
      .eq('id', postId);
      
    if (error) {
      toast({ variant: 'destructive', title: 'Error al eliminar', description: error.message });
    } else {
      toast({ title: 'Anuncio eliminado' });
      await fetchAnnouncements();
    }
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
            <Skeleton className="h-5 w-1/2 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const getInitials = (name?: string | null, lastName?: string | null) => {
    if (name && lastName) return `${name[0]}${lastName[0]}`.toUpperCase();
    if (name) return name.substring(0, 2).toUpperCase();
    return "P";
  };

  const isProfessional = userRole === 1;

  return (
    <>
      {isProfessional && (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="text-lg font-headline">Crear un Nuevo Anuncio</CardTitle>
                <p className="text-sm text-muted-foreground">Comparte noticias, eventos o consejos con la comunidad.</p>
            </CardHeader>
            <CardContent>
            <Form {...postForm}>
                <form onSubmit={postForm.handleSubmit(onPostSubmit)} className="space-y-4">
                <FormField
                    control={postForm.control}
                    name="mensaje"
                    render={({ field }) => (
                    <FormItem>
                        <Textarea
                            placeholder="Escribe tu anuncio aquí..."
                            className="resize-none"
                            rows={4}
                            {...field}
                        />
                        <FormMessage />
                    </FormItem>
                    )}
                />
                {selectedFile && (
                    <div className="flex items-center justify-between p-2 text-sm text-muted-foreground bg-muted rounded-md">
                        <div className="flex items-center gap-2 truncate">
                            <ImageIcon className="w-4 h-4" />
                            <span className="truncate">{selectedFile.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6"
                            onClick={() => {
                                setSelectedFile(null);
                                if (fileInputRef.current) fileInputRef.current.value = "";
                            }}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                )}
                <div className="flex justify-between items-center">
                    <FormField
                        control={postForm.control}
                        name="file"
                        render={() => (
                            <FormItem>
                                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                    <Paperclip className="w-4 h-4 mr-2"/>
                                    Adjuntar Imagen
                                </Button>
                                <FormControl>
                                    <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={postForm.formState.isSubmitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
                        <Send className="w-4 h-4 mr-2" />
                        {postForm.formState.isSubmitting ? 'Publicando...' : 'Publicar Anuncio'}
                    </Button>
                </div>
                </form>
            </Form>
            </CardContent>
        </Card>
      )}

      <div className="space-y-6">
          <h2 className="text-2xl font-semibold font-headline">Anuncios Recientes</h2>
          {loading ? renderSkeletons() : announcements.length === 0 ? (
             <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                        <Megaphone className="w-12 h-12 mb-4"/>
                        <h3 className="text-lg font-semibold">No hay anuncios todavía</h3>
                        <p className="text-sm">Pronto nuestros profesionales publicarán novedades aquí.</p>
                    </div>
                </CardContent>
            </Card>
          ) : announcements.map((post) => {
            const author = post.usuarios;
            const authorName = author ? `${author.name || ''} ${author.last_name || ''}`.trim() : "Profesional";
            const authorInitials = getInitials(author?.name, author?.last_name);
            const isAuthor = currentUser && currentUser.id === post.user_id;

            return (
              <Card key={post.id}>
                <CardHeader>
                    <div className="flex items-start gap-4">
                        <Avatar>
                            <AvatarFallback>{authorInitials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <p className="font-semibold">{authorName}</p>
                                {author?.rol === 1 && (
                                <Badge variant="outline" className="border-primary/50 text-primary h-5 text-xs">
                                    <Check className="w-3 h-3 mr-1" />
                                    Profesional
                                </Badge>
                                )}
                                {author?.rol === 2 && (
                                <Badge variant="outline" className="border-yellow-500/50 text-yellow-500 h-5 text-xs">
                                    <Shield className="w-3 h-3 mr-1" />
                                    Moderador
                                </Badge>
                                )}
                            </div>
                            {author.titulo && <p className="text-xs text-primary">{author.titulo}</p>}
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
                                                <AlertDialogDescription>Esta acción no se puede deshacer. Esto eliminará permanentemente el anuncio.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeletePost(post.id)}>Continuar</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{post.mensaje}</p>
                   {post.img_url && (
                    <div className="mt-4">
                        <Image src={post.img_url} alt="Imagen del anuncio" width={500} height={500} className="rounded-lg object-cover w-full max-h-[400px]" />
                    </div>
                    )}
                </CardContent>
              </Card>
            );
          })}
      </div>

       <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Anuncio</DialogTitle>
                </DialogHeader>
                <Form {...editForm}>
                    <form onSubmit={editForm.handleSubmit(handleUpdatePost)} className="space-y-4">
                        <FormField
                            control={editForm.control}
                            name="mensaje"
                            render={({ field }) => (
                                <FormItem>
                                    <Label htmlFor="edit-content" className="sr-only">Anuncio</Label>
                                    <Textarea id="edit-content" rows={5} {...field} />
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
    </>
  )
}
