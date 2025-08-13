
"use client";

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { startOfMonth, addMonths, startOfDay } from 'date-fns';

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
import type { Recipe } from '@/types/recipe';

const formSchema = z.object({
  titulo: z.string().min(5, 'El título debe tener al menos 5 caracteres.'),
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
  categoria: z.string().min(3, 'La categoría es requerida.'),
  ingredientes: z.string().min(10, 'Los ingredientes son requeridos.'),
  instrucciones: z.string().min(20, 'Las instrucciones son requeridas.'),
  img_url: z.string().optional().nullable(),
  image_file: z.any().optional(),
});

interface RecipeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  recipe: Recipe | null;
  userId: string;
}

export function RecipeFormModal({ isOpen, onClose, onSuccess, recipe, userId }: RecipeFormModalProps) {
  const { toast } = useToast();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: '',
      descripcion: '',
      categoria: '',
      ingredientes: '',
      instrucciones: '',
      img_url: null,
      image_file: null
    },
  });
  
  useEffect(() => {
    if (recipe) {
      form.reset({
        titulo: recipe.titulo,
        descripcion: recipe.descripcion,
        categoria: recipe.categoria,
        ingredientes: recipe.ingredientes,
        instrucciones: recipe.instrucciones,
        img_url: recipe.img_url,
      });
      setImagePreview(recipe.img_url);
    } else {
      form.reset({
        titulo: '',
        descripcion: '',
        categoria: '',
        ingredientes: '',
        instrucciones: '',
        img_url: null,
        image_file: null,
      });
      setImagePreview(null);
    }
  }, [recipe, form]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({ variant: "destructive", title: "Tipo de archivo no válido", description: "Por favor selecciona una imagen." });
        return;
      }
      form.setValue("image_file", file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    form.setValue("image_file", null);
    form.setValue("img_url", null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      let imageUrl = recipe?.img_url || null;

      if (values.image_file) {
        const file = values.image_file;
        const filePath = `${userId}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('recetas').upload(filePath, file);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage.from('recetas').getPublicUrl(filePath);
        imageUrl = publicUrl;
      } else if (!imagePreview) {
          imageUrl = null;
      }
      
      const now = new Date();
      const firstDay = startOfDay(startOfMonth(now));
      const nextMonthFirstDay = startOfDay(addMonths(firstDay, 1));

      const recipeData: Omit<Recipe, 'id'> = {
        user_id: userId,
        titulo: values.titulo,
        descripcion: values.descripcion,
        categoria: values.categoria,
        ingredientes: values.ingredientes,
        instrucciones: values.instrucciones,
        img_url: imageUrl,
        fecha: firstDay.toISOString(),
        visible: true,
        visible_hasta: nextMonthFirstDay.toISOString(),
      };
      
      let error;
      if (recipe) {
        // Update
        const { error: updateError } = await supabase.from('recetas').update(recipeData).eq('id', recipe.id);
        error = updateError;
      } else {
        // Insert
        const { error: insertError } = await supabase.from('recetas').insert(recipeData);
        error = insertError;
      }

      if (error) throw error;

      toast({ title: recipe ? 'Receta Actualizada' : 'Receta Creada', description: 'La receta se ha guardado exitosamente.' });
      onSuccess();

    } catch (err: any) {
      console.error('Error saving recipe:', err);
      toast({ variant: 'destructive', title: 'Error al guardar', description: err.message });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{recipe ? 'Editar Receta' : 'Crear Nueva Receta'}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-1 pr-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                  control={form.control}
                  name="image_file"
                  render={() => (
                    <FormItem>
                      <FormLabel>Imagen de la Receta</FormLabel>
                      <FormControl>
                        <div 
                          className="border-2 border-dashed border-muted rounded-lg p-4 text-center cursor-pointer hover:border-primary"
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
                            <div className="relative group">
                              <Image src={imagePreview} alt="Vista previa" width={400} height={250} className="rounded-md mx-auto object-cover max-h-48 w-auto" />
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
                              <p className="text-xs">Recomendado: 800x600px</p>
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
                    <FormControl><Input placeholder="Ej. Ensalada César con Pollo a la Parrilla" {...field} /></FormControl>
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
                    <FormControl><Textarea placeholder="Una breve descripción de la receta..." {...field} rows={3}/></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <FormControl><Input placeholder="Ej. Almuerzo, Cena, Postre" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ingredientes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingredientes</FormLabel>
                    <FormControl><Textarea placeholder="Lista de ingredientes, uno por línea..." {...field} rows={6} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="instrucciones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instrucciones</FormLabel>
                    <FormControl><Textarea placeholder="Pasos para preparar la receta..." {...field} rows={8}/></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                  <DialogClose asChild>
                      <Button type="button" variant="secondary">Cancelar</Button>
                  </DialogClose>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Receta'}
                  </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
