import type { Order, OrderStatus, Operator, ServiceType } from "@/lib/types";
import { canTransitionFrom } from "@/lib/orders/stateMachine";

// Helpers de presentación para el dominio de órdenes (shared por list/detail/dashboard).

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  nueva: "Nueva",
  pendiente_pago: "Pendiente de pago",
  en_progreso: "En progreso",
  revision: "En revisión",
  pendiente_final: "Pendiente de entrega",
  completada: "Completada",
  cancelada: "Cancelada",
};

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  ensayo: "Ensayo",
  presentacion: "Presentación",
  investigacion: "Investigación",
  formato: "Formato",
  diseno: "Diseño",
  video: "Video",
};

// Clases Tailwind por estado (contraste ≥4.5:1 sobre texto).
export const ORDER_STATUS_CLASSES: Record<OrderStatus, string> = {
  nueva: "bg-blue-100 text-blue-800",
  pendiente_pago: "bg-amber-100 text-amber-900",
  en_progreso: "bg-indigo-100 text-indigo-800",
  revision: "bg-purple-100 text-purple-800",
  pendiente_final: "bg-teal-100 text-teal-800",
  completada: "bg-green-100 text-green-800",
  cancelada: "bg-gray-200 text-gray-600",
};

export const PAYMENT_STATUS_LABELS = {
  unpaid: "Sin pagar",
  partial: "Abono parcial",
  paid: "Pagada",
} as const;

export const PAYMENT_STATUS_CLASSES = {
  unpaid: "bg-red-100 text-red-800",
  partial: "bg-amber-100 text-amber-900",
  paid: "bg-green-100 text-green-800",
} as const;

// Transiciones disponibles para el operador propietario según el estado actual.
export function getAvailableTransitions(order: Order): OrderStatus[] {
  return canTransitionFrom(order.status);
}

// Vencida: dueDate en el pasado y estado activo (no completada/cancelada).
export function isOverdue(order: Order): boolean {
  if (!order.dueDate) return false;
  if (order.status === "completada" || order.status === "cancelada") return false;
  return new Date(order.dueDate).getTime() < Date.now();
}

// Vence hoy: dueDate es hoy y estado activo (no completada/cancelada).
export function isDueToday(order: Order): boolean {
  if (!order.dueDate) return false;
  if (order.status === "completada" || order.status === "cancelada") return false;
  
  const today = new Date();
  const dueDate = new Date(order.dueDate);
  
  return dueDate.toDateString() === today.toDateString();
}

// Vence mañana: dueDate es mañana y estado activo (no completada/cancelada).
export function isDueTomorrow(order: Order): boolean {
  if (!order.dueDate) return false;
  if (order.status === "completada" || order.status === "cancelada") return false;
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dueDate = new Date(order.dueDate);
  
  return dueDate.toDateString() === tomorrow.toDateString();
}

export function formatDueDate(dueDate: string | null): string {
  if (!dueDate) return "—";
  const d = new Date(dueDate);
  return d.toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" });
}

export function operatorLabel(
  operators: Operator[] | undefined,
  operatorId: string,
): string {
  const op = operators?.find((o) => o.id === operatorId);
  return op?.displayName ?? operatorId;
}

// OrderDetails vacío con forma válida para cada serviceType (campos mínimos).
export function defaultOrderDetails(serviceType: ServiceType): OrderDetails {
  switch (serviceType) {
    case "ensayo":
      return { tema: "", paginas: "1-3", normas: "ninguna", tieneGuia: false };
    case "presentacion":
      return {
        tema: "",
        diapositivas: "hasta-10",
        estilo: "no-importa",
        incluyeImagenes: "no",
        tieneGuia: false,
      };
    case "investigacion":
      return {
        tema: "",
        profundidad: "media",
        fuentesMinimas: "no-importa",
        formatoEntrega: "resumen",
        tieneGuia: false,
      };
    case "formato":
      return {
        tipoDocumento: "word",
        norma: "APA",
        necesitaIndice: false,
        necesitaPortada: false,
      };
    case "diseno":
      return {
        tipoDiseno: "flayer",
        proposito: "",
        textoIncluir: "",
        tieneImagenes: false,
      };
    case "video":
      return {
        tipoVideo: "corto-redes",
        duracion: "15-30s",
        plataforma: "tiktok",
        tieneMaterial: false,
        musicaFondo: "no-importa",
        vozEnOff: "texto",
        tieneGuion: false,
      };
  }
}
