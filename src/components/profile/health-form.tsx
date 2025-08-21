
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { HealthFormData } from "@/types/health-form";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "../ui/separator";
import { useEffect } from "react";

const formSchema = z.object({
  pregunta_1_edad: z.coerce.number().min(1, "La edad es requerida.").positive("La edad debe ser positiva."),
  pregunta_2_estatura: z.coerce.number().min(1, "La estatura es requerida.").positive("La estatura debe ser positiva."),
  pregunta_3_peso: z.coerce.number().min(1, "El peso es requerido.").positive("El peso debe ser positivo."),
  pregunta_4_grasa_corporal: z.number().min(5).max(50),
  pregunta_5_diagnostico_medico: z.array(z.string()),
  pregunta_5_diagnostico_otro: z.string().optional(),
  pregunta_6_objetivo_principal: z.string().min(1, "El objetivo es requerido."),
  pregunta_7_dias_ejercicio: z.string({ required_error: "Debes seleccionar una opción." }),
  pregunta_8_actividad_diaria: z.string({ required_error: "Debes seleccionar una opción." }),
  pregunta_9_restricciones_alimentarias: z.string().optional(),
  pregunta_10_ciclo_menstrual: z.string({ required_error: "Debes seleccionar una opción." }),
  pregunta_11_anticonceptivos: z.string({ required_error: "Debes seleccionar una opción." }),
  pregunta_12_diagnostico_ginecologico: z.string({ required_error: "Debes seleccionar una opción." }),
  pregunta_13_compromiso: z.string({ required_error: "Debes seleccionar una opción." }),
});

const diagnosticosMedicosOptions = [
    { id: 'hipotiroidismo', label: 'Hipotiroidismo' },
    { id: 'resistencia_insulina', label: 'Resistencia a la insulina' },
    { id: 'sop', label: 'SOP (Síndrome de Ovario Poliquístico)' },
    { id: 'ninguno', label: 'Ninguno' },
];

interface HealthFormProps {
  userId: string;
  initialData: HealthFormData | null;
  onFormSubmit: () => void;
}

function InputWithUnit({ unit, ...props }: React.ComponentProps<typeof Input> & { unit: string }) {
    return (
        <div className="relative">
            <Input type="number" className="pr-12" {...props} />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground text-sm">
                {unit}
            </div>
        </div>
    )
}

export function HealthForm({ userId, initialData, onFormSubmit }: HealthFormProps) {
  const { toast } = useToast();
  const supabase = createClient();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        pregunta_1_edad: undefined,
        pregunta_2_estatura: undefined,
        pregunta_3_peso: undefined,
        pregunta_4_grasa_corporal: 25,
        pregunta_5_diagnostico_medico: [],
        pregunta_5_diagnostico_otro: "",
        pregunta_6_objetivo_principal: "",
        pregunta_7_dias_ejercicio: undefined,
        pregunta_8_actividad_diaria: undefined,
        pregunta_9_restricciones_alimentarias: "",
        pregunta_10_ciclo_menstrual: undefined,
        pregunta_11_anticonceptivos: undefined,
        pregunta_12_diagnostico_ginecologico: undefined,
        pregunta_13_compromiso: undefined,
    },
  });

  useEffect(() => {
    if (initialData) {
        const diagnosticos = initialData.pregunta_5_diagnostico_medico || [];
        const predefinidos = diagnosticos.filter(d => diagnosticosMedicosOptions.some(opt => opt.id === d));
        const otro = diagnosticos.find(d => !diagnosticosMedicosOptions.some(opt => opt.id === d));

        form.reset({
            pregunta_1_edad: initialData.pregunta_1_edad || undefined,
            pregunta_2_estatura: initialData.pregunta_2_estatura || undefined,
            pregunta_3_peso: initialData.pregunta_3_peso || undefined,
            pregunta_4_grasa_corporal: initialData.pregunta_4_grasa_corporal || 25,
            pregunta_5_diagnostico_medico: predefinidos,
            pregunta_5_diagnostico_otro: otro || "",
            pregunta_6_objetivo_principal: initialData.pregunta_6_objetivo_principal || "",
            pregunta_7_dias_ejercicio: initialData.pregunta_7_dias_ejercicio || undefined,
            pregunta_8_actividad_diaria: initialData.pregunta_8_actividad_diaria || undefined,
            pregunta_9_restricciones_alimentarias: initialData.pregunta_9_restricciones_alimentarias || "",
            pregunta_10_ciclo_menstrual: initialData.pregunta_10_ciclo_menstrual || undefined,
            pregunta_11_anticonceptivos: initialData.pregunta_11_anticonceptivos || undefined,
            pregunta_12_diagnostico_ginecologico: initialData.pregunta_12_diagnostico_ginecologico || undefined,
            pregunta_13_compromiso: initialData.pregunta_13_compromiso || undefined,
        });
    }
  }, [initialData, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    
    // Combine "Otro" with the rest of the diagnoses
    const diagnosticosCompletos = values.pregunta_5_diagnostico_otro 
        ? [...values.pregunta_5_diagnostico_medico, values.pregunta_5_diagnostico_otro] 
        : values.pregunta_5_diagnostico_medico;

    const formDataToSave = {
      user_id: userId,
      pregunta_1_edad: values.pregunta_1_edad,
      pregunta_2_estatura: values.pregunta_2_estatura,
      pregunta_3_peso: values.pregunta_3_peso,
      pregunta_4_grasa_corporal: values.pregunta_4_grasa_corporal,
      pregunta_5_diagnostico_medico: diagnosticosCompletos,
      pregunta_6_objetivo_principal: values.pregunta_6_objetivo_principal,
      pregunta_7_dias_ejercicio: values.pregunta_7_dias_ejercicio,
      pregunta_8_actividad_diaria: values.pregunta_8_actividad_diaria,
      pregunta_9_restricciones_alimentarias: values.pregunta_9_restricciones_alimentarias,
      pregunta_10_ciclo_menstrual: values.pregunta_10_ciclo_menstrual,
      pregunta_11_anticonceptivos: values.pregunta_11_anticonceptivos,
      pregunta_12_diagnostico_ginecologico: values.pregunta_12_diagnostico_ginecologico,
      pregunta_13_compromiso: values.pregunta_13_compromiso,
      updated_at: new Date().toISOString(),
    };
    
    const { error } = await supabase
        .from('formulario')
        .upsert(formDataToSave, { onConflict: 'user_id' });

    if (error) {
        console.error("Error saving form", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo guardar el formulario. " + error.message });
    } else {
        toast({ title: "Formulario Guardado", description: "Tus respuestas se han guardado correctamente." });
        onFormSubmit();
    }
  };

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="pregunta_1_edad" render={({ field }) => (
                    <FormItem>
                        <FormLabel>1. ¿Cuál es tu edad?</FormLabel>
                        <FormControl><InputWithUnit unit="años" placeholder="Ej. 30" {...field} /></FormControl>
                        <FormDescription>Esto nos ayudará a personalizar tu plan.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="pregunta_2_estatura" render={({ field }) => (
                    <FormItem>
                        <FormLabel>2. ¿Cuál es tu estatura?</FormLabel>
                        <FormControl><InputWithUnit unit="cm" placeholder="Ej. 165" {...field} /></FormControl>
                        <FormDescription>Para calcular tu composición ideal.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="pregunta_3_peso" render={({ field }) => (
                    <FormItem>
                        <FormLabel>3. ¿Cuál es tu peso actual?</FormLabel>
                        <FormControl><InputWithUnit unit="kg" placeholder="Ej. 70.5" {...field} step="0.1"/></FormControl>
                        <FormDescription>Sin juzgar, solo necesitamos el dato.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}/>
            </div>
            <Separator/>
            
            <FormField control={form.control} name="pregunta_4_grasa_corporal" render={({ field }) => (
                <FormItem>
                    <FormLabel>4. Porcentaje de grasa corporal.</FormLabel>
                    <FormDescription>Mueve el slider para ajustar el valor.</FormDescription>
                    <FormControl>
                        <div className="flex items-center gap-4 pt-2">
                            <Slider min={5} max={50} step={5} value={[field.value]} onValueChange={(vals) => field.onChange(vals[0])} />
                            <div className="w-16 text-center text-lg font-semibold text-primary">{field.value}%</div>
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
            <Separator/>
           
             <Controller
                name="pregunta_5_diagnostico_medico"
                control={form.control}
                render={() => (
                    <FormItem>
                        <FormLabel>5. Diagnóstico médico actual.</FormLabel>
                        <FormDescription>Selecciona todo lo que aplique.</FormDescription>
                        {diagnosticosMedicosOptions.map((item) => (
                            <FormField
                                key={item.id}
                                control={form.control}
                                name="pregunta_5_diagnostico_medico"
                                render={({ field }) => (
                                    <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value?.includes(item.id)}
                                                onCheckedChange={(checked) => {
                                                    const updatedValue = field.value ? [...field.value] : [];
                                                    if (checked) {
                                                        if (item.id === 'ninguno') {
                                                            return field.onChange(['ninguno']);
                                                        } else {
                                                            const filtered = updatedValue.filter(v => v !== 'ninguno');
                                                            return field.onChange([...filtered, item.id]);
                                                        }
                                                    } else {
                                                        return field.onChange(updatedValue.filter((value) => value !== item.id));
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                        <FormLabel className="font-normal">{item.label}</FormLabel>
                                    </FormItem>
                                )}
                            />
                        ))}
                        <FormField
                            control={form.control}
                            name="pregunta_5_diagnostico_otro"
                            render={({ field }) => (
                                <FormItem className="flex items-center gap-3 pt-2">
                                    <FormLabel className="font-normal whitespace-nowrap mt-2">Otro:</FormLabel>
                                    <FormControl><Input placeholder="Especificar..." {...field} /></FormControl>
                                </FormItem>
                            )}
                        />
                        <FormMessage />
                    </FormItem>
                )}
            />
            <Separator/>
            
            <FormField control={form.control} name="pregunta_6_objetivo_principal" render={({ field }) => (
                <FormItem>
                    <FormLabel>6. ¿Cuál es tu objetivo principal?</FormLabel>
                    <FormDescription>Describe claramente lo que quieres lograr.</FormDescription>
                    <FormControl><Textarea placeholder="Ej: Perder 10kg, ganar masa muscular, mejorar mi energía..." {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
            <Separator/>
           
            <FormField control={form.control} name="pregunta_7_dias_ejercicio" render={({ field }) => (
                <FormItem className="space-y-3">
                     <FormLabel>7. Días de ejercicio por semana.</FormLabel>
                     <FormDescription>¿Con qué frecuencia puedes ejercitarte?</FormDescription>
                     <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                            <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="0" /></FormControl><FormLabel className="font-normal">0 días (sedentario).</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="1-3" /></FormControl><FormLabel className="font-normal">1-3 días por semana.</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="3-4" /></FormControl><FormLabel className="font-normal">3-4 días por semana.</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="5+" /></FormControl><FormLabel className="font-normal">5 o más días por semana.</FormLabel></FormItem>
                        </RadioGroup>
                     </FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
            <Separator/>
           
             <FormField control={form.control} name="pregunta_8_actividad_diaria" render={({ field }) => (
                <FormItem className="space-y-3">
                     <FormLabel>8. Nivel de actividad física diaria</FormLabel>
                     <FormDescription>Más allá del ejercicio programado.</FormDescription>
                     <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                            <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="sedentario" /></FormControl><FormLabel className="font-normal">Sedentario (trabajo de oficina, poca actividad).</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="moderada" /></FormControl><FormLabel className="font-normal">Moderada (camino regularmente, algo activo).</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="alta" /></FormControl><FormLabel className="font-normal">Alta (trabajo físico o muy activa en general).</FormLabel></FormItem>
                        </RadioGroup>
                     </FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
            <Separator/>
            
            <FormField control={form.control} name="pregunta_9_restricciones_alimentarias" render={({ field }) => (
                <FormItem>
                    <FormLabel>9. Restricciones alimentarias.</FormLabel>
                    <FormDescription>Cuéntanos sobre alergias, intolerancias o preferencias.</FormDescription>
                    <FormControl><Textarea placeholder="Ej: Alergia a los frutos secos, intolerancia a la lactosa, vegetariana..." {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
             <Separator/>
           
             <FormField control={form.control} name="pregunta_10_ciclo_menstrual" render={({ field }) => (
                <FormItem className="space-y-3">
                     <FormLabel>10. ¿Tienes ciclo menstrual regular?</FormLabel>
                     <FormDescription>Esto afecta tu metabolismo y energía.</FormDescription>
                     <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                            <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="si" /></FormControl><FormLabel className="font-normal">Sí, tengo ciclo menstrual regular.</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No, mi ciclo es irregular.</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="no_aplica" /></FormControl><FormLabel className="font-normal">No aplica (menopausia, etc.)</FormLabel></FormItem>
                        </RadioGroup>
                     </FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
            <Separator/>
            
            <FormField control={form.control} name="pregunta_11_anticonceptivos" render={({ field }) => (
                <FormItem className="space-y-3">
                     <FormLabel>11. ¿Usas anticonceptivos hormonales?</FormLabel>
                     <FormDescription>Pastillas, DIU hormonal, implante, etc.</FormDescription>
                     <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                            <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="si" /></FormControl><FormLabel className="font-normal">Sí, uso anticonceptivos hormonales.</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No, no uso anticonceptivos hormonales.</FormLabel></FormItem>
                        </RadioGroup>
                     </FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
            <Separator/>
            
            <FormField control={form.control} name="pregunta_12_diagnostico_ginecologico" render={({ field }) => (
                <FormItem className="space-y-3">
                     <FormLabel>12. ¿Tienes algún diagnóstico ginecológico?</FormLabel>
                     <FormDescription>SOP, endometriosis, etc.</FormDescription>
                     <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                            <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="si" /></FormControl><FormLabel className="font-normal">Sí, tengo un diagnóstico ginecológico.</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No, no tengo diagnósticos ginecológicos.</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="no_estoy_segura" /></FormControl><FormLabel className="font-normal">No estoy segura.</FormLabel></FormItem>
                        </RadioGroup>
                     </FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
            <Separator/>
            
            <FormField control={form.control} name="pregunta_13_compromiso" render={({ field }) => (
                <FormItem className="space-y-3">
                     <FormLabel>13. Nivel de compromiso con el plan.</FormLabel>
                     <FormDescription>Sé honesta contigo misma.</FormDescription>
                     <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                            <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="1" /></FormControl><FormLabel className="font-normal">Nivel 1: Recién empieza, quiero ir poco a poco.</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="2" /></FormControl><FormLabel className="font-normal">Nivel 2: Me esfuerzo bastante, pero no me exijo al 100%.</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="3" /></FormControl><FormLabel className="font-normal">Nivel 3: Estoy lista para seguir el plan al pie de la letra.</FormLabel></FormItem>
                        </RadioGroup>
                     </FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
            
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Guardando..." : "Guardar Cuestionario"}
            </Button>
        </form>
      </Form>
  );
}
