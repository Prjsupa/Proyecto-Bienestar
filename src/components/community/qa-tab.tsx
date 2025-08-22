

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Annoyed, MessageSquare, Paperclip, X, Image as ImageIcon, Check, MoreHorizontal, Edit, Trash2, Shield } from "lucide-react";
import Image from "next/image";

import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import type { ProfessionalQuestion, ProfessionalReply } from "@/types/community";
import { Badge } from "../ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ModerationActionDialog } from "./moderation-action-dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const questionSchema = z.object({
  mensaje: z.string().min(15, "La pregunta debe tener al menos 15 caracteres.").max(500, "La pregunta no puede exceder los 500 caracteres."),
  file: z.any().optional(),
});

const editQuestionSchema = z.object({
    mensaje: z.string().min(15, "La pregunta debe tener al menos 15 caracteres.").max(500, "La pregunta no puede exceder los 500 caracteres."),
});

const replySchema = z.object({
  mensaje: z.string().min(1, "La respuesta no puede estar vacía.").max(500, "La respuesta no puede exceder los 500 caracteres."),
});

const editReplySchema = z.object({
    mensaje: z.string().min(1, "La respuesta no puede estar vacía.").max(500, "La respuesta no puede exceder los 500 caracteres."),
});

type ModerationInfo = {
    contentId: string;
    targetUserId: string;
    actionType: 'Eliminar Pregunta' | 'Eliminar Respuesta Profesional';
    section: 'Comunidad - Preguntas';
};


export function QATab() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<number | null>(null);
  const [questions, setQuestions] = useState<ProfessionalQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<ProfessionalQuestion | null>(null);
  const [editingReply, setEditingReply] = useState<ProfessionalReply | null>(null);
  const [moderationInfo, setModerationInfo] = useState<ModerationInfo | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const supabase = createClient();

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pregunta_profesional')
      .select(`
        *,
        usuarios:user_id ( id, name, last_name, rol, titulo ),
        respuesta_profesional (
            *,
            usuarios:user_id ( id, name, last_name, rol, titulo )
        )
      `)
      .order('fecha', { ascending: false })
      .order('fecha', { referencedTable: 'respuesta_profesional', ascending: true });

    if (error) {
      console.error("Error fetching Q&A posts:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar las preguntas." });
    } else {
      setQuestions(data as any[]);
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
        if (profile) {
            setUserRole(profile.rol);
        }
      }

      await fetchQuestions();
      setIsClient(true);
    };
    fetchUserAndData();
  }, [fetchQuestions, supabase]);

  const questionForm = useForm<z.infer<typeof questionSchema>>({
    resolver: zodResolver(questionSchema),
    defaultValues: { mensaje: "" },
  });

  const editQuestionForm = useForm<z.infer<typeof editQuestionSchema>>({
    resolver: zodResolver(editQuestionSchema),
  });

  const replyForm = useForm<z.infer<typeof replySchema>>({
    resolver: zodResolver(replySchema),
    defaultValues: { mensaje: "" },
  });
  
  const editReplyForm = useForm<z.infer<typeof editReplySchema>>({
    resolver: zodResolver(editReplySchema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({ variant: "destructive", title: "Archivo inválido", description: "Solo se permiten imágenes." });
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast({ variant: "destructive", title: "Archivo demasiado grande", description: "La imagen no puede exceder los 5MB." });
        return;
      }
      setSelectedFile(file);
    }
  };

  async function onQuestionSubmit(values: z.infer<typeof questionSchema>) {
    if (!currentUser) {
        toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión para preguntar.' });
        return;
    }
    
    let imageUrl: string | null = null;
    if (selectedFile) {
        const filePath = `${currentUser.id}/${Date.now()}_${selectedFile.name}`;
        const { error: uploadError } = await supabase.storage
            .from('pregunta.profesional')
            .upload(filePath, selectedFile);
        
        if (uploadError) {
            toast({ variant: 'destructive', title: 'Error al subir imagen', description: uploadError.message });
            return;
        }
        
        const { data: { publicUrl } } = supabase.storage.from('pregunta.profesional').getPublicUrl(filePath);
        imageUrl = publicUrl;
    }

    const { error } = await supabase
      .from('pregunta_profesional')
      .insert({ mensaje: values.mensaje, user_id: currentUser.id, img_url: imageUrl });

    if (error) {
      toast({ variant: "destructive", title: "Error al enviar", description: error.message });
    } else {
      toast({ title: "Pregunta enviada", description: "Tu pregunta ha sido publicada." });
      questionForm.reset();
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchQuestions();
    }
  }

  async function onReplySubmit(values: z.infer<typeof replySchema>, postId: string) {
    if (!currentUser) {
      toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión para responder.' });
      return;
    }

    const { error } = await supabase.from('respuesta_profesional').insert({
      post_id: postId,
      user_id: currentUser.id,
      mensaje: values.mensaje,
    });

    if (error) {
      toast({ variant: 'destructive', title: 'Error al responder', description: error.message });
    } else {
      await fetchQuestions();
      replyForm.reset();
      setReplyingTo(null);
    }
  }

  const handleEditQuestionClick = (question: ProfessionalQuestion) => {
    setEditingQuestion(question);
    editQuestionForm.setValue("mensaje", question.mensaje);
  };

  const handleUpdateQuestion = async (values: z.infer<typeof editQuestionSchema>) => {
    if (!editingQuestion) return;
    const { error } = await supabase
      .from('pregunta_profesional')
      .update({ mensaje: values.mensaje })
      .eq('id', editingQuestion.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Error al actualizar', description: error.message });
    } else {
      toast({ title: 'Pregunta actualizada' });
      setEditingQuestion(null);
      await fetchQuestions();
    }
  };

  const handleSimpleDelete = async (id: string, type: 'question' | 'reply') => {
    const tableName = type === 'question' ? 'pregunta_profesional' : 'respuesta_profesional';
    const storageName = type === 'question' ? 'pregunta.profesional' : null;

    if (storageName) {
        const { data: item, error: fetchError } = await supabase.from(tableName).select('img_url').eq('id', id).single();
        if(item?.img_url) {
            const imagePath = item.img_url.split(`/${storageName}/`)[1];
            if (imagePath) await supabase.storage.from(storageName).remove([imagePath]);
        }
    }

    const { error } = await supabase.from(tableName).delete().eq('id', id);

    if (error) {
        toast({ variant: 'destructive', title: 'Error al eliminar', description: error.message });
    } else {
        toast({ title: 'Contenido eliminado' });
        await fetchQuestions();
    }
  };
  
  const handleEditReplyClick = (reply: ProfessionalReply) => {
    setEditingReply(reply);
    editReplyForm.setValue("mensaje", reply.mensaje);
  };
  
  const handleUpdateReply = async (values: z.infer<typeof editReplySchema>) => {
    if (!editingReply) return;

    const { error } = await supabase
      .from('respuesta_profesional')
      .update({ mensaje: values.mensaje })
      .eq('id', editingReply.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Error al actualizar', description: error.message });
    } else {
      toast({ title: 'Respuesta actualizada' });
      setEditingReply(null);
      await fetchQuestions();
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

  const isProfessional = userRole === 1;

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-headline">Pregúntale a nuestros Expertos</CardTitle>
          <p className="text-sm text-muted-foreground">¿Tienes dudas sobre nutrición, entrenamientos o bienestar? Nuestros profesionales están aquí para ayudarte.</p>
        </CardHeader>
        <CardContent>
          <Form {...questionForm}>
            <form onSubmit={questionForm.handleSubmit(onQuestionSubmit)} className="space-y-4">
              <FormField
                control={questionForm.control}
                name="mensaje"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tu Pregunta</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Por ejemplo: '¿Cuál es la mejor forma de calentar para una sesión de pesas?'"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <div className="flex justify-between items-center">
                <FormField
                  control={questionForm.control}
                  name="file"
                  render={() => (
                    <FormItem>
                      <FormControl>
                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                          <Paperclip className="w-4 h-4 mr-2" />
                          Adjuntar Imagen
                        </Button>
                      </FormControl>
                      <input
                        type="file"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={questionForm.formState.isSubmitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
                  {questionForm.formState.isSubmitting ? 'Enviando...' : 'Enviar Pregunta'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold font-headline">Preguntas Recientes</h2>
        {loading ? renderSkeletons() : questions.length === 0 ? (
           <Card>
              <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                      <Annoyed className="w-12 h-12 mb-4"/>
                      <h3 className="text-lg font-semibold">No hay preguntas todavía</h3>
                      <p className="text-sm">¡Sé el primero en preguntar algo!</p>
                  </div>
              </CardContent>
          </Card>
        ) : questions.map((question) => {
            const author = question.usuarios;
            const authorName = author ? `${author.name || ''} ${author.last_name || ''}`.trim() : "Usuario Anónimo";
            const authorInitials = getInitials(author?.name, author?.last_name);
            const isAuthor = currentUser && currentUser.id === question.user_id;
            const canReply = isProfessional || isAuthor;
            const isModerator = userRole === 2;
            const canModeratorDelete = isModerator && !isAuthor && author?.rol === 0;

            return (
              <Card key={question.id}>
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
                      {isClient && (
                        <p className="text-xs text-muted-foreground">
                          preguntó {formatDistanceToNow(new Date(question.fecha), { addSuffix: true, locale: es })}
                        </p>
                      )}
                    </div>
                    {(isAuthor || canModeratorDelete) && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {isAuthor && (
                                    <DropdownMenuItem onClick={() => handleEditQuestionClick(question)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        <span>Editar</span>
                                    </DropdownMenuItem>
                                )}
                                {canModeratorDelete ? (
                                    <DropdownMenuItem
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            setModerationInfo({
                                                contentId: question.id,
                                                targetUserId: question.user_id,
                                                actionType: 'Eliminar Pregunta',
                                                section: 'Comunidad - Preguntas',
                                            });
                                        }}
                                        className="text-destructive"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span>Eliminar (Mod)</span>
                                    </DropdownMenuItem>
                                ) : isAuthor && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" /><span>Eliminar</span>
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleSimpleDelete(question.id, 'question')}>Continuar</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{question.mensaje}</p>
                    {question.img_url && (
                    <div className="mt-4">
                        <Image 
                        src={question.img_url} 
                        alt="Imagen de la pregunta" 
                        width={500} 
                        height={500} 
                        className="rounded-lg object-cover w-full max-h-[400px]"
                        />
                    </div>
                    )}
                </CardContent>
                <CardFooter className="flex-col items-start gap-4">
                    {canReply && (
                      <div className="w-full">
                        <button onClick={() => setReplyingTo(replyingTo === question.id ? null : question.id)} className="flex items-center gap-2 text-sm hover:text-primary">
                          <MessageSquare className="w-4 h-4" />
                          <span>{question.respuesta_profesional?.length || 0}</span>
                          <span>Responder</span>
                        </button>
                        {replyingTo === question.id && (
                          <Form {...replyForm}>
                            <form onSubmit={replyForm.handleSubmit((values) => onReplySubmit(values, question.id))} className="w-full flex items-start gap-4 pt-4 mt-4 border-t">
                              <Avatar className="h-9 w-9 mt-1">
                                <AvatarFallback>{getInitials(currentUser?.user_metadata?.name, currentUser?.user_metadata?.last_name)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-2">
                                <FormField
                                  control={replyForm.control}
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
                                <Button type="submit" size="sm" disabled={replyForm.formState.isSubmitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
                                  {replyForm.formState.isSubmitting ? 'Enviando...' : 'Enviar Respuesta'}
                                </Button>
                              </div>
                            </form>
                          </Form>
                        )}
                      </div>
                    )}
                    {question.respuesta_profesional && question.respuesta_profesional.length > 0 && (
                      <div className="w-full space-y-4 pt-4 border-t">
                        <h4 className="text-sm font-semibold">Respuestas</h4>
                        {question.respuesta_profesional.map((reply: ProfessionalReply) => {
                          const replyAuthor = reply.usuarios;
                          const replyAuthorName = replyAuthor ? `${replyAuthor.name || ''} ${replyAuthor.last_name || ''}`.trim() : "Usuario";
                          const replyAuthorInitials = getInitials(replyAuthor?.name, replyAuthor?.last_name);
                          const isReplyAuthor = currentUser && currentUser.id === reply.user_id;
                          const canModeratorDeleteReply = isModerator && !isReplyAuthor && replyAuthor?.rol === 0;

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
                              {(isReplyAuthor || canModeratorDeleteReply) && (
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
                                        {canModeratorDeleteReply ? (
                                            <DropdownMenuItem
                                                onSelect={(e) => {
                                                    e.preventDefault();
                                                    setModerationInfo({
                                                        contentId: reply.id,
                                                        targetUserId: reply.user_id,
                                                        actionType: 'Eliminar Respuesta Profesional',
                                                        section: 'Comunidad - Preguntas',
                                                    });
                                                }}
                                                className="text-destructive"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /><span>Eliminar (Mod)</span>
                                            </DropdownMenuItem>
                                        ) : isReplyAuthor && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4" /><span>Eliminar</span>
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                        <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleSimpleDelete(reply.id, 'reply')}>Continuar</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
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
        })}
      </div>
      
        <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Pregunta</DialogTitle>
                </DialogHeader>
                <Form {...editQuestionForm}>
                    <form onSubmit={editQuestionForm.handleSubmit(handleUpdateQuestion)} className="space-y-4">
                        <FormField
                            control={editQuestionForm.control}
                            name="mensaje"
                            render={({ field }) => (
                                <FormItem>
                                    <Textarea id="edit-question-content" rows={4} {...field} />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">Cancelar</Button>
                            </DialogClose>
                            <Button type="submit" disabled={editQuestionForm.formState.isSubmitting}>
                                {editQuestionForm.formState.isSubmitting ? "Guardando..." : "Guardar Cambios"}
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
                onSuccess={fetchQuestions}
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
