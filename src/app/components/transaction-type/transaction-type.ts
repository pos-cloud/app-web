import { Printer } from '../printer/printer';
import { PaymentMethod } from '../payment-method/payment-method';
import { Company, CompanyType } from '../company/company';
import { User } from '../user/user';
import { UseOfCFDI } from '../use-of-CFDI.component.ts/use-of-CFDI';
import { EmailTemplate } from '../email-template/email-template';
import { Branch } from '../branch/branch';

import * as moment from 'moment';
import { Application } from '../application/application.model';
import { EmployeeType } from '../employee-type/employee-type.model';
import { ShipmentMethod } from '../shipment-method/shipment-method.model';
import { Model } from '../model/model.model';
import { IAttribute } from 'app/util/attribute.interface';
import { TransactionState } from '../transaction/transaction';
import { CashBoxType } from '../cash-box-type/cash-box-type.model';


export class TransactionType extends Model {

    public _id: string;
    public order: number = 1;
    public transactionMovement: TransactionMovement;
    public abbreviation: string;
    public name: string = '';
    public labelPrint: string;
    public currentAccount: CurrentAccount = CurrentAccount.No;
    public movement: Movements = Movements.Inflows;
    public modifyStock: boolean = false;
    public stockMovement: StockMovement;
    public requestArticles: boolean = false;
    public modifyArticle: boolean = false;
    public entryAmount: EntryAmount = EntryAmount.SaleWithVAT;
    public requestTaxes: boolean = false;
    public requestPaymentMethods: boolean = true;
    public paymentMethods : PaymentMethod[];
    public showKeyboard: boolean = false;
    public defectOrders: boolean = false;
    public electronics: boolean = false;
    public codes: CodeAFIP[]; // AR
    public fiscalCode: string;
    public fixedOrigin: number;
    public fixedLetter: string;
    public maxOrderNumber: number = 0;
    public showPrices: boolean = true;
    public printable: boolean = false;
    public defectPrinter: Printer;
    public defectUseOfCFDI: UseOfCFDI;
    public tax: boolean = false;
    public cashBoxImpact: boolean = true;
    public cashOpening: boolean = false;
    public cashClosing: boolean = false;
    public allowAPP: boolean = false;
    public allowEdit: boolean = false;
    public allowDelete: boolean = false;
    public allowZero: boolean = false;
    public allowCompanyDiscount: boolean = true;
    public allowPriceList : boolean = true;
    public requestCurrency: boolean = false;
    public requestEmployee: EmployeeType;
    public requestTransport: boolean = false;
    public fastPayment: PaymentMethod;
    public requestCompany: CompanyType;
    public isPreprinted: boolean = false;
    public automaticNumbering: boolean = true;
    public automaticCreation: boolean = false;
    public showPriceType: PriceType = PriceType.Final;
    public showDescriptionType: DescriptionType = DescriptionType.Description;
    public printDescriptionType: DescriptionType = DescriptionType.Description;
    public printSign: boolean = false;
    public posKitchen: boolean = false;
    public readLayout: boolean = false;
    public updatePrice: PriceType;
    public resetNumber: boolean = false;
    public updateArticle: boolean = false;
    public finishCharge: boolean = true;
    public requestEmailTemplate: boolean = false;
    public defectEmailTemplate: EmailTemplate;
    public requestShipmentMethod: boolean = false;
    public defectShipmentMethod: ShipmentMethod;
    public application: Application;
    public company: Company;
    public branch: Branch;
    public level: number = 0;
    public groupsArticles: boolean = false;
    public printOrigin: boolean = false;
    public expirationDate: string;
    public numberPrint: number = 0;
    public orderNumber : number;
    public resetOrderNumber : string;
    public allowAccounting : boolean = false;
    public finishState : TransactionState;
    public optionalAFIP: optionalAFIP;
    public cashBoxType : CashBoxType;
    public creationUser: User;
    public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public updateUser: User;
    public updateDate: string;

    constructor() { super(); }

    static getAttributes(): IAttribute[] {
        return Model.getAttributes([
            {
                name: 'transactionMovement',
                visible: true,
                filter: true,
                datatype: 'string',
                align: 'left',
            }, {
                name: 'name',
                visible: true,
                filter: true,
                datatype: 'string',
                align: 'left',
            },
            {
                name: 'order',
                filter: true,
                datatype: 'number',
                align: 'left',
            },
            {
                name: 'branch.name',
                filter: true,
                datatype: 'string',
                align: 'left',
            },
            {
                name: 'movement',
                filter: true,
                datatype: 'string',
                align: 'left',
            },
            {
                name: 'abbreviation',
                filter: true,
                datatype: 'string',
                align: 'left',
            },
            {
                name: 'labelPrint',
                filter: true,
                datatype: 'string',
                align: 'left',
            },
            {
                name: 'modifyStock',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            },
            {
                name: 'currentAccount',
                filter: true,
                datatype: 'string',
                align: 'left',
            },
            {
                name: 'stockMovement',
                filter: true,
                datatype: 'string',
                align: 'left',
            },
            {
                name: 'requestArticles',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            },
            {
                name: 'modifyArticle',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            },
            {
                name: 'entryAmount',
                filter: true,
                datatype: 'string',
                align: 'left',
            },
            {
                name: 'requestTaxes',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            },
            {
                name: 'requestPaymentMethods',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            },
            {
                name: 'showKeyboard',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            },
            {
                name: 'defectOrders',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            },
            {
                name: 'electronics',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            },
            {
                name: 'codes',
                filter: true,
                datatype: 'string',
                project: `{"$reduce":{"input":"$codes.code","initialValue":"","in":{"$concat":["$$value",{"$cond":{"if":{"$eq":["$$value",""]},"then":"","else":"; "}},{"$concat":[{"$toString":"$$this"}]}]}}}`,
                align: 'left',
            },
            {
                name: 'fiscalCode',
                filter: true,
                datatype: 'string',
                align: 'left',
            },
            {
                name: 'fixedOrigin',
                filter: true,
                datatype: 'number',
                align: 'left',
            },
            {
                name: 'fixedLetter',
                filter: true,
                datatype: 'string',
                align: 'left',
            },
            {
                name: 'maxOrderNumber',
                filter: true,
                datatype: 'number',
                align: 'left',
            },
            {
                name: 'showPrices',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            },
            {
                name: 'printable',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            },
            {
                name: 'defectPrinter.name',
                filter: true,
                datatype: 'string',
                align: 'left',
            },
            {
                name: 'defectUseOfCFDI.name',
                filter: true,
                datatype: 'string',
                align: 'left',
            },
            {
                name: 'tax',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            }, {
                name: 'cashBoxImpact',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            }, {
                name: 'cashOpening',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            }, {
                name: 'cashClosing',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            }, {
                name: 'allowAPP',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            }, {
                name: 'allowEdit',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            }, {
                name: 'allowDelete',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            }, {
                name: 'allowZero',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            }, {
                name: 'allowCompanyDiscount',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            }, {
                name: 'requestCurrency',
                filter: true,
                datatype: 'string',
                align: 'left',
            }, {
                name: 'requestEmployee.name',
                filter: true,
                datatype: 'string',
                align: 'left',
            }, {
                name: 'requestTransport',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            }, {
                name: 'fastPayment.name',
                filter: true,
                datatype: 'string',
                align: 'left',
            }, {
                name: 'requestCompany',
                filter: true,
                datatype: 'string',
                align: 'left',
            }, {
                name: 'isPreprinted',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            }, {
                name: 'automaticNumbering',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            }, {
                name: 'automaticCreation',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            }, {
                name: 'showPriceType',
                filter: true,
                datatype: 'string',
                align: 'left',
            }, {
                name: 'showDescriptionType',
                filter: true,
                datatype: 'string',
                align: 'left',
            }, {
                name: 'printDescriptionType',
                filter: true,
                datatype: 'string',
                align: 'left',
            }, {
                name: 'printSign',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            }, {
                name: 'posKitchen',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            }, {
                name: 'readLayout',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            }, {
                name: 'updatePrice',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            }, {
                name: 'resetNumber',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            }, {
                name: 'updateArticle',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            }, {
                name: 'finishCharge',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            }, {
                name: 'requestShipmentMethod',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            }, {
                name: 'defectShipmentMethod.name',
                filter: true,
                datatype: 'string',
                align: 'left',
            }, {
                name: 'requestEmailTemaplte',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            }, {
                name: 'defectEmailTemplate.name',
                filter: true,
                datatype: 'string',
                align: 'left',
            }, {
                name: 'application.name',
                filter: true,
                datatype: 'string',
                align: 'left',
            }, {
                name: 'company.name',
                filter: true,
                datatype: 'string',
                align: 'left',
            },{
                name: 'optionalAFIP',
                filter: true,
                datatype: 'string',
                align: 'left',
            }, {
                name: 'level',
                filter: true,
                datatype: 'number',
                align: 'left',
            }, {
                name: 'groupsArticles',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            }, {
                name: 'printOrigin',
                filter: true,
                datatype: 'boolean',
                align: 'left',
            }, {
                name: 'expirationDate',
                filter: true,
                datatype: 'date',
                align: 'left',
            }, {
                name: 'numberPrint',
                filter: true,
                datatype: 'number',
                align: 'left',
            },{
                name: 'finishState',
                filter: true,
                datatype: 'string',
                align: 'left',
            },
        ])
    }
}

export enum Movements {
    Inflows = <any>"Entrada",
    Outflows = <any>"Salida"
}

export enum StockMovement {
    Inflows = <any>"Entrada",
    Outflows = <any>"Salida",
    Inventory = <any>"Inventario",
    Transfer = <any>"Transferencia"
}

export enum CurrentAccount {
    Yes = <any>"Si",
    No = <any>"No",
    Charge = <any>"Cobra"
}

export class CodeAFIP {
    letter: string;
    code: number;
}

export enum TransactionMovement {
    Sale = <any>"Venta",
    Purchase = <any>"Compra",
    Stock = <any>"Stock",
    Money = <any>"Fondos"
}

export enum EntryAmount {
    CostWithoutVAT = <any>"Costo sin IVA",
    CostWithVAT = <any>"Costo con IVA",
    SaleWithoutVAT = <any>"Venta sin IVA",
    SaleWithVAT = <any>"Venta con IVA"
}

export enum PriceType {
    Base = <any>"Precio Base",
    Final = <any>"Precio Final",
    SinTax = <any>"Precio Sin Impuestos",
    Purchase = <any>"Ultima Compra"
}

export enum DescriptionType {
    Code = <any>"Código",
    Description = <any>"Descripción",
    PosDescription = <any>"Descripción Corta"
}

export interface optionalAFIP {
    id : string,
    name : string,
    value : string
}