/** Textos del cartel de confirmación. */
const SCOPE_LABELS = {
  all: 'Todos los productos',
  filter: 'Productos filtrados',
} as const;

export interface PriceUpdateConfirmation {
  title: string;
  sentence: string;
  warningTitle: string;
  warningText: string;
}

export interface PriceUpdateConfirmationInput {
  optionUpdate: 'all' | 'filter';
  /** Cantidad a mostrar: códigos de esta página si es filtro; total del listado si es todos. */
  productCount: number;
}

export function buildPriceUpdateConfirmation(input: PriceUpdateConfirmationInput): PriceUpdateConfirmation {
  const scope = input.optionUpdate === 'all' ? SCOPE_LABELS.all : SCOPE_LABELS.filter;
  const products = input.productCount === 1 ? '1 producto' : `${input.productCount} productos`;

  return {
    title: 'Confirmación de actualización',
    sentence: `Vas a actualizar ${products} (${scope}).`,
    warningTitle: 'No se puede volver atrás',
    warningText:
      'Los precios quedan como los dejes. No hay forma de deshacer este cambio. Si no estás seguro, cancelá.',
  };
}
