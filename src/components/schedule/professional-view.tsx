
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, Users, Check, X, MoreVertical, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { AppointmentWithUser, Cita } from '@/types/community';
import { Skeleton } from '../ui/skeleton';

export function ProfessionalSchedulerView() {
  const [appointments, setAppointments] = useState<AppointmentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>();
  const supabase = createClient();
  const { toast } = useToast();

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cita')
      .select(`
        *,
        usuarios (
          id,
          name,
          last_name
        )
      `)
      .in('estado', ['pendiente', 'confirmada'])
      .order('fecha_agendada', { ascending: true });

    if (error) {
      console.error('Error fetching appointments:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar las citas.' });
    } else {
      setAppointments(data as any[]);
    }
    setLoading(false);
  }, [supabase, toast]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const filteredAppointments = useMemo(() => {
    if (!date) return appointments;
    return appointments.filter(a => isSameDay(new Date(a.fecha_agendada), date));
  }, [appointments, date]);

  const handleUpdateStatus = async (appointment: AppointmentWithUser, newStatus: Cita['estado']) => {
    const { error } = await supabase
      .from('cita')
      .update({ estado: newStatus })
      .eq('id', appointment.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Error al actualizar', description: error.message });
      return;
    }
    
    // Create notification for the user
    const notificationMessage = `Tu cita para el ${format(new Date(appointment.fecha_agendada), "dd/MM/yyyy 'a las' HH:mm", { locale: es })} ha sido ${newStatus === 'confirmada' ? 'confirmada' : 'cancelada'}.`;
    const { error: notificationError } = await supabase
      .from('notificaciones')
      .insert({
        user_id: appointment.user_id,
        mensaje: notificationMessage,
        link: '/schedule'
      });

    if (notificationError) {
      console.warn("Could not create notification for appointment status change:", notificationError);
    }
    
    toast({ title: 'Cita Actualizada', description: `La cita ha sido marcada como ${newStatus}.` });
    fetchAppointments();
  };

  const getStatusInfo = (status: Cita['estado']) => {
    switch (status) {
        case 'pendiente': return { variant: 'secondary', text: 'Pendiente' };
        case 'confirmada': return { variant: 'default', text: 'Confirmada' };
        default: return { variant: 'outline', text: 'Desconocido' };
    }
  }

  const renderSkeletons = () => (
    <TableBody>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i}>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
        </TableRow>
      ))}
    </TableBody>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <Users className="w-8 h-8" />
            Gestión de Citas
        </h1>
        <p className="text-muted-foreground">
            Revisa, confirma o cancela las citas agendadas por los usuarios.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <CardTitle>
                  {date ? `Citas para el ${format(date, "PPP", { locale: es })}` : 'Todas las Citas'}
                </CardTitle>
                <CardDescription>
                    {filteredAppointments.length > 0 
                        ? `Mostrando ${filteredAppointments.length} cita(s).`
                        : 'No hay citas que coincidan con los filtros.'
                    }
                </CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full sm:w-[280px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>{date ? format(date, "PPP", { locale: es }) : 'Filtrar por fecha...'}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
              {date && (
                <Button variant="ghost" size="icon" onClick={() => setDate(undefined)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
        </CardHeader>
        <CardContent>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Hora</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    {loading ? renderSkeletons() : (
                        <TableBody>
                            {filteredAppointments.length > 0 ? (
                                filteredAppointments.map((appt) => {
                                    const status = getStatusInfo(appt.estado);
                                    const userName = appt.usuarios ? `${appt.usuarios.name} ${appt.usuarios.last_name}` : 'Usuario no disponible';

                                    return (
                                        <TableRow key={appt.id}>
                                            <TableCell className="font-medium">{userName}</TableCell>
                                            <TableCell>{format(new Date(appt.fecha_agendada), 'PPP', { locale: es })}</TableCell>
                                            <TableCell>{format(new Date(appt.fecha_agendada), 'HH:mm', { locale: es })}</TableCell>
                                            <TableCell>
                                                <Badge variant={status.variant}>{status.text}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem onClick={() => handleUpdateStatus(appt, 'confirmada')} disabled={appt.estado === 'confirmada'}>
                                                            <Check className="mr-2 h-4 w-4" />
                                                            <span>Confirmar</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleUpdateStatus(appt, 'cancelada')} className="text-destructive">
                                                            <X className="mr-2 h-4 w-4" />
                                                            <span>Cancelar Cita</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No hay citas para mostrar.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    )}
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
