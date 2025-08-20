
"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Bell, Circle } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Notificacion } from '@/types/community';

export function NotificationsDropdown() {
    const [notifications, setNotifications] = useState<Notificacion[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('notificaciones')
            .select('*')
            .order('fecha', { ascending: false })
            .limit(20);

        if (error) {
            console.error("Error fetching notifications:", error);
        } else {
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.leida).length);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchNotifications();

        const channel = supabase
            .channel('realtime-notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notificaciones'
            }, (payload) => {
                const newNotification = payload.new as Notificacion;
                // Add the new notification to the top of the list
                setNotifications(prev => [newNotification, ...prev]);
                setUnreadCount(prev => prev + 1);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };

    }, [fetchNotifications, supabase]);

    const handleMarkAsRead = async (id: string) => {
        // Optimistic UI update
        const originalNotifications = [...notifications];
        setNotifications(notifications.map(n => n.id === id ? { ...n, leida: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));

        const { error } = await supabase
            .from('notificaciones')
            .update({ leida: true })
            .eq('id', id);

        if (error) {
            // Revert on error
            setNotifications(originalNotifications);
            setUnreadCount(originalNotifications.filter(n => !n.leida).length);
            console.error("Error marking notification as read:", error);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <div className="absolute top-1.5 right-1.5 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive/80 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-destructive text-xs items-center justify-center text-destructive-foreground">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        </div>
                    )}
                    <span className="sr-only">Notificaciones</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 md:w-96" align="end">
                <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[400px]">
                    {loading ? (
                        <div className="p-2 space-y-2">
                           {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center text-sm text-muted-foreground py-10">
                            No tienes notificaciones nuevas.
                        </div>
                    ) : (
                        notifications.map(notif => (
                            <DropdownMenuItem key={notif.id} asChild className={cn("flex items-start gap-3 p-3 data-[highlighted]:bg-muted/80", !notif.leida && "bg-secondary")}>
                                <Link href={notif.link || '#'} onClick={() => handleMarkAsRead(notif.id)}>
                                    {!notif.leida && <Circle className="h-2 w-2 mt-1.5 fill-primary text-primary flex-shrink-0" />}
                                    <div className={cn("flex-grow", notif.leida && "ml-4")}>
                                        <p className="text-sm whitespace-normal">{notif.mensaje}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(notif.fecha), { addSuffix: true, locale: es })}</p>
                                    </div>
                                </Link>
                            </DropdownMenuItem>
                        ))
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
