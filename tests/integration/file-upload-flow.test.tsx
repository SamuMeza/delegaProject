import { describe, it, expect, beforeEach, mock } from "bun:test";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Mock de lucide-react
mock.module("lucide-react", () => ({
  Upload: (props: any) => <div data-testid="upload-icon" {...props} />,
  X: (props: any) => <div data-testid="x-icon" {...props} />,
  FileText: (props: any) => <div data-testid="file-text-icon" {...props} />,
}));

// Importar después del mock
const { FileUpload } = await import("@/components/landing/FileUpload");

describe("FileUpload Component", () => {
  const mockOnChange = mock(() => {});

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("debería renderizar el componente", () => {
    render(<FileUpload files={[]} onChange={mockOnChange} />);

    expect(screen.getByText("Arrastra archivos o haz clic para seleccionar")).toBeTruthy();
    expect(screen.getByText(/Máximo 10MB por archivo/)).toBeTruthy();
  });

  it("debería mostrar el input file oculto", () => {
    render(<FileUpload files={[]} onChange={mockOnChange} />);

    const input = document.querySelector('input[type="file"]');
    expect(input).toBeTruthy();
    expect(input?.getAttribute("accept")).toBe(".pdf,.docx,.doc");
    expect(input?.getAttribute("multiple")).toBe("");
  });

  it("debería mostrar la lista de archivos cuando hay archivos", () => {
    const files = [
      new File(["test1"], "doc1.pdf", { type: "application/pdf" }),
      new File(["test2"], "doc2.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }),
    ];

    render(<FileUpload files={files} onChange={mockOnChange} />);

    expect(screen.getByText("doc1.pdf")).toBeTruthy();
    expect(screen.getByText("doc2.docx")).toBeTruthy();
  });

  it("debería mostrar botón de eliminar para cada archivo", () => {
    const files = [
      new File(["test"], "doc.pdf", { type: "application/pdf" }),
    ];

    render(<FileUpload files={files} onChange={mockOnChange} />);

    const deleteButton = screen.getByLabelText("Eliminar doc.pdf");
    expect(deleteButton).toBeTruthy();
  });

  it("debería llamar a onChange con el archivo eliminado", () => {
    const files = [
      new File(["test1"], "doc1.pdf", { type: "application/pdf" }),
      new File(["test2"], "doc2.pdf", { type: "application/pdf" }),
    ];

    render(<FileUpload files={files} onChange={mockOnChange} />);

    const deleteButton = screen.getByLabelText("Eliminar doc1.pdf");
    fireEvent.click(deleteButton);

    expect(mockOnChange).toHaveBeenCalledWith([files[1]]);
  });

  it("debería mostrar error cuando se proporciona", () => {
    render(<FileUpload files={[]} onChange={mockOnChange} error="Error de upload" />);

    expect(screen.getByText("Error de upload")).toBeTruthy();
  });

  it("debería aceptar archivos PDF y DOCX", () => {
    render(<FileUpload files={[]} onChange={mockOnChange} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.accept).toContain(".pdf");
    expect(input.accept).toContain(".docx");
  });
});
