import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ServiceSelector } from "@/components/landing/ServiceSelector";
import { DynamicFields } from "@/components/landing/DynamicFields";
import { PriceEstimator } from "@/components/landing/PriceEstimator";
import { WhatsAppGenerator, type WhatsAppMessageData } from "@/components/landing/WhatsAppGenerator";
import { FileUpload } from "@/components/landing/FileUpload";
import { getServiceConfig, type ServiceTypeConfig } from "@/lib/config/serviceTypes";
import { generateTrackingUrl } from "@/lib/tracking";
import { estimatePrice } from "@/lib/pricing";
import { uploadOrderFiles } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { X, Check, ChevronLeft, ChevronRight, Send, Pencil, Loader2 } from "lucide-react";
import type { ServiceType } from "@/lib/types";

const STEPS = [
  { num: 1, label: "Servicio" },
  { num: 2, label: "Detalles" },
  { num: 3, label: "Contacto" },
  { num: 4, label: "Resumen" },
];

interface FormState {
  clientName: string;
  clientContact: string;
  description: string;
  fieldValues: Record<string, string>;
  files: File[];
}

const initialState: FormState = {
  clientName: "",
  clientContact: "",
  description: "",
  fieldValues: {},
  files: [],
};

function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-md mx-auto mb-12">
      {STEPS.map((step, i) => {
        const done = currentStep > step.num;
        const active = currentStep === step.num;
        return (
          <div key={step.num} className="flex items-center flex-1 last:flex-initial">
            {/* Connector line */}
            {i > 0 && (
              <div className={cn(
                "h-0.5 flex-1 mx-2 transition-all duration-300",
                done ? "bg-secondary" : "bg-border-subtle",
              )} />
            )}
            {/* Circle */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                  done
                    ? "bg-secondary text-on-secondary"
                    : active
                      ? "bg-secondary text-on-secondary"
                      : "bg-surface-container-lowest border-2 border-border-subtle text-on-surface-variant",
                )}
              >
                {done ? <Check className="w-4 h-4" /> : step.num}
              </div>
              <span
                className={cn(
                  "text-xs font-semibold uppercase tracking-wider",
                  active ? "text-secondary" : done ? "text-primary" : "text-on-surface-variant",
                )}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Step1({
  selected,
  onSelect,
}: {
  selected: ServiceType | null;
  onSelect: (s: ServiceTypeConfig) => void;
}) {
  return (
    <div>
      <h2 className="mb-2 font-display text-headline-md text-primary">
        ¿Qué necesitas?
      </h2>
      <p className="mb-8 text-on-surface-variant">
        Selecciona el tipo de servicio académico que deseas delegar.
      </p>
      <ServiceSelector selected={selected} onSelect={onSelect} />
    </div>
  );
}

function Step2({
  form,
  setForm,
  errors,
  setErrors,
  serviceType,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  serviceType: ServiceType;
}) {
  function handleFieldChange(name: string, value: string) {
    setForm((prev) => ({ ...prev, fieldValues: { ...prev.fieldValues, [name]: value } }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  return (
    <div>
      <h2 className="mb-2 font-display text-headline-md text-primary">
        Proporciona los detalles
      </h2>
      <p className="mb-8 text-on-surface-variant">
        Mientras más específico seas, mejor será el resultado.
      </p>

      <div className="space-y-6">
        {/* Dynamic fields based on service */}
        <DynamicFields
          serviceType={serviceType}
          values={form.fieldValues}
          errors={errors}
          onChange={handleFieldChange}
        />

        {/* Additional Instructions */}
        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-semibold text-on-surface uppercase tracking-wider">
            Instrucciones adicionales (Opcional)
          </label>
          <textarea
            id="description"
            value={form.description}
            onChange={(e) => {
              setForm((p) => ({ ...p, description: e.target.value }));
              setErrors((p) => ({ ...p, description: "" }));
            }}
            className="w-full rounded-lg border border-border-subtle bg-surface-studio px-4 py-3 text-sm shadow-xs focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2 resize-none"
            rows={4}
            placeholder="Incluye reglas de formato específicas, estilos de citación o materiales de referencia..."
          />
        </div>

        {/* Upload zone */}
        <FileUpload
          files={form.files}
          onChange={(files) => setForm((p) => ({ ...p, files }))}
        />
      </div>
    </div>
  );
}

function Step3({
  form,
  setForm,
  errors,
  setErrors,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
  return (
    <div className="max-w-md mx-auto">
      <h2 className="mb-2 font-display text-headline-md text-primary">
        ¿Cómo podemos contactarte?
      </h2>
      <p className="mb-8 text-on-surface-variant">
        Usamos WhatsApp para enviar actualizaciones y materiales finales directamente a ti.
      </p>

      <div className="space-y-6">
        <div>
          <label htmlFor="clientName" className="mb-1 block text-sm font-semibold text-on-surface uppercase tracking-wider">
            Nombre completo <span className="text-error">*</span>
          </label>
          <input
            id="clientName"
            value={form.clientName}
            onChange={(e) => {
              setForm((p) => ({ ...p, clientName: e.target.value }));
              setErrors((p) => ({ ...p, clientName: "" }));
            }}
            className="h-12 w-full rounded-lg border border-border-subtle bg-surface-studio px-4 text-sm shadow-xs focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2"
            placeholder="Ej: María Pérez"
          />
          {errors.clientName && <p className="mt-1 text-xs text-error">{errors.clientName}</p>}
        </div>

        <div>
          <label htmlFor="clientContact" className="mb-1 block text-sm font-semibold text-on-surface uppercase tracking-wider">
            Número de WhatsApp <span className="text-error">*</span>
          </label>
          <div className="flex">
            <span className="flex items-center px-4 rounded-l-lg border border-r-0 border-border-subtle bg-surface-container text-sm text-on-surface-variant">
              +
            </span>
            <input
              id="clientContact"
              value={form.clientContact}
              onChange={(e) => {
                setForm((p) => ({ ...p, clientContact: e.target.value }));
                setErrors((p) => ({ ...p, clientContact: "" }));
              }}
              className="h-12 flex-1 rounded-r-lg border border-border-subtle bg-surface-studio px-4 text-sm shadow-xs focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2"
                  placeholder="584167050424"
            />
          </div>
          {errors.clientContact && <p className="mt-1 text-xs text-error">{errors.clientContact}</p>}
          <p className="mt-1 text-xs text-on-surface-variant text-right">
            Incluye el código de país.
          </p>
        </div>
      </div>
    </div>
  );
}

function Step4({
  form,
  serviceType,
  estimatedPrice,
  onEdit,
}: {
  form: FormState;
  serviceType: ServiceType;
  estimatedPrice: number;
  onEdit: (step: number) => void;
}) {
  const config = getServiceConfig(serviceType);
  return (
    <div className="max-w-lg mx-auto text-center">
      {/* Success icon */}
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container">
        <Check className="w-8 h-8 text-secondary" />
      </div>

      <h2 className="mb-2 font-display text-headline-md text-primary">
        Revisa tu solicitud
      </h2>
      <p className="mb-8 text-on-surface-variant">
        Confirma los datos antes de enviar.
      </p>

      {/* Summary card */}
      <div className="bg-surface-studio rounded-lg p-6 border border-border-subtle text-left mb-8">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
          <div>
            <dt className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Tipo de servicio</dt>
            <dd className="mt-1 text-sm font-semibold text-primary capitalize">{config?.label ?? serviceType}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Precio estimado</dt>
            <dd className="mt-1 text-sm font-semibold text-secondary">~${estimatedPrice.toFixed(2)}</dd>
          </div>
          {form.fieldValues.topic && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Tema</dt>
              <dd className="mt-1 text-sm text-primary">{form.fieldValues.topic}</dd>
            </div>
          )}
          {form.fieldValues.slideCount && (
            <div>
              <dt className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Diapositivas</dt>
              <dd className="mt-1 text-sm text-primary">{form.fieldValues.slideCount}</dd>
            </div>
          )}
          {form.fieldValues.wordCount && (
            <div>
              <dt className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Palabras</dt>
              <dd className="mt-1 text-sm text-primary">{form.fieldValues.wordCount}</dd>
            </div>
          )}
          {form.description && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Descripción</dt>
              <dd className="mt-1 text-sm text-primary">{form.description}</dd>
            </div>
          )}
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Contacto</dt>
            <dd className="mt-1 text-sm text-primary">{form.clientName} (+{form.clientContact})</dd>
          </div>
        </dl>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          type="button"
          onClick={() => onEdit(2)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-border-subtle bg-transparent px-6 py-3 text-sm font-semibold text-primary hover:border-outline transition-colors"
        >
          <Pencil className="w-4 h-4" />
          Editar detalles
        </button>
      </div>
    </div>
  );
}

export function DelegatePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [trackingToken, setTrackingToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  const estimatedPrice = useMemo(
    () => (selectedService ? estimatePrice(selectedService, form.fieldValues) : 0),
    [selectedService, form.fieldValues],
  );

  function handleSelect(config: ServiceTypeConfig) {
    setSelectedService(config.id);
    setForm(initialState);
    setErrors({});
  }

  function validateCurrentStep(): boolean {
    if (step === 1) {
      return !!selectedService;
    }
    if (step === 2) {
      if (!selectedService) return false;
      const config = getServiceConfig(selectedService);
      if (config) {
        for (const field of config.fields) {
          if (field.required && !form.fieldValues[field.name]?.trim()) {
            setErrors((p) => ({ ...p, [field.name]: "Este campo es obligatorio" }));
            return false;
          }
        }
      }
      return true;
    }
    if (step === 3) {
      const newErrors: Record<string, string> = {};
      if (!form.clientName.trim()) newErrors.clientName = "Ingresa tu nombre";
      if (!form.clientContact.trim()) newErrors.clientContact = "Ingresa un contacto";
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }
    return true;
  }

  function nextStep() {
    if (!validateCurrentStep()) return;
    setErrors({});
    setStep((s) => Math.min(s + 1, 4));
  }

  function prevStep() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleSubmit() {
    if (!selectedService) return;
    setIsSubmitting(true);
    setUploadErrors([]);

    // Generar token de seguimiento
    const orderId = `ORD-${Date.now()}`;
    const token = await generateTrackingUrl({
      id: orderId,
      clientName: form.clientName,
      serviceType: selectedService,
      status: "nueva",
      description: form.description,
      price: estimatedPrice,
      dueDate: "",
      paymentStatus: "unpaid",
    });

    // Subir archivos si hay
    if (form.files.length > 0) {
      const { urls, errors } = await uploadOrderFiles(orderId, form.files);
      setFileUrls(urls);
      if (errors.length > 0) {
        setUploadErrors(errors);
      }
    }

    setTrackingToken(token);
    setSubmitted(true);
    setIsSubmitting(false);
  }

  function goToStep(targetStep: number) {
    setErrors({});
    setStep(targetStep);
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
      files: fileUrls.length > 0 ? fileUrls : undefined,
    };

    return (
      <div className="min-h-screen flex flex-col bg-surface-studio">
        {/* Header */}
        <header className="fixed top-0 w-full z-50 bg-surface-studio shadow-sm h-16">
        <nav className="flex justify-between items-center h-16 w-full px-4 md:px-16">
            <Link to="/" className="font-display text-headline-md font-bold text-primary">
              Delega
            </Link>
          </nav>
        </header>

        <main className="flex-1 pt-16">
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
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-studio">
      {/* Transactional Header */}
      <header className="fixed top-0 w-full z-50 bg-surface-studio shadow-sm h-16">
        <nav className="flex justify-between items-center h-16 w-full max-w-[1280px] mx-auto px-4 md:px-16">
          <Link to="/" className="font-display text-headline-md font-bold text-primary">
            Delega
          </Link>
          <button
            onClick={() => navigate("/servicios")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
        </nav>
      </header>

      <main className="flex-1 pt-16">
        <div className="w-full max-w-[1280px] mx-auto px-4 md:px-16 py-12">
          <div className="mx-auto max-w-3xl">
            {/* Progress bar */}
            <ProgressBar currentStep={step} />

            {/* Step content */}
            <div className="bg-surface-container-lowest rounded-xl shadow-ambient p-6 md:p-8 flex-grow">
              {step === 1 && (
                <Step1 selected={selectedService} onSelect={handleSelect} />
              )}
              {step === 2 && selectedService && (
                <Step2
                  form={form}
                  setForm={setForm}
                  errors={errors}
                  setErrors={setErrors}
                  serviceType={selectedService}
                />
              )}
              {step === 3 && (
                <Step3
                  form={form}
                  setForm={setForm}
                  errors={errors}
                  setErrors={setErrors}
                />
              )}
              {step === 4 && selectedService && (
                <Step4
                  form={form}
                  serviceType={selectedService}
                  estimatedPrice={estimatedPrice}
                  onEdit={goToStep}
                />
              )}

              {/* Navigation buttons */}
              {step < 4 && (
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-border-subtle">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="inline-flex items-center gap-2 rounded-lg border-2 border-border-subtle bg-transparent px-6 py-3 text-sm font-semibold text-primary hover:border-outline transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Atrás
                    </button>
                  ) : (
                    <div />
                  )}
                  {step === 3 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (validateCurrentStep()) {
                          setStep(4);
                        }
                      }}
                      className="inline-flex items-center gap-2 rounded-lg bg-secondary px-6 py-3 text-sm font-semibold text-on-secondary transition-all hover:bg-secondary/90 shadow-ambient hover:shadow-ambient-hover"
                    >
                      Revisar solicitud
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={step === 1 && !selectedService}
                      className="inline-flex items-center gap-2 rounded-lg bg-secondary px-6 py-3 text-sm font-semibold text-on-secondary transition-all hover:bg-secondary/90 shadow-ambient hover:shadow-ambient-hover disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {/* Step 4: Send to WhatsApp */}
              {step === 4 && (
                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 pt-6 border-t border-border-subtle">
                  {uploadErrors.length > 0 && (
                    <div className="w-full mb-4 p-3 rounded-lg bg-error/10 border border-error/20">
                      <p className="text-sm font-semibold text-error mb-1">Error al subir archivos:</p>
                      <ul className="text-xs text-on-surface-variant list-disc list-inside">
                        {uploadErrors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-[#1DA851] shadow-ambient hover:shadow-ambient-hover disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Subiendo archivos...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Enviar por WhatsApp
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
