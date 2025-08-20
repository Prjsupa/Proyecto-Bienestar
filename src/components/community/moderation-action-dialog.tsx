
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/utils/supabase/client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ModerationActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Callback to re-fetch data after success
  moderatorId: string;
  targetUserId: string;
  actionType: 'Eliminar Publicación' | 'Eliminar Respuesta' | 'Eliminar Pregunta' | 'Eliminar Respuesta Profesional' | 'Eliminar Video de Técnica' | 'Eliminar Respuesta de Técnica';
  section: string;
  contentId: string;
}

const formSchema = z.object({
  reason: z.string().min(10, { message: "La razón debe tener al menos 10 caracteres." }),
});

export function ModerationActionDialog({
  isOpen,
  onClose,
  onSuccess,
  moderatorId,
  targetUserId,
  actionType,
  section,
  contentId,
}: ModerationActionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { reason: "" },
  });

  const getTargetTableAndStorage = () => {
    switch(actionType) {
        case 'Eliminar Publicación': return { table: 'comunidad', storage: 'publicaciones' };
        case 'Eliminar Respuesta': return { table: 'comunidad_respuestas', storage: null };
        case 'Eliminar Pregunta': return { table: 'pregunta_profesional', storage: 'pregunta.profesional' };
        case 'Eliminar Respuesta Profesional': return { table: 'respuesta_profesional', storage: null };
        case 'Eliminar Video de Técnica': return { table: 'clinica_tecnica', storage: 'clinica.tecnica' };
        case 'Eliminar Respuesta de Técnica': return { table: 'clinica_tecnica_respuesta', storage: null };
        default: throw new Error('Invalid action type');
    }
  }

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
        // 1. Delete content file from storage if it exists
        const { table, storage } = getTargetTableAndStorage();
        if (storage) {
            const { data: item, error: fetchError } = await supabase.from(table).select('img_url, video_url').eq('id', contentId).single();
            if (fetchError) console.warn(`Could not fetch item to delete from storage: ${fetchError.message}`);
            
            const url = item?.img_url || item?.video_url;
            if (url) {
                const path = url.split(`/${storage}/`)[1];
                if (path) {
                     const { error: storageError } = await supabase.storage.from(storage).remove([path]);
                     if (storageError) console.warn(`Failed to delete from storage: ${storageError.message}`);
                }
            }
        }
        
        // 2. Delete the content record from the table
        const { error: deleteError } = await supabase.from(table).delete().eq('id', contentId);
        if (deleteError) throw new Error(`Error al eliminar el contenido: ${deleteError.message}`);

        // 3. Log the moderation action. This will trigger the notification.
        const { error: logError } = await supabase
            .from('accion_moderador')
            .insert({
                moderador_id: moderatorId,
                user_id: targetUserId,
                accion: actionType,
                seccion: section,
                razon: values.reason,
            });
        if (logError) throw new Error(`Error al registrar la acción: ${logError.message}`);
      
      toast({
        title: "Acción completada",
        description: `El contenido ha sido eliminado y la acción registrada.`,
      });
      onSuccess();
      onClose();

    } catch (error: any) {
      console.error("Error en la acción de moderación:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
      form.reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/>Confirmar Eliminación</DialogTitle>
          <DialogDescription>
            Estás a punto de eliminar contenido de un usuario. Por favor, especifica la razón. Esta acción quedará registrada.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razón de la eliminación</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: La publicación incumple las normas de la comunidad sobre..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
              </DialogClose>
              <Button type="submit" variant="destructive" disabled={isSubmitting}>
                {isSubmitting ? "Confirmando..." : "Confirmar y Eliminar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
