
export type Author = {
    id: string;
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

export type AnnouncementPost = {
  id: string;
  fecha: string;
  user_id: string;
  mensaje: string;
  img_url: string | null;
  usuarios: Author;
}

export type ClaseEnVivo = {
    id: string;
    user_id: string;
    titulo: string;
    descripcion: string | null;
    fecha_hora: string;
    link: string | null;
    disponible_hasta: string;
    miniatura: string | null;
    reproduciendo?: boolean;
}

export type Cita = {
    id: string;
    user_id: string;
    fecha_agendada: string;
    estado: 'pendiente' | 'confirmada' | 'cancelada';
}

export type AppointmentWithUser = Cita & {
    usuarios: {
        id: string;
        name: string | null;
        last_name: string | null;
    } | null;
};

export type ModerationAction = {
    id: string;
    moderador_id: string;
    user_id: string;
    accion: string;
    seccion: string;
    razon: string;
    fecha: string;
};

export type ModerationActionWithNames = ModerationAction & {
    moderador: {
        name: string | null;
        last_name: string | null;
    } | null;
    usuario_afectado: {
        name: string | null;
        last_name: string | null;
    } | null;
};

export type UserWithRole = {
    id: string;
    name: string | null;
    last_name: string | null;
    email: string | null;
    rol: number;
    entorno: 'casa' | 'gimnasio' | null;
    created_at: string;
}

export type Notificacion = {
    id: string;
    user_id: string;
    mensaje: string;
    link: string | null;
    leida: boolean;
    fecha: string;
}

export type LiveChatMessage = {
    id: string;
    clase_id: string;
    user_id: string;
    mensaje: string;
    fecha: string;
    usuarios: Author | null;
}

export type Conversation = {
    id: string;
    created_at: string;
    user_id: string;
    professional_id: string;
    last_message_preview: string | null;
    last_message_at: string;
    unread_by_user: boolean;
    unread_by_professional: boolean;
    user: Author;
    professional: Author;
}

export type ChatMessage = {
    id: string;
    created_at: string;
    conversation_id: string;
    sender_id: string;
    receiver_id: string;
    message: string;
    sender?: Author;
    status?: 'sending' | 'delivered' | 'failed';
    optimisticId?: string;
}
