export interface IButton {
  title: string;
  class: string;
  icon: string;
  click: string;
  /** Expresión evaluada con `item` en contexto; si es falsy, el botón no se muestra. */
  show?: string;
}
