
export type Recipe = {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  img_url: string | null;
  ingredientes: string[];
  instrucciones: string;
  fecha_publicado: string;
  visible: boolean;
};
