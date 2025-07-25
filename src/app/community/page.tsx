
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Check, MessageCircle, Paperclip, X, CornerDownRight, Annoyed } from "lucide-react";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const postSchema = z.object({
  content: z.string().min(10, "La publicación debe tener al menos 10 caracteres.").max(500, "La publicación no puede exceder los 500 caracteres."),
  file: z.any().optional(),
});

const questionSchema = z.object({
  question: z.string().min(15, "La pregunta debe tener al menos 15 caracteres.").max(500, "La pregunta no puede exceder los 500 caracteres."),
  file: z.any().optional(),
});

const replySchema = z.object({
  replyContent: z.string().min(1, "La respuesta no puede estar vacía.").max(500, "La respuesta no puede exceder los 500 caracteres."),
});

type Reply = {
    id: number;
    author: string;
    avatar: string;
    aiHint: string;
    timestamp: Date;
    content: string;
    isProfessional?: boolean;
}

type CommunityPost = {
  id: number;
  author: string;
  avatar: string;
  aiHint: string;
  timestamp: Date;
  content: string;
  replies: Reply[];
};

type ProfessionalPost = {
    id: number;
    author: string;
    specialty: string;
    avatar: string;
    aiHint: string;
    timestamp: Date;
    title: string;
    content: string;
}

type QAPost = {
    id: number;
    author: string;
    avatar: string;
    aiHint: string;
    timestamp: Date;
    question: string;
    answer: {
        professional: string;
        specialty: string;
        avatar: string;
        aiHint: string;
        content: string;
    } | null;
}

const initialPostsData: Omit<CommunityPost, 'timestamp' | 'replies'>[] = [
    {
      id: 1,
      author: "Mark Johnson",
      avatar: "https://placehold.co/40x40.png",
      aiHint: "man lifting weights",
      content: "¡Acabo de alcanzar un nuevo récord personal en peso muerto! La clave fue concentrarme en la forma, especialmente en mantener la espalda recta. Recuerden activar los dorsales antes de tirar. ¡Manténganse fuertes todos! #pesomuerto #PR",
    },
    {
      id: 2,
      author: "Jane Doe",
      avatar: "https://placehold.co/40x40.png",
      aiHint: "woman yoga",
      content: "¿Alguien tiene consejos para mejorar la flexibilidad para el yoga? Me cuestan las flexiones hacia adelante. He estado intentando mantener los estiramientos durante 30 segundos pero no veo mucho progreso.",
    },
    {
      id: 3,
      author: "Carlos Rodriguez",
      avatar: "https://placehold.co/40x40.png",
      aiHint: "man running",
      content: "¡Hoy completé mi primera carrera de 5k! El programa 'Del sofá a los 5k' de la app es fantástico. Lo recomiendo mucho para cualquier principiante. La sensación de logro es increíble.",
    },
];

const initialRepliesData: Omit<Reply, 'timestamp'>[][] = [
    [
        { id: 1, author: 'Coach Sarah', avatar: 'https://placehold.co/40x40.png', aiHint: 'woman coach', content: '¡Impresionante trabajo Mark! La forma lo es todo. ¡Sigue así!', isProfessional: true },
        { id: 2, author: 'Alex', avatar: 'https://placehold.co/40x40.png', aiHint: 'person gym', content: '¡Felicidades! Es un gran logro.' },
    ],
    [
        { id: 3, author: 'Michael Star', avatar: 'https://placehold.co/40x40.png', aiHint: 'man physiotherapist', content: 'La constancia es clave, Jane. Intenta incorporar estiramientos dinámicos antes de tus sesiones y mantén estiramientos estáticos después. El estiramiento FNP también podría ser muy beneficioso para ti.', isProfessional: true },
    ],
    [],
]


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

const initialProfessionalPostsData: Omit<ProfessionalPost, 'timestamp'>[] = [
    {
        id: 1,
        author: "Coach Sarah",
        specialty: "Entrenadora Principal",
        avatar: 'https://placehold.co/40x40.png',
        aiHint: "woman coach",
        title: "¡Nueva clase en vivo esta semana!",
        content: "¡Hola equipo! Este miércoles a las 18:00 tendremos una clase de HIIT en vivo. ¡Será un desafío total! Habrá modificaciones para todos los niveles. ¡No se la pierdan en la sección En Vivo!",
    },
    {
        id: 2,
        author: "Dra. Emily Carter",
        specialty: "Nutricionista",
        avatar: 'https://placehold.co/40x40.png',
        aiHint: "woman doctor smiling",
        title: "La importancia de la hidratación",
        content: "Recordatorio amistoso: ¡manténganse hidratados! Beber suficiente agua es crucial para la energía, la recuperación muscular y la salud en general. Intenta llevar una botella de agua contigo durante todo el día. #hidratacion #salud",
    }
]

export default function CommunityPage() {
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [qaPosts, setQAPosts] = useState<QAPost[]>([]);
  const [professionalPosts, setProfessionalPosts] = useState<ProfessionalPost[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [selectedPostFile, setSelectedPostFile] = useState<File | null>(null);
  const [selectedQuestionFile, setSelectedQuestionFile] = useState<File | null>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const postFileInputRef = useRef<HTMLInputElement>(null);
  const questionFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const postsWithTimestamps = initialPostsData.map((post, index) => ({
      ...post,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * (5 * (index + 1))),
      replies: initialRepliesData[index]?.map((reply, replyIndex) => ({
          ...reply,
          timestamp: new Date(Date.now() - 1000 * 60 * (3 * (replyIndex + 1))),
      })) || [],
    }));
     const qaWithTimestamps = initialQAData.map((qa, index) => ({
      ...qa,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * (3 * (index + 1))),
    }));
    const professionalPostsWithTimestamps = initialProfessionalPostsData.map((post, index) => ({
        ...post,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * (24 * (index + 1))),
    }))
    setCommunityPosts(postsWithTimestamps);
    setQAPosts(qaWithTimestamps);
    setProfessionalPosts(professionalPostsWithTimestamps);
    setIsClient(true);
  }, []);
  
  const postForm = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: { content: "" },
  });
  
  const questionForm = useForm<z.infer<typeof questionSchema>>({
    resolver: zodResolver(questionSchema),
    defaultValues: { question: "" },
  });

  const replyForm = useForm<z.infer<typeof replySchema>>({
    resolver: zodResolver(replySchema),
    defaultValues: { replyContent: "" },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        alert("El archivo no puede exceder los 5MB.");
        return;
      }
      setFile(file);
    }
  };


  function onPostSubmit(values: z.infer<typeof postSchema>) {
    console.log("Nueva publicación:", {...values, file: selectedPostFile?.name});
    const newPost: CommunityPost = {
        id: Date.now(),
        author: 'Sofia Davis',
        avatar: 'https://github.com/shadcn.png',
        aiHint: 'person smiling',
        timestamp: new Date(),
        content: values.content,
        replies: []
    }
    setCommunityPosts(posts => [newPost, ...posts]);
    postForm.reset();
    setSelectedPostFile(null);
    if(postFileInputRef.current) postFileInputRef.current.value = "";
  }
  
  function onQuestionSubmit(values: z.infer<typeof questionSchema>) {
    console.log("Nueva pregunta:", {...values, file: selectedQuestionFile?.name});
    const newQA: QAPost = {
        id: Date.now(),
        author: 'Sofia Davis',
        avatar: 'https://github.com/shadcn.png',
        aiHint: 'person thinking',
        timestamp: new Date(),
        question: values.question,
        answer: null
    }
    setQAPosts(qas => [newQA, ...qas]);
    questionForm.reset();
    setSelectedQuestionFile(null);
    if(questionFileInputRef.current) questionFileInputRef.current.value = "";
  }

  function onReplySubmit(postId: number, values: z.infer<typeof replySchema>) {
    console.log(`Respondiendo a la publicación ${postId}:`, values.replyContent);
    // En una app real, esto se enviaría a un servidor
    const newReply: Reply = {
        id: Date.now(),
        author: 'Sofia Davis', // Asumiendo que el usuario actual es Sofia
        avatar: 'https://github.com/shadcn.png',
        aiHint: 'person smiling',
        timestamp: new Date(),
        content: values.replyContent,
        isProfessional: false // Cambiar a true si un profesional responde
    };
    setCommunityPosts(posts => posts.map(post => 
        post.id === postId ? {...post, replies: [...post.replies, newReply]} : post
    ));
    replyForm.reset();
    setReplyingTo(null);
  }

  const renderSkeletons = () => (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
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
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold font-headline">Centro de Comunidad</h1>
          <p className="text-muted-foreground">
            Conecta con compañeros y obtén consejos de expertos para potenciar tu viaje de bienestar.
          </p>
        </div>

        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="feed">Comunidad</TabsTrigger>
            <TabsTrigger value="q-and-a">Pregúntale a un Profesional</TabsTrigger>
            <TabsTrigger value="announcements">Anuncios de Profesionales</TabsTrigger>
          </TabsList>
          
          <TabsContent value="feed" className="mt-6">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg font-headline">Comparte tus ideas</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...postForm}>
                  <form onSubmit={postForm.handleSubmit(onPostSubmit)} className="space-y-4">
                    <FormField
                      control={postForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="¿Qué tienes en mente? ¡Comparte un consejo de entrenamiento o un éxito reciente!"
                              className="resize-none"
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     {selectedPostFile && (
                      <div className="flex items-center justify-between p-2 text-sm text-muted-foreground bg-muted rounded-md">
                          <div className="flex items-center gap-2 truncate">
                            <Paperclip className="w-4 h-4" />
                            <span className="truncate">{selectedPostFile.name}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => {
                                setSelectedPostFile(null)
                                if(postFileInputRef.current) postFileInputRef.current.value = "";
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                       <FormField
                        control={postForm.control}
                        name="file"
                        render={() => (
                            <FormItem>
                                <FormControl>
                                  <>
                                    <input 
                                      type="file" 
                                      className="hidden" 
                                      ref={postFileInputRef}
                                      onChange={(e) => handleFileChange(e, setSelectedPostFile)}
                                      accept="image/*,video/*,application/pdf,.doc,.docx"
                                    />
                                    <Button type="button" variant="outline" onClick={() => postFileInputRef.current?.click()}>
                                        <Paperclip className="w-4 h-4 mr-2"/>
                                        Adjuntar Archivo
                                    </Button>
                                  </>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                       />

                      <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">Publicar</Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <h2 className="text-2xl font-semibold font-headline">Publicaciones Recientes</h2>
              {!isClient ? renderSkeletons() : communityPosts.map((post) => (
                <Card key={post.id}>
                  <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                    <Avatar>
                      <AvatarImage src={post.avatar} alt={post.author} data-ai-hint={post.aiHint} />
                      <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="w-full">
                      <p className="font-semibold">{post.author}</p>
                      {isClient && (
                          <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(post.timestamp, { addSuffix: true, locale: es })}
                          </p>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{post.content}</p>
                  </CardContent>
                  <CardFooter className="flex-col items-start gap-4">
                     <Button variant="ghost" size="sm" onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}>
                        <CornerDownRight className="w-4 h-4 mr-2"/>
                        Responder
                     </Button>

                     {post.replies.length > 0 && (
                        <div className="w-full space-y-4 pl-8 border-l border-border ml-4">
                            {post.replies.map(reply => (
                                <div key={reply.id} className="flex gap-3">
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={reply.avatar} alt={reply.author} data-ai-hint={reply.aiHint} />
                                        <AvatarFallback>{reply.author.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-sm">{reply.author}</p>
                                            {isClient && (
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(reply.timestamp, { addSuffix: true, locale: es })}
                                                </p>
                                            )}
                                            {reply.isProfessional && (
                                                 <Badge variant="outline" className="border-primary/50 text-primary text-xs">
                                                    <Check className="w-3 h-3 mr-1" />
                                                    Profesional
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{reply.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                     )}

                     {replyingTo === post.id && (
                        <div className="w-full pl-8 ml-4">
                            <Form {...replyForm}>
                                <form onSubmit={replyForm.handleSubmit(data => onReplySubmit(post.id, data))} className="flex items-start gap-3">
                                    <Avatar className="w-8 h-8 mt-1">
                                        <AvatarImage src="https://github.com/shadcn.png" alt="Your avatar" data-ai-hint="person smiling"/>
                                        <AvatarFallback>Tú</AvatarFallback>
                                    </Avatar>
                                    <FormField
                                        control={replyForm.control}
                                        name="replyContent"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormControl>
                                                    <Input placeholder="Escribe una respuesta..." {...field} />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">Enviar</Button>
                                </form>
                            </Form>
                        </div>
                     )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="q-and-a" className="mt-6">
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
                                    if(questionFileInputRef.current) questionFileInputRef.current.value = "";
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
                                  <>
                                    <input 
                                      type="file" 
                                      className="hidden" 
                                      ref={questionFileInputRef}
                                      onChange={(e) => handleFileChange(e, setSelectedQuestionFile)}
                                      accept="image/*,video/*,application/pdf,.doc,.docx"
                                    />
                                    <Button type="button" variant="outline" onClick={() => questionFileInputRef.current?.click()}>
                                        <Paperclip className="w-4 h-4 mr-2"/>
                                        Adjuntar Archivo
                                    </Button>
                                  </>
                                </FormControl>
                                <FormMessage/>
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
                                    <MessageCircle className="w-4 h-4 mr-2"/>
                                    Esperando respuesta de un profesional.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="announcements" className="mt-6">
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold font-headline">Anuncios de Profesionales</h2>
                 {!isClient ? renderSkeletons() : professionalPosts.map((post) => (
                    <Card key={post.id}>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={post.avatar} alt={post.author} data-ai-hint={post.aiHint} />
                                    <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{post.author}</p>
                                    <p className="text-xs text-muted-foreground">{post.specialty}</p>
                                </div>
                                {isClient && (
                                    <p className="text-xs text-muted-foreground ml-auto">
                                        {formatDistanceToNow(post.timestamp, { addSuffix: true, locale: es })}
                                    </p>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                            <p className="text-muted-foreground whitespace-pre-wrap">{post.content}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

