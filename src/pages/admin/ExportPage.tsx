import { useExport } from "@/hooks/useExport";
import { ExportButton } from "@/components/ExportButton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Database, FileJson, Shield } from "lucide-react";

export function ExportPage() {
  const { loading, error, success, exportData } = useExport();

  return (
    <main className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Exportar datos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Descarga un respaldo de todos los datos del sistema.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4" />
              Datos incluidos
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Órdenes, clientes, suscripciones, configuración, operadores y log de actividad.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileJson className="h-4 w-4" />
              Formato
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Archivo JSON con todos los registros organizados por tabla.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Los datos se procesan localmente. No se envían a ningún servidor.
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exportar backup</CardTitle>
          <CardDescription>
            Se descargará un archivo JSON con todos los datos de IndexedDB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExportButton
            loading={loading}
            success={success}
            error={error}
            onClick={exportData}
          />
        </CardContent>
      </Card>
    </main>
  );
}
