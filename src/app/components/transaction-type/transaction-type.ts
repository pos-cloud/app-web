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
    public stockMovement: StockMovement = StockMovement.Inflows;
    public requestArticles: boolean = false;
    public modifyArticle: boolean = false;
    public entryAmount: EntryAmount = EntryAmount.SaleWithVAT;
    public requestTaxes: boolean = false;
    public requestPaymentMethods: boolean = true;
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
    public updatePrice: boolean = false;
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
    public expirationDate: string = null;
    public numberPrint: number = 0;
    public creationUser: User;
    public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public updateUser: User;
    public updateDate: string;

    constructor() { super(); }

    static getAttributes(): {
        name: string,
        visible: boolean,
        disabled: boolean,
        filter: boolean,
        defaultFilter: string,
        datatype: string,
        project: any,
        align: string,
        required: boolean
    }[] {
        return Model.getAttributes([
            {
                name: 'transactionMovement',
                visible: true,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'string',
                project: null,
                align: 'left',
                required: false,
            }, {
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
                name: 'order',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'number',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'branch.name',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'string',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'movement',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'string',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'abbreviation',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'string',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'labelPrint',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'string',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'modifyStock',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'currentAccount',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'string',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'stockMovement',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'string',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'requestArticles',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'modifyArticle',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'entryAmount',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'string',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'requestTaxes',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'requestPaymentMethods',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'defectOrders',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'electronics',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'codes',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'string',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'fiscalCode',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'string',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'fixedOrigin',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'number',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'fixedLetter',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'string',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'maxOrderNumber',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'number',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'showPrices',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'printable',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'defectPrinter.name',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'string',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'defectUseOfCFDI.name',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'string',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'tax',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'cashBoxImpact',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'cashOpening',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'cashClosing',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'allowAPP',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'allowEdit',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'allowDelete',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'allowZero',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'requestCurrency',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'string',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'requestEmployee.name',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'string',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'requestTransport',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'fastPayment.name',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'string',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'requestCompany',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'string',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'isPreprinted',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'automaticNumbering',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'automaticCreation',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'showPriceType',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'string',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'showDescriptionType',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'string',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'printDescriptionType',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'string',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'printSign',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'posKitchen',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'readLayout',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'updatePrice',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'resetNumber',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'updateArticle',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'finishCharge',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'requestShipmentMethod',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'defectShipmentMethod.name',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'string',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'requestEmailTemaplte',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'defectEmailTemplate.name',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'string',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'application.name',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'string',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'company.name',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'string',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'level',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'number',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'groupsArticles',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'printOrigin',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'expirationDate',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'date',
                project: null,
                align: 'left',
                required: false,
            },{
                name: 'numberPrint',
                visible: false,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'number',
                project: null,
                align: 'left',
                required: false,
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
    SinTax = <any>"Precio Sin Impuestos"
}

export enum DescriptionType {
    Code = <any>"Código",
    Description = <any>"Descripción",
    PosDescription = <any>"Descripción Corta"
}
