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

const AMOUNT_TYPES = new Set([1, 2]);

export interface PriceUpdateConfirmationRow {
  label: string;
  value: string;
}

export interface PriceUpdateConfirmation {
  title: string;
  sentence: string;
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
  /** Artículos con código: la misma lista que se envía. En «todos» no hay un total del catálogo. */
  articleCount: number;
}

export function buildPriceUpdateConfirmation(input: PriceUpdateConfirmationInput): PriceUpdateConfirmation {
  const type = Number(input.type);
  const scope = input.optionUpdate === 'all' ? SCOPE_LABELS.all : SCOPE_LABELS.filter;
  const products =
    input.optionUpdate === 'all'
      ? 'los productos'
      : input.articleCount === 1
        ? '1 producto'
        : `${input.articleCount} productos`;

  return {
    title: 'Confirmación de actualización',
    sentence: `Vas a actualizar ${products} (${scope}).`,
    rows: [
      { label: 'Campo', value: FIELD_LABELS[input.field] ?? input.field },
      { label: 'Forma', value: TYPE_LABELS[type] ?? '' },
      { label: 'Valor', value: formatAmount(type, input.amount) },
      { label: 'Decimales', value: String(input.decimal) },
    ],
    warningTitle: 'No se puede volver atrás',
    warningText:
      'Los precios quedan como los dejes. No hay forma de deshacer este cambio. Si no estás seguro, cancelá.',
  };
}

function formatAmount(type: number, amount: number | string): string {
  return AMOUNT_TYPES.has(type) ? `$ ${amount}` : `${amount} %`;
}
