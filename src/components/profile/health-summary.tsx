
"use client";

import type { HealthFormData } from '@/types/health-form';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

interface HealthSummaryProps {
  formData: HealthFormData;
  onEdit: () => void;
}

function SummaryItem({ label, value }: { label: string; value: string | number | null | undefined | string[] }) {
    const displayValue = Array.isArray(value) ? value.join(', ') : value;
    if (value === null || value === undefined || value === '') return null;

    return (
        <div className="flex flex-col sm:flex-row sm:items-center py-3">
            <dt className="sm:w-1/3 font-semibold text-muted-foreground">{label}</dt>
            <dd className="sm:w-2/3 text-foreground">{String(displayValue)}</dd>
        </div>
    );
}

const diagnosticosMedicosLabels: { [key: string]: string } = {
    'hipotiroidismo': 'Hipotiroidismo',
    'resistencia_insulina': 'Resistencia a la insulina',
    'sop': 'SOP (Síndrome de Ovario Poliquístico)',
    'ninguno': 'Ninguno',
};

const diasEjercicioLabels: { [key: string]: string } = {
    '0': '0 días (sedentario)',
    '1-3': '1-3 días por semana',
    '3-4': '3-4 días por semana',
    '5+': '5 o más días por semana',
};

const actividadDiariaLabels: { [key: string]: string } = {
    'sedentario': 'Sedentario (trabajo de oficina, poca actividad)',
    'moderada': 'Moderada (camino regularmente, algo activo)',
    'alta': 'Alta (trabajo físico o muy activa en general)',
};

const cicloMenstrualLabels: { [key: string]: string } = {
    'si': 'Sí, tengo ciclo menstrual regular',
    'no': 'No, mi ciclo es irregular',
    'no_aplica': 'No aplica (menopausia, etc.)',
};

const siNoLabels: { [key: string]: string } = {
    'si': 'Sí',
    'no': 'No',
};

const diagnosticoGinecologicoLabels: { [key: string]: string } = {
    ...siNoLabels,
    'no_estoy_segura': 'No estoy segura',
};

const compromisoLabels: { [key: string]: string } = {
    '1': 'Nivel 1: Recién empieza, quiero ir poco a poco.',
    '2': 'Nivel 2: Me esfuerzo bastante, pero no me exijo al 100%.',
    '3': 'Nivel 3: Estoy lista para seguir el plan al pie de la letra.',
};

const entornoLabels: { [key: string]: string } = {
    'casa': 'En Casa',
    'gimnasio': 'En el Gimnasio',
};

export function HealthSummary({ formData, onEdit }: HealthSummaryProps) {
  const getDiagnosticoDisplay = () => {
    if (!formData.pregunta_5_diagnostico_medico || formData.pregunta_5_diagnostico_medico.length === 0) {
        return 'No especificado';
    }
    return formData.pregunta_5_diagnostico_medico.map(d => diagnosticosMedicosLabels[d] || d).join(', ');
  }

  return (
    <div className="space-y-6">
        <dl className="divide-y divide-border">
            <SummaryItem label="Edad" value={`${formData.pregunta_1_edad} años`} />
            <SummaryItem label="Estatura" value={`${formData.pregunta_2_estatura} cm`} />
            <SummaryItem label="Peso" value={`${formData.pregunta_3_peso} kg`} />
            <SummaryItem label="Grasa Corporal" value={`${formData.pregunta_4_grasa_corporal}%`} />
            <SummaryItem label="Diagnóstico Médico" value={getDiagnosticoDisplay()} />
            <SummaryItem label="Objetivo Principal" value={formData.pregunta_6_objetivo_principal} />
            <SummaryItem label="Días de Ejercicio" value={formData.pregunta_7_dias_ejercicio ? diasEjercicioLabels[formData.pregunta_7_dias_ejercicio] : null} />
            <SummaryItem label="Actividad Diaria" value={formData.pregunta_8_actividad_diaria ? actividadDiariaLabels[formData.pregunta_8_actividad_diaria] : null} />
            <SummaryItem label="Restricciones Alimentarias" value={formData.pregunta_9_restricciones_alimentarias || 'Ninguna'} />
            <SummaryItem label="Ciclo Menstrual" value={formData.pregunta_10_ciclo_menstrual ? cicloMenstrualLabels[formData.pregunta_10_ciclo_menstrual] : null} />
            <SummaryItem label="Uso de Anticonceptivos" value={formData.pregunta_11_anticonceptivos ? siNoLabels[formData.pregunta_11_anticonceptivos] : null} />
            <SummaryItem label="Diagnóstico Ginecológico" value={formData.pregunta_12_diagnostico_ginecologico ? diagnosticoGinecologicoLabels[formData.pregunta_12_diagnostico_ginecologico] : null} />
            <SummaryItem label="Nivel de Compromiso" value={formData.pregunta_13_compromiso ? compromisoLabels[formData.pregunta_13_compromiso] : null} />
            <SummaryItem label="Entorno de Entrenamiento" value={formData.pregunta_14_entorno ? entornoLabels[formData.pregunta_14_entorno] : null} />
        </dl>
        <div className="flex justify-end pt-4">
            <Button onClick={onEdit}>
                <Pencil className="w-4 h-4 mr-2" />
                Editar mis respuestas
            </Button>
        </div>
    </div>
  );
}
