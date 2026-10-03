'use strict';

import { Tax } from '@types';

export class Taxes {
  public _id: string;
  public tax: Tax;
  public percentage: number = 0.0;
  public taxBase: number = 0.0;
  public taxAmount: number = 0.0;

  constructor() {}
}
