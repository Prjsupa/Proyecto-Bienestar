

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
  };

type PostAuthor = {
    name: string | null;
    last_name: string | null;
};

export type TechniquePost = {
  id: string;
  fecha: string;
  user_id: string;
  video_url: string | null;
  nota: string | null;
  usuarios: PostAuthor | null;
};
