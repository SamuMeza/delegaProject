import type { ServiceType } from "@/lib/types";

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
  fields: ConditionalField[];
}

export const SERVICE_TYPES: ServiceTypeConfig[] = [
  {
    id: "ensayo",
    label: "Ensayo",
    description: "Redacción y corrección de ensayos académicos",
    basePrice: 5,
    fields: [
      { name: "wordCount", label: "Cantidad de palabras", type: "number", required: true, placeholder: "Ej: 1500" },
      { name: "academicLevel", label: "Nivel académico", type: "select", required: true, options: [{ value: "secundaria", label: "Secundaria" }, { value: "pregrado", label: "Pregrado" }, { value: "postgrado", label: "Postgrado" }] },
      { name: "subjectArea", label: "Área temática", type: "text", required: true, placeholder: "Ej: Historia, Biología" },
      { name: "citationStyle", label: "Estilo de citación", type: "select", required: false, options: [{ value: "APA", label: "APA" }, { value: "MLA", label: "MLA" }, { value: "Chicago", label: "Chicago" }, { value: "ninguna", label: "Sin norma" }] },
    ],
  },
  {
    id: "presentacion",
    label: "Presentación",
    description: "Diseño de diapositivas para exposiciones",
    basePrice: 4,
    fields: [
      { name: "slideCount", label: "Número de diapositivas", type: "number", required: true, placeholder: "Ej: 10" },
      { name: "topic", label: "Tema de la presentación", type: "text", required: true, placeholder: "Ej: Cambio climático" },
      { name: "audienceLevel", label: "Audiencia", type: "select", required: true, options: [{ value: "basico", label: "Básico" }, { value: "intermedio", label: "Intermedio" }, { value: "avanzado", label: "Avanzado" }] },
    ],
  },
  {
    id: "investigacion",
    label: "Investigación",
    description: "Trabajos de investigación y monografías",
    basePrice: 5,
    fields: [
      { name: "topic", label: "Tema de investigación", type: "text", required: true, placeholder: "Ej: Economía venezolana" },
      { name: "wordCount", label: "Cantidad de palabras", type: "number", required: true, placeholder: "Ej: 3000" },
      { name: "sourceCount", label: "Fuentes requeridas", type: "number", required: true, placeholder: "Ej: 5" },
      { name: "academicLevel", label: "Nivel académico", type: "select", required: true, options: [{ value: "secundaria", label: "Secundaria" }, { value: "pregrado", label: "Pregrado" }, { value: "postgrado", label: "Postgrado" }] },
    ],
  },
  {
    id: "formato",
    label: "Formato",
    description: "Aplicación de normas de estilo y formato",
    basePrice: 2,
    fields: [
      { name: "formatType", label: "Norma de formato", type: "select", required: true, options: [{ value: "APA", label: "APA" }, { value: "MLA", label: "MLA" }, { value: "Chicago", label: "Chicago" }] },
      { name: "documentType", label: "Tipo de documento", type: "select", required: true, options: [{ value: "tesis", label: "Tesis" }, { value: "monografia", label: "Monografía" }, { value: "articulo", label: "Artículo" }, { value: "otro", label: "Otro" }] },
      { name: "pageCount", label: "Cantidad de páginas", type: "number", required: true, placeholder: "Ej: 20" },
    ],
  },
  {
    id: "diseno",
    label: "Diseño",
    description: "Creación de piezas gráficas y visuales",
    basePrice: 3,
    fields: [
      { name: "designType", label: "Tipo de diseño", type: "select", required: true, options: [{ value: "logo", label: "Logo" }, { value: "infographic", label: "Infografía" }, { value: "banner", label: "Banner" }] },
      { name: "dimensions", label: "Dimensiones (px)", type: "text", required: false, placeholder: "Ej: 1080x1080" },
      { name: "colorScheme", label: "Esquema de colores", type: "text", required: false, placeholder: "Ej: Azul y blanco" },
    ],
  },
  {
    id: "video",
    label: "Video",
    description: "Edición y producción de videos",
    basePrice: 8,
    fields: [
      { name: "duration", label: "Duración estimada", type: "select", required: true, options: [{ value: "15-30s", label: "15-30 segundos" }, { value: "1-3min", label: "1-3 minutos" }, { value: "3-5min", label: "3-5 minutos" }, { value: "mas", label: "Más de 5 minutos" }] },
      { name: "style", label: "Estilo de video", type: "select", required: true, options: [{ value: "explainer", label: "Explicativo" }, { value: "tutorial", label: "Tutorial" }, { value: "promo", label: "Promocional" }] },
      { name: "resolution", label: "Resolución", type: "select", required: false, options: [{ value: "720p", label: "720p" }, { value: "1080p", label: "1080p" }, { value: "4k", label: "4K" }] },
    ],
  },
];

export function getServiceConfig(type: ServiceType): ServiceTypeConfig | undefined {
  return SERVICE_TYPES.find((s) => s.id === type);
}