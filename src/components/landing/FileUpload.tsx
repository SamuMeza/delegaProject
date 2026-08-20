import { useRef, useState } from "react";
import { Upload, X, FileText } from "lucide-react";

const MAX_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 5;
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

interface Props {
  files: File[];
  onChange: (files: File[]) => void;
  error?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({ files, onChange, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function addFiles(newFiles: FileList | File[]) {
    const incoming = Array.from(newFiles);
    const valid: File[] = [];

    for (const f of incoming) {
      if (files.length + valid.length >= MAX_FILES) break;
      if (!ALLOWED_TYPES.includes(f.type)) continue;
      if (f.size > MAX_SIZE) continue;
      if (files.some((existing) => existing.name === f.name && existing.size === f.size)) continue;
      valid.push(f);
    }

    if (valid.length > 0) {
      onChange([...files, ...valid]);
    }
  }

  function removeFile(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.doc"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center gap-2 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-secondary bg-secondary/5"
            : "border-border-subtle bg-surface-studio hover:bg-surface-container"
        }`}
      >
        <Upload className="w-8 h-8 text-on-surface-variant" />
        <p className="text-sm font-semibold text-on-surface">
          Arrastra archivos o haz clic para seleccionar
        </p>
        <p className="text-xs text-on-surface-variant">
          Máximo 10MB por archivo (PDF, DOCX). Máximo 5 archivos.
        </p>
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-studio px-3 py-2"
            >
              <FileText className="w-4 h-4 text-on-surface-variant shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary truncate">{file.name}</p>
                <p className="text-xs text-on-surface-variant">{formatSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors shrink-0"
                aria-label={`Eliminar ${file.name}`}
              >
                <X className="w-4 h-4 text-on-surface-variant" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
