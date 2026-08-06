import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { ActionType } from "@/lib/types";

export interface ActivityLogFilters {
  operatorId?: string;
  action?: ActionType;
  dateFrom?: string;
  dateTo?: string;
}

const PAGE_SIZE = 50;

export function useActivityLog() {
  const [filters, setFilters] = useState<ActivityLogFilters>({});
  const [page, setPage] = useState(1);
  const [allEntries, setAllEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    let query = supabase.from("activity_log").select("*");

    if (filters.operatorId) {
      query = query.eq("operator_id", filters.operatorId);
    }
    if (filters.action) {
      query = query.eq("action", filters.action);
    }
    if (filters.dateFrom) {
      query = query.gte("timestamp", filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte("timestamp", filters.dateTo);
    }

    query
      .order("timestamp", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("Error useActivityLog:", error);
          setAllEntries([]);
        } else {
          const mapped = (data || []).map((e: any) => ({
            id: e.id,
            operatorId: e.operator_id,
            action: e.action,
            targetType: e.target_type,
            targetId: e.target_id,
            details: e.details,
            timestamp: e.timestamp,
          }));
          setAllEntries(mapped);
        }
        setLoading(false);
      });
  }, [filters.operatorId, filters.action, filters.dateFrom, filters.dateTo]);

  const total = allEntries.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paginatedEntries = allEntries.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const updateFilters = useCallback((newFilters: ActivityLogFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  return {
    entries: paginatedEntries,
    allEntries,
    total,
    totalPages,
    page,
    setPage,
    filters,
    updateFilters,
    resetFilters,
    loading,
  };
}
