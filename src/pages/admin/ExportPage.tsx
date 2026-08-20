import { useExport } from "@/hooks/useExport";
import { ExportButton } from "@/components/ExportButton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Database, FileJson, Shield } from "lucide-react";

export function ExportPage() {
  const { loading, error, success, exportData } = useExport();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-headline-md text-primary mb-2">Exportar datos</h2>
        <p className="text-sm text-on-surface-variant">
          Descarga un respaldo de todos los datos del sistema.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <CardHeader className="pb-3 px-0">
            <CardTitle className="text-base flex items-center gap-2 text-primary">
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
                <Database className="h-4 w-4 text-primary" />
              </div>
              Datos incluidos
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-on-surface-variant px-0">
            Órdenes, clientes, suscripciones, configuración, operadores y log de actividad.
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="pb-3 px-0">
            <CardTitle className="text-base flex items-center gap-2 text-primary">
              <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center">
                <FileJson className="h-4 w-4 text-on-secondary-container" />
              </div>
              Formato
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-on-surface-variant px-0">
            Archivo JSON con todos los registros organizados por tabla.
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="pb-3 px-0">
            <CardTitle className="text-base flex items-center gap-2 text-primary">
              <div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center">
                <Shield className="h-4 w-4 text-on-tertiary-fixed-variant" />
              </div>
              Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-on-surface-variant px-0">
            Los datos se procesan localmente. No se envían a ningún servidor.
          </CardContent>
        </Card>
      </div>

      <Card className="p-6">
        <CardHeader className="px-0">
          <CardTitle className="text-headline-sm text-primary font-display">Exportar backup</CardTitle>
          <CardDescription className="text-on-surface-variant">
            Se descargará un archivo JSON con todos los datos de IndexedDB.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <ExportButton
            loading={loading}
            success={success}
            error={error}
            onClick={exportData}
          />
        </CardContent>
      </Card>
    </div>
  );
}
