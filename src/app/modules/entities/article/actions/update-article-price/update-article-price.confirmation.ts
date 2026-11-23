/** Textos del cartel de confirmación. Los tipos coinciden con UPDATE_TYPE del formulario. */
const FIELD_LABELS: Record<string, string> = {
  basePrice: 'Precio base',
  salePrice: 'Precio de venta',
  markupPercentage: 'Margen',
};

const SCOPE_LABELS = {
  all: 'Todos los productos',
  filter: 'Productos filtrados',
} as const;

const TYPE_LABELS: Record<number, string> = {
  1: 'Monto fijo',
  2: 'Monto incremental',
  3: 'Porcentaje incremental',
  4: 'Porcentaje fijo',
};

const TYPE_EFFECT: Record<number, string> = {
  1: 'Todos quedan con ese valor fijo.',
  2: 'Se suma ese monto al valor actual de cada producto.',
  3: 'Se suma ese porcentaje al valor actual de cada producto.',
  4: 'Todos quedan con ese porcentaje fijo.',
};

const AMOUNT_TYPES = new Set([1, 2]);

export interface PriceUpdateConfirmationRow {
  label: string;
  value: string;
}

export interface PriceUpdateConfirmation {
  title: string;
  sentence: string;
  detail: string;
  effect: string;
  rows: PriceUpdateConfirmationRow[];
  warningTitle: string;
  warningText: string;
}

export interface PriceUpdateConfirmationInput {
  optionUpdate: 'all' | 'filter';
  field: string;
  type: number;
  amount: number | string;
  decimal: number | string;
  /** Artículos con código: la misma lista que se envía. */
  articleCount: number;
  /** Total del filtro del listado. Solo aporta contexto si el alcance es filter y es mayor que articleCount. */
  filteredTotal?: number | null;
}

export function buildPriceUpdateConfirmation(input: PriceUpdateConfirmationInput): PriceUpdateConfirmation {
  const type = Number(input.type);
  const fieldLabel = FIELD_LABELS[input.field] ?? input.field;
  const scope = input.optionUpdate === 'all' ? SCOPE_LABELS.all : SCOPE_LABELS.filter;
  const amountLabel = formatAmount(type, input.amount);
  const productsLabel =
    input.optionUpdate === 'all'
      ? 'Todos los del sistema'
      : input.articleCount === 1
        ? '1 producto de esta página'
        : `${input.articleCount} productos de esta página`;

  return {
    title: 'Confirmación de actualización',
    sentence: sentenceCopy(input, scope),
    detail: detailCopy(input),
    effect: `${TYPE_EFFECT[type] ?? ''} Campo: ${fieldLabel}. Valor: ${amountLabel}.`,
    rows: [
      { label: 'Productos', value: productsLabel },
      { label: 'Alcance', value: scope },
      { label: 'Campo', value: fieldLabel },
      { label: 'Forma', value: TYPE_LABELS[type] ?? '' },
      { label: 'Valor', value: amountLabel },
      { label: 'Decimales', value: String(input.decimal) },
    ],
    warningTitle: 'No se puede volver atrás',
    warningText:
      'Los precios quedan como los dejes. No hay forma de deshacer este cambio. Si no estás seguro, cancelá.',
  };
}

function sentenceCopy(input: PriceUpdateConfirmationInput, scope: string): string {
  if (input.optionUpdate === 'all') {
    return `Vas a actualizar todos los productos del sistema (${scope}).`;
  }

  const products =
    input.articleCount === 1 ? '1 producto de esta página' : `${input.articleCount} productos de esta página`;
  return `Vas a actualizar ${products} (${scope}).`;
}

function detailCopy(input: PriceUpdateConfirmationInput): string {
  if (input.optionUpdate === 'all') {
    return 'Entran todos los productos del sistema, también los que no estás viendo. Los filtros del listado no se tienen en cuenta.';
  }

  const filteredTotal = input.filteredTotal ?? 0;
  if (filteredTotal > input.articleCount) {
    return `Son los de esta página. El filtro tiene ${filteredTotal} productos; las otras páginas no entran.`;
  }

  return 'Son los productos que ves en la lista ahora.';
}

function formatAmount(type: number, amount: number | string): string {
  return AMOUNT_TYPES.has(type) ? `$ ${amount}` : `${amount} %`;
}
