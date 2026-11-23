import { buildPriceUpdateConfirmation } from './update-article-price.confirmation';

describe('buildPriceUpdateConfirmation', () => {
  it('en filtro dice la cantidad, el alcance y detalla si hay más páginas', () => {
    const copy = buildPriceUpdateConfirmation({
      optionUpdate: 'filter',
      field: 'salePrice',
      type: 2,
      amount: 20,
      decimal: 2,
      articleCount: 10,
      filteredTotal: 433,
    });

    expect(copy.title).toBe('Confirmación de actualización');
    expect(copy.sentence).toBe('Vas a actualizar 10 productos (Productos filtrados).');
    expect(copy.detail).toBe('Son los de esta página. El filtro tiene 433 productos; las otras páginas no entran.');
    expect(copy.effect).toBe(
      'Se suma ese monto al valor actual de cada producto. Campo: Precio de venta. Valor: $ 20.'
    );
    expect(copy.rows).toEqual([
      { label: 'Productos', value: '10 productos de esta página' },
      { label: 'Alcance', value: 'Productos filtrados' },
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

  it('en filtro no inventa páginas de más cuando el total no suma', () => {
    const copy = buildPriceUpdateConfirmation({
      optionUpdate: 'filter',
      field: 'basePrice',
      type: 3,
      amount: 10,
      decimal: 0,
      articleCount: 10,
      filteredTotal: 10,
    });

    expect(copy.sentence).toBe('Vas a actualizar 10 productos (Productos filtrados).');
    expect(copy.detail).toBe('Son los productos que ves en la lista ahora.');
    expect(copy.rows[0]).toEqual({ label: 'Productos', value: '10 productos de esta página' });
    expect(copy.rows[4]).toEqual({ label: 'Valor', value: '10 %' });
  });

  it('en todos no inventa una cantidad y explica el alcance', () => {
    const copy = buildPriceUpdateConfirmation({
      optionUpdate: 'all',
      field: 'basePrice',
      type: 1,
      amount: '150.50',
      decimal: 2,
      articleCount: 8,
      filteredTotal: 120,
    });

    expect(copy.sentence).toBe('Vas a actualizar todos los productos (Todos los productos).');
    expect(copy.detail).toBe(
      'Entran todos los productos del sistema, también los que no estás viendo. Los filtros del listado no se tienen en cuenta.'
    );
    expect(copy.sentence).not.toContain('8');
    expect(copy.sentence).not.toContain('120');
    expect(copy.detail).not.toContain('8');
    expect(copy.detail).not.toContain('120');
    expect(copy.rows[0]).toEqual({ label: 'Productos', value: 'Todos los del sistema' });
    expect(copy.rows[2]).toEqual({ label: 'Campo', value: 'Precio base' });
    expect(copy.rows[4]).toEqual({ label: 'Valor', value: '$ 150.50' });
  });

  it('usa singular cuando hay un solo producto filtrado', () => {
    const copy = buildPriceUpdateConfirmation({
      optionUpdate: 'filter',
      field: 'markupPercentage',
      type: 4,
      amount: 40,
      decimal: 1,
      articleCount: 1,
      filteredTotal: 1,
    });

    expect(copy.sentence).toBe('Vas a actualizar 1 producto (Productos filtrados).');
    expect(copy.rows[0].value).toBe('1 producto de esta página');
    expect(copy.rows[2].value).toBe('Margen');
    expect(copy.rows[3].value).toBe('Porcentaje fijo');
    expect(copy.rows[4].value).toBe('40 %');
  });
});
