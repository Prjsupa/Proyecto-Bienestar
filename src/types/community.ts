
export type PostAuthor = {
    name: string | null;
    last_name: string | null;
};

export type Reply = {
    id: string;
    post_id: string;
    user_id: string;
    mensaje: string;
    fecha: string;
    usuarios: PostAuthor | null;
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

