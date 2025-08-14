
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
  onConfirm: () => void;
  moderatorId: string;
  targetUserId: string;
  actionType: string;
  section: string;
  contentId: string;
}

const formSchema = z.object({
  reason: z.string().min(10, { message: "La razón debe tener al menos 10 caracteres." }),
});

export function ModerationActionDialog({
  isOpen,
  onClose,
  onConfirm,
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

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // 1. Log the moderation action
      const { error: logError } = await supabase
        .from('accion_moderador')
        .insert({
          moderador_id: moderatorId,
          user_id: targetUserId,
          accion: actionType,
          seccion,
          razon: values.reason,
          contenido_id: contentId,
        });

      if (logError) {
        throw logError;
      }
      
      // 2. Execute the actual deletion callback
      onConfirm();
      
      toast({
        title: "Acción completada",
        description: `El contenido ha sido eliminado y la acción registrada.`,
      });
      onClose();

    } catch (error: any) {
      console.error("Error en la acción de moderación:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo completar la acción de moderación. " + error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
