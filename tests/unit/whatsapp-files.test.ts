import { describe, it, expect } from "bun:test";

// Interfaz WhatsAppMessageData
interface WhatsAppMessageData {
  token: string;
  clientName: string;
  clientContact: string;
  serviceType: string;
  description: string;
  parameters: string;
  estimatedPrice: number;
  createdAt: string;
  files?: string[]; // URLs de archivos
}

// Función buildMessage (replicada del componente)
function buildMessage(data: WhatsAppMessageData): string {
  const lines = [
    "【Nueva Solicitud de Delega】",
    "",
    `📋 ID de seguimiento: ${data.token}`,
    `👤 Cliente: ${data.clientName}`,
    `📞 Contacto: ${data.clientContact}`,
    `🎓 Servicio: ${data.serviceType}`,
    `📝 Descripción: ${data.description}`,
    `⚙️ Parámetros: ${data.parameters}`,
    `💰 Precio estimado: $${data.estimatedPrice}`,
    `📅 Fecha de solicitud: ${data.createdAt}`,
  ];

  if (data.files && data.files.length > 0) {
    lines.push("", "📎 Archivos adjuntos:");
    data.files.forEach((url, i) => {
      lines.push(`${i + 1}. ${url}`);
    });
  }

  return lines.join("\n");
}

describe("WhatsApp Message Builder", () => {
  const baseData: WhatsAppMessageData = {
    token: "ORD-123",
    clientName: "María Pérez",
    clientContact: "584167050424",
    serviceType: "trabajos_escritos",
    description: "Ensayo sobre ecología",
    parameters: "tema: Ecología, palabras: 1500",
    estimatedPrice: 3.5,
    createdAt: "2026-08-19 10:30",
  };

  it("debería generar mensaje sin archivos", () => {
    const message = buildMessage(baseData);

    expect(message).toContain("【Nueva Solicitud de Delega】");
    expect(message).toContain("📋 ID de seguimiento: ORD-123");
    expect(message).toContain("👤 Cliente: María Pérez");
    expect(message).toContain("📞 Contacto: 584167050424");
    expect(message).toContain("🎓 Servicio: trabajos_escritos");
    expect(message).toContain("📝 Descripción: Ensayo sobre ecología");
    expect(message).toContain("⚙️ Parámetros: tema: Ecología, palabras: 1500");
    expect(message).toContain("💰 Precio estimado: $3.5");
    expect(message).toContain("📅 Fecha de solicitud: 2026-08-19 10:30");
    expect(message).not.toContain("📎 Archivos adjuntos:");
  });

  it("debería incluir archivos cuando se proporcionan URLs", () => {
    const dataWithFiles: WhatsAppMessageData = {
      ...baseData,
      files: [
        "https://example.com/order-files/ORD-123/doc1.pdf",
        "https://example.com/order-files/ORD-123/doc2.pdf",
      ],
    };

    const message = buildMessage(dataWithFiles);

    expect(message).toContain("📎 Archivos adjuntos:");
    expect(message).toContain("1. https://example.com/order-files/ORD-123/doc1.pdf");
    expect(message).toContain("2. https://example.com/order-files/ORD-123/doc2.pdf");
  });

  it("no debería incluir sección de archivos cuando el array está vacío", () => {
    const dataWithEmptyFiles: WhatsAppMessageData = {
      ...baseData,
      files: [],
    };

    const message = buildMessage(dataWithEmptyFiles);

    expect(message).not.toContain("📎 Archivos adjuntos:");
  });

  it("no debería incluir sección de archivos cuando files es undefined", () => {
    const message = buildMessage(baseData);

    expect(message).not.toContain("📎 Archivos adjuntos:");
  });

  it("debería manejar un solo archivo", () => {
    const dataWithOneFile: WhatsAppMessageData = {
      ...baseData,
      files: ["https://example.com/order-files/ORD-123/doc.pdf"],
    };

    const message = buildMessage(dataWithOneFile);

    expect(message).toContain("📎 Archivos adjuntos:");
    expect(message).toContain("1. https://example.com/order-files/ORD-123/doc.pdf");
    expect(message).not.toContain("2.");
  });

  it("debería incluir archivos después de la fecha de solicitud", () => {
    const dataWithFiles: WhatsAppMessageData = {
      ...baseData,
      files: ["https://example.com/file.pdf"],
    };

    const message = buildMessage(dataWithFiles);
    const fechaIndex = message.indexOf("📅 Fecha de solicitud:");
    const archivosIndex = message.indexOf("📎 Archivos adjuntos:");

    expect(fechaIndex).toBeLessThan(archivosIndex);
  });
});
