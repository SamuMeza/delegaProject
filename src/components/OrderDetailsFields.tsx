import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import type {
  OrderDetails,
  OrderDetailsDiseno,
  OrderDetailsEnsayo,
  OrderDetailsFormato,
  OrderDetailsInvestigacion,
  OrderDetailsPresentacion,
  OrderDetailsVideo,
  ServiceType,
} from "@/lib/types";

// Formulario de detalles por tipo de servicio (manual §2.2.4 / §6.1).
// Componente controlado: produce un OrderDetails tipado según serviceType.

interface Props {
  serviceType: ServiceType;
  value: OrderDetails;
  onChange: (value: OrderDetails) => void;
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

export function OrderDetailsFields({ serviceType, value, onChange }: Props) {
  const set = (patch: Record<string, unknown>) =>
    onChange({ ...value, ...patch } as OrderDetails);

  switch (serviceType) {
    case "ensayo": {
      const v = value as OrderDetailsEnsayo;
      return (
        <div className="space-y-3">
          <div>
            <Label htmlFor="d-tema">Tema</Label>
            <Input id="d-tema" value={v.tema ?? ""} onChange={(e) => set({ tema: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="d-pag">Páginas</Label>
            <Select id="d-pag" value={v.paginas ?? "1-3"} onValueChange={(val) => set({ paginas: val })}>
              <option value="1-3">1-3</option>
              <option value="4-7">4-7</option>
              <option value="8+">8+</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="d-norm">Normas</Label>
            <Select id="d-norm" value={v.normas ?? "ninguna"} onValueChange={(val) => set({ normas: val })}>
              <option value="ninguna">Ninguna</option>
              <option value="APA">APA</option>
              <option value="ISO">ISO</option>
              <option value="otra">Otra</option>
            </Select>
          </div>
          <Check label="Tiene guía" checked={v.tieneGuia ?? false} onChange={(b) => set({ tieneGuia: b })} />
          <div>
            <Label htmlFor="d-inst">Instrucciones especiales</Label>
            <Textarea id="d-inst" value={v.instruccionesEspeciales ?? ""} onChange={(e) => set({ instruccionesEspeciales: e.target.value })} />
          </div>
        </div>
      );
    }
    case "presentacion": {
      const v = value as OrderDetailsPresentacion;
      return (
        <div className="space-y-3">
          <div>
            <Label htmlFor="d-tema">Tema</Label>
            <Input id="d-tema" value={v.tema ?? ""} onChange={(e) => set({ tema: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="d-diap">Diapositivas</Label>
            <Select id="d-diap" value={v.diapositivas ?? "hasta-10"} onValueChange={(val) => set({ diapositivas: val })}>
              <option value="hasta-10">Hasta 10</option>
              <option value="11-20">11-20</option>
              <option value="mas-20">Más de 20</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="d-est">Estilo</Label>
            <Select id="d-est" value={v.estilo ?? "no-importa"} onValueChange={(val) => set({ estilo: val })}>
              <option value="minimalista">Minimalista</option>
              <option value="colorido">Colorido</option>
              <option value="formal">Formal</option>
              <option value="no-importa">No importa</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="d-col">Colores</Label>
            <Input id="d-col" value={v.colores ?? ""} onChange={(e) => set({ colores: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="d-img">Incluye imágenes</Label>
            <Select id="d-img" value={v.incluyeImagenes ?? "no"} onValueChange={(val) => set({ incluyeImagenes: val })}>
              <option value="si-busca">Sí, Delega busca</option>
              <option value="si-proporciona">Sí, cliente proporciona</option>
              <option value="no">No</option>
            </Select>
          </div>
          <Check label="Tiene guía" checked={v.tieneGuia ?? false} onChange={(b) => set({ tieneGuia: b })} />
          <div>
            <Label htmlFor="d-inst">Instrucciones especiales</Label>
            <Textarea id="d-inst" value={v.instruccionesEspeciales ?? ""} onChange={(e) => set({ instruccionesEspeciales: e.target.value })} />
          </div>
        </div>
      );
    }
    case "investigacion": {
      const v = value as OrderDetailsInvestigacion;
      return (
        <div className="space-y-3">
          <div>
            <Label htmlFor="d-tema">Tema</Label>
            <Input id="d-tema" value={v.tema ?? ""} onChange={(e) => set({ tema: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="d-prof">Profundidad</Label>
            <Select id="d-prof" value={v.profundidad ?? "media"} onValueChange={(val) => set({ profundidad: val })}>
              <option value="basica">Básica</option>
              <option value="media">Media</option>
              <option value="avanzada">Avanzada</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="d-fuen">Fuentes mínimas</Label>
            <Select id="d-fuen" value={v.fuentesMinimas ?? "no-importa"} onValueChange={(val) => set({ fuentesMinimas: val })}>
              <option value="no-importa">No importa</option>
              <option value="3-5">3-5</option>
              <option value="6-10">6-10</option>
              <option value="mas-10">Más de 10</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="d-forment">Formato de entrega</Label>
            <Select id="d-forment" value={v.formatoEntrega ?? "resumen"} onValueChange={(val) => set({ formatoEntrega: val })}>
              <option value="resumen">Resumen</option>
              <option value="fichas">Fichas</option>
              <option value="estado-del-arte">Estado del arte</option>
            </Select>
          </div>
          <Check label="Tiene guía" checked={v.tieneGuia ?? false} onChange={(b) => set({ tieneGuia: b })} />
        </div>
      );
    }
    case "formato": {
      const v = value as OrderDetailsFormato;
      return (
        <div className="space-y-3">
          <div>
            <Label htmlFor="d-td">Tipo de documento</Label>
            <Select id="d-td" value={v.tipoDocumento ?? "word"} onValueChange={(val) => set({ tipoDocumento: val })}>
              <option value="word">Word</option>
              <option value="pdf">PDF</option>
              <option value="powerpoint">PowerPoint</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="d-norm">Norma</Label>
            <Select id="d-norm" value={v.norma ?? "APA"} onValueChange={(val) => set({ norma: val })}>
              <option value="APA">APA</option>
              <option value="ISO">ISO</option>
              <option value="otra">Otra</option>
            </Select>
          </div>
          <Check label="Necesita índice" checked={v.necesitaIndice ?? false} onChange={(b) => set({ necesitaIndice: b })} />
          <Check label="Necesita portada" checked={v.necesitaPortada ?? false} onChange={(b) => set({ necesitaPortada: b })} />
          <div>
            <Label htmlFor="d-not">Notas adicionales</Label>
            <Textarea id="d-not" value={v.notasAdicionales ?? ""} onChange={(e) => set({ notasAdicionales: e.target.value })} />
          </div>
        </div>
      );
    }
    case "diseno": {
      const v = value as OrderDetailsDiseno;
      return (
        <div className="space-y-3">
          <div>
            <Label htmlFor="d-td2">Tipo de diseño</Label>
            <Select id="d-td2" value={v.tipoDiseno ?? "flayer"} onValueChange={(val) => set({ tipoDiseno: val })}>
              <option value="flayer">Flayer</option>
              <option value="infografia">Infografía</option>
              <option value="portada">Portada</option>
              <option value="otro">Otro</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="d-prop">Propósito</Label>
            <Input id="d-prop" value={v.proposito ?? ""} onChange={(e) => set({ proposito: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="d-col2">Colores</Label>
            <Input id="d-col2" value={v.colores ?? ""} onChange={(e) => set({ colores: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="d-text">Texto a incluir</Label>
            <Textarea id="d-text" value={v.textoIncluir ?? ""} onChange={(e) => set({ textoIncluir: e.target.value })} />
          </div>
          <Check label="Tiene imágenes" checked={v.tieneImagenes ?? false} onChange={(b) => set({ tieneImagenes: b })} />
          <div>
            <Label htmlFor="d-inst">Instrucciones especiales</Label>
            <Textarea id="d-inst" value={v.instruccionesEspeciales ?? ""} onChange={(e) => set({ instruccionesEspeciales: e.target.value })} />
          </div>
        </div>
      );
    }
    case "video": {
      const v = value as OrderDetailsVideo;
      return (
        <div className="space-y-3">
          <div>
            <Label htmlFor="d-tv">Tipo de video</Label>
            <Select id="d-tv" value={v.tipoVideo ?? "corto-redes"} onValueChange={(val) => set({ tipoVideo: val })}>
              <option value="corto-redes">Corto para redes</option>
              <option value="presentacion">Presentación</option>
              <option value="publicitario">Publicitario</option>
              <option value="educativo">Educativo</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="d-dur">Duración</Label>
            <Select id="d-dur" value={v.duracion ?? "15-30s"} onValueChange={(val) => set({ duracion: val })}>
              <option value="15-30s">15-30s</option>
              <option value="1-3min">1-3 min</option>
              <option value="3-5min">3-5 min</option>
              <option value="mas">Más</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="d-plat">Plataforma</Label>
            <Select id="d-plat" value={v.plataforma ?? "tiktok"} onValueChange={(val) => set({ plataforma: val })}>
              <option value="tiktok">TikTok</option>
              <option value="facebook-reels">Facebook Reels</option>
              <option value="facebook-video">Facebook Video</option>
              <option value="youtube-shorts">YouTube Shorts</option>
              <option value="otra">Otra</option>
            </Select>
          </div>
          <Check label="Tiene material" checked={v.tieneMaterial ?? false} onChange={(b) => set({ tieneMaterial: b })} />
          <div>
            <Label htmlFor="d-mus">Música de fondo</Label>
            <Select id="d-mus" value={v.musicaFondo ?? "no-importa"} onValueChange={(val) => set({ musicaFondo: val })}>
              <option value="si">Sí</option>
              <option value="no">No</option>
              <option value="no-importa">No importa</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="d-voz">Voz en off</Label>
            <Select id="d-voz" value={v.voEnOff ?? "texto"} onValueChange={(val) => set({ voEnOff: val })}>
              <option value="voz">Voz</option>
              <option value="texto">Texto</option>
              <option value="solo-musica">Solo música</option>
            </Select>
          </div>
          <Check label="Tiene guion" checked={v.tieneGuion ?? false} onChange={(b) => set({ tieneGuion: b })} />
          <div>
            <Label htmlFor="d-col3">Colores / estilo</Label>
            <Input id="d-col3" value={v.coloresEstilo ?? ""} onChange={(e) => set({ coloresEstilo: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="d-inst">Instrucciones especiales</Label>
            <Textarea id="d-inst" value={v.instruccionesEspeciales ?? ""} onChange={(e) => set({ instruccionesEspeciales: e.target.value })} />
          </div>
        </div>
      );
    }
  }
}
