import { useState, useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/delegaDb";
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

  const entries = useLiveQuery(async () => {
    let results = await db.activity_log.toArray();

    if (filters.operatorId) {
      results = results.filter((e) => e.operatorId === filters.operatorId);
    }
    if (filters.action) {
      results = results.filter((e) => e.action === filters.action);
    }
    if (filters.dateFrom) {
      results = results.filter((e) => e.timestamp >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      results = results.filter((e) => e.timestamp <= filters.dateTo!);
    }

    return results.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [filters.operatorId, filters.action, filters.dateFrom, filters.dateTo]);

  const total = entries?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paginatedEntries = entries?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) ?? [];

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
    allEntries: entries,
    total,
    totalPages,
    page,
    setPage,
    filters,
    updateFilters,
    resetFilters,
    loading: entries === undefined,
  };
}
