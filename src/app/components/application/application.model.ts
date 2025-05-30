import { IAttribute } from '@types';

import { Company } from '@types';
import { Article } from '../article/article';
import { Category } from '../category/category';
import { EmailTemplate } from '../email-template/email-template';
import { Model } from '../model/model.model';
import { PaymentMethod } from '../payment-method/payment-method';
import { ShipmentMethod } from '../shipment-method/shipment-method.model';
import { TransactionType } from '../transaction-type/transaction-type';

export class Application extends Model {
  order: number;
  name: string;
  url: string;
  type: ApplicationType;
  socialNetworks: {
    facebook: string;
    instagram: string;
    youtube: string;
    twitter: string;
  };
  contact: {
    phone: number;
    whatsapp: number;
    claim: number;
  };
  design: {
    labelNote: string;
    about: string;
    categoryTitle: string;
    categoriesByLine: number;
    showSearchBar: boolean;
    resources: {
      logo: string;
      banners: string[];
    };
    colors: {
      primary: string;
      secondary: string;
      tercery: string;
      backgroud: string;
      backgrounHeader: string;
      backgroundFooter: string;
      font: string;
    };
    font: {
      family: string;
      weight: string;
      style: string;
      size: string;
    };
    home: {
      title: string;
      view: string;
      order: number;
      resources: {
        article: Article;
        category: Category;
        banner: string;
        order: number;
        link: string;
      }[];
    }[];
  };
  auth: {
    requireOPT: boolean;
    messageOPT: { type: String };
  };
  integrations: {
    meli: {
      code: { type: String };
      token: { type: String };
      refreshToken: { type: String };
    };
  };
  notifications: {
    app: {
      checkout: string;
      temporaryMessage: string;
    };
    email: {
      checkout: string;
    };
  };
  schedule: {
    day: string;
    from: string;
    to: string;
  }[];
  email: {
    register: {
      enabled: boolean;
      template: EmailTemplate;
    };
    endTransaction: {
      enabled: boolean;
      template: EmailTemplate;
    };
    statusTransaction: {
      paymentConfirmed: {
        enabled: boolean;
        template: EmailTemplate;
      };
      paymentDeclined: {
        enabled: boolean;
        template: EmailTemplate;
      };
      closed: {
        enabled: boolean;
        template: EmailTemplate;
      };
      sent: {
        enabled: boolean;
        template: EmailTemplate;
      };
      delivered: {
        enabled: boolean;
        template: EmailTemplate;
      };
    };
  };
  tiendaNube: {
    userId: string;
    token: string;
    transactionType: TransactionType;
    shipmentMethod: ShipmentMethod;
    paymentMethod: PaymentMethod;
    company: Company;
    article: Article;
  };
  menu: {
    portain: string;
    background: string;
    article: {
      font: string;
      size: number;
      color: string;
      style: string;
      weight: string;
    };
    category: {
      font: string;
      size: number;
      color: string;
      style: string;
      weight: string;
    };
    price: {
      font: string;
      size: number;
      color: string;
      style: string;
      weight: string;
    };
    observation: {
      font: string;
      size: number;
      color: string;
      style: string;
      weight: string;
    };
  };
  wooCommerce: {
    key: string;
    secret: string;
    transactionType: TransactionType;
    shipmentMethod: ShipmentMethod;
    paymentMethod: PaymentMethod;
    company: Company;
    article: Article;
  };

  constructor() {
    super();
  }

  static getAttributes(): IAttribute[] {
    return Model.getAttributes([
      {
        name: 'order',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'number',
        project: null,
        align: 'center',
        required: false,
      },
      {
        name: 'name',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
      },
      {
        name: 'url',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
      },
      {
        name: 'type',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
      },
    ]);
  }
}

export enum ApplicationType {
  Web = <any>'Web',
  App = <any>'App',
  WooCommerce = <any>'WooCommerce',
  MercadoLibre = <any>'MercadoLibre',
  TiendaNube = <any>'TiendaNube',
  Menu = <any>'Carta digital',
}
