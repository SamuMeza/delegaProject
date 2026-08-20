import { useActivityLog } from "@/hooks/useActivityLog";
import { ActivityLogEntry } from "@/components/ActivityLogEntry";
import { ActivityLogFiltersComponent } from "@/components/ActivityLogFilters";
import { ActivityLogPagination } from "@/components/ActivityLogPagination";
import { Skeleton } from "@/components/ui/skeleton";

export function ActivityLogPage() {
  const {
    entries,
    total,
    totalPages,
    page,
    setPage,
    filters,
    updateFilters,
    resetFilters,
    loading,
  } = useActivityLog();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-headline-md text-primary mb-2">Log de actividad</h2>
        <p className="text-sm text-on-surface-variant">
          Registro cronológico de acciones realizadas en el panel.
        </p>
      </div>

      <ActivityLogFiltersComponent
        filters={filters}
        onFilterChange={updateFilters}
        onReset={resetFilters}
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 bg-surface-container-lowest rounded-xl shadow-ambient space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-48" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 text-on-surface-variant bg-surface-container-lowest rounded-xl shadow-ambient">
          <p className="text-lg font-display">No hay actividad registrada</p>
          <p className="text-sm mt-1">
            Las acciones realizadas en el panel aparecerán aquí.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-surface-container-lowest rounded-xl shadow-ambient overflow-hidden divide-y divide-border-subtle">
            {entries.map((entry) => (
              <ActivityLogEntry key={entry.id} entry={entry} />
            ))}
          </div>
          <ActivityLogPagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
