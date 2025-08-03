
export type Routine = {
    id: string;
    titulo: string;
    descripcion: string;
    entorno: 'Casa' | 'Gimnasio';
    equipo: string;
    ejercicios: string;
    fecha: string;
    visible: boolean;
    img_url: string | null;
  };
  
