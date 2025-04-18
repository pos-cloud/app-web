import { Activity, TransactionType } from '@types';

export interface Permission extends Activity {
  name: string;

  collections: {
    name: string;
    actions: {
      view: boolean;
      add: boolean;
      edit: boolean;
      delete: boolean;
      export: boolean;
    };
  }[];

  menu: {
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
}
