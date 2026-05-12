import { Activity, Article, Company, PaymentMethod, ShipmentMethod, TransactionType } from '@types';

export interface ArcaIntegrationEntry {
  companyName: string;
  identificationValue: string;
}

export interface Application extends Activity {
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
  /** Certificados ARCA por empresa (CUIT). Formato legacy `{ companyName, identificationValue }` se migra al cargar. */
  arca?: ArcaIntegrationEntry[];
}
