

export type Routine = {
    id: string;
    titulo: string;
    descripcion: string;
    entorno: 'casa' | 'gimnasio';
    equipo: string;
    ejercicios: string;
    fecha: string;
    visible: boolean;
    img_url: string | null;
    visible_hasta?: string;
  };

type Author = {
    id: string;
    name: string | null;
    last_name: string | null;
    rol?: number;
    titulo?: string | null;
};

export type TechniqueReply = {
    id: string;
    post_id: string;
    user_id: string;
    mensaje: string;
    fecha: string;
    usuarios: Author | null;
}

export type TechniquePost = {
  id: string;
  fecha: string;
  user_id: string;
  video_url: string | null;
  nota: string | null;
  usuarios: Author;
  clinica_tecnica_respuesta: TechniqueReply[];
};

    