import { useState, useMemo } from "react";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { ServiceSelector } from "@/components/landing/ServiceSelector";
import { DynamicFields } from "@/components/landing/DynamicFields";
import { PriceEstimator } from "@/components/landing/PriceEstimator";
import { WhatsAppGenerator, type WhatsAppMessageData } from "@/components/landing/WhatsAppGenerator";
import { getServiceConfig, type ServiceTypeConfig } from "@/lib/config/serviceTypes";
import { generateTrackingUrl } from "@/lib/tracking";
import { estimatePrice } from "@/lib/pricing";
import type { ServiceType } from "@/lib/types";

interface FormState {
  clientName: string;
  clientContact: string;
  description: string;
  fieldValues: Record<string, string>;
}

const initialState: FormState = {
  clientName: "",
  clientContact: "",
  description: "",
  fieldValues: {},
};

function validate(serviceType: ServiceType | null, state: FormState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!serviceType) return errors;

  if (!state.clientName.trim()) errors.clientName = "Ingresa tu nombre";
  if (!state.clientContact.trim()) errors.clientContact = "Ingresa un contacto";
  if (!state.description.trim()) errors.description = "Describe el trabajo";

  const config = getServiceConfig(serviceType);
  if (config) {
    for (const field of config.fields) {
      if (field.required && !state.fieldValues[field.name]?.trim()) {
        errors[field.name] = `Este campo es obligatorio`;
      }
    }
  }
  return errors;
}

export function DelegatePage() {
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [trackingToken, setTrackingToken] = useState("");

  const estimatedPrice = useMemo(
    () => (selectedService ? estimatePrice(selectedService, form.fieldValues) : 0),
    [selectedService, form.fieldValues],
  );

  function handleFieldChange(name: string, value: string) {
    setForm((prev) => ({ ...prev, fieldValues: { ...prev.fieldValues, [name]: value } }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function handleSelect(config: ServiceTypeConfig) {
    setSelectedService(config.id);
    setForm(initialState);
    setErrors({});
    setSubmitted(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedService) return;
    const validation = validate(selectedService, form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    const token = await generateTrackingUrl({
      id: `ORD-${Date.now()}`,
      clientName: form.clientName,
      serviceType: selectedService,
      status: "nueva",
      description: form.description,
      price: estimatedPrice,
      dueDate: "",
      paymentStatus: "unpaid",
    });
    setTrackingToken(token);
    setSubmitted(true);
  }

  if (submitted) {
    const now = new Date();
    const waData: WhatsAppMessageData = {
      token: trackingToken,
      clientName: form.clientName,
      clientContact: form.clientContact,
      serviceType: selectedService ?? "",
      description: form.description,
      parameters: Object.entries(form.fieldValues)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", "),
      estimatedPrice,
      createdAt: `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`,
    };

    return (
      <LandingLayout>
        <div className="w-full max-w-[1280px] mx-auto px-4 md:px-16 py-12">
          <div className="mx-auto max-w-lg text-center">
            <h1 className="mb-4 font-display text-headline-md text-primary">
              Solicitud lista
            </h1>
            <p className="mb-8 text-on-surface-variant">
              Tu solicitud está preparada. Envíala por WhatsApp para que nuestros
              operadores la reciban.
            </p>
            <WhatsAppGenerator data={waData} onCopy={() => {}} />
          </div>
        </div>
      </LandingLayout>
    );
  }

  return (
    <LandingLayout>
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-16 py-12">
        <h1 className="mb-2 font-display text-headline-md text-primary">
          Delegar tarea
        </h1>
        <p className="mb-8 text-on-surface-variant">
          Selecciona el tipo de servicio, completa los detalles y envía tu solicitud.
        </p>

        <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-6">
          {/* Service selector */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-on-surface uppercase tracking-wider">
              Tipo de servicio <span className="text-error">*</span>
            </label>
            <ServiceSelector selected={selectedService} onSelect={handleSelect} />
          </div>

          {selectedService && (
            <>
              {/* Client info */}
              <div>
                <label htmlFor="clientName" className="mb-1 block text-sm font-semibold text-on-surface uppercase tracking-wider">
                  Tu nombre <span className="text-error">*</span>
                </label>
                <input
                  id="clientName"
                  value={form.clientName}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, clientName: e.target.value }));
                    setErrors((p) => ({ ...p, clientName: "" }));
                  }}
                  className="h-10 w-full rounded-lg border border-border-subtle bg-surface-studio px-3 py-1 text-sm shadow-xs focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2"
                  placeholder="Ej: María Pérez"
                />
                {errors.clientName && <p className="mt-1 text-xs text-error">{errors.clientName}</p>}
              </div>

              <div>
                <label htmlFor="clientContact" className="mb-1 block text-sm font-semibold text-on-surface uppercase tracking-wider">
                  Contacto (WhatsApp) <span className="text-error">*</span>
                </label>
                <input
                  id="clientContact"
                  value={form.clientContact}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, clientContact: e.target.value }));
                    setErrors((p) => ({ ...p, clientContact: "" }));
                  }}
                  className="h-10 w-full rounded-lg border border-border-subtle bg-surface-studio px-3 py-1 text-sm shadow-xs focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2"
                  placeholder="Ej: 584121234567"
                />
                {errors.clientContact && <p className="mt-1 text-xs text-error">{errors.clientContact}</p>}
              </div>

              {/* Dynamic fields */}
              <DynamicFields
                serviceType={selectedService}
                values={form.fieldValues}
                errors={errors}
                onChange={handleFieldChange}
              />

              {/* Description */}
              <div>
                <label htmlFor="description" className="mb-1 block text-sm font-semibold text-on-surface uppercase tracking-wider">
                  Descripción del trabajo <span className="text-error">*</span>
                </label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, description: e.target.value }));
                    setErrors((p) => ({ ...p, description: "" }));
                  }}
                  className="w-full rounded-lg border border-border-subtle bg-surface-studio px-3 py-2 text-sm shadow-xs focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2"
                  rows={3}
                  placeholder="Describe lo que necesitas..."
                />
                {errors.description && <p className="mt-1 text-xs text-error">{errors.description}</p>}
              </div>

              {/* Price estimator */}
              <PriceEstimator serviceType={selectedService} params={form.fieldValues} />

              {/* Submit */}
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-6 py-3 text-sm font-semibold text-on-secondary transition-all hover:bg-secondary/90 shadow-ambient hover:shadow-ambient-hover"
              >
                Delegar por WhatsApp
              </button>
            </>
          )}
        </form>
      </div>
    </LandingLayout>
  );
}
