import { IAttribute } from '@types';
import { Model } from '../model/model.model';
import { TransactionType } from '../transaction-type/transaction-type';

export class Permission extends Model {
  public name: string;

  public collections: {
    name: string;
    actions: {
      view: boolean;
      add: boolean;
      edit: boolean;
      delete: boolean;
      export: boolean;
    };
  }[];

  public menu: {
    sales: {
      counter: boolean;
      tiendaNube: boolean;
      wooCommerce: boolean;
      delivery: boolean;
      voucherReader: boolean;
      resto: boolean;
    };
    money: boolean;
    production: boolean;
    purchases: boolean;
    stock: boolean;
    articles: boolean;
    companies: {
      client: boolean;
      provider: boolean;
    };
    report: boolean;
    config: boolean;
    gallery: boolean;
    resto: boolean;
  };

  filterTransaction: boolean;
  filterCompany: boolean;

  transactionTypes: TransactionType[];
  editArticle: boolean;
  allowDiscount: boolean;
  allowPayment: boolean;

  constructor() {
    super();
  }

  static getAttributes(): IAttribute[] {
    return Model.getAttributes([
      {
        name: 'name',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'string',
        project: null,
        align: 'center',
        required: true,
      },
    ]);
  }
}
