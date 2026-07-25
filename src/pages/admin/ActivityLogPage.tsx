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
    <main className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Log de actividad</h1>
        <p className="mt-1 text-sm text-muted-foreground">
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
            <div key={i} className="p-4 border rounded-lg space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-48" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">No hay actividad registrada</p>
          <p className="text-sm mt-1">
            Las acciones realizadas en el panel aparecerán aquí.
          </p>
        </div>
      ) : (
        <>
          <div className="border rounded-lg divide-y">
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
    </main>
  );
}
