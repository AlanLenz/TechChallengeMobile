import type { ReceiptFileInput } from '../entities/transaction.entity';

/** Tipos MIME aceitos como comprovante — imagens comuns de foto + PDF de extrato. */
export const RECEIPT_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const;

/** Extensões correspondentes (fallback quando o picker não informa o MIME type). */
export const RECEIPT_ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'pdf'] as const;

/**
 * Limite de 5 MB. Fotos de comprovante de celular e PDFs de extrato ficam tipicamente entre
 * 100 KB e 3 MB; 5 MB dá folga sem permitir abuso e é o mesmo limite declarado em
 * `storage.rules`.
 */
export const RECEIPT_MAX_SIZE_BYTES = 5 * 1024 * 1024;

const EXTENSION_TO_MIME: Record<string, (typeof RECEIPT_ALLOWED_MIME_TYPES)[number]> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  pdf: 'application/pdf',
};

/** Extensão em minúsculas sem ponto, derivada do nome do arquivo (`''` se não houver). */
export function fileExtension(fileName: string): string {
  const match = /\.([a-z0-9]+)$/i.exec(fileName.trim());
  return match ? match[1].toLowerCase() : '';
}

/** Resolve o MIME type do arquivo: usa o informado pelo picker ou deduz pela extensão. */
export function resolveReceiptMimeType(file: ReceiptFileInput): string | undefined {
  if (file.mimeType) return file.mimeType;
  return EXTENSION_TO_MIME[fileExtension(file.name)];
}

/** `true` se o arquivo é um comprovante aceito (tipo permitido). */
export function isAllowedReceiptType(file: ReceiptFileInput): boolean {
  const mime = resolveReceiptMimeType(file);
  if (mime && (RECEIPT_ALLOWED_MIME_TYPES as readonly string[]).includes(mime)) return true;
  return (RECEIPT_ALLOWED_EXTENSIONS as readonly string[]).includes(fileExtension(file.name));
}

/** Extensão a usar no nome armazenado — a do arquivo, ou deduzida do MIME, ou 'bin'. */
export function storedFileExtension(file: ReceiptFileInput): string {
  const fromName = fileExtension(file.name);
  if (fromName) return fromName;
  const fromMime = Object.entries(EXTENSION_TO_MIME).find(([, mime]) => mime === file.mimeType);
  return fromMime ? fromMime[0] : 'bin';
}
