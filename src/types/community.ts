
export type PostAuthor = {
    name: string | null;
    last_name: string | null;
};

export type CommunityPost = {
  id: string;
  user_id: string;
  mensaje: string;
  img_url: string | null;
  fecha: string;
  usuarios: PostAuthor | null;
};

export type Reply = {
    id: number;
    author: string;
    avatar: string;
    aiHint: string;
    timestamp: Date;
    content: string;
    isProfessional?: boolean;
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

    