import { useState, useCallback } from "react";
import { db } from "@/lib/db/delegaDb";

interface ExportState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

export function useExport() {
  const [state, setState] = useState<ExportState>({
    loading: false,
    error: null,
    success: false,
  });

  const exportData = useCallback(async () => {
    setState({ loading: true, error: null, success: false });

    try {
      const [
        operators,
        clients,
        subscriptions,
        orders,
        attachments,
        activityLog,
        config,
      ] = await Promise.all([
        db.operators.toArray(),
        db.clients.toArray(),
        db.subscriptions.toArray(),
        db.orders.toArray(),
        db.order_attachments.toArray(),
        db.activity_log.toArray(),
        db.config.toArray(),
      ]);

      const attachmentMetadata = attachments.map(({ blob: _blob, ...rest }) => rest);

      const data = {
        operators,
        clients,
        subscriptions,
        orders,
        orderAttachments: attachmentMetadata,
        activityLog,
        config,
        exportedAt: new Date().toISOString(),
      };

      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `delega-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      setState({ loading: false, error: null, success: true });
      setTimeout(() => setState((prev) => ({ ...prev, success: false })), 3000);
    } catch (err) {
      setState({
        loading: false,
        error: err instanceof Error ? err.message : "Error al exportar datos",
        success: false,
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, error: null, success: false });
  }, []);

  return {
    ...state,
    exportData,
    reset,
  };
}
