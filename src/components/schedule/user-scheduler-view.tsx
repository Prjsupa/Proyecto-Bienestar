
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  CalendarClock,
  CalendarPlus,
  CalendarCheck,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { format, getDay, startOfDay, isEqual, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import type { Cita } from "@/types/community";

const allAvailableTimes = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00"
];
const MAX_APPOINTMENTS_PER_DAY = 2;

interface UserSchedulerViewProps {
  currentUser: User | null;
}

export function UserSchedulerView({ currentUser }: UserSchedulerViewProps) {
  const [existingAppointment, setExistingAppointment] = useState<Cita | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [bookedAppointments, setBookedAppointments] = useState<Cita[]>([]);

  const { toast } = useToast();
  const supabase = createClient();

  const fetchAppointments = useCallback(async () => {
    const { data: allAppointments, error: allAppointmentsError } = await supabase
        .from('cita')
        .select('*')
        .in('estado', ['pendiente', 'confirmada']);
    
    if (allAppointmentsError) {
        console.error("Error fetching all appointments:", allAppointmentsError);
        toast({ variant: "destructive", title: "Error", description: "No se pudo cargar la disponibilidad." });
    } else {
        setBookedAppointments(allAppointments);
    }
  }, [supabase, toast]);

  const fetchUserAppointment = useCallback(async () => {
    if (!currentUser) {
        setLoading(false);
        return;
    }
    const { data, error } = await supabase
        .from('cita')
        .select('*')
        .eq('user_id', currentUser.id)
        .in('estado', ['pendiente', 'confirmada', 'cancelada'])
        .order('fecha_agendada', { ascending: false })
        .limit(1)
        .maybeSingle();
    
    if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
        console.error("Error fetching appointment:", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo cargar tu cita existente." });
    } else {
        setExistingAppointment(data);
    }
    setLoading(false);
  }, [currentUser, supabase, toast]);


  useEffect(() => {
    async function getInitialData() {
        setLoading(true);
        await fetchAppointments();
        await fetchUserAppointment();
    }
    getInitialData();
  }, [fetchAppointments, fetchUserAppointment]);

  const appointmentsPerDay = useMemo(() => {
    const counts: Record<string, number> = {};
    bookedAppointments.forEach((appt) => {
      const day = startOfDay(new Date(appt.fecha_agendada)).toISOString();
      counts[day] = (counts[day] || 0) + 1;
    });
    return counts;
  }, [bookedAppointments]);

  const fullyBookedDays = useMemo(() => {
    return Object.entries(appointmentsPerDay)
      .filter(([, count]) => count >= MAX_APPOINTMENTS_PER_DAY)
      .map(([day]) => new Date(day));
  }, [appointmentsPerDay]);

  const availableTimesForSelectedDate = useMemo(() => {
    if (!date) return [];

    const selectedDayStartISO = startOfDay(date).toISOString();

    const bookedTimesOnSelectedDate = bookedAppointments
      .filter((appt) => {
        const apptDayStartISO = startOfDay(new Date(appt.fecha_agendada)).toISOString();
        return apptDayStartISO === selectedDayStartISO;
      })
      .map((appt) => format(new Date(appt.fecha_agendada), "HH:mm"));

    return allAvailableTimes.filter((time) => !bookedTimesOnSelectedDate.includes(time));
  }, [date, bookedAppointments]);


  const handleSchedule = async () => {
    if (!currentUser || !date || !selectedTime) {
      toast({ variant: "destructive", title: "Selección incompleta", description: "Por favor, selecciona una fecha y una hora." });
      return;
    }

    setIsSubmitting(true);
    const datePart = format(date, "yyyy-MM-dd");
    const appointmentDateTimeString = `${datePart} ${selectedTime}:00`;

    const { data: newAppointment, error } = await supabase
      .from("cita")
      .insert({
        user_id: currentUser.id,
        fecha_agendada: appointmentDateTimeString,
        estado: "pendiente",
      })
      .select()
      .single();

    if (error) {
      toast({ variant: "destructive", title: "Error al agendar", description: error.message });
      console.error("Error inserting appointment:", error);
    } else {
      toast({ title: "¡Cita Agendada!", description: `Tu cita ha sido agendada para el ${format(new Date(newAppointment.fecha_agendada), "PPP", { locale: es })} a las ${selectedTime}.` });
      setExistingAppointment(newAppointment);
      setBookedAppointments([...bookedAppointments, newAppointment]);
      setDate(undefined);
      setSelectedTime(null);
    }
    setIsSubmitting(false);
  };

  const handleReschedule = async () => {
    if (!existingAppointment || !date || !selectedTime) return;
    setIsSubmitting(true);

    const datePart = format(date, "yyyy-MM-dd");
    const newAppointmentDateTimeString = `${datePart} ${selectedTime}:00`;

    const { data, error } = await supabase
      .from("cita")
      .update({
        fecha_agendada: newAppointmentDateTimeString,
        estado: "pendiente",
      })
      .eq("id", existingAppointment.id)
      .select()
      .single();

    if (error) {
      toast({ variant: "destructive", title: "Error al posponer", description: "No se pudo actualizar tu cita." });
    } else {
      toast({ title: "¡Cita Reprogramada!", description: `Tu cita se movió al ${format(new Date(data.fecha_agendada), "PPP", { locale: es })} a las ${selectedTime}.` });
      setExistingAppointment(data);
      setBookedAppointments(bookedAppointments.map((a) => (a.id === data.id ? data : a)));
      setIsRescheduling(false);
      setDate(undefined);
      setSelectedTime(null);
    }
    setIsSubmitting(false);
  };

  const handleCancel = async () => {
    if (!existingAppointment) return;
    setIsSubmitting(true);
    const { error } = await supabase.from("cita").delete().eq("id", existingAppointment.id);

    if (error) {
      toast({ variant: "destructive", title: "Error al cancelar", description: "No se pudo cancelar tu cita." });
    } else {
      toast({ title: "Cita Cancelada", description: "Tu cita ha sido cancelada exitosamente." });
      setBookedAppointments(bookedAppointments.filter((a) => a.id !== existingAppointment.id));
      setExistingAppointment(null);
      setIsRescheduling(false);
    }
    setIsSubmitting(false);
  };

  const today = startOfDay(new Date());
  const minDate = addDays(today, 2);

  const getStatusInfo = (status: Cita['estado']) => {
    switch (status) {
        case 'pendiente': return { variant: 'secondary', text: 'Pendiente' };
        case 'confirmada': return { variant: 'default', text: 'Confirmada' };
        case 'cancelada': return { variant: 'destructive', text: 'Cancelada por Profesional' };
        default: return { variant: 'outline', text: 'Desconocido' };
    }
  }

  const AppointmentView = () => {
    if (!existingAppointment) return null;
    const statusInfo = getStatusInfo(existingAppointment.estado);
    const isCancelled = existingAppointment.estado === 'cancelada';

    return (
        <Card className={cn(isCancelled && "border-destructive/50 bg-destructive/5")}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {isCancelled ? <XCircle className="w-6 h-6 text-destructive"/> : <CalendarCheck className="w-6 h-6 text-primary"/> }
                    Tu Próxima Cita
                </CardTitle>
                <CardDescription>
                    {isCancelled 
                        ? "Un profesional ha cancelado tu cita. Puedes posponerla o cancelarla."
                        : "Aquí están los detalles de tu próxima consulta."
                    }
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-lg">
                    <CalendarClock className="w-6 h-6 text-primary" />
                    <span className="font-semibold">{format(new Date(existingAppointment.fecha_agendada), "eeee, dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="font-semibold">Estado:</span>
                    <Badge variant={statusInfo.variant}>
                        {statusInfo.text}
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
    )
  };

  const SchedulerView = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <CalendarPlus className="w-7 h-7" />
            {isRescheduling ? "Posponer Cita" : "Agendar Cita con Nutricionista"}
        </CardTitle>
        <CardDescription>
            {isRescheduling ? "Selecciona la nueva fecha y hora para tu consulta." : "Elige una fecha y hora para tu consulta personalizada."}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex justify-center items-center p-4 sm:p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={(day) =>
              getDay(day) === 0 ||
              getDay(day) === 6 ||
              day < minDate ||
              fullyBookedDays.some((bookedDay) => isEqual(startOfDay(bookedDay), startOfDay(day)))
            }
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
              Selecciona uno de los horarios disponibles.
            </p>
          </div>
          {date ? (
            availableTimesForSelectedDate.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableTimesForSelectedDate.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => setSelectedTime(time)}
                    className={cn(selectedTime === time && "bg-accent text-accent-foreground")}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay horarios disponibles para este día.</p>
            )
          ) : (
            <p className="text-sm text-muted-foreground">Selecciona una fecha para ver los horarios.</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 sm:p-6 border-t flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          {date && selectedTime ? (
            <p className="text-sm text-muted-foreground">
              Cita seleccionada: <span className="font-semibold text-foreground">{format(date, "PPP", { locale: es })} a las {selectedTime}</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Selecciona una fecha y hora para tu cita.</p>
          )}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            {isRescheduling && (
                <Button variant="ghost" onClick={() => { setIsRescheduling(false); setDate(undefined); setSelectedTime(null); }} disabled={isSubmitting}>
                    Volver
                </Button>
            )}
            <Button
                onClick={isRescheduling ? handleReschedule : handleSchedule}
                disabled={!date || !selectedTime || isSubmitting}
                className="bg-accent text-accent-foreground hover:bg-accent/90 flex-1 sm:flex-grow-0"
            >
                {isSubmitting ? "Confirmando..." : isRescheduling ? "Confirmar Cambio" : "Confirmar Cita"}
            </Button>
        </div>
      </CardFooter>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {existingAppointment && !isRescheduling ? <AppointmentView /> : <SchedulerView />}
    </div>
  );
}
