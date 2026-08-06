import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

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
        operatorsRes,
        clientsRes,
        subscriptionsRes,
        ordersRes,
        attachmentsRes,
        activityLogRes,
        configRes,
      ] = await Promise.all([
        supabase.from("operators").select("*"),
        supabase.from("clients").select("*"),
        supabase.from("subscriptions").select("*"),
        supabase.from("orders").select("*"),
        supabase.from("order_attachments").select("*"),
        supabase.from("activity_log").select("*"),
        supabase.from("config").select("*"),
      ]);

      const data = {
        operators: operatorsRes.data || [],
        clients: clientsRes.data || [],
        subscriptions: subscriptionsRes.data || [],
        orders: ordersRes.data || [],
        orderAttachments: (attachmentsRes.data || []).map(({ blob: _blob, ...rest }: any) => rest),
        activityLog: activityLogRes.data || [],
        config: configRes.data || [],
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
