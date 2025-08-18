
"use client";

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, addDays } from 'date-fns';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/utils/supabase/client';
import { UploadCloud, X } from 'lucide-react';
import Image from 'next/image';
import type { ClaseEnVivo } from '@/types/community';

const formSchema = z.object({
  titulo: z.string().min(5, 'El título debe tener al menos 5 caracteres.'),
  descripcion: z.string().optional(),
  fecha_hora: z.string().min(1, 'La fecha y hora son requeridas.'),
  link: z.string().url('Debe ser un enlace válido.').optional().nullable(),
  miniatura: z.any().optional(),
});

interface LiveSessionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  session: ClaseEnVivo | null;
  userId: string;
}

export function LiveSessionFormModal({ isOpen, onClose, onSuccess, session, userId }: LiveSessionFormModalProps) {
  const { toast } = useToast();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: '',
      descripcion: '',
      fecha_hora: '',
      link: '',
      miniatura: null,
    },
  });

  const formatDateForInput = (dateString: string) => {
    // The datetime-local input needs "YYYY-MM-DDTHH:mm".
    // We get a full ISO string from Supabase (UTC), so we convert it to a Date object
    // which automatically adjusts to the user's local timezone, and then format it.
    const date = new Date(dateString);
    // Slice to get YYYY-MM-DDTHH:mm
    return date.toISOString().slice(0, 16);
  };
  
  useEffect(() => {
    if (session) {
      form.reset({
        titulo: session.titulo,
        descripcion: session.descripcion || '',
        fecha_hora: session.fecha_hora ? formatDateForInput(session.fecha_hora) : '',
        link: session.link,
        miniatura: null,
      });
      setImagePreview(session.miniatura);
    } else {
      form.reset({
        titulo: '',
        descripcion: '',
        fecha_hora: '',
        link: '',
        miniatura: null,
      });
      setImagePreview(null);
    }
  }, [session, form]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({ variant: "destructive", title: "Tipo de archivo no válido", description: "Por favor selecciona una imagen." });
        return;
      }
      form.setValue("miniatura", file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    form.setValue("miniatura", null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      let imageUrl = session?.miniatura || null;

      if (values.miniatura && values.miniatura instanceof File) {
        const file = values.miniatura;
        const filePath = `${userId}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('miniaturas').upload(filePath, file);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage.from('miniaturas').getPublicUrl(filePath);
        imageUrl = publicUrl;
      } else if (!imagePreview) {
          imageUrl = null;
      }
      
      const sessionDate = new Date(values.fecha_hora);
      const availableUntilDate = addDays(sessionDate, 15);

      const sessionData = {
        user_id: userId,
        titulo: values.titulo,
        descripcion: values.descripcion,
        fecha_hora: sessionDate.toISOString(), // Send as full ISO string
        link: values.link,
        disponible_hasta: availableUntilDate.toISOString(), // Send as full ISO string
        miniatura: imageUrl,
      };
      
      let error;
      if (session) {
        const { error: updateError } = await supabase.from('clases_en_vivo').update(sessionData).eq('id', session.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from('clases_en_vivo').insert(sessionData);
        error = insertError;
      }

      if (error) throw error;

      toast({ title: session ? 'Clase Actualizada' : 'Clase Creada', description: 'La clase en vivo se ha guardado exitosamente.' });
      onSuccess();

    } catch (err: any) {
      console.error('Error saving session:', err);
      toast({ variant: 'destructive', title: 'Error al guardar', description: err.message });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{session ? 'Editar Clase en Vivo' : 'Crear Nueva Clase en Vivo'}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-1 pr-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="miniatura"
                  render={() => (
                    <FormItem>
                      <FormLabel>Miniatura de la Clase</FormLabel>
                      <FormControl>
                        <div 
                          className="border-2 border-dashed border-muted rounded-lg p-4 text-center cursor-pointer hover:border-primary aspect-video flex items-center justify-center"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                          />
                          {imagePreview ? (
                            <div className="relative group w-full h-full">
                              <Image src={imagePreview} alt="Vista previa" layout="fill" objectFit="cover" className="rounded-md" />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => { e.stopPropagation(); removeImage(); }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="text-muted-foreground">
                              <UploadCloud className="mx-auto h-10 w-10 mb-2" />
                              <p>Haz clic para subir una imagen</p>
                              <p className="text-xs">Recomendado: 16:9 (Ej. 1280x720px)</p>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
              />
              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl><Input placeholder="Ej. Yoga para principiantes" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl><Textarea placeholder="Una breve descripción de la clase en vivo..." {...field} rows={3}/></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enlace del Directo (YouTube, etc.)</FormLabel>
                    <FormControl><Input placeholder="https://youtube.com/live/..." {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                  control={form.control}
                  name="fecha_hora"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Fecha y Hora del Evento</FormLabel>
                      <FormControl><Input type="datetime-local" {...field} /></FormControl>
                      <FormMessage />
                  </FormItem>
                  )}
              />
              <DialogFooter>
                  <DialogClose asChild>
                      <Button type="button" variant="secondary">Cancelar</Button>
                  </DialogClose>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Clase'}
                  </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
