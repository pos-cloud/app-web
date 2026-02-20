import {
  Account,
  Activity,
  Address,
  Branch,
  BusinessRule,
  CashBox,
  Company,
  Currency,
  Deposit,
  Employee,
  PriceList,
  RelationType,
  ShipmentMethod,
  Table,
  Taxes,
  TransactionType,
  Transport,
  UseOfCFDI,
} from '@types';

export interface Transaction extends Activity {
  _id: string;
  origin: number;
  letter: string;
  number: number;
  startDate: string;
  endDate: string;
  expirationDate: string;
  VATPeriod: string;
  state: TransactionState;
  basePrice: number;
  exempt: number;
  taxes?: Taxes[];
  discountAmount: number;
  discountPercent: number;
  commissionAmount: number;
  administrativeExpenseAmount: number;
  otherExpenseAmount: number;
  totalPrice: number;
  roundingAmount: number;
  diners: number;
  orderNumber: number;
  observation: string;
  madein: string;
  balance: number;
  CAE: string; // AR
  CAEExpirationDate: string; // AR
  relationType: RelationType; // MX
  useOfCFDI: UseOfCFDI; // MX
  stringSAT: string; // MX
  CFDStamp: string; // MX
  SATStamp: string; // MX
  UUID: string; // MX
  type: TransactionType;
  company: Company;
  cashBox: CashBox;
  currency: Currency;
  quotation: number;
  printed: number;
  table: Table;
  employeeOpening: Employee;
  employeeClosing: Employee;
  deliveryAddress: Address;
  branchOrigin: Branch;
  branchDestination: Branch;
  depositOrigin: Deposit;
  depositDestination: Deposit;
  transport: Transport;
  shipmentMethod: ShipmentMethod;
  priceList: PriceList;
  businessRules: BusinessRule[];
  paymentMethodEcommerce: string;
  wooId: string;
  declaredValue: number;
  package: number;
  account: Account;
  optionalAFIP: {
    id: string;
    value: string;
  };
  tracking: { date: string; state: TransactionState }[];
  tiendaNubeId: string;
  canceledTransactions: {
    typeId: TransactionType;
    code: number;
    origin: number;
    letter: string;
    number: number;
  };
  balanceAccount: number;
  feArObj: any;
  tiendaNubeObj: any;
  wooObj: any;
}

export enum TransactionState {
  Open = <any>'Abierto',
  Outstanding = <any>'Pendiente de pago',
  PaymentConfirmed = <any>'Pago Confirmado',
  PaymentDeclined = <any>'Pago Rechazado',
  Canceled = <any>'Anulado',
  Packing = <any>'Armando',
  Closed = <any>'Cerrado',
  Delivered = <any>'Entregado',
  Sent = <any>'Enviado',
  Preparing = <any>'Preparando',
  Pending = <any>'Pendiente',
  Produccion = <any>'En Producción',
}

export enum TransactionStateTiendaNube {
  Open = <any>'open', //abierto
  Closed = <any>'closed', //cerrado
  Canceled = <any>'canceled', //cancelado
  Packed = <any>'packed', //preparado
  Fulfilled = <any>'fulfilled', //completado
}

export enum TransactionStatusWooCommerce {
  Pending = <any>'pending', //pendiente
  Processing = <any>'processing', //procesando
  Onhold = <any>'onhold', //en espera
  Completed = <any>'completed', //preparado
  Cancelled = <any>'cancelled', //completado
  Refunded = <any>'refunded', //reenboldado
}

export enum TransactionMovement {
  Sale = <any>'Venta',
  Purchase = <any>'Compra',
  Stock = <any>'Stock',
  Money = <any>'Fondos',
  Production = <any>'Producción',
}
