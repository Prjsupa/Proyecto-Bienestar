
"use client";

import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { format, getDay, startOfDay, setHours, setMinutes, setSeconds } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarClock, CalendarPlus, CalendarCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const availableTimes = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00",
];

type Cita = {
    id: string;
    fecha_agendada: string;
    estado: 'pendiente' | 'confirmada' | 'cancelada';
}

export default function SchedulePage() {
  const [user, setUser] = useState<User | null>(null);
  const [existingAppointment, setExistingAppointment] = useState<Cita | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRescheduling, setIsRescheduling] = useState(false);
  
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    const fetchUserAndAppointment = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
            const { data, error } = await supabase
                .from('cita')
                .select('*')
                .eq('user_id', user.id)
                .in('estado', ['pendiente', 'confirmada'])
                .order('fecha_agendada', { ascending: false })
                .limit(1)
                .maybeSingle();
            
            if (error) {
                console.error("Error fetching appointment:", error);
                if (error.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine.
                    toast({ variant: "destructive", title: "Error", description: "No se pudo cargar tu cita existente." });
                }
            } else if (data) {
                setExistingAppointment(data);
            }
        }
        setLoading(false);
    };
    fetchUserAndAppointment();
  }, [supabase, toast]);

  const handleSchedule = async () => {
    if (!user || !date || !selectedTime) {
      toast({ variant: "destructive", title: "Selección incompleta", description: "Por favor, selecciona una fecha y una hora." });
      return;
    }
    
    setIsSubmitting(true);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const appointmentDate = setSeconds(setMinutes(setHours(date, hours), minutes), 0);

    const { data: newAppointment, error } = await supabase
      .from('cita')
      .insert({
        user_id: user.id,
        fecha_agendada: appointmentDate.toISOString(),
        estado: 'pendiente'
      })
      .select()
      .single();

    if (error) {
      toast({ variant: "destructive", title: "Error al agendar", description: error.message });
      console.error("Error inserting appointment:", error);
    } else {
      toast({ title: "¡Cita Agendada!", description: `Tu cita ha sido agendada para el ${format(appointmentDate, "PPP", { locale: es })} a las ${selectedTime}.` });
      setExistingAppointment(newAppointment);
      setDate(undefined);
      setSelectedTime(null);
    }
    setIsSubmitting(false);
  };
  
   const handleReschedule = async () => {
    if (!existingAppointment || !date || !selectedTime) return;
    setIsSubmitting(true);
    
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const newAppointmentDate = setSeconds(setMinutes(setHours(date, hours), minutes), 0);
    
    const { data, error } = await supabase
      .from('cita')
      .update({ fecha_agendada: newAppointmentDate.toISOString(), estado: 'pendiente' })
      .eq('id', existingAppointment.id)
      .select()
      .single();
      
    if (error) {
       toast({ variant: "destructive", title: "Error al posponer", description: "No se pudo actualizar tu cita." });
    } else {
       toast({ title: "¡Cita Reprogramada!", description: `Tu cita se movió al ${format(newAppointmentDate, "PPP", { locale: es })} a las ${selectedTime}.`});
       setExistingAppointment(data);
       setIsRescheduling(false);
       setDate(undefined);
       setSelectedTime(null);
    }
    setIsSubmitting(false);
  };

  const handleCancel = async () => {
    if (!existingAppointment) return;
    setIsSubmitting(true);
    const { error } = await supabase
      .from('cita')
      .update({ estado: 'cancelada' })
      .eq('id', existingAppointment.id);
      
    if (error) {
       toast({ variant: "destructive", title: "Error al cancelar", description: "No se pudo cancelar tu cita." });
    } else {
       toast({ title: "Cita Cancelada", description: "Tu cita ha sido cancelada exitosamente." });
       setExistingAppointment(null);
       setIsRescheduling(false); 
    }
    setIsSubmitting(false);
  };

  const today = startOfDay(new Date());

  if (loading) {
    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
                <Card>
                    <CardContent className="p-6">
                        <Skeleton className="h-64 w-full" />
                    </CardContent>
                    <CardFooter>
                         <Skeleton className="h-10 w-32 ml-auto" />
                    </CardFooter>
                </Card>
            </div>
        </AppLayout>
    )
  }

  const AppointmentView = () => (
    <Card>
        <CardHeader>
            <CardTitle>Cita Agendada</CardTitle>
            <CardDescription>Tu cita está programada para:</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-lg">
                <CalendarClock className="w-6 h-6 text-primary"/>
                <span className="font-semibold">{format(new Date(existingAppointment!.fecha_agendada), "eeee, dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold">Estado:</span>
                <Badge variant={existingAppointment!.estado === 'pendiente' ? 'secondary' : 'default'}>
                    {existingAppointment!.estado.charAt(0).toUpperCase() + existingAppointment!.estado.slice(1)}
                </Badge>
              </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
            <Button variant="outline" onClick={() => setIsRescheduling(true)} disabled={isSubmitting}>Posponer</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={isSubmitting}>
                {isSubmitting ? 'Cancelando...' : 'Cancelar Cita'}
            </Button>
        </CardFooter>
    </Card>
  );

  const SchedulerView = () => (
     <Card>
        <CardContent className="p-0 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex justify-center items-center p-4 sm:p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(day) => getDay(day) === 0 || getDay(day) === 6 || day < today}
                    className="rounded-md border"
                    locale={es}
                />
            </div>
            <div className="space-y-6 p-4 sm:p-0">
            <div className="space-y-2">
                <h3 className="text-lg font-semibold font-headline">
                Horarios Disponibles para {date ? format(date, "PPP", { locale: es }) : "..."}
                </h3>
                <p className="text-sm text-muted-foreground">
                    Selecciona uno de los horarios disponibles a continuación.
                </p>
            </div>
            {date ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableTimes.map((time) => (
                    <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => setSelectedTime(time)}
                    className={cn(
                        selectedTime === time && "bg-accent text-accent-foreground"
                    )}
                    >
                    {time}
                    </Button>
                ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">
                Por favor, selecciona una fecha para ver los horarios.
                </p>
            )}
            </div>
        </CardContent>
        <CardFooter className="p-4 sm:p-6 border-t">
            <div className="flex-1">
                {date && selectedTime ? (
                    <p className="text-sm text-muted-foreground">
                        Cita seleccionada: <span className="font-semibold text-foreground">{format(date, "PPP", { locale: es })} a las {selectedTime}</span>
                    </p>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Selecciona una fecha y hora para tu cita.
                    </p>
                )}
            </div>
             <Button 
                onClick={isRescheduling ? handleReschedule : handleSchedule} 
                disabled={!date || !selectedTime || isSubmitting} 
                className="bg-accent text-accent-foreground hover:bg-accent/90"
             >
                {isSubmitting ? 'Confirmando...' : (isRescheduling ? 'Confirmar Cambio' : 'Confirmar Cita')}
             </Button>
             {isRescheduling && (
                <Button variant="ghost" onClick={() => { setIsRescheduling(false); setDate(undefined); setSelectedTime(null); }} disabled={isSubmitting}>
                    Volver
                </Button>
            )}
        </CardFooter>
    </Card>
  );

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
                {existingAppointment && !isRescheduling ? <CalendarCheck className="w-8 h-8"/> : <CalendarPlus className="w-8 h-8" />}
                {existingAppointment && !isRescheduling ? "Tu Próxima Cita" : (isRescheduling ? "Posponer Cita" : "Agendar Cita con Nutricionista")}
            </h1>
            <p className="text-muted-foreground">
                {existingAppointment && !isRescheduling
                    ? "Aquí están los detalles de tu próxima consulta. Puedes posponerla o cancelarla."
                    : (isRescheduling ? "Selecciona la nueva fecha y hora para tu consulta." : "Elige una fecha y hora para tu consulta personalizada.")
                }
            </p>
        </div>
        {existingAppointment && !isRescheduling ? <AppointmentView /> : <SchedulerView />}
      </div>
    </AppLayout>
  );
}
