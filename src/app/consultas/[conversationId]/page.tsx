
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import Image from 'next/image';

import { AppLayout } from '@/components/app-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, Clock, Check, XCircle, Paperclip, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatMessage, Conversation, Author } from '@/types/community';


const chatSchema = z.object({
    message: z.string().max(1000, 'El mensaje no puede exceder los 1000 caracteres.'),
    file: z.any().optional(),
}).refine(data => data.message || data.file, {
    message: 'El mensaje o la imagen no pueden estar vacíos.',
    path: ['message'],
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ChatPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [otherParticipant, setOtherParticipant] = useState<Author | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    
    const params = useParams();
    const conversationId = params.conversationId as string;
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const router = useRouter();
    const supabase = createClient();
    
    const form = useForm<z.infer<typeof chatSchema>>({
        resolver: zodResolver(chatSchema),
        defaultValues: { message: '' },
    });
    
    const fetchMessages = useCallback(async () => {
        const { data, error } = await supabase
            .from('mensajes_chat')
            .select('*, sender:sender_id(id, name, last_name)')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });
        
        if (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los mensajes.' });
        } else {
            setMessages(data.map(m => ({ ...m, status: 'delivered' })));
        }
    }, [supabase, conversationId, toast]);

    const markAsRead = useCallback(async (role: number) => {
        if (role === null) return;
    
        const fieldToUpdate = role === 0 ? 'unread_by_user' : 'unread_by_professional';
        
        const { error } = await supabase
            .from('conversaciones')
            .update({ [fieldToUpdate]: false })
            .eq('id', conversationId);
    
        if (error) {
            console.error("Error marking as read", error);
            // This might fail if RLS prevents it, but we try anyway.
            // Don't toast here to avoid bothering the user.
        }
    }, [supabase, conversationId]);

    useEffect(() => {
        const getUserAndConversation = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setCurrentUser(user);
            
            const { data: profile } = await supabase.from('usuarios').select('rol').eq('id', user.id).single();
            const role = profile?.rol ?? null;
            setUserRole(role);

            const { data: convoData, error: convoError } = await supabase
                .rpc('get_conversation_by_id', { c_id: conversationId, requestor_id: user.id });

            if (convoError || !convoData || convoData.length === 0) {
                toast({ variant: 'destructive', title: 'Error', description: 'No se pudo encontrar la conversación o no tienes acceso.' });
                router.push('/consultas');
                return;
            }
            
            const currentConvo = convoData[0] as Conversation;
            setConversation(currentConvo);
            
            const other = role === 0 ? currentConvo.professional : currentConvo.user;
            setOtherParticipant(other);

            await fetchMessages();
            
            if (role !== null) {
                const unread = role === 0 ? currentConvo.unread_by_user : currentConvo.unread_by_professional;
                if (unread) {
                   await markAsRead(role);
                }
            }

            setLoading(false);
        };
        getUserAndConversation();
    }, [conversationId, router, supabase, toast, fetchMessages, markAsRead]);

    useEffect(() => {
        if (!currentUser || userRole === null) return;

        const channel = supabase
            .channel(`chat-${conversationId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'mensajes_chat',
                filter: `conversation_id=eq.${conversationId}`
            }, async (payload) => {
                 const { data: authorData } = await supabase
                    .from('usuarios')
                    .select('id, name, last_name')
                    .eq('id', payload.new.sender_id)
                    .single();

                const newMessage = { 
                    ...payload.new, 
                    sender: authorData || undefined, 
                    status: 'delivered' 
                } as ChatMessage;

                if(newMessage.sender_id !== currentUser.id) {
                    setMessages(prev => [...prev, newMessage]);
                    await markAsRead(userRole);
                } else {
                    setMessages(prev => prev.map(m => 
                        m.optimisticId === `optimistic-${payload.new.id}` ? newMessage : m
                    ));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, supabase, currentUser, userRole, markAsRead]);
    
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
            });
        }
    }, [messages]);

    const getInitials = (name?: string | null, lastName?: string | null) => {
        if (name && lastName) return `${name[0]}${lastName[0]}`.toUpperCase();
        if (name) return name.substring(0, 2).toUpperCase();
        return "U";
    };

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
            setImagePreview(URL.createObjectURL(file));
        }
    };
    
    const removeImagePreview = () => {
        setSelectedFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    const onSubmit = async (values: z.infer<typeof chatSchema>) => {
        if (!currentUser || !conversation || !otherParticipant || userRole === null) return;
        
        let imageUrl: string | undefined = undefined;

        const tempId = `optimistic-${Date.now()}`;
        const optimisticMessage: ChatMessage = {
            id: tempId,
            optimisticId: tempId,
            conversation_id: conversationId,
            sender_id: currentUser.id,
            receiver_id: otherParticipant.id,
            message: values.message,
            img_url: imagePreview || undefined,
            created_at: new Date().toISOString(),
            status: 'sending',
            sender: {
                id: currentUser.id,
                name: currentUser.user_metadata.name,
                last_name: currentUser.user_metadata.last_name,
            }
        };
        
        setMessages(prev => [...prev, optimisticMessage]);
        form.reset();
        removeImagePreview();

        if (selectedFile) {
            const filePath = `${conversationId}/${currentUser.id}/${Date.now()}_${selectedFile.name}`;
            const { error: uploadError } = await supabase.storage
                .from('conversaciones')
                .upload(filePath, selectedFile);
            
            if (uploadError) {
                toast({ variant: 'destructive', title: 'Error al subir imagen', description: uploadError.message });
                setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m));
                return;
            }
            const { data: { publicUrl } } = supabase.storage.from('conversaciones').getPublicUrl(filePath);
            imageUrl = publicUrl;
        }

        const { data: insertData, error } = await supabase
            .from('mensajes_chat')
            .insert({
                conversation_id: conversationId,
                sender_id: currentUser.id,
                receiver_id: otherParticipant.id,
                message: values.message,
                img_url: imageUrl,
            })
            .select('id')
            .single();

        if (error) {
            toast({ variant: 'destructive', title: 'Error al enviar', description: error.message });
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m));
        } else {
             setMessages(prev => prev.map(m => m.id === tempId ? { ...m, optimisticId: `optimistic-${insertData.id}` } : m));
             // After sending, ensure the sender's own conversation is marked as read.
             await markAsRead(userRole);
        }
    };
    
    if (loading) {
        return (
            <AppLayout>
                <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-10rem)]">
                    <div className="p-4 border-b flex items-center gap-4">
                        <Skeleton className="h-6 w-6" />
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-1">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                    <div className="flex-1 p-4 space-y-4">
                         <Skeleton className="h-12 w-3/4" />
                         <Skeleton className="h-12 w-3/4 ml-auto" />
                         <Skeleton className="h-12 w-3/4" />
                    </div>
                    <div className="p-4 border-t">
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto border rounded-lg flex flex-col h-[calc(100vh-8rem)]">
                <div className="p-4 border-b flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/consultas"><ArrowLeft className="h-5 w-5"/></Link>
                    </Button>
                    <Avatar className="h-12 w-12">
                        <AvatarFallback>{getInitials(otherParticipant?.name, otherParticipant?.last_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-bold">{otherParticipant?.name} {otherParticipant?.last_name}</p>
                        <p className="text-sm text-primary">{otherParticipant?.titulo}</p>
                    </div>
                </div>
                <ScrollArea className="flex-1 p-4 bg-muted/20" ref={scrollAreaRef}>
                    <div className="space-y-6">
                        {messages.map((msg, index) => {
                            const isCurrentUser = msg.sender_id === currentUser?.id;
                            const showDateSeparator = index === 0 || format(new Date(messages[index-1].created_at), 'yyyy-MM-dd') !== format(new Date(msg.created_at), 'yyyy-MM-dd');
                            
                            return (
                                <div key={msg.id}>
                                    {showDateSeparator && (
                                        <div className="text-center text-xs text-muted-foreground my-4">
                                            {format(new Date(msg.created_at), "eeee, dd 'de' MMMM", { locale: es })}
                                        </div>
                                    )}
                                    <div className={cn("flex items-end gap-2", isCurrentUser ? "justify-end" : "justify-start")}>
                                        <div className={cn("max-w-[75%] p-3 rounded-xl space-y-2", isCurrentUser ? "bg-primary text-primary-foreground rounded-br-none" : "bg-background rounded-bl-none border")}>
                                            {msg.img_url && (
                                                <Image 
                                                    src={msg.img_url} 
                                                    alt="Imagen adjunta" 
                                                    width={300} 
                                                    height={300} 
                                                    className="rounded-md object-cover" 
                                                    data-ai-hint="medical photo"
                                                />
                                            )}
                                            {msg.message && <p className="text-sm whitespace-pre-wrap">{msg.message}</p>}
                                        </div>
                                    </div>
                                    {isCurrentUser ? (
                                        <div className="flex items-center justify-end gap-1 mt-1 text-xs text-muted-foreground">
                                            <span>{format(new Date(msg.created_at), "HH:mm")}</span>
                                            {msg.status === 'sending' && <Clock className="h-3 w-3" />}
                                            {msg.status === 'delivered' && <Check className="h-3 w-3" />}
                                            {msg.status === 'failed' && <XCircle className="h-3 w-3 text-destructive" />}
                                        </div>
                                    ) : (
                                         <p className="text-xs text-muted-foreground mt-1">
                                            {format(new Date(msg.created_at), "HH:mm")}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t bg-background">
                    {imagePreview && (
                        <div className="relative w-24 h-24 mb-4 rounded-md overflow-hidden">
                            <Image src={imagePreview} alt="Vista previa" layout="fill" objectFit="cover" />
                            <Button 
                                variant="destructive" 
                                size="icon" 
                                className="absolute top-1 right-1 h-6 w-6"
                                onClick={removeImagePreview}
                            >
                                <X className="h-4 w-4"/>
                            </Button>
                        </div>
                    )}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4">
                            <FormField
                                control={form.control}
                                name="message"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <div className="relative">
                                                <Textarea
                                                    placeholder="Escribe tu mensaje..."
                                                    className="resize-none pr-12"
                                                    rows={2}
                                                    {...field}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            form.handleSubmit(onSubmit)();
                                                        }
                                                    }}
                                                />
                                                <Button 
                                                    type="button" 
                                                    variant="ghost" 
                                                    size="icon"
                                                    className="absolute bottom-2 right-2 h-8 w-8"
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    <Paperclip className="h-5 w-5" />
                                                </Button>
                                                <input 
                                                    type="file" 
                                                    ref={fileInputRef} 
                                                    className="hidden" 
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                />
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                                <Send className="h-5 w-5"/>
                                <span className="sr-only">Enviar</span>
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </AppLayout>
    );
}

    