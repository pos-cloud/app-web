import { Activity, Article, Company, PaymentMethod, ShipmentMethod, TransactionType } from '@types';

export interface Application extends Activity {
  name: string;
  url: string;
  type: ApplicationType;
  tiendaNube: {
    userId: number;
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
    url: string;
    transactionType: TransactionType;
    shipmentMethod: ShipmentMethod;
    paymentMethod: PaymentMethod;
    company: Company;
    article: Article;
  };
  twilio: {
    senderNumber: string;
    accountSid: string;
    authToken: string;
  };
}

export enum ApplicationType {
  Web = <any>'Web',
  App = <any>'App',
  WooCommerce = <any>'WooCommerce',
  MercadoLibre = <any>'MercadoLibre',
  TiendaNube = <any>'TiendaNube',
  Menu = <any>'Carta digital',
}
