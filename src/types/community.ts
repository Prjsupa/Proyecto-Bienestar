

export type PostAuthor = {
    name: string | null;
    last_name: string | null;
    avatar_url?: string;
};

export type AuthorVista = {
    name: string | null;
    last_name: string | null;
    id: string;
    email: string;
    avatar_url?: string;
}

export type Reply = {
    id: string;
    post_id: string;
    user_id: string;
    mensaje: string;
    fecha: string;
    usuarios_vista: AuthorVista | null;
}

export type CommunityPost = {
  id: string;
  user_id: string;
  mensaje: string;
  img_url: string | null;
  fecha: string;
  usuarios: PostAuthor | null;
  comunidad_respuestas?: Reply[];
};

export type QAPost = {
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

export type ProfessionalPost = {
    id: number;
    author: string;
    specialty: string;
    avatar: string;
    aiHint: string;
    timestamp: Date;
    title: string;
    content: string;
}

export type ClaseEnVivo = {
    id: string;
    titulo: string;
    descripcion: string | null;
    fecha_hora: string;
    link: string | null;
    disponible_hasta: string;
    miniatura: string | null;
}
    
