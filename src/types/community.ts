

export type Author = {
    name: string | null;
    last_name: string | null;
    rol?: number;
    titulo?: string | null;
}

export type Reply = {
    id: string;
    post_id: string;
    user_id: string;
    mensaje: string;
    fecha: string;
    usuarios: Author | null;
}

export type CommunityPost = {
  id: string;
  user_id: string;
  mensaje: string;
  img_url: string | null;
  fecha: string;
  usuarios: Author | null;
  comunidad_respuestas: Reply[];
};

export type QAReply = {
    id: string;
    created_at: string;
    pregunta_id: string;
    respuesta: string;
    user_id: string;
    es_profesional?: boolean;
    usuarios: {
        name: string | null;
        last_name: string | null;
        avatar_url?: string;
    } | null;
}

export type QAPost = {
    id: string;
    created_at: string;
    pregunta: string;
    user_id: string;
    usuarios: {
        name: string | null;
        last_name: string | null;
        avatar_url?: string;
    } | null;
    respuestas_profesionales: QAReply[];
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

export type Cita = {
    id: string;
    user_id: string;
    fecha_agendada: string;
    estado: 'pendiente' | 'confirmada' | 'cancelada';
}
