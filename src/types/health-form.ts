
export type HealthFormData = {
  id?: string;
  user_id?: string;
  pregunta_1_edad: number | null;
  pregunta_2_estatura: number | null;
  pregunta_3_peso: number | null;
  pregunta_4_grasa_corporal: number | null;
  pregunta_5_diagnostico_medico: string[];
  pregunta_5_diagnostico_otro: string | null;
  pregunta_6_objetivo_principal: string | null;
  pregunta_7_dias_ejercicio: string | null;
  pregunta_8_actividad_diaria: string | null;
  pregunta_9_restricciones_alimentarias: string | null;
  pregunta_10_ciclo_menstrual: string | null;
  pregunta_11_anticonceptivos: string | null;
  pregunta_12_diagnostico_ginecologico: string | null;
  pregunta_13_compromiso: string | null;
  created_at?: string;
  updated_at?: string;
};
