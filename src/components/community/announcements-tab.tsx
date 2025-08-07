
"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProfessionalPost } from "@/types/community";

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

export function AnnouncementsTab() {
    const [professionalPosts, setProfessionalPosts] = useState<ProfessionalPost[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        const professionalPostsWithTimestamps = initialProfessionalPostsData.map((post, index) => ({
            ...post,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * (24 * (index + 1))),
        }));
        setProfessionalPosts(professionalPostsWithTimestamps);
        setIsClient(true);
    }, []);

    const renderSkeletons = () => (
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="w-full space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-5 w-1/2 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      );

    return (
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
    )
}
