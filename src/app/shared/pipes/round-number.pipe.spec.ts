import { RoundNumberPipe } from './round-number.pipe';

describe('RoundNumberPipe', () => {
  const pipe = new RoundNumberPipe();

  it('redondea a 2 decimales', () => {
    expect(pipe.transform(1.239)).toBe(1.24);
  });

  it('devuelve 0 si el valor es 0', () => {
    expect(pipe.transform(0)).toBe(0);
  });
});
