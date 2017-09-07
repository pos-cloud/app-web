//Paquetes de Angular
import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

//Paquetes de terceros
import { NgbAlertConfig, NgbActiveModal, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';

//Modelos
import { PaymentMethod } from './../../models/payment-method';
import { Transaction, TransactionState } from './../../models/transaction';
import { TransactionType } from './../../models/transaction-type';
import { Company } from './../../models/company';

//Services
import { PaymentMethodService } from './../../services/payment-method.service';
import { TransactionService } from './../../services/transaction.service';
import { TransactionTypeService } from './../../services/transaction-type.service';
import { CompanyService } from './../../services/company.service';

//Pipes
import { DatePipe, DecimalPipe } from '@angular/common'; 

@Component({
  selector: 'app-add-transaction',
  templateUrl: './add-transaction.component.html',
  styleUrls: ['./add-transaction.component.css'],
  providers: [NgbAlertConfig, DatePipe, DecimalPipe]
})

export class AddTransactionComponent implements OnInit {

  public transactionForm: FormGroup;
  public paymentMethods: PaymentMethod[];
  public companies: Company[];
  public transaction: Transaction;
  public alertMessage: string = "";
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public datePipe = new DatePipe('es-AR');

  public formErrors = {
    'date': '',
    'number': '',
    'amount': '',
    'paymentMethod': '',
    'company': ''
  };

  public validationMessages = {
    'company': {
      'required': 'Este campo es requerido.'
    },
    'date': {
      'required': 'Este campo es requerido.'
    },
    'number': {
      'required': 'Este campo es requerido.'
    },
    'totalPrice': {
      'required': 'Este campo es requerido.'
    },
    'paymentMethod': {
      'required': 'Este campo es requerido.'
    }
  };

  constructor(
    public _paymentMethodService: PaymentMethodService,
    public _transactionService: TransactionService,
    public _transactionTypeService: TransactionTypeService,
    public _companyService: CompanyService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { 
    this.transaction = new Transaction();
    this.transaction.type = new TransactionType();
    this.transaction.company = new Company();
    this.transaction.paymentMethod = new PaymentMethod();
    this.paymentMethods = new Array();
    this.companies = new Array();
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getTransactionTypeCharge();
    this.getCompanies();
    this.getPaymentMethods();
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getCompanies(): void {

    this.loading = true;

    this._companyService.getCompanies().subscribe(
      result => {
        if (!result.companies) {
          this.showMessage(result.message, "info", true);
          this.companies = null;
        } else {
          this.companies = result.companies;
          this.transaction.company = result.companies[0];
          this.setValueForm();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getPaymentMethods(): void {

    this.loading = true;

    this._paymentMethodService.getPaymentMethods().subscribe(
      result => {
        if (!result.paymentMethods) {
          this.showMessage(result.message, "info", true);
        } else {
          this.paymentMethods = result.paymentMethods;
          this.transaction.paymentMethod = result.paymentMethods[0];
          this.setValueForm();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getTransactionTypeCharge(): void {

    this.loading = true;

    this._transactionTypeService.getTransactionTypeCharge().subscribe(
      result => {
        if (!result.transactionTypes) {
          this.showMessage(result.message, "info", true);
        } else {
          this.transaction.type = result.transactionTypes[0];
          this.setValueForm();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public setValueForm() {
    
    this.transactionForm.setValue({
      'company': this.transaction.company,
      'date': this.datePipe.transform(this.transaction.date, 'yyyy/MM/dd'),
      'number': this.transaction.number,
      'totalPrice': this.transaction.totalPrice,
      'paymentMethod': this.transaction.paymentMethod,
      'observation': ''
    });
  }

  public buildForm(): void {

    this.transactionForm = this._fb.group({
      'company': [this.transaction.company, [
          Validators.required
        ]
      ],
      'date': [this.datePipe.transform(this.transaction.date, 'yyyy/MM/dd'), [
          Validators.required
        ]
      ],
      'number': [this.transaction.number, [
          Validators.required
        ]
      ],
      'totalPrice': [this.transaction.totalPrice, [
          Validators.required
        ]
      ],
      'paymentMethod': [this.transaction.paymentMethod, [
          Validators.required
        ]
      ],
      'observation': [this.transaction.observation, [
        ]
      ],
    });

    this.transactionForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.transactionForm) { return; }
    const form = this.transactionForm;

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

  public addTransaction(): void {

    this.transaction.company = this.transactionForm.value.company;
    this.transaction.date = this.transactionForm.value.date;
    this.transaction.number = this.transactionForm.value.number;
    this.transaction.totalPrice = this.transactionForm.value.totalPrice;
    this.transaction.paymentMethod = this.transactionForm.value.paymentMethod;
    this.transaction.observation = this.transactionForm.value.observation;
    this.transaction.state = TransactionState.Closed;

    this.saveTransaction();
  }

  public saveTransaction(): void {

    this.loading = true;
    
    this._transactionService.saveTransaction(this.transaction).subscribe(
      result => {
        if (!result.transaction) {
          this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.transaction = result.transaction;
          this.showMessage("La transacción se ha añadido con éxito.", "success", true);
          this.activeModal.close('charge');
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
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
    this.alertMessage = "";
  }
}