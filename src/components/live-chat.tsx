
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, Check, Shield } from 'lucide-react';
import type { LiveChatMessage } from '@/types/community';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';


const chatSchema = z.object({
    message: z.string().min(1, 'El mensaje no puede estar vacío').max(280, 'El mensaje no puede exceder los 280 caracteres.'),
});

interface LiveChatProps {
    claseId: string;
    currentUser: User;
}

export function LiveChat({ claseId, currentUser }: LiveChatProps) {
    const [messages, setMessages] = useState<LiveChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const supabase = createClient();

    const form = useForm<z.infer<typeof chatSchema>>({
        resolver: zodResolver(chatSchema),
        defaultValues: { message: '' },
    });
    
    const fetchMessages = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('live_chat_mensajes')
            .select('*, usuarios:user_id(*)')
            .eq('clase_id', claseId)
            .order('fecha', { ascending: true });
        
        if (error) {
            console.error("Error fetching chat messages:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los mensajes.' });
        } else {
            setMessages(data as any[]);
        }
        setLoading(false);
    }, [supabase, claseId, toast]);


    useEffect(() => {
        fetchMessages();
        
        const channel = supabase
            .channel(`live-chat-${claseId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'live_chat_mensajes',
                filter: `clase_id=eq.${claseId}`
            }, async (payload) => {
                 const { data: authorData, error: authorError } = await supabase
                    .from('usuarios')
                    .select('*')
                    .eq('id', payload.new.user_id)
                    .single();

                if (authorError) {
                    console.error("Error fetching author for new message:", authorError);
                    setMessages(prev => [...prev, payload.new as LiveChatMessage]);
                } else {
                     const newMessage = {
                        ...payload.new,
                        usuarios: authorData,
                    } as LiveChatMessage;
                    setMessages(prev => [...prev, newMessage]);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [claseId, fetchMessages, supabase]);

     useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const getInitials = (name?: string | null, lastName?: string | null) => {
        if (name && lastName) return `${name[0]}${lastName[0]}`.toUpperCase();
        if (name) return name.substring(0, 2).toUpperCase();
        return "U";
    };

    const onSubmit = async (values: z.infer<typeof chatSchema>) => {
        const { error } = await supabase
            .from('live_chat_mensajes')
            .insert({
                clase_id: claseId,
                user_id: currentUser.id,
                mensaje: values.message,
            });
        if (error) {
            toast({ variant: 'destructive', title: 'Error al enviar', description: error.message });
        } else {
            form.reset();
        }
    };

    return (
        <div className="flex flex-col h-full bg-background">
            <div className="p-4 border-b">
                <h3 className="font-semibold text-lg">Chat en Vivo</h3>
            </div>
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                    {loading ? (
                        [...Array(10)].map((_, i) => (
                           <div key={i} className="flex items-start gap-3">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="flex-1 space-y-1">
                                    <Skeleton className="h-4 w-2/5" />
                                    <Skeleton className="h-4 w-4/5" />
                                </div>
                            </div>
                        ))
                    ) : messages.length === 0 ? (
                        <div className="text-center text-sm text-muted-foreground py-10">
                            No hay mensajes todavía. ¡Sé el primero!
                        </div>
                    ) : (
                        messages.map(msg => {
                            const author = msg.usuarios;
                            const authorName = author ? `${author.name} ${author.last_name}`.trim() : 'Usuario';
                            const authorInitials = getInitials(author?.name, author?.last_name);
                            const isCurrentUser = msg.user_id === currentUser.id;

                            return (
                                <div key={msg.id} className={cn("flex items-start gap-3", isCurrentUser && "justify-end")}>
                                     {!isCurrentUser && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{authorInitials}</AvatarFallback>
                                        </Avatar>
                                     )}
                                     <div className={cn("flex-1 max-w-[80%] p-3 rounded-lg", isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted")}>
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-sm">{isCurrentUser ? "Tú" : authorName}</p>
                                                {author?.rol === 1 && <Badge variant="secondary" className="h-5 text-xs"><Check className="w-3 h-3 mr-1"/>Profesional</Badge>}
                                                {author?.rol === 2 && <Badge variant="secondary" className="h-5 text-xs"><Shield className="w-3 h-3 mr-1"/>Moderador</Badge>}
                                            </div>
                                            <p className={cn("text-xs", isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground")}>
                                                {formatDistanceToNow(new Date(msg.fecha), { addSuffix: true, locale: es })}
                                            </p>
                                        </div>
                                        <p className="text-sm mt-1 whitespace-pre-wrap">{msg.mensaje}</p>
                                    </div>
                                    {isCurrentUser && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{authorInitials}</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>
            </ScrollArea>
             <div className="p-4 border-t">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2">
                         <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Textarea
                                            placeholder="Escribe tu mensaje..."
                                            className="resize-none"
                                            rows={1}
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
                        <Button type="submit" size="icon" disabled={form.formState.isSubmitting}>
                            <Send className="h-4 w-4"/>
                            <span className="sr-only">Enviar</span>
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}
