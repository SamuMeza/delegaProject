// Tipos estrictos para las entidades de Delega (manual técnico §2.2).
// Solo definición de datos; la lógica de negocio vive en otra capa.

export type OperatorRole = "operator";

export type PriceRanges = Record<string, { min: number; max: number }>;

export interface FaqItem {
  question: string;
  answer: string;
}

export interface PagoMovilInfo {
  bank: string;
  rif: string;
  phone: string;
}

export type ServiceType =
  | "ensayo"
  | "presentacion"
  | "investigacion"
  | "formato"
  | "diseno"
  | "video";

export type OrderStatus =
  | "nueva"
  | "pendiente_pago"
  | "en_progreso"
  | "revision"
  | "pendiente_final"
  | "completada"
  | "cancelada";

export type SubscriptionType = "basico" | "pro" | "creativo" | "full";

export type SubscriptionStatus = "activa" | "vencida" | "cancelada" | "reemplazada";

export type CoverageTipo = "estandar" | "cubierta_por_suscripcion" | "suelta_con_descuento";

export type ActionType =
  | "login"
  | "logout"
  | "create_order"
  | "update_order"
  | "delete_order"
  | "add_note"
  | "upload_file"
  | "change_status"
  | "create_client"
  | "update_client"
  | "create_subscription"
  | "cancel_subscription"
  | "renew_subscription"
  | "delete_attachment";

export interface Operator {
  id: string;
  username: string;
  displayName: string;
  passwordHash: string;
  role: OperatorRole;
  services: ServiceType[];
  color: string;
  active: boolean;
  createdAt: number;
}

export interface SubscriptionEmbedded {
  type: SubscriptionType;
  startDate: string;
  endDate: string;
  price: number;
  status: SubscriptionStatus;
  monthlyQuota: number;
  usedPerMonth: Record<string, number>;
}

export interface Client {
  phone: string;
  name: string;
  email?: string;
  notes?: string;
  totalOrders: number;
  totalSpent: number;
  subscription: SubscriptionEmbedded | null;
  history: string[];
}

export interface Subscription {
  id: string;
  clientPhone: string;
  type: SubscriptionType;
  startDate: string;
  endDate: string;
  price: number;
  status: SubscriptionStatus;
  monthlyQuota: number;
  usedPerMonth: Record<string, number>;
}

export interface OrderNote {
  text: string;
  author: string;
  at: string;
}

export interface OrderFile {
  name: string;
  blob: Blob;
  uploadedAt: string;
}

export interface OrderDetailsEnsayo {
  tema: string;
  paginas: "1-3" | "4-7" | "8+";
  normas: "ninguna" | "APA" | "ISO" | "otra";
  tieneGuia: boolean;
  instruccionesEspeciales?: string;
}

export interface OrderDetailsPresentacion {
  tema: string;
  diapositivas: "hasta-10" | "11-20" | "mas-20";
  estilo: "minimalista" | "colorido" | "formal" | "no-importa";
  colores?: string;
  incluyeImagenes: "si-busca" | "si-proporciona" | "no";
  tieneGuia: boolean;
  instruccionesEspeciales?: string;
}

export interface OrderDetailsInvestigacion {
  tema: string;
  profundidad: "basica" | "media" | "avanzada";
  fuentesMinimas: "no-importa" | "3-5" | "6-10" | "mas-10";
  formatoEntrega: "resumen" | "fichas" | "estado-del-arte";
  tieneGuia: boolean;
}

export interface OrderDetailsFormato {
  tipoDocumento: "word" | "pdf" | "powerpoint";
  norma: "APA" | "ISO" | "otra";
  necesitaIndice: boolean;
  necesitaPortada: boolean;
  notasAdicionales?: string;
}

export interface OrderDetailsDiseno {
  tipoDiseno: "flayer" | "infografia" | "portada" | "otro";
  proposito: string;
  colores?: string;
  textoIncluir: string;
  tieneImagenes: boolean;
  instruccionesEspeciales?: string;
}

export interface OrderDetailsVideo {
  tipoVideo: "corto-redes" | "presentacion" | "publicitario" | "educativo";
  duracion: "15-30s" | "1-3min" | "3-5min" | "mas";
  plataforma:
    | "tiktok"
    | "facebook-reels"
    | "facebook-video"
    | "youtube-shorts"
    | "otra";
  tieneMaterial: boolean;
  musicaFondo: "si" | "no" | "no-importa";
  vozEnOff: "voz" | "texto" | "solo-musica";
  tieneGuion: boolean;
  coloresEstilo?: string;
  instruccionesEspeciales?: string;
}

export type OrderDetails =
  | OrderDetailsEnsayo
  | OrderDetailsPresentacion
  | OrderDetailsInvestigacion
  | OrderDetailsFormato
  | OrderDetailsDiseno
  | OrderDetailsVideo;

export interface Order {
  id: string;
  clientPhone: string;
  clientName: string;
  serviceType: ServiceType;
  operatorId: string;
  details: OrderDetails;
  hasMaterial: boolean | null;
  price: number;
  paidAmount: number;
  totalPaid: number;
  paymentRef: string;
  status: OrderStatus;
  createdAt: string;
  dueDate: string | null;
  completedAt: string | null;
  notes: OrderNote[];
  subscriptionId: string | null;
  coverageTipo: CoverageTipo;
  files: OrderFile[];
}

export interface OperatorStats {
  orders: number;
  revenue: number;
}

export interface MonthlyStats {
  id: string;
  month: string;
  totalOrders: number;
  totalRevenue: number;
  byOperator: Record<string, OperatorStats>;
  completedOrders: number;
  pendingOrders: number;
  newClients: number;
  returningClients: number;
}

export interface ActivityLogEntry {
  id: string;
  operatorId: string;
  action: ActionType;
  targetId: string;
  details: string;
  timestamp: string;
}

export interface Config {
  id: string;
  sessionTimeoutHours: number;
  orderCounter: number;
  subscriptionCounter: number;
  notificationEnabled: boolean;
  priceRanges: PriceRanges;
  faqs: FaqItem[];
  pagoMovil: PagoMovilInfo;
  disclaimers: string[];
  createdAt: number;
  updatedAt: number;
}

// Session: estado de acceso del operador en su dispositivo (vive en localStorage).
// No es una entidad persistida en IndexedDB. Ver data-model.md.
export interface Session {
  operatorId: string;
  username: string;
  displayName: string;
  loginAt: number;
  expiresAt: number;
}
