import { Activity, Article, Company, Deposit, PaymentMethod, ShipmentMethod, TransactionType } from '@types';

export interface FeArIntegrationEntry {
  companyName: string;
  identificationValue: string;
  file: string;
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
    deposit: Deposit;
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
  feAr?: FeArIntegrationEntry[];
  catalog?: {
    primaryColor: string;
    backgroundColor: string;
    transactionType: TransactionType;
    logo: string;
    cover: string;
    name: string;
    title: string;
    description: string;
    whatsapp: string;
    instagram: string;
    facebook: string;
  };
  /** Turnos online en appointments.poscloud.ar/{base}, con marca propia (independiente del catálogo). */
  appointments?: {
    enabled: boolean;
    name?: string;
    address?: string;
    /** Marca propia de turnos (independiente del catálogo). */
    logo?: string;
    primaryColor?: string;
    whatsapp?: string;
    /** 0 domingo … 6 sábado */
    days?: number[];
    maxDaysAhead?: number;
    periods?: { id: 'morning' | 'afternoon' | 'night'; from: string; to: string; enabled: boolean }[];
  };
  claude?: {
    token: string;
    database: string;
    issuedAt?: string;
  };
}
