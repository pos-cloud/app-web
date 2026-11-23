import { buildPriceUpdateConfirmation } from './update-article-price.confirmation';

describe('buildPriceUpdateConfirmation', () => {
  it('en filtro cuenta la página y avisa si el filtro tiene más', () => {
    const copy = buildPriceUpdateConfirmation({
      optionUpdate: 'filter',
      field: 'salePrice',
      type: 2,
      amount: 20,
      decimal: 2,
      articleCount: 10,
      filteredTotal: 35,
    });

    expect(copy.sentence).toBe('Vas a actualizar el precio de venta de 10 productos de esta página.');
    expect(copy.detail).toBe('El filtro tiene 35 productos. Las otras páginas no entran.');
    expect(copy.rows).toEqual([
      { label: 'Forma', value: 'Monto incremental' },
      { label: 'Valor', value: '$ 20' },
      { label: 'Decimales', value: '2' },
    ]);
    expect(copy.title).toBe('Confirmá la actualización');
    expect(copy.subtitle).toBe('Revisá antes de continuar');
    expect(copy.warningTitle).toBe('No se puede volver atrás');
    expect(copy.warningText).toBe(
      'Los precios quedan como los dejes. No hay forma de deshacer este cambio. Si no estás seguro, cancelá.'
    );
  });

  it('en filtro no usa el total cuando no suma páginas', () => {
    const samePage = buildPriceUpdateConfirmation({
      optionUpdate: 'filter',
      field: 'basePrice',
      type: 3,
      amount: 10,
      decimal: 0,
      articleCount: 10,
      filteredTotal: 10,
    });
    const smaller = buildPriceUpdateConfirmation({
      optionUpdate: 'filter',
      field: 'basePrice',
      type: 3,
      amount: 10,
      decimal: 0,
      articleCount: 10,
      filteredTotal: 4,
    });

    expect(samePage.sentence).toBe('Vas a actualizar el precio base de 10 productos de esta página.');
    expect(samePage.detail).toBe('No incluye otras páginas del filtro.');
    expect(smaller.detail).toBe('No incluye otras páginas del filtro.');
    expect(samePage.rows).toEqual([
      { label: 'Forma', value: 'Porcentaje incremental' },
      { label: 'Valor', value: '10 %' },
      { label: 'Decimales', value: '0' },
    ]);
  });

  it('en todos no muestra cantidad ni el total del filtro', () => {
    const copy = buildPriceUpdateConfirmation({
      optionUpdate: 'all',
      field: 'basePrice',
      type: 1,
      amount: '150.50',
      decimal: 2,
      articleCount: 8,
      filteredTotal: 120,
    });

    expect(copy.sentence).toBe('Vas a actualizar el precio base de todos los productos del sistema.');
    expect(copy.detail).toBe('No respeta los filtros del listado. Entran todos, también los que no estás viendo.');
    expect(`${copy.sentence} ${copy.detail}`).not.toContain('120');
    expect(`${copy.sentence} ${copy.detail}`).not.toContain('8');
    expect(copy.rows).toEqual([
      { label: 'Forma', value: 'Monto fijo' },
      { label: 'Valor', value: '$ 150.50' },
      { label: 'Decimales', value: '2' },
    ]);
  });

  it('usa singular cuando hay un solo producto en la página', () => {
    const copy = buildPriceUpdateConfirmation({
      optionUpdate: 'filter',
      field: 'markupPercentage',
      type: 4,
      amount: 40,
      decimal: 1,
      articleCount: 1,
      filteredTotal: 1,
    });

    expect(copy.sentence).toBe('Vas a actualizar el margen de 1 producto de esta página.');
    expect(copy.detail).toBe('No incluye otras páginas del filtro.');
    expect(copy.rows[0].value).toBe('Porcentaje fijo');
    expect(copy.rows[1].value).toBe('40 %');
  });
});
