
"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { startOfDay, startOfMonth, addMonths } from 'date-fns';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/utils/supabase/client';
import type { Routine } from '@/types/routine';
import { Switch } from './ui/switch';

const formSchema = z.object({
  titulo: z.string().min(5, 'El título debe tener al menos 5 caracteres.'),
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
  equipo: z.string().min(3, 'El equipo es requerido.'),
  ejercicios: z.string().min(20, 'Los ejercicios son requeridos.'),
  visible: z.boolean(),
});

interface RoutineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  routine: Routine | null;
  userId: string;
  environment: 'casa' | 'gimnasio';
}

export function RoutineFormModal({ isOpen, onClose, onSuccess, routine, userId, environment }: RoutineFormModalProps) {
  const { toast } = useToast();
  const supabase = createClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: '',
      descripcion: '',
      equipo: '',
      ejercicios: '',
      visible: true,
    },
  });
  
  useEffect(() => {
    if (routine) {
      form.reset({
        titulo: routine.titulo,
        descripcion: routine.descripcion,
        equipo: routine.equipo,
        ejercicios: routine.ejercicios,
        visible: routine.visible,
      });
    } else {
      form.reset({
        titulo: '',
        descripcion: '',
        equipo: '',
        ejercicios: '',
        visible: true,
      });
    }
  }, [routine, form]);


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const routineData: Omit<Routine, 'id' | 'entorno'> & { id?: string, entorno: string } = {
        user_id: userId,
        titulo: values.titulo,
        descripcion: values.descripcion,
        equipo: values.equipo,
        ejercicios: values.ejercicios,
        entorno: environment,
        visible: values.visible,
        fecha: routine?.fecha || new Date().toISOString(),
        visible_hasta: routine?.visible_hasta || new Date().toISOString(),
      };

      const isBeingMadeVisible = routine && !routine.visible && values.visible;
      
      if (!routine || isBeingMadeVisible) {
        const now = new Date();
        const firstDayOfMonth = startOfDay(startOfMonth(now));
        const nextMonthFirstDay = startOfDay(addMonths(firstDayOfMonth, 1));
        routineData.fecha = firstDayOfMonth.toISOString();
        routineData.visible_hasta = nextMonthFirstDay.toISOString();
      }
      
      let error;
      if (routine) {
        const { error: updateError } = await supabase.from('rutinas').update(routineData).eq('id', routine.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from('rutinas').insert(routineData);
        error = insertError;
      }

      if (error) throw error;

      toast({ title: routine ? 'Rutina Actualizada' : 'Rutina Creada', description: 'La rutina se ha guardado exitosamente.' });
      onSuccess();

    } catch (err: any) {
      console.error('Error saving routine:', err);
      toast({ variant: 'destructive', title: 'Error al guardar', description: err.message });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{routine ? 'Editar Rutina' : 'Crear Nueva Rutina'}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-1 pr-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="visible"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <FormLabel>Visible para Usuarios</FormLabel>
                            <p className="text-xs text-muted-foreground">
                            Si está activado, todos los usuarios podrán ver esta rutina.
                            </p>
                        </div>
                        <FormControl>
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        </FormItem>
                    )}
                />
              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl><Input placeholder="Ej. Tren Superior - Día 1" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción Corta</FormLabel>
                    <FormControl><Textarea placeholder="Una breve descripción de la rutina..." {...field} rows={3}/></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="equipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipo Necesario</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Lista de equipo necesario, uno por línea..." {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ejercicios"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ejercicios</FormLabel>
                    <FormControl><Textarea placeholder="Lista de ejercicios, series y repeticiones..." {...field} rows={8} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                  <DialogClose asChild>
                      <Button type="button" variant="secondary">Cancelar</Button>
                  </DialogClose>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Rutina'}
                  </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
