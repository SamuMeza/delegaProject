import { getServiceConfig, type ServiceTypeConfig } from "@/lib/config/serviceTypes";
import type { ServiceType } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DynamicFields({
  serviceType,
  values,
  errors,
  onChange,
}: {
  serviceType: ServiceType;
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
}) {
  const config = getServiceConfig(serviceType);
  if (!config) return null;

  return (
    <div className="space-y-4">
      {config.fields.map((field) => {
        const hasError = !!errors[field.name];
        return (
          <div key={field.name}>
            <Label htmlFor={field.name} className="text-sm font-semibold text-on-surface uppercase tracking-wider">
              {field.label}
              {field.required && <span className="ml-1 text-error">*</span>}
            </Label>
            {field.type === "select" && field.options ? (
              <select
                id={field.name}
                value={values[field.name] ?? ""}
                onChange={(e) => onChange(field.name, e.target.value)}
                className="h-10 w-full rounded-lg border border-border-subtle bg-surface-studio px-3 py-1 text-sm shadow-xs focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2"
              >
                <option value="">Seleccione...</option>
                {field.options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                id={field.name}
                value={values[field.name] ?? ""}
                onChange={(e) => onChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className="mt-1 w-full rounded-lg border border-border-subtle bg-surface-studio px-3 py-2 text-sm shadow-xs focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2"
                rows={3}
              />
            ) : (
              <Input
                id={field.name}
                type={field.type}
                value={values[field.name] ?? ""}
                onChange={(e) => onChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className="mt-1"
              />
            )}
            {hasError && (
              <p className="mt-1 text-xs text-error">{errors[field.name]}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}