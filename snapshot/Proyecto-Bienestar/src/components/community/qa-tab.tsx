
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Check, MessageCircle, Paperclip, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { QAPost } from "@/types/community";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const questionSchema = z.object({
  question: z.string().min(15, "La pregunta debe tener al menos 15 caracteres.").max(500, "La pregunta no puede exceder los 500 caracteres."),
  file: z.any().optional(),
});

const initialQAData: Omit<QAPost, 'timestamp'>[] = [
    {
        id: 1,
        author: 'Laura Evans',
        avatar: 'https://placehold.co/40x40.png',
        aiHint: 'woman thinking',
        question: '¿Cuáles son las mejores comidas post-entrenamiento para la recuperación muscular? Siempre me siento muy adolorida al día siguiente.',
        answer: {
            professional: 'Dra. Emily Carter',
            specialty: 'Nutricionista',
            avatar: 'https://placehold.co/40x40.png',
            aiHint: 'woman doctor smiling',
            content: "¡Gran pregunta, Laura! Para la recuperación muscular, apunta a una comida con una proporción de 3:1 o 4:1 de carbohidratos a proteínas dentro de los 45 minutos posteriores a tu entrenamiento. Un batido con fruta y proteína en polvo, o pollo a la parrilla con batata son excelentes opciones. Esto ayuda a reponer las reservas de glucógeno y a reparar las fibras musculares.",
        }
    },
    {
        id: 2,
        author: 'David Chen',
        avatar: 'https://placehold.co/40x40.png',
        aiHint: 'man stretching',
        question: 'Tengo un ligero dolor en la rodilla derecha cuando hago sentadillas. ¿Debería preocuparme?',
        answer: {
            professional: 'Michael Star',
            specialty: 'Fisioterapeuta',
            avatar: 'https://placehold.co/40x40.png',
            aiHint: 'man physiotherapist',
            content: "Hola David, es prudente escuchar a tu cuerpo. El dolor durante las sentadillas podría deberse a la forma. Asegúrate de que tus rodillas sigan la línea de tus pies y no se vayan hacia adentro. Intenta grabarte o que un profesional revise tu forma. Si el dolor persiste, es mejor que te lo revisen para descartar cualquier problema subyacente. Por ahora, intenta reducir el peso y concéntrate en la forma.",
        }
    },
    {
        id: 3,
        author: 'Maria Garcia',
        avatar: 'https://placehold.co/40x40.png',
        aiHint: 'woman confused',
        question: '¿Cuánto cardio es demasiado? Quiero perder peso pero no quiero perder masa muscular.',
        answer: null,
    }
]

export function QATab() {
  const [qaPosts, setQAPosts] = useState<QAPost[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [selectedQuestionFile, setSelectedQuestionFile] = useState<File | null>(null);
  const questionFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const qaWithTimestamps = initialQAData.map((qa, index) => ({
      ...qa,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * (3 * (index + 1))),
    }));
    setQAPosts(qaWithTimestamps);
    setIsClient(true);
  }, []);

  const questionForm = useForm<z.infer<typeof questionSchema>>({
    resolver: zodResolver(questionSchema),
    defaultValues: { question: "" },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast({ variant: "destructive", title: "Archivo demasiado grande", description: "El archivo no puede exceder los 5MB." });
        return;
      }
      setSelectedQuestionFile(file);
    }
  };

  function onQuestionSubmit(values: z.infer<typeof questionSchema>) {
    console.log("Nueva pregunta:", { ...values, file: selectedQuestionFile?.name });
    // Lógica para enviar pregunta...
    toast({ title: "Pregunta enviada", description: "Tu pregunta ha sido enviada a nuestros profesionales."});
    questionForm.reset();
    setSelectedQuestionFile(null);
    if (questionFileInputRef.current) questionFileInputRef.current.value = "";
  }
  
  const renderSkeletons = () => (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="w-full space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-headline">Pregúntale a nuestros Expertos</CardTitle>
          <p className="text-sm text-muted-foreground">¿Tienes preguntas sobre nutrición, entrenamientos o recuperación? Nuestros profesionales están aquí para ayudarte.</p>
        </CardHeader>
        <CardContent>
          <Form {...questionForm}>
            <form onSubmit={questionForm.handleSubmit(onQuestionSubmit)} className="space-y-4">
              <FormField
                control={questionForm.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tu Pregunta</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Por ejemplo: '¿Cuál es la mejor forma de calentar para una carrera?'"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {selectedQuestionFile && (
                <div className="flex items-center justify-between p-2 text-sm text-muted-foreground bg-muted rounded-md">
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip className="w-4 h-4" />
                    <span className="truncate">{selectedQuestionFile.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      setSelectedQuestionFile(null);
                      if (questionFileInputRef.current) questionFileInputRef.current.value = "";
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <div className="flex justify-between items-center">
                <FormField
                  control={questionForm.control}
                  name="file"
                  render={() => (
                    <FormItem>
                      <FormControl>
                        <Button type="button" variant="outline" onClick={() => questionFileInputRef.current?.click()}>
                          <Paperclip className="w-4 h-4 mr-2" />
                          Adjuntar Archivo
                        </Button>
                      </FormControl>
                      <input
                        type="file"
                        className="hidden"
                        ref={questionFileInputRef}
                        onChange={handleFileChange}
                        accept="image/*,video/*,application/pdf,.doc,.docx"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">Enviar Pregunta</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold font-headline">Preguntas Respondidas</h2>
        {!isClient ? renderSkeletons() : qaPosts.map((qa) => (
          <Card key={qa.id}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={qa.avatar} alt={qa.author} data-ai-hint={qa.aiHint} />
                  <AvatarFallback>{qa.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{qa.author}</p>
                  {isClient && (
                    <p className="text-xs text-muted-foreground">
                      preguntó {formatDistanceToNow(qa.timestamp, { addSuffix: true, locale: es })}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-base mb-4">{qa.question}</p>
              {qa.answer ? (
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={qa.answer.avatar} alt={qa.answer.professional} data-ai-hint={qa.answer.aiHint} />
                      <AvatarFallback>{qa.answer.professional.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{qa.answer.professional}</p>
                      <p className="text-xs text-muted-foreground">{qa.answer.specialty}</p>
                    </div>
                    <Badge variant="outline" className="ml-auto border-primary/50 text-primary">
                      <Check className="w-3 h-3 mr-1" />
                      Profesional
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{qa.answer.content}</p>
                </div>
              ) : (
                <div className="flex items-center justify-center text-sm text-muted-foreground p-4 bg-secondary/50 rounded-lg">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Esperando respuesta de un profesional.
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
