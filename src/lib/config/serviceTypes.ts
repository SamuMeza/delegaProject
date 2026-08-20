import type { ServiceType } from "@/lib/types";
import {
  FileText,
  Presentation,
  Palette,
  Video,
  type LucideIcon,
} from "lucide-react";

export interface ConditionalField {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "textarea";
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

export interface ServiceTypeConfig {
  id: ServiceType;
  label: string;
  description: string;
  basePrice: number;
  icon: LucideIcon;
  fields: ConditionalField[];
}

export const SERVICE_TYPES: ServiceTypeConfig[] = [
  {
    id: "trabajos_escritos",
    label: "Trabajos Escritos",
    description: "Ensayos, tesis, monografías, informes, artículos y formato APA",
    basePrice: 2,
    icon: FileText,
    fields: [
      { name: "subtipo", label: "Tipo de trabajo", type: "select", required: true, options: [
        { value: "ensayo", label: "Ensayo" },
        { value: "tesis", label: "Tesis / Trabajo de grado" },
        { value: "monografia", label: "Monografía" },
        { value: "informe", label: "Informe" },
        { value: "articulo", label: "Artículo" },
        { value: "formato", label: "Formato / Normas APA" },
      ]},
      { name: "tema", label: "Tema", type: "text", required: true, placeholder: "Ej: Economía venezolana" },
      { name: "paginas", label: "Cantidad de páginas", type: "select", required: true, options: [
        { value: "1-3", label: "1–3 páginas" },
        { value: "4-7", label: "4–7 páginas" },
        { value: "8+", label: "8+ páginas" },
      ]},
      { name: "tieneGuia", label: "¿Tiene guía/instrucciones?", type: "select", required: true, options: [
        { value: "true", label: "Sí" },
        { value: "false", label: "No" },
      ]},
      { name: "instruccionesEspeciales", label: "Instrucciones especiales", type: "textarea", required: false, placeholder: "Detalles adicionales sobre el trabajo..." },
    ],
  },
  {
    id: "presentacion",
    label: "Presentación",
    description: "Diseño de diapositivas para exposiciones",
    basePrice: 4,
    icon: Presentation,
    fields: [
      { name: "slideCount", label: "Número de diapositivas", type: "number", required: true, placeholder: "Ej: 10" },
      { name: "topic", label: "Tema de la presentación", type: "text", required: true, placeholder: "Ej: Cambio climático" },
      { name: "audienceLevel", label: "Audiencia", type: "select", required: true, options: [
        { value: "basico", label: "Básico" },
        { value: "intermedio", label: "Intermedio" },
        { value: "avanzado", label: "Avanzado" },
      ]},
    ],
  },
  {
    id: "diseno",
    label: "Diseño",
    description: "Creación de piezas gráficas, flyers animados y paquetes de fotos",
    basePrice: 3,
    icon: Palette,
    fields: [
      { name: "designType", label: "Tipo de diseño", type: "select", required: true, options: [
        { value: "logo", label: "Logo" },
        { value: "infographic", label: "Infografía" },
        { value: "banner", label: "Banner" },
        { value: "flyers_animados", label: "Flyers animados" },
        { value: "paquete_fotos", label: "Paquete de fotos" },
      ]},
      { name: "dimensions", label: "Dimensiones (px)", type: "text", required: false, placeholder: "Ej: 1080x1080" },
      { name: "colorScheme", label: "Esquema de colores", type: "text", required: false, placeholder: "Ej: Azul y blanco" },
    ],
  },
  {
    id: "video",
    label: "Video",
    description: "Edición y producción de videos",
    basePrice: 8,
    icon: Video,
    fields: [
      { name: "duration", label: "Duración estimada", type: "select", required: true, options: [
        { value: "15-30s", label: "15-30 segundos" },
        { value: "1-3min", label: "1-3 minutos" },
        { value: "3-5min", label: "3-5 minutos" },
        { value: "mas", label: "Más de 5 minutos" },
      ]},
      { name: "style", label: "Estilo de video", type: "select", required: true, options: [
        { value: "explainer", label: "Explicativo" },
        { value: "tutorial", label: "Tutorial" },
        { value: "promo", label: "Promocional" },
      ]},
      { name: "resolution", label: "Resolución", type: "select", required: false, options: [
        { value: "720p", label: "720p" },
        { value: "1080p", label: "1080p" },
      ]},
    ],
  },
];

export function getServiceConfig(type: ServiceType): ServiceTypeConfig | undefined {
  return SERVICE_TYPES.find((s) => s.id === type);
}