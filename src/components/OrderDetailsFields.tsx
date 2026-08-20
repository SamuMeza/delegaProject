import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type {
  OrderDetails,
  OrderDetailsTrabajosEscritos,
  OrderDetailsPresentacion,
  OrderDetailsDiseno,
  OrderDetailsVideo,
  ServiceType,
} from "@/lib/types";

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
    case "trabajos_escritos": {
      const v = value as OrderDetailsTrabajosEscritos;
      return (
        <div className="space-y-3">
          <div>
            <Label htmlFor="d-subtipo">Tipo de trabajo</Label>
            <Select value={v.subtipo ?? "ensayo"} onValueChange={(val) => set({ subtipo: val })}>
              <SelectTrigger id="d-subtipo" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ensayo">Ensayo</SelectItem>
                <SelectItem value="tesis">Tesis / Trabajo de grado</SelectItem>
                <SelectItem value="monografia">Monografía</SelectItem>
                <SelectItem value="informe">Informe</SelectItem>
                <SelectItem value="articulo">Artículo</SelectItem>
                <SelectItem value="formato">Formato / Normas APA</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="d-tema">Tema</Label>
            <Input id="d-tema" value={v.tema ?? ""} onChange={(e) => set({ tema: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="d-pag">Páginas</Label>
            <Select value={v.paginas ?? "1-3"} onValueChange={(val) => set({ paginas: val })}>
              <SelectTrigger id="d-pag" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-3">1–3 páginas</SelectItem>
                <SelectItem value="4-7">4–7 páginas</SelectItem>
                <SelectItem value="8+">8+ páginas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="d-guia">¿Tiene guía/instrucciones?</Label>
            <Select value={v.tieneGuia ? "true" : "false"} onValueChange={(val) => set({ tieneGuia: val === "true" })}>
              <SelectTrigger id="d-guia" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sí</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
            <Select value={v.diapositivas ?? "hasta-10"} onValueChange={(val) => set({ diapositivas: val })}>
              <SelectTrigger id="d-diap" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hasta-10">Hasta 10</SelectItem>
                <SelectItem value="11-20">11-20</SelectItem>
                <SelectItem value="mas-20">Más de 20</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="d-est">Estilo</Label>
            <Select value={v.estilo ?? "no-importa"} onValueChange={(val) => set({ estilo: val })}>
              <SelectTrigger id="d-est" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minimalista">Minimalista</SelectItem>
                <SelectItem value="colorido">Colorido</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="no-importa">No importa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="d-col">Colores</Label>
            <Input id="d-col" value={v.colores ?? ""} onChange={(e) => set({ colores: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="d-img">Incluye imágenes</Label>
            <Select value={v.incluyeImagenes ?? "no"} onValueChange={(val) => set({ incluyeImagenes: val })}>
              <SelectTrigger id="d-img" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="si-busca">Sí, Delega busca</SelectItem>
                <SelectItem value="si-proporciona">Sí, cliente proporciona</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
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
    case "diseno": {
      const v = value as OrderDetailsDiseno;
      return (
        <div className="space-y-3">
          <div>
            <Label htmlFor="d-td2">Tipo de diseño</Label>
            <Select value={v.tipoDiseno ?? "flayer"} onValueChange={(val) => set({ tipoDiseno: val })}>
              <SelectTrigger id="d-td2" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flayer">Flayer</SelectItem>
                <SelectItem value="infografia">Infografía</SelectItem>
                <SelectItem value="portada">Portada</SelectItem>
                <SelectItem value="flyers_animados">Flyers animados</SelectItem>
                <SelectItem value="paquete_fotos">Paquete de fotos</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
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
            <Select value={v.tipoVideo ?? "corto-redes"} onValueChange={(val) => set({ tipoVideo: val })}>
              <SelectTrigger id="d-tv" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="corto-redes">Corto para redes</SelectItem>
                <SelectItem value="presentacion">Presentación</SelectItem>
                <SelectItem value="publicitario">Publicitario</SelectItem>
                <SelectItem value="educativo">Educativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="d-dur">Duración</Label>
            <Select value={v.duracion ?? "15-30s"} onValueChange={(val) => set({ duracion: val })}>
              <SelectTrigger id="d-dur" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15-30s">15-30s</SelectItem>
                <SelectItem value="1-3min">1-3 min</SelectItem>
                <SelectItem value="3-5min">3-5 min</SelectItem>
                <SelectItem value="mas">Más</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="d-plat">Plataforma</Label>
            <Select value={v.plataforma ?? "tiktok"} onValueChange={(val) => set({ plataforma: val })}>
              <SelectTrigger id="d-plat" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="facebook-reels">Facebook Reels</SelectItem>
                <SelectItem value="facebook-video">Facebook Video</SelectItem>
                <SelectItem value="youtube-shorts">YouTube Shorts</SelectItem>
                <SelectItem value="otra">Otra</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Check label="Tiene material" checked={v.tieneMaterial ?? false} onChange={(b) => set({ tieneMaterial: b })} />
          <div>
            <Label htmlFor="d-mus">Música de fondo</Label>
            <Select value={v.musicaFondo ?? "no-importa"} onValueChange={(val) => set({ musicaFondo: val })}>
              <SelectTrigger id="d-mus" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="si">Sí</SelectItem>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="no-importa">No importa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="d-voz">Voz en off</Label>
            <Select value={v.vozEnOff ?? "texto"} onValueChange={(val) => set({ vozEnOff: val })}>
              <SelectTrigger id="d-voz" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="voz">Voz</SelectItem>
                <SelectItem value="texto">Texto</SelectItem>
                <SelectItem value="solo-musica">Solo música</SelectItem>
              </SelectContent>
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
