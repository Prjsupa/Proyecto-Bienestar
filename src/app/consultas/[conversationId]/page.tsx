
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

import { AppLayout } from '@/components/app-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, Clock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatMessage, Conversation, Author } from '@/types/community';


const chatSchema = z.object({
    message: z.string().min(1, 'El mensaje no puede estar vacío').max(1000, 'El mensaje no puede exceder los 1000 caracteres.'),
});

export default function ChatPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [otherParticipant, setOtherParticipant] = useState<Author | null>(null);
    
    const params = useParams();
    const conversationId = params.conversationId as string;
    const scrollAreaRef = useRef<HTMLDivElement>(null);
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
            .select('*, sender:sender_id(*)')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });
        
        if (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los mensajes.' });
        } else {
            setMessages(data.map(m => ({ ...m, status: 'delivered' })));
        }
    }, [supabase, conversationId, toast]);

    const markAsRead = useCallback(async (currentRole: number, currentConvo: Conversation) => {
        if (currentRole === null || !currentConvo) return;
        
        const fieldToUpdate = currentRole === 0 ? 'unread_by_user' : 'unread_by_professional';
        const needsUpdate = currentConvo[fieldToUpdate];
    
        if (!needsUpdate) return;
    
        const { error } = await supabase
            .from('conversaciones')
            .update({ [fieldToUpdate]: false })
            .eq('id', currentConvo.id);
    
        if (error) {
            console.error("Error marking as read", error);
        } else {
            setConversation(prev => prev ? { ...prev, [fieldToUpdate]: false } : null);
        }
    }, [supabase]);

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
            setLoading(false);
            
            if (role !== null) {
                await markAsRead(role, currentConvo);
            }
        };
        getUserAndConversation();
    }, [conversationId, router, supabase, toast, fetchMessages, markAsRead]);

    useEffect(() => {
        if (!currentUser) return;

        const channel = supabase
            .channel(`chat-${conversationId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'mensajes_chat',
                filter: `conversation_id=eq.${conversationId}`
            }, async (payload) => {
                 const { data: authorData, error: authorError } = await supabase
                    .from('usuarios')
                    .select('*')
                    .eq('id', payload.new.sender_id)
                    .single();

                let newMessage: ChatMessage;
                if (authorError) {
                    console.error("Error fetching author for new message:", authorError);
                    newMessage = { ...payload.new, status: 'delivered' } as ChatMessage;
                } else {
                    newMessage = { ...payload.new, sender: authorData, status: 'delivered' } as ChatMessage;
                }


                if(newMessage.sender_id !== currentUser.id) {
                    setMessages(prev => [...prev, newMessage]);
                    if (userRole !== null && conversation !== null) {
                        await markAsRead(userRole, conversation);
                    }
                } else {
                    // Update the optimistic message with the real one from the DB
                    setMessages(prev => prev.map(m => 
                        m.optimisticId === `optimistic-${payload.new.id}` ? newMessage : m
                    ));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, supabase, currentUser, userRole, conversation, markAsRead]);
    
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

    const onSubmit = async (values: z.infer<typeof chatSchema>) => {
        if (!currentUser || !conversation || userRole === null) return;
        
        const tempId = `optimistic-${Date.now()}`;
        const optimisticMessage: ChatMessage = {
            id: tempId,
            optimisticId: tempId,
            conversation_id: conversationId,
            sender_id: currentUser.id,
            receiver_id: otherParticipant!.id,
            message: values.message,
            created_at: new Date().toISOString(),
            status: 'sending',
        };
        
        setMessages(prev => [...prev, optimisticMessage]);
        form.reset();

        const { data: insertData, error } = await supabase
            .from('mensajes_chat')
            .insert({
                conversation_id: conversationId,
                sender_id: currentUser.id,
                receiver_id: otherParticipant!.id,
                message: values.message,
            })
            .select()
            .single();

        if (error) {
            toast({ variant: 'destructive', title: 'Error al enviar', description: error.message });
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m));
        } else {
             // This associates the temporary ID with the permanent one
             setMessages(prev => prev.map(m => m.id === tempId ? { ...m, optimisticId: `optimistic-${insertData.id}` } : m));

             if (userRole === 1) {
                const { error: rpcError } = await supabase.rpc('marcar_conversacion_como_leida_profesional', {
                    c_id: conversationId,
                });

                if (rpcError) {
                    console.error("Error calling RPC to mark as read:", rpcError);
                } else {
                    setConversation(prev => prev ? { ...prev, unread_by_professional: false } : null);
                }
             }
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
                                        <div className={cn("max-w-[75%] p-3 rounded-xl", isCurrentUser ? "bg-primary text-primary-foreground rounded-br-none" : "bg-background rounded-bl-none border")}>
                                            <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                        </div>
                                    </div>
                                    {isCurrentUser && (
                                        <div className="flex items-center justify-end gap-1 mt-1">
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(msg.created_at), "HH:mm")}
                                            </p>
                                            {msg.status === 'sending' && <Clock className="h-3 w-3 text-muted-foreground" />}
                                            {msg.status === 'delivered' && <Check className="h-3 w-3 text-muted-foreground" />}
                                            {msg.status === 'failed' && <span className="text-xs text-destructive">Fallo</span>}
                                        </div>
                                    )}
                                    {!isCurrentUser && (
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
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4">
                            <FormField
                                control={form.control}
                                name="message"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <Textarea
                                                placeholder="Escribe tu mensaje..."
                                                className="resize-none"
                                                rows={2}
                                                {...field}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        form.handleSubmit(onSubmit)();
                                                    }
                                                }}
                                            />
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

    