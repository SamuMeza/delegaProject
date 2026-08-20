import { describe, it, expect, beforeEach, mock } from "bun:test";

// Mock de Supabase client
const mockUpload = mock(() => Promise.resolve({ data: { path: "test/file.pdf" }, error: null }));
const mockGetPublicUrl = mock(() => ({ data: { publicUrl: "https://example.com/file.pdf" } }));
const mockList = mock(() => Promise.resolve({ data: [{ name: "file.pdf", id: "1" }], error: null }));
const mockRemove = mock(() => Promise.resolve({ error: null }));

const mockFrom = mock(() => ({
  upload: mockUpload,
  getPublicUrl: mockGetPublicUrl,
  list: mockList,
  remove: mockRemove,
}));

mock.module("@/lib/supabase", () => ({
  supabase: {
    storage: {
      from: mockFrom,
    },
  },
}));

// Importar después del mock
const { uploadOrderFile, getOrderFileUrl, listOrderFiles, removeOrderFile } = await import("@/lib/storage");

describe("Storage Helper", () => {
  beforeEach(() => {
    mockUpload.mockClear();
    mockGetPublicUrl.mockClear();
    mockList.mockClear();
    mockRemove.mockClear();
    mockFrom.mockClear();
  });

  describe("uploadOrderFile", () => {
    it("debería subir un archivo al bucket correcto", async () => {
      const file = new File(["test"], "test.pdf", { type: "application/pdf" });
      const result = await uploadOrderFile("ORD-123", file);

      expect(mockFrom).toHaveBeenCalledWith("order-files");
      expect(result.path).toBe("test/file.pdf");
    });

    it("debería manejar errores de upload", async () => {
      mockUpload.mockResolvedValueOnce({ data: null, error: { message: "Error de upload" } });

      const file = new File(["test"], "test.pdf", { type: "application/pdf" });
      const result = await uploadOrderFile("ORD-123", file);

      expect(result.error).toBe("Error de upload");
    });
  });

  describe("getOrderFileUrl", () => {
    it("debería retornar la URL pública del archivo", () => {
      const url = getOrderFileUrl("ORD-123", "test.pdf");

      expect(mockFrom).toHaveBeenCalledWith("order-files");
      expect(url).toBe("https://example.com/file.pdf");
    });
  });

  describe("listOrderFiles", () => {
    it("debería listar archivos de una orden", async () => {
      const files = await listOrderFiles("ORD-123");

      expect(mockFrom).toHaveBeenCalledWith("order-files");
      expect(files).toHaveLength(1);
      expect(files[0].name).toBe("file.pdf");
    });

    it("debería manejar errores de listado", async () => {
      mockList.mockResolvedValueOnce({ data: null, error: { message: "Error de listado" } });

      const files = await listOrderFiles("ORD-123");

      expect(files).toHaveLength(0);
    });
  });

  describe("removeOrderFile", () => {
    it("debería eliminar un archivo", async () => {
      const result = await removeOrderFile("ORD-123", "test.pdf");

      expect(mockFrom).toHaveBeenCalledWith("order-files");
      expect(result.success).toBe(true);
    });

    it("debería manejar errores de eliminación", async () => {
      mockRemove.mockResolvedValueOnce({ error: { message: "Error de eliminación" } });

      const result = await removeOrderFile("ORD-123", "test.pdf");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Error de eliminación");
    });
  });
});
