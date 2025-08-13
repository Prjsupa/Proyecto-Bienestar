
export type Routine = {
    id: string;
    user_id?: string;
    titulo: string;
    descripcion: string;
    entorno: 'casa' | 'gimnasio';
    equipo: string;
    ejercicios: string;
    fecha: string;
    visible: boolean;
    visible_hasta?: string;
  };

    

    
