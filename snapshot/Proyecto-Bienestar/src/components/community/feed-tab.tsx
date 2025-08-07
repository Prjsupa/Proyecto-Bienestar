
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Annoyed, Image as ImageIcon, MessageSquare, Paperclip, X } from "lucide-react";
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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const postSchema = z.object({
  content: z.string().min(10, "La publicación debe tener al menos 10 caracteres.").max(500, "La publicación no puede exceder los 500 caracteres."),
  file: z.any().optional(),
});

const replySchema = z.object({
  content: z.string().min(1, "La respuesta no puede estar vacía.").max(500, "La respuesta no puede exceder los 500 caracteres."),
});

export function FeedTab() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [selectedPostFile, setSelectedPostFile] = useState<File | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const postFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const supabase = createClient();
  
  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    const { data: postsData, error: postsError } = await supabase
        .from('comunidad')
        .select(`
            *,
            usuarios ( name, last_name ),
            comunidad_respuestas ( *, usuarios_vista(*) )
        `)
        .order('fecha', { ascending: false });

    if (postsError) {
        console.error('Error fetching posts:', postsError);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar las publicaciones.' });
    } else {
        setCommunityPosts(postsData as any[]);
    }
    setLoadingPosts(false);
  }, [supabase, toast]);

  useEffect(() => {
    const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
    }
    fetchUser();
    fetchPosts();
    setIsClient(true);
  }, [fetchPosts, supabase]);

  const postForm = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: { content: "" },
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
                                const replyAuthorProfile = reply.usuarios_vista;
                                const replyAuthorName = replyAuthorProfile ? `${replyAuthorProfile.name} ${replyAuthorProfile.last_name}`.trim() : "Usuario Anónimo";
                                const replyAuthorInitials = getInitials(replyAuthorProfile?.name, replyAuthorProfile?.last_name);
                                return (
                                    <div key={reply.id} className="flex items-start gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{replyAuthorInitials}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 bg-secondary p-3 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <p className="font-semibold text-sm">{replyAuthorName}</p>
                                                    {isClient && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDistanceToNow(new Date(reply.fecha), { addSuffix: true, locale: es })}
                                                    </p>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{reply.mensaje}</p>
                                        </div>
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
    </>
  )
}
