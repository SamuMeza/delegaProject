import { Button } from "@/components/ui/button";
import { Download, Loader2, Check } from "lucide-react";

interface Props {
  loading: boolean;
  success: boolean;
  error: string | null;
  onClick: () => void;
}

export function ExportButton({ loading, success, error, onClick }: Props) {
  return (
    <div className="space-y-2">
      <Button
        onClick={onClick}
        disabled={loading}
        size="lg"
        className="w-full sm:w-auto"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Exportando...
          </>
        ) : success ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Descargado
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Exportar backup
          </>
        )}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
