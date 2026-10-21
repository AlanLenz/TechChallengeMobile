export type TransactionType = 'Deposit' | 'Transfer';

export function isDepositType(type?: string): boolean {
  return String(type).toLowerCase() === 'deposit';
}

export type CategoryId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const CATEGORIES_MAP: Record<CategoryId, string> = {
  1: 'Alimentação',
  2: 'Transporte',
  3: 'Moradia',
  4: 'Saúde',
  5: 'Educação',
  6: 'Lazer',
  7: 'Outros',
};

/** Recibo/comprovante anexado a uma transação, armazenado no Firebase Storage. */
export type TransactionReceipt = {
  /** Nome original do arquivo escolhido pelo usuário — só metadado, para exibição. */
  name: string;
  /** Download URL público (com token) do Firebase Storage. */
  url: string;
  /** Caminho completo no Storage — usado para reabrir ou apagar o arquivo. */
  path: string;
  /** MIME type do arquivo (ex.: 'application/pdf', 'image/jpeg'). */
  contentType: string;
};

export type Transaction = {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  categories_id?: CategoryId;
  receipt?: TransactionReceipt;
};

/** Arquivo selecionado pelo picker, antes do upload — ainda não enviado ao Storage. */
export type ReceiptFileInput = {
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
};

/** Dados necessários para criar ou editar uma transação (já normalizados, sem máscara de UI). */
export type TransactionInput = {
  type: TransactionType;
  description: string;
  amount: number;
  date: string;
  categoriesId: CategoryId;
  /** Novo arquivo a enviar (opcional — comprovante não é obrigatório). */
  receiptFile?: ReceiptFileInput;
  /** Comprovante já enviado (preenchido só na edição). */
  receipt?: TransactionReceipt;
};

/** Sentinela "all" representa "sem filtro" nos selects de filtro — não é um valor de domínio. */
export type TransactionTypeFilter = TransactionType | 'all';
export type CategoryFilter = CategoryId | 'all';
export type AttachmentFilter = 'all' | 'with' | 'without';

export type TransactionFilters = {
  description: string;
  startDate?: string;
  endDate?: string;
  type: TransactionTypeFilter;
  categoryId: CategoryFilter;
  attachment: AttachmentFilter;
};
