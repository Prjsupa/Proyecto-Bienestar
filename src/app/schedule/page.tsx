
"use client";

import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { format, getDay, startOfDay, setHours, setMinutes, setSeconds } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

const availableTimes = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00",
];

export default function SchedulePage() {
  const [user, setUser] = useState<User | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    };
    fetchUser();
  }, [supabase.auth]);

  const handleSchedule = async () => {
    if (!user || !date || !selectedTime) {
      toast({
        variant: "destructive",
        title: "Selección incompleta",
        description: "Por favor, selecciona una fecha y una hora.",
      });
      return;
    }
    
    setIsSubmitting(true);

    const [hours, minutes] = selectedTime.split(':').map(Number);
    let appointmentDate = setSeconds(setMinutes(setHours(date, hours), minutes), 0);

    const { error } = await supabase
      .from('cita')
      .insert({
        user_id: user.id,
        fecha_agendada: appointmentDate.toISOString(),
        estado: 'pendiente'
      });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error al agendar",
        description: "Hubo un problema al guardar tu cita. Inténtalo de nuevo.",
      });
       console.error("Error inserting appointment:", error);
    } else {
      toast({
        title: "¡Cita Agendada!",
        description: `Tu cita ha sido agendada para el ${format(appointmentDate, "PPP", { locale: es })} a las ${selectedTime}.`,
      });
      setDate(undefined);
      setSelectedTime(null);
    }
    setIsSubmitting(false);
  };
  
  const today = startOfDay(new Date());

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <CalendarPlus className="w-8 h-8" />
            Agendar Cita con Nutricionista
          </h1>
          <p className="text-muted-foreground">
            Elige una fecha y hora para tu consulta personalizada.
          </p>
        </div>

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
              <Button onClick={handleSchedule} disabled={!date || !selectedTime || isSubmitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {isSubmitting ? 'Confirmando...' : 'Confirmar Cita'}
              </Button>
            </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}
