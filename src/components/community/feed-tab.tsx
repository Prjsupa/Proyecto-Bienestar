
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Annoyed, Image as ImageIcon, MessageSquare, Paperclip, X, MoreHorizontal, Trash2, Edit, Check, Shield } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { CommunityPost, Reply } from "@/types/community";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { ModerationActionDialog } from "./moderation-action-dialog";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const postSchema = z.object({
  content: z.string().min(10, "La publicación debe tener al menos 10 caracteres.").max(500, "La publicación no puede exceder los 500 caracteres."),
  file: z.any().optional(),
});

const editPostSchema = z.object({
  content: z.string().min(10, "La publicación debe tener al menos 10 caracteres.").max(500, "La publicación no puede exceder los 500 caracteres."),
});

const replySchema = z.object({
  content: z.string().min(1, "La respuesta no puede estar vacía.").max(500, "La respuesta no puede exceder los 500 caracteres."),
});

const editReplySchema = z.object({
    content: z.string().min(1, "La respuesta no puede estar vacía.").max(500, "La respuesta no puede exceder los 500 caracteres."),
});

type ModerationInfo = {
    contentId: string;
    targetUserId: string;
    actionType: 'Eliminar Publicación' | 'Eliminar Respuesta';
    section: 'Comunidad - Feed';
    onConfirm: () => void;
};

export function FeedTab() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<number | null>(null);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [selectedPostFile, setSelectedPostFile] = useState<File | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [editingReply, setEditingReply] = useState<Reply | null>(null);
  const [moderationInfo, setModerationInfo] = useState<ModerationInfo | null>(null);

  const postFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const supabase = createClient();
  
  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    const { data: postsData, error: postsError } = await supabase
        .from('comunidad')
        .select(`
            id,
            user_id,
            mensaje,
            img_url,
            fecha,
            usuarios:user_id ( id, name, last_name, rol, titulo ),
            comunidad_respuestas (
                id,
                post_id,
                user_id,
                mensaje,
                fecha,
                usuarios:user_id ( id, name, last_name, rol, titulo )
            )
        `)
        .order('fecha', { ascending: false })
        .order('fecha', { referencedTable: 'comunidad_respuestas', ascending: true });


    if (postsError) {
        console.error('Error fetching posts:', postsError);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar las publicaciones.' });
    } else {
        setCommunityPosts(postsData as any[]);
    }
    setLoadingPosts(false);
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

  const postForm = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: { content: "" },
  });

  const editForm = useForm<z.infer<typeof editPostSchema>>({
    resolver: zodResolver(editPostSchema),
  });
  
  const editReplyForm = useForm<z.infer<typeof editReplySchema>>({
    resolver: zodResolver(editReplySchema),
  });

  const replyForm = useForm<z.infer<typeof replySchema>>({
    resolver: zodResolver(replySchema),
    defaultValues: { content: "" },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast({ variant: "destructive", title: "Archivo demasiado grande", description: "El archivo no puede exceder los 5MB." });
        return;
      }
      setSelectedPostFile(file);
    }
  };

  async function onPostSubmit(values: z.infer<typeof postSchema>) {
    if (!currentUser) {
      toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión para publicar.' });
      return;
    }

    let imageUrl: string | null = null;
    if (selectedPostFile) {
      const filePath = `${currentUser.id}/${Date.now()}_${selectedPostFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('publicaciones')
        .upload(filePath, selectedPostFile);

      if (uploadError) {
        toast({ variant: 'destructive', title: 'Error al subir imagen', description: uploadError.message });
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from('publicaciones').getPublicUrl(filePath);
      imageUrl = publicUrl;
    }

    const newPostForDb = {
      user_id: currentUser.id,
      mensaje: values.content,
      img_url: imageUrl,
    };
    
    const { error: insertError } = await supabase
      .from('comunidad')
      .insert(newPostForDb);
    
    if (insertError) {
      toast({ variant: 'destructive', title: 'Error al publicar', description: insertError.message });
      return;
    }

    await fetchPosts();
    postForm.reset();
    setSelectedPostFile(null);
    if(postFileInputRef.current) postFileInputRef.current.value = "";
  }
  
  async function onReplySubmit(values: z.infer<typeof replySchema>, postId: string) {
    if (!currentUser) {
        toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión para responder.' });
        return;
    }

    const { error } = await supabase
        .from('comunidad_respuestas')
        .insert({
            post_id: postId,
            user_id: currentUser.id,
            mensaje: values.content,
        });
    
    if (error) {
        toast({ variant: 'destructive', title: 'Error al responder', description: error.message });
    } else {
        await fetchPosts();
        replyForm.reset();
        setReplyingTo(null);
    }
  }

  const handleEditClick = (post: CommunityPost) => {
    setEditingPost(post);
    editForm.setValue("content", post.mensaje);
  };
  
  const handleUpdatePost = async (values: z.infer<typeof editPostSchema>) => {
    if (!editingPost) return;

    const { error } = await supabase
        .from('comunidad')
        .update({ mensaje: values.content })
        .eq('id', editingPost.id);

    if (error) {
        toast({ variant: 'destructive', title: 'Error al actualizar', description: error.message });
    } else {
        toast({ title: 'Publicación actualizada', description: 'Tu publicación ha sido guardada.' });
        setEditingPost(null);
        await fetchPosts();
    }
  };

  const handleDeletePost = async (postId: string) => {
    const { data: post, error: fetchError } = await supabase
        .from('comunidad')
        .select('img_url')
        .eq('id', postId)
        .single();
    
    if (fetchError) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo encontrar la publicación a eliminar.' });
        return;
    }

    if (post.img_url) {
        const imagePath = post.img_url.split('/publicaciones/')[1];
        const { error: storageError } = await supabase.storage
            .from('publicaciones')
            .remove([imagePath]);
        
        if (storageError) {
            toast({ variant: 'destructive', title: 'Error al eliminar imagen', description: storageError.message });
            return;
        }
    }

    const { error } = await supabase
        .from('comunidad')
        .delete()
        .eq('id', postId);

    if (error) {
        toast({ variant: 'destructive', title: 'Error al eliminar', description: error.message });
    } else {
        toast({ title: 'Publicación eliminada' });
        await fetchPosts();
    }
  };
  
  const handleEditReplyClick = (reply: Reply) => {
    setEditingReply(reply);
    editReplyForm.setValue("content", reply.mensaje);
  };

  const handleUpdateReply = async (values: z.infer<typeof editReplySchema>) => {
    if (!editingReply) return;

    const { error } = await supabase
      .from('comunidad_respuestas')
      .update({ mensaje: values.content })
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
      .from('comunidad_respuestas')
      .delete()
      .eq('id', replyId);

    if (error) {
      toast({ variant: 'destructive', title: 'Error al eliminar', description: error.message });
    } else {
      toast({ title: 'Respuesta eliminada' });
      await fetchPosts();
    }
  };


  const renderSkeletons = () => (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="w-full space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </CardHeader>
          <CardContent>
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
    return "U";
  };
  
  return (
    <>
        <Card className="mb-8">
            <CardHeader>
            <CardTitle className="text-lg font-headline">Comparte tus ideas</CardTitle>
            </CardHeader>
            <CardContent>
            <Form {...postForm}>
                <form onSubmit={postForm.handleSubmit(onPostSubmit)} className="space-y-4">
                <FormField
                    control={postForm.control}
                    name="content"
                    render={({ field }) => (
                    <FormItem>
                        <FormControl>
                        <Textarea
                            placeholder="¿Qué tienes en mente? ¡Comparte un consejo de entrenamiento o un éxito reciente!"
                            className="resize-none"
                            rows={4}
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                {selectedPostFile && (
                    <div className="flex items-center justify-between p-2 text-sm text-muted-foreground bg-muted rounded-md">
                        <div className="flex items-center gap-2 truncate">
                        <ImageIcon className="w-4 h-4" />
                        <span className="truncate">{selectedPostFile.name}</span>
                        </div>
                        <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => {
                            setSelectedPostFile(null)
                            if(postFileInputRef.current) postFileInputRef.current.value = "";
                        }}
                        >
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
                            <FormControl>
                                <Button type="button" variant="outline" onClick={() => postFileInputRef.current?.click()}>
                                    <Paperclip className="w-4 h-4 mr-2"/>
                                    Adjuntar Imagen
                                </Button>
                            </FormControl>
                            <input 
                                type="file" 
                                className="hidden" 
                                ref={postFileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                            />
                            <FormMessage/>
                        </FormItem>
                    )}
                    />

                    <Button type="submit" disabled={postForm.formState.isSubmitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    {postForm.formState.isSubmitting ? 'Publicando...' : 'Publicar'}
                    </Button>
                </div>
                </form>
            </Form>
            </CardContent>
        </Card>

        <div className="space-y-6">
            <h2 className="text-2xl font-semibold font-headline">Publicaciones Recientes</h2>
            {loadingPosts ? renderSkeletons() : communityPosts.length > 0 ? communityPosts.map((post) => {
            const authorProfile = post.usuarios;
            const authorName = authorProfile ? `${authorProfile.name} ${authorProfile.last_name}`.trim() : "Usuario Anónimo";
            const authorInitials = getInitials(authorProfile?.name, authorProfile?.last_name);
            const isPostAuthor = currentUser && currentUser.id === post.user_id;
            const isModerator = userRole === 2;
            const canDeletePost = isPostAuthor || (isModerator && authorProfile?.rol === 0);

            return (
                <Card key={post.id}>
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
                    <Avatar>
                    <AvatarFallback>{authorInitials}</AvatarFallback>
                    </Avatar>
                    <div className="w-full">
                    <div className="flex items-center gap-2">
                        <p className="font-semibold">{authorName}</p>
                        {authorProfile?.rol === 1 && (
                            <Badge variant="outline" className="border-primary/50 text-primary h-5 text-xs">
                                <Check className="w-3 h-3 mr-1" />
                                Profesional
                            </Badge>
                        )}
                        {authorProfile?.rol === 2 && (
                            <Badge variant="outline" className="border-yellow-500/50 text-yellow-500 h-5 text-xs">
                                <Shield className="w-3 h-3 mr-1" />
                                Moderador
                            </Badge>
                        )}
                    </div>
                    {authorProfile?.rol === 1 && authorProfile.titulo && (
                        <p className="text-xs text-primary">{authorProfile.titulo}</p>
                    )}
                    {isClient && (
                        <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(post.fecha), { addSuffix: true, locale: es })}
                        </p>
                    )}
                    </div>
                    {(isPostAuthor || canDeletePost) && (
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {isPostAuthor && (
                                    <DropdownMenuItem onClick={() => handleEditClick(post)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        <span>Editar</span>
                                    </DropdownMenuItem>
                                )}
                                {canDeletePost && (
                                    <DropdownMenuItem 
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            if (isPostAuthor) {
                                                handleDeletePost(post.id);
                                            } else {
                                                setModerationInfo({
                                                    contentId: post.id,
                                                    targetUserId: post.user_id,
                                                    actionType: 'Eliminar Publicación',
                                                    section: 'Comunidad - Feed',
                                                    onConfirm: () => handleDeletePost(post.id)
                                                });
                                            }
                                        }} 
                                        className="text-destructive"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span>Eliminar</span>
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-wrap">{post.mensaje}</p>
                    {post.img_url && (
                    <div className="mt-4">
                        <Image 
                        src={post.img_url} 
                        alt="Imagen de la publicación" 
                        width={500} 
                        height={500} 
                        className="rounded-lg object-cover w-full max-h-[400px]"
                        />
                    </div>
                    )}
                </CardContent>
                <CardFooter className="flex-col items-start gap-4">
                    <div className="flex items-center gap-4 text-muted-foreground">
                        <button onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)} className="flex items-center gap-2 text-sm hover:text-primary">
                            <MessageSquare className="w-4 h-4" />
                            <span>{post.comunidad_respuestas?.length || 0}</span>
                            <span>Responder</span>
                        </button>
                    </div>
                    {replyingTo === post.id && (
                        <Form {...replyForm}>
                            <form onSubmit={replyForm.handleSubmit((values) => onReplySubmit(values, post.id))} className="w-full flex items-start gap-4 pt-4 border-t">
                                <Avatar className="h-9 w-9 mt-1">
                                    <AvatarFallback>{getInitials(currentUser?.user_metadata?.name, currentUser?.user_metadata?.last_name)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-2">
                                    <FormField
                                        control={replyForm.control}
                                        name="content"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Textarea
                                                    placeholder="Escribe tu respuesta..."
                                                    className="resize-none"
                                                    rows={2}
                                                    {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" size="sm" disabled={replyForm.formState.isSubmitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
                                        {replyForm.formState.isSubmitting ? 'Enviando...' : 'Enviar Respuesta'}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    )}
                    {post.comunidad_respuestas && post.comunidad_respuestas.length > 0 && (
                        <div className="w-full space-y-4 pt-4 border-t">
                            {post.comunidad_respuestas.map((reply: Reply) => {
                                const replyAuthorProfile = reply.usuarios;
                                const replyAuthorName = replyAuthorProfile ? `${replyAuthorProfile.name} ${replyAuthorProfile.last_name}`.trim() : "Usuario Anónimo";
                                const replyAuthorInitials = getInitials(replyAuthorProfile?.name, replyAuthorProfile?.last_name);
                                const isReplyAuthor = currentUser && currentUser.id === reply.user_id;
                                const canDeleteReply = isReplyAuthor || (isModerator && replyAuthorProfile?.rol === 0);

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
                                                        {replyAuthorProfile?.rol === 1 && (
                                                            <Badge variant="outline" className="border-primary/50 text-primary h-5 text-xs">
                                                                <Check className="w-3 h-3 mr-1" />
                                                                Profesional
                                                            </Badge>
                                                        )}
                                                        {replyAuthorProfile?.rol === 2 && (
                                                            <Badge variant="outline" className="border-yellow-500/50 text-yellow-500 h-5 text-xs">
                                                                <Shield className="w-3 h-3 mr-1" />
                                                                Moderador
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {replyAuthorProfile?.rol === 1 && replyAuthorProfile.titulo && (
                                                        <p className="text-xs text-primary">{replyAuthorProfile.titulo}</p>
                                                    )}
                                                </div>
                                                    {isClient && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDistanceToNow(new Date(reply.fecha), { addSuffix: true, locale: es })}
                                                    </p>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{reply.mensaje}</p>
                                        </div>
                                         {(isReplyAuthor || canDeleteReply) && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    {isReplyAuthor && (
                                                        <DropdownMenuItem onClick={() => handleEditReplyClick(reply)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            <span>Editar</span>
                                                        </DropdownMenuItem>
                                                    )}
                                                    {canDeleteReply && (
                                                        <DropdownMenuItem 
                                                            onSelect={(e) => {
                                                                e.preventDefault();
                                                                if (isReplyAuthor) {
                                                                    handleDeleteReply(reply.id);
                                                                } else {
                                                                    setModerationInfo({
                                                                        contentId: reply.id,
                                                                        targetUserId: reply.user_id,
                                                                        actionType: 'Eliminar Respuesta',
                                                                        section: 'Comunidad - Feed',
                                                                        onConfirm: () => handleDeleteReply(reply.id)
                                                                    });
                                                                }
                                                            }} 
                                                            className="text-destructive"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            <span>Eliminar</span>
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                )
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
                        <Annoyed className="w-12 h-12 mb-4"/>
                        <h3 className="text-lg font-semibold">No hay publicaciones todavía</h3>
                        <p className="text-sm">¡Sé el primero en compartir algo con la comunidad!</p>
                    </div>
                </CardContent>
            </Card>
            )}
        </div>
        
        <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Publicación</DialogTitle>
                </DialogHeader>
                <Form {...editForm}>
                    <form onSubmit={editForm.handleSubmit(handleUpdatePost)} className="space-y-4">
                        <FormField
                            control={editForm.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <Label htmlFor="edit-content" className="sr-only">Contenido</Label>
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
        
        <Dialog open={!!editingReply} onOpenChange={() => setEditingReply(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Respuesta</DialogTitle>
                </DialogHeader>
                <Form {...editReplyForm}>
                    <form onSubmit={editReplyForm.handleSubmit(handleUpdateReply)} className="space-y-4">
                         <FormField
                            control={editReplyForm.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <Label htmlFor="edit-reply-content" className="sr-only">Contenido</Label>
                                    <Textarea id="edit-reply-content" rows={4} {...field} />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                             <DialogClose asChild>
                                <Button type="button" variant="secondary">Cancelar</Button>
                            </DialogClose>
                            <Button type="submit" disabled={editReplyForm.formState.isSubmitting}>
                                {editReplyForm.formState.isSubmitting ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>

        {moderationInfo && currentUser && (
            <ModerationActionDialog
                isOpen={!!moderationInfo}
                onClose={() => setModerationInfo(null)}
                onConfirm={moderationInfo.onConfirm}
                moderatorId={currentUser.id}
                targetUserId={moderationInfo.targetUserId}
                actionType={moderationInfo.actionType}
                section={moderationInfo.section}
                contentId={moderationInfo.contentId}
            />
        )}
    </>
  )
}
