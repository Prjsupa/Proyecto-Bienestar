
"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEventListener } from 'usehooks-ts'

import { AppLayout } from '@/components/app-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { Conversation, Author } from '@/types/community';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, Briefcase, PlusCircle, MessageSquareText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function ConsultasPage() {
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<number | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    
    // For starting a new conversation
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [professionals, setProfessionals] = useState<Author[]>([]);

    const router = useRouter();
    const pathname = usePathname();
    const { toast } = useToast();
    const supabase = createClient();

    const fetchInitialData = useCallback(async (user: User) => {
        setLoading(true);
        const { data: profile } = await supabase.from('usuarios').select('rol').eq('id', user.id).single();
        if (!profile) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo encontrar tu perfil.' });
            setLoading(false);
            return;
        }
        setUserRole(profile.rol);

        let rpcCall = '';
        let params = {};

        if (profile.rol === 0) { // User
            rpcCall = 'get_conversations_for_user';
            params = { u_id: user.id };
        } else if (profile.rol === 1) { // Professional
            rpcCall = 'get_conversations_for_professional';
            params = { p_id: user.id };
        }

        if (rpcCall) {
            const { data, error } = await supabase.rpc(rpcCall, params);
            if (error) {
                console.error(error);
                toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar tus conversaciones.' });
            } else {
                setConversations(data as Conversation[]);
            }
        }
        setLoading(false);
    }, [supabase, toast]);

    const fetchProfessionals = useCallback(async () => {
        const { data, error } = await supabase
            .from('usuarios')
            .select('id, name, last_name, rol, titulo')
            .eq('rol', 1);
        if (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los profesionales.' });
        } else {
            setProfessionals(data);
        }
    }, [supabase, toast]);


    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setCurrentUser(user);
        };
        getUser();
    }, [supabase, router]);
    
    useEffect(() => {
        if(currentUser){
            fetchInitialData(currentUser);
        }
    }, [currentUser, fetchInitialData])

    // Refetch data when window becomes visible (e.g., user navigates back)
    const onVisibilityChange = () => {
        if (document.visibilityState === 'visible' && currentUser) {
            fetchInitialData(currentUser);
        }
    };
    useEventListener('visibilitychange', onVisibilityChange);

    const handleStartConversation = async (professionalId: string) => {
        if (!currentUser) return;
        setIsModalOpen(false); // Close modal immediately

        const { data, error } = await supabase
            .rpc('get_or_create_conversation', { p_id: professionalId, u_id: currentUser.id });
        
        if (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo iniciar la conversación.' });
        } else {
            router.push(`/consultas/${data}`);
        }
    };
    
    const getInitials = (name?: string | null, lastName?: string | null) => {
        if (name && lastName) return `${name[0]}${lastName[0]}`.toUpperCase();
        if (name) return name.substring(0, 2).toUpperCase();
        return "U";
    };
    
    const handleNewConversationClick = async () => {
        await fetchProfessionals();
        setIsModalOpen(true);
    }

    if (loading) {
        return (
            <AppLayout>
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                    <Card>
                        <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    const ConversationList = ({ conversations, role }: { conversations: Conversation[], role: number }) => (
        <Card>
            <CardHeader className="flex flex-row justify-between items-center">
                <div>
                    <CardTitle className="flex items-center gap-2"><Users /> Tus Conversaciones</CardTitle>
                    <CardDescription>
                        {role === 0 
                            ? "Aquí están tus conversaciones con los profesionales." 
                            : "Aquí están las conversaciones que los usuarios han iniciado contigo."
                        }
                    </CardDescription>
                </div>
                {role === 0 && (
                    <Button onClick={handleNewConversationClick}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nueva Consulta
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-3">
                {conversations.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No tienes conversaciones activas.</p>
                ) : (
                    conversations.map(convo => {
                        const otherParticipant = role === 0 ? convo.professional : convo.user;
                        const unread = role === 0 ? convo.unread_by_user : convo.unread_by_professional;
                        
                        return (
                        <Link key={convo.id} href={`/consultas/${convo.id}`} className="block">
                            <div className="w-full text-left p-4 rounded-lg border flex items-center gap-4 hover:bg-muted/50 transition-colors relative">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback>{getInitials(otherParticipant.name, otherParticipant.last_name)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col">
                                          <p className="font-semibold">{otherParticipant.name} {otherParticipant.last_name}</p>
                                          {otherParticipant.titulo && <p className="text-xs text-primary">{otherParticipant.titulo}</p>}
                                        </div>
                                        <p className="text-xs text-muted-foreground whitespace-nowrap">{formatDistanceToNow(new Date(convo.last_message_at), { addSuffix: true, locale: es })}</p>
                                    </div>
                                    <p className={cn("text-sm text-muted-foreground truncate", unread && "font-bold text-foreground")}>
                                        {convo.last_message_preview || "..."}
                                    </p>
                                </div>
                                {unread && <div className="absolute top-3 right-3 h-3 w-3 rounded-full bg-primary" />}
                            </div>
                        </Link>
                    )})
                )}
            </CardContent>
        </Card>
    );

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto">
                <div className="space-y-2 mb-8">
                    <h1 className="text-3xl font-bold font-headline">Consultas Privadas</h1>
                    <p className="text-muted-foreground">
                        {userRole === 0 ? "Inicia o continúa una conversación directa con nuestros expertos." : "Gestiona tus conversaciones con los usuarios."}
                    </p>
                </div>
                {userRole !== null && <ConversationList conversations={conversations} role={userRole} />}
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Briefcase /> Selecciona un Profesional</DialogTitle>
                        <DialogDescription>
                            Haz clic en un profesional para iniciar una nueva conversación privada.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-4 max-h-[60vh] overflow-y-auto">
                         {professionals.map(pro => (
                            <button 
                                key={pro.id} 
                                className="w-full text-left p-4 rounded-lg border flex items-center gap-4 hover:bg-muted/50 transition-colors"
                                onClick={() => handleStartConversation(pro.id)}
                            >
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback>{getInitials(pro.name, pro.last_name)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-semibold">{pro.name} {pro.last_name}</p>
                                    <p className="text-sm text-primary">{pro.titulo}</p>
                                </div>
                                <MessageSquareText className="w-5 h-5 text-muted-foreground" />
                            </button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
