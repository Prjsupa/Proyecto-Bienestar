
export type Routine = {
    id: string;
    title: string;
    category: "Casa" | "Gimnasio";
    duration: string;
    level: "Principiante" | "Intermedio" | "Avanzado";
    img_url: string | null;
    aiHint: string;
  };
  
