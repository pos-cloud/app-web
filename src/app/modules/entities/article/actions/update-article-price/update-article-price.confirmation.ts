/** Textos del cartel de confirmación. Los tipos coinciden con UPDATE_TYPE del formulario. */
const FIELD_PHRASE: Record<string, string> = {
  basePrice: 'el precio base',
  salePrice: 'el precio de venta',
  markupPercentage: 'el margen',
};

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
  subtitle: string;
  title: string;
  sentence: string;
  detail: string;
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
  const phrase = FIELD_PHRASE[input.field] ?? input.field;
  const scope = scopeCopy(input, phrase);
  const type = Number(input.type);

  return {
    subtitle: 'Revisá antes de continuar',
    title: 'Confirmá la actualización',
    sentence: scope.sentence,
    detail: scope.detail,
    rows: [
      { label: 'Forma', value: TYPE_LABELS[type] ?? '' },
      { label: 'Valor', value: formatAmount(type, input.amount) },
      { label: 'Decimales', value: String(input.decimal) },
    ],
    warningTitle: 'No se puede volver atrás',
    warningText:
      'Los precios quedan como los dejes. No hay forma de deshacer este cambio. Si no estás seguro, cancelá.',
  };
}

function scopeCopy(input: PriceUpdateConfirmationInput, phrase: string): { sentence: string; detail: string } {
  if (input.optionUpdate === 'all') {
    return {
      sentence: `Vas a actualizar ${phrase} de todos los productos del sistema.`,
      detail: 'No respeta los filtros del listado. Entran todos, también los que no estás viendo.',
    };
  }

  const products = input.articleCount === 1 ? '1 producto' : `${input.articleCount} productos`;
  const filteredTotal = input.filteredTotal ?? 0;

  return {
    sentence: `Vas a actualizar ${phrase} de ${products} de esta página.`,
    detail:
      filteredTotal > input.articleCount
        ? `El filtro tiene ${filteredTotal} productos. Las otras páginas no entran.`
        : 'No incluye otras páginas del filtro.',
  };
}

function formatAmount(type: number, amount: number | string): string {
  return AMOUNT_TYPES.has(type) ? `$ ${amount}` : `${amount} %`;
}
