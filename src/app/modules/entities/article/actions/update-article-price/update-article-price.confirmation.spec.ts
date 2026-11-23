import { buildPriceUpdateConfirmation } from './update-article-price.confirmation';

describe('buildPriceUpdateConfirmation', () => {
  it('en filtro dice la cantidad y Productos filtrados', () => {
    const copy = buildPriceUpdateConfirmation({
      optionUpdate: 'filter',
      productCount: 10,
    });

    expect(copy.title).toBe('Confirmación de actualización');
    expect(copy.sentence).toBe('Vas a actualizar 10 productos (Productos filtrados).');
    expect(copy.warningTitle).toBe('No se puede volver atrás');
  });

  it('en todos dice la cantidad y Todos los productos', () => {
    const copy = buildPriceUpdateConfirmation({
      optionUpdate: 'all',
      productCount: 433,
    });

    expect(copy.sentence).toBe('Vas a actualizar 433 productos (Todos los productos).');
  });

  it('usa singular cuando hay un solo producto', () => {
    const copy = buildPriceUpdateConfirmation({
      optionUpdate: 'filter',
      productCount: 1,
    });

    expect(copy.sentence).toBe('Vas a actualizar 1 producto (Productos filtrados).');
  });
});
