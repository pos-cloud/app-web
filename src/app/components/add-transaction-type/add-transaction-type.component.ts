import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { TransactionType, Movements, CurrentAccount, CodeAFIP, TransactionMovement, StockMovement, EntryAmount } from './../../models/transaction-type';
import { Printer } from './../../models/printer';
import { EmployeeType } from './../../models/employee-type';

import { TransactionTypeService } from './../../services/transaction-type.service';
import { PrinterService } from './../../services/printer.service';
import { EmployeeTypeService } from './../../services/employee-type.service';
import { PaymentMethodService } from 'app/services/payment-method.service';
import { PaymentMethod } from 'app/models/payment-method';
import { CompanyType } from 'app/models/company';
import { Config } from 'app/app.config';
import { CurrencyService } from 'app/services/currency.service';
import { Currency } from 'app/models/currency';

@Component({
  selector: 'app-add-transaction-type',
  templateUrl: './add-transaction-type.component.html',
  styleUrls: ['./add-transaction-type.component.css'],
  providers: [NgbAlertConfig]
})

export class AddTransactionTypeComponent implements OnInit {

  @Input() transactionType: TransactionType;
  public transactionMovements: any[] = [TransactionMovement.Sale, TransactionMovement.Purchase, TransactionMovement.Stock, TransactionMovement.Money];
  public stockMovements: any [] = [StockMovement.Inflows,StockMovement.Outflows,StockMovement.Inventory]
  public transactionTypeForm: FormGroup;
  public companyTypes: CompanyType[] = [CompanyType.None, CompanyType.Client, CompanyType.Provider];
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public printers: Printer[];
  public employeeTypes: EmployeeType[];
  public paymentMethods: PaymentMethod[];
  public currencies: Currency[];
  public letters: string[] = ["", "A", "B", "C", "E", "M", "R", "T", "X"];
  @Input() readonly: boolean;
  @Input() operation: string;
  public userCountry: string = 'AR';

  // OPCIONES FORMULARIO
  public opCurrentAccount: string = '';
  public opCashMovement: string = '';
  public opStockMovement: string = '';

  public formErrors = {
    'transactionMovement': '',
    'abbreviation': '',
    'name': '',
  };

  public validationMessages = {
    'transactionMovement': {
      'required': 'Este campo es requerido.',
    },
    'abbreviation': {
      'maxlength': 'No puede exceder los 2 carácteres.'
    },
    'name': {
      'required': 'Este campo es requerido.',
    }
  };

  constructor(
    public _transactionTypeService: TransactionTypeService,
    public _employeeTypeService: EmployeeTypeService,
    public _paymentMethodService: PaymentMethodService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _printerService: PrinterService,
    public _currencyService: CurrencyService,
  ) {
    this.getCurrencies();
    this.getPaymentMethods();
    this.getEmployeeTypes();
    this.getPrinters();
  }

  ngOnInit(): void {

    this.userCountry = Config.country;
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    if(!this.transactionType) {
      this.transactionType = new TransactionType();
    } else {
      if (this.transactionType.currentAccount) {
        this.opCurrentAccount = this.transactionType.currentAccount.toString();
      }
      if (this.transactionType.movement) {
        this.opCashMovement = this.transactionType.movement.toString();
      }
      if (this.transactionType.stockMovement) {
        this.opStockMovement = this.transactionType.stockMovement.toString();
      }
    }
    this.buildForm();
    this.setValueForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getPrinters(): void {

    this.loading = true;

    this._printerService.getPrinters().subscribe(
      result => {
        if (!result.printers) {
          this.printers = undefined;
        } else {
          this.printers = result.printers;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }
  
  public getCurrencies(): void {

    this.loading = true;

    this._currencyService.getCurrencies('sort="name":1').subscribe(
      result => {
        if (!result.currencies) {
        } else {
          this.currencies = result.currencies;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getEmployeeTypes(): void {

    this.loading = true;

    this._employeeTypeService.getEmployeeTypes().subscribe(
      result => {
        if (!result.employeeTypes) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.loading = false;
          this.employeeTypes = result.employeeTypes;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getPaymentMethods(): void {

    this.loading = true;

    this._paymentMethodService.getPaymentMethods().subscribe(
      result => {
        if (!result.paymentMethods) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.loading = false;
          this.paymentMethods = result.paymentMethods;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public buildForm(): void {

    this.transactionTypeForm = this._fb.group({
      '_id': [this.transactionType._id, [
        ]
      ],
      'transactionMovement': [this.transactionType.transactionMovement, [
          Validators.required
        ]
      ],
      'abbreviation': [this.transactionType.abbreviation, [,
        Validators.maxLength(2)
        ]
      ],
      'name': [this.transactionType.name, [
          Validators.required
        ]
      ],
      'labelPrint': [this.transactionType.labelPrint, [
        ]
      ],
      'currentAccount': [this.transactionType.currentAccount, [
        ]
      ],
      'movement': [this.transactionType.movement, [
        ]
      ],
      'modifyStock': [this.transactionType.modifyStock, [
        ]
      ],
      'stockMovement': [this.transactionType.stockMovement, [
        ]
      ],
      'requestArticles': [this.transactionType.requestArticles, [
        ]
      ],
      'requestTaxes': [this.transactionType.requestTaxes, [
        ]
      ],
      'modifyArticle': [this.transactionType.modifyArticle, [
        ]
      ],
      'defectOrders': [this.transactionType.defectOrders, [
        ]
      ],
      'fixedOrigin': [this.transactionType.fixedOrigin, [
        ]
      ],
      'fixedLetter': [this.transactionType.fixedLetter, [
        ]
      ],
      'resetNumber': [this.transactionType.resetNumber, [
        ]
      ],
      'electronics': [this.transactionType.electronics, [
        ]
      ],
      'codeA': [this.getCode(this.transactionType,"A"), [
        ]
      ],
      'codeB': [this.getCode(this.transactionType, "B"), [
        ]
      ],
      'codeC': [this.getCode(this.transactionType, "C"), [
        ]
      ],
      'fiscalCode': [this.transactionType.fiscalCode, [
        ]
      ],
      'printable': [this.transactionType.printable, [
        ]
      ],
      'defectPrinter': [this.transactionType.defectPrinter, [
        ]
      ],
      'tax': [this.transactionType.tax, [
        ]
      ],
      'cashBoxImpact': [this.transactionType.cashBoxImpact, [
        ]
      ],
      'cashOpening': [this.transactionType.cashOpening, [
        ]
      ],
      'cashClosing': [this.transactionType.cashClosing, [
        ]
      ],
      'allowAPP': [this.transactionType.allowAPP, [
        ]
      ],
      'requestPaymentMethods': [this.transactionType.requestPaymentMethods, [
        ]
      ],
      'showPrices': [this.transactionType.showPrices, [
        ]
      ],
      'entryAmount': [this.transactionType.entryAmount, [
        ]
      ],
      'allowEdit': [this.transactionType.allowEdit, [
        ]
      ],
      'allowDelete': [this.transactionType.allowDelete, [
        ]
      ],
      'requestEmployee': [this.transactionType.requestEmployee, [
        ]
      ],
      'requestCurrency': [this.transactionType.requestCurrency, [
        ]
      ],
      'fastPayment': [this.transactionType.fastPayment, [
        ]
      ],
      'requestCompany': [this.transactionType.requestCompany, [
        ]
      ]
    });

    this.transactionTypeForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.transactionTypeForm) { return; }
    const form = this.transactionTypeForm;

    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);

      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  public getCode(transactionType: TransactionType, letter: string): number {

    let code: number = 0;
    if (transactionType.codes) {
      let jsonString = JSON.stringify(transactionType.codes);
      let json = JSON.parse(jsonString);
      json.find(function (x) {
        if (x.letter === letter) {
          code = x.code;
        }
      });
    }

    return code;
  }

  public setValueForm(): void {

    if (!this.transactionType._id) this.transactionType._id = '';
    if (!this.transactionType.transactionMovement && this.transactionMovements && this.transactionMovements.length > 0) this.transactionType.transactionMovement = TransactionMovement.Sale;
    if (!this.transactionType.transactionMovement) this.transactionType.transactionMovement = null;
    if (!this.transactionType.abbreviation) this.transactionType.abbreviation = '';
    if (!this.transactionType.name) this.transactionType.name = '';
    if (!this.transactionType.labelPrint) this.transactionType.labelPrint = '';
    if (!this.transactionType.currentAccount) this.transactionType.currentAccount = CurrentAccount.No;
    if (!this.transactionType.movement) this.transactionType.movement = Movements.Inflows;
    if (this.transactionType.modifyStock === undefined) this.transactionType.modifyStock = false;
    if (!this.transactionType.stockMovement) this.transactionType.stockMovement = StockMovement.Outflows;
    if (this.transactionType.requestArticles === undefined) this.transactionType.requestArticles = false;
    if (this.transactionType.modifyArticle === undefined) this.transactionType.modifyArticle = false;
    if (this.transactionType.requestTaxes === undefined) this.transactionType.requestTaxes = false;
    if (this.transactionType.defectOrders === undefined) this.transactionType.defectOrders = false;
    if (!this.transactionType.fixedOrigin) this.transactionType.fixedOrigin = 0;
    if (!this.transactionType.fixedLetter) this.transactionType.fixedLetter = '';
    if (this.transactionType.resetNumber === undefined) this.transactionType.resetNumber = false;
    if (this.transactionType.electronics === undefined) this.transactionType.electronics = false;
    if (!this.transactionType.fiscalCode) this.transactionType.fiscalCode = "";
    if (this.transactionType.printable === undefined) this.transactionType.printable = false;

    let defectPrinter;
    if (!this.transactionType.defectPrinter) {
      defectPrinter = null;
    } else {
      if (this.transactionType.defectPrinter._id) {
        defectPrinter = this.transactionType.defectPrinter._id;
      } else {
        defectPrinter = this.transactionType.defectPrinter;
      }
    }

    if (!this.transactionType.requestCompany) this.transactionType.requestCompany = null;
    if (this.transactionType.tax === undefined) this.transactionType.tax = false;
    if (this.transactionType.allowAPP === undefined) this.transactionType.allowAPP = false;
    if (this.transactionType.cashBoxImpact === undefined) this.transactionType.cashBoxImpact = true;
    if (this.transactionType.cashOpening === undefined) this.transactionType.cashOpening = false;
    if (this.transactionType.cashClosing === undefined) this.transactionType.cashClosing = false;
    if (this.transactionType.requestPaymentMethods === undefined) this.transactionType.requestPaymentMethods = true;
    if (this.transactionType.showPrices === undefined) this.transactionType.showPrices = true;
    if(this.transactionType.transactionMovement === TransactionMovement.Sale) {
      if (this.transactionType.entryAmount) this.transactionType.entryAmount = EntryAmount.SaleWithVAT;
    } else {
      if (this.transactionType.entryAmount) this.transactionType.entryAmount = EntryAmount.CostWithoutVAT;
    }
    if (this.transactionType.allowDelete === undefined) this.transactionType.allowDelete = false;
    if (this.transactionType.allowEdit === undefined) this.transactionType.allowEdit = false;

    let requestCurrency;
    if (!this.transactionType.requestCurrency) {
      requestCurrency = null;
    } else {
      if (this.transactionType.requestCurrency._id) {
        requestCurrency = this.transactionType.requestCurrency._id;
      } else {
        requestCurrency = this.transactionType.requestCurrency;
      }
    }

    let requestEmployee;
    if (!this.transactionType.requestEmployee) {
      requestEmployee = null;
    } else {
      if (this.transactionType.requestEmployee._id) {
        requestEmployee = this.transactionType.requestEmployee._id;
      } else {
        requestEmployee = this.transactionType.requestEmployee;
      }
    }

    let fastPayment;
    if (!this.transactionType.fastPayment) {
      fastPayment = null;
    } else {
      if (this.transactionType.fastPayment._id) {
        fastPayment = this.transactionType.fastPayment._id;
      } else {
        fastPayment = this.transactionType.fastPayment;
      }
    }

    this.transactionTypeForm.setValue({
      '_id': this.transactionType._id,
      'transactionMovement': this.transactionType.transactionMovement,
      'abbreviation': this.transactionType.abbreviation,
      'name': this.transactionType.name,
      'labelPrint': this.transactionType.labelPrint,
      'currentAccount': this.transactionType.currentAccount,
      'movement': this.transactionType.movement,
      'modifyStock': this.transactionType.modifyStock,
      'stockMovement': this.transactionType.stockMovement,
      'requestArticles': this.transactionType.requestArticles,
      'modifyArticle': this.transactionType.modifyArticle,
      'requestTaxes': this.transactionType.requestTaxes,
      'requestPaymentMethods': this.transactionType.requestPaymentMethods,
      'defectOrders': this.transactionType.defectOrders,
      'fixedOrigin': this.transactionType.fixedOrigin,
      'fixedLetter': this.transactionType.fixedLetter,
      'resetNumber': this.transactionType.resetNumber,
      'electronics': this.transactionType.electronics,
      'codeA': this.getCode(this.transactionType, "A"),
      'codeB': this.getCode(this.transactionType, "B"),
      'codeC': this.getCode(this.transactionType, "C"),
      'fiscalCode': this.transactionType.fiscalCode,
      'printable': this.transactionType.printable,
      'defectPrinter': defectPrinter,
      'tax': this.transactionType.tax,
      'cashOpening': this.transactionType.cashOpening,
      'cashClosing': this.transactionType.cashClosing,
      'allowAPP': this.transactionType.allowAPP,
      'showPrices': this.transactionType.showPrices,
      'entryAmount': this.transactionType.entryAmount,
      'allowEdit': this.transactionType.allowEdit,
      'allowDelete': this.transactionType.allowDelete,
      'requestCurrency': requestCurrency,
      'requestEmployee': requestEmployee,
      'fastPayment': fastPayment,
      'requestCompany': this.transactionType.requestCompany
    });
  }

  public addTransactionType(): void {

    this.loading = true;
    this.transactionType = this.transactionTypeForm.value;
    this.transactionType.codes = this.getCodes();
    if(this.operation === 'add') {
      this.saveTransactionType();
    } else if (this.operation === 'update') {
      this.updateTransactionType();
    }
  }

  public updateTransactionType(): void {

    this.loading = true;

    this._transactionTypeService.updateTransactionType(this.transactionType).subscribe(
      result => {
        if (!result.transactionType) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.transactionType = result.transactionType;
          this.showMessage("El tipo de transacción se ha actualizado con éxito.", 'success', false);
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getCodes(): CodeAFIP[] {

    let codes = new Array();
    let codeA = new CodeAFIP();
    codeA.letter = 'A';
    codeA.code = this.transactionTypeForm.value.codeA;
    codes.push(codeA);
    let codeB = new CodeAFIP();
    codeB.letter = 'B';
    codeB.code = this.transactionTypeForm.value.codeB;
    codes.push(codeB);
    let codeC = new CodeAFIP();
    codeC.letter = 'C';
    codeC.code = this.transactionTypeForm.value.codeC;
    codes.push(codeC);

    return codes;
  }

  public saveTransactionType(): void {

    this.loading = true;

    this._transactionTypeService.saveTransactionType(this.transactionType).subscribe(
      result => {
        if (!result.transactionType) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.transactionType = result.transactionType;
          this.showMessage("El tipo de transacción se ha añadido con éxito.", 'success', false);
          this.transactionType = new TransactionType();
          this.buildForm();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }
}
