import { buildPriceUpdateConfirmation } from './update-article-price.confirmation';

describe('buildPriceUpdateConfirmation', () => {
  it('en filtro dice la cantidad y el detalle del cambio', () => {
    const copy = buildPriceUpdateConfirmation({
      optionUpdate: 'filter',
      field: 'salePrice',
      type: 2,
      amount: 20,
      decimal: 2,
      productCount: 10,
    });

    expect(copy.title).toBe('Confirmación de actualización');
    expect(copy.sentence).toBe('Vas a actualizar 10 productos (Productos filtrados).');
    expect(copy.rows).toEqual([
      { label: 'Campo', value: 'Precio de venta' },
      { label: 'Forma', value: 'Monto incremental' },
      { label: 'Valor', value: '$ 20' },
      { label: 'Decimales', value: '2' },
    ]);
    expect(copy.warningTitle).toBe('No se puede volver atrás');
  });

  it('en todos dice la cantidad y Todos los productos', () => {
    const copy = buildPriceUpdateConfirmation({
      optionUpdate: 'all',
      field: 'basePrice',
      type: 1,
      amount: '1222',
      decimal: 2,
      productCount: 433,
    });

    expect(copy.sentence).toBe('Vas a actualizar 433 productos (Todos los productos).');
    expect(copy.rows).toEqual([
      { label: 'Campo', value: 'Precio base' },
      { label: 'Forma', value: 'Monto fijo' },
      { label: 'Valor', value: '$ 1222' },
      { label: 'Decimales', value: '2' },
    ]);
  });

  it('usa singular cuando hay un solo producto', () => {
    const copy = buildPriceUpdateConfirmation({
      optionUpdate: 'filter',
      field: 'markupPercentage',
      type: 4,
      amount: 40,
      decimal: 1,
      productCount: 1,
    });

    expect(copy.sentence).toBe('Vas a actualizar 1 producto (Productos filtrados).');
    expect(copy.rows[0].value).toBe('Margen');
    expect(copy.rows[2].value).toBe('40 %');
  });
});
