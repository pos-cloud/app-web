import { buildPriceUpdateConfirmation } from './update-article-price.confirmation';

describe('buildPriceUpdateConfirmation', () => {
  it('en filtro dice la cantidad y la opción elegida', () => {
    const copy = buildPriceUpdateConfirmation({
      optionUpdate: 'filter',
      field: 'salePrice',
      type: 2,
      amount: 20,
      decimal: 2,
      articleCount: 10,
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
    expect(copy.warningText).toBe(
      'Los precios quedan como los dejes. No hay forma de deshacer este cambio. Si no estás seguro, cancelá.'
    );
  });

  it('en todos no inventa una cantidad y repite la opción', () => {
    const copy = buildPriceUpdateConfirmation({
      optionUpdate: 'all',
      field: 'basePrice',
      type: 1,
      amount: '150.50',
      decimal: 2,
      articleCount: 8,
    });

    expect(copy.sentence).toBe('Vas a actualizar los productos (Todos los productos).');
    expect(copy.sentence).not.toContain('8');
    expect(copy.rows[0]).toEqual({ label: 'Campo', value: 'Precio base' });
    expect(copy.rows[2]).toEqual({ label: 'Valor', value: '$ 150.50' });
  });

  it('usa singular cuando hay un solo producto filtrado', () => {
    const copy = buildPriceUpdateConfirmation({
      optionUpdate: 'filter',
      field: 'markupPercentage',
      type: 4,
      amount: 40,
      decimal: 1,
      articleCount: 1,
    });

    expect(copy.sentence).toBe('Vas a actualizar 1 producto (Productos filtrados).');
    expect(copy.rows[0].value).toBe('Margen');
    expect(copy.rows[1].value).toBe('Porcentaje fijo');
    expect(copy.rows[2].value).toBe('40 %');
  });
});
