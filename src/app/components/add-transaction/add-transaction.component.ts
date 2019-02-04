//Paquetes de Angular
import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

//Paquetes de terceros
import { NgbAlertConfig, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

//Modelos
import { Transaction, TransactionState } from './../../models/transaction';
import { TransactionMovement } from './../../models/transaction-type';
import { Company, CompanyType } from './../../models/company';
import { Taxes } from '../../models/taxes';
import { Employee } from './../../models/employee';

//Services
import { TransactionService } from './../../services/transaction.service';
import { TransactionTypeService } from './../../services/transaction-type.service';
import { CompanyService } from './../../services/company.service';
import { EmployeeService } from './../../services/employee.service';

//Pipes
import { DateFormatPipe } from './../../pipes/date-format.pipe';
import { RoundNumberPipe } from './../../pipes/round-number.pipe';
import { ListCompaniesComponent } from '../list-companies/list-companies.component';
import { CashBoxService } from 'app/services/cash-box.service';
import { UserService } from 'app/services/user.service';

@Component({
  selector: 'app-add-transaction',
  templateUrl: './add-transaction.component.html',
  styleUrls: ['./add-transaction.component.css'],
  providers: [NgbAlertConfig, DateFormatPipe]
})

export class AddTransactionComponent implements OnInit {

  public transactionForm: FormGroup;
  public companies: Company[];
  @Input() transactionId: string;
  @Input() transactionTypeId: string;
  @Input() companyId: string;
  public transaction: Transaction;
  public taxes: Taxes[] = new Array();
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public posType: string;
  public datePipe = new DateFormatPipe();
  public letters: string[] = ["A", "B", "C", "E", "M", "R", "T","X"];
  public roundNumber = new RoundNumberPipe();
  public transactionMovement: string;
  public employees: Employee[] = new Array();
  public readonly: boolean = false;
  public states: TransactionState[] = [
    TransactionState.Open,
    TransactionState.Canceled,
    TransactionState.Closed,
    TransactionState.Delivered,
    TransactionState.Sent,
    TransactionState.Pending
  ];
  public companyName: string = "Consumidor Final";

  public formErrors = {
    'date': '',
    'origin': '',
    'letter': '',
    'number': '',
    'VATPeriod': '',
    'basePrice': '',
    'exempt': '',
    'totalPrice': '',
    'company': '',
    'employeeOpening': ''
  };

  public validationMessages = {
    'company': {
      'required': 'Este campo es requerido.'
    },
    'date': {
      'required': 'Este campo es requerido.'
    },
    'origin': {
      'required': 'Este campo es requerido.'
    },
    'letter': {
      'required': 'Este campo es requerido.'
    },
    'number': {
      'required': 'Este campo es requerido.'
    },
    'VATPeriod': {
      'required': 'Este campo es requerido.'
    },
    'basePrice': {
      'required': 'Este campo es requerido.'
    },
    'exempt': {
      'required': 'Este campo es requerido.'
    },
    'totalPrice': {
      'required': 'Este campo es requerido.'
    },
    'employeeOpening': {
    }
  };

  constructor(
    public _transactionService: TransactionService,
    public _transactionTypeService: TransactionTypeService,
    public _companyService: CompanyService,
    public _employeeService: EmployeeService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal,
    public _cashBoxService: CashBoxService,
    public _userService: UserService
  ) {
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.posType = pathLocation[2];

    this.transaction = new Transaction();
    this.buildForm();

    if (this.transactionId){
        this.getTransaction();
      } else {
        this.getTransactionType();
    }
  }

  public getTransaction() : void {

    this.loading = true;

    this._transactionService.getTransaction(this.transactionId).subscribe(
      result => {
        if (!result.transaction) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.transaction = result.transaction;
          this.transactionMovement = this.transaction.type.transactionMovement.toString();
          this.transaction.totalPrice = this.roundNumber.transform(this.transaction.totalPrice);
          if(this.transaction.company) {
            this.companyName = this.transaction.company.name;
          }
          this.setValuesForm();
          if(this.transaction.type.cashBoxImpact && !this.transaction.cashBox) {
            this.getOpenCashBox();
          }
          if (this.transaction.type.requestEmployee) {
            this.getEmployees('where="type":"' + this.transaction.type.requestEmployee._id + '"');
          }
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      });
  }

  public getTransactionType(): void {

    this.loading = true;

    this._transactionTypeService.getTransactionType(this.transactionTypeId).subscribe(
      result => {
        if (!result.transactionType) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.transaction.type = result.transactionType;
          this.transactionMovement = this.transaction.type.transactionMovement.toString();
          if (this.transaction.type.fixedOrigin && this.transaction.type.fixedOrigin !== 0) {
            this.transaction.origin = this.transaction.type.fixedOrigin;
          }

          if (this.transaction.type.fixedLetter && this.transaction.type.fixedLetter !== '') {
            this.transaction.letter = this.transaction.type.fixedLetter.toUpperCase();
          }

          this.setValuesForm();

          if (this.transaction.type.transactionMovement === TransactionMovement.Purchase ||
            this.transaction.type.transactionMovement === TransactionMovement.Money) {
            this.getLastTransactionByType(false);
          }

          if (this.transaction.type.requestEmployee) {
            this.getEmployees('where="type":"' + this.transaction.type.requestEmployee._id + '"');
          }

          if (this.transaction.type.cashBoxImpact && !this.transaction.cashBox) {
            this.getOpenCashBox();
          }

          if(this.companyId) {
            this.getCompany();
          }
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      });
  }

  public getCompany(): void {

    this.loading = true;

    this._companyService.getCompany(this.companyId).subscribe(
      result => {
        if (!result.company) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.transaction.company = result.company;
          this.companyName = this.transaction.company.name;
          this.setValuesForm();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      });
  }

  public getOpenCashBox(toSave: boolean = false): void {

    this.loading = true;

    this._cashBoxService.getOpenCashBox(this._userService.getIdentity().employee._id).subscribe(
      result => {
        if (!result.cashBoxes) {
          if (toSave) {
            this.saveTransaction();
          } else {
            this.setValuesForm();
          }
        } else {
          this.transaction.cashBox = result.cashBoxes[0];
          if (toSave) {
            if(!this.transaction._id || this.transaction._id === '') {
              this.saveTransaction();
            } else {
              this.updateTransaction(false);
            }
          } else {
            this.setValuesForm();
            if (this.transaction._id && this.transaction._id !== '') {
              this.updateTransaction(false);
            }
          }
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.transactionForm = this._fb.group({
      'company': [this.companyName, [
          Validators.required
        ]
      ],
      'date': [moment(this.transaction.startDate).format('YYYY-MM-DD'), [
          Validators.required
        ]
      ],
      'letter': [this.transaction.letter, [
          Validators.required
        ]
      ],
      'origin': [this.transaction.origin, [
          Validators.required
        ]
      ],
      'number': [this.transaction.number, [
          Validators.required
        ]
      ],
      'basePrice': [0.00, [
          Validators.required
        ]
      ],
      'exempt': [this.transaction.exempt, [
          Validators.required
        ]
      ],
      'totalPrice': [this.transaction.totalPrice, [
          Validators.required
        ]
      ],
      'observation': [this.transaction.observation, [
        ]
      ],
      'employeeOpening': [this.transaction.employeeOpening, [
        ]
      ],
      'state': [this.transaction.state, [
        ]
      ],
      'VATPeriod': [this.transaction.VATPeriod, [
        ]
      ],
    });

    this.transactionForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public setValuesForm(): void {

    if (!this.transaction.origin) this.transaction.origin = 0;
    if (!this.transaction.letter) this.transaction.letter = "X";
    if (!this.transaction.number) this.transaction.number = 1;
    if (!this.transaction.observation) this.transaction.observation = '';

    let employeeOpening;
    if (!this.transaction.employeeOpening) {
      employeeOpening = null;
    } else {
      if (this.transaction.employeeOpening._id) {
        employeeOpening = this.transaction.employeeOpening._id;
      } else {
        employeeOpening = this.transaction.employeeOpening;
      }
    }

    if (this.transaction.company) {
      this.companyName = this.transaction.company.name;
    }

    this.transactionForm.setValue({
      'company': this.companyName,
      'date': moment(this.transaction.startDate).format('YYYY-MM-DD'),
      'origin': this.transaction.origin,
      'letter': this.transaction.letter,
      'number': this.transaction.number,
      'basePrice': this.transactionForm.value.basePrice,
      'exempt': this.transaction.exempt,
      'totalPrice': this.transaction.totalPrice,
      'observation': this.transaction.observation,
      'employeeOpening': employeeOpening,
      'state': this.transaction.state,
      'VATPeriod': this.transaction.VATPeriod
    });
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

  public changeCompany(): void {
    if (this.transaction._id && this.transaction._id !== '') {
      this.openModal('change-company', this.transaction);
    } else {
      this.activeModal.close('change-company');
    }
  }

  public openModal(
    op: string,
    transaction?: Transaction): void {

    let modalRef;

    switch (op) {
      case 'change-company':
        modalRef = this._modalService.open(ListCompaniesComponent, { size: 'lg' });
        if (transaction.type.transactionMovement === TransactionMovement.Purchase) {
          modalRef.componentInstance.type = CompanyType.Provider;
        } else if (transaction.type.transactionMovement === TransactionMovement.Sale) {
          modalRef.componentInstance.type = CompanyType.Client;
        }
        modalRef.result.then(
          (result) => {
            if (result.company) {
              if (!transaction) {
                transaction = new Transaction();
              }
              transaction.company = result.company;
            }
          }, (reason) => {

          }
        );
        break;
      default:
        break;
    }
  }

  public getEmployees(query: string): void {

    this.loading = true;

    this._employeeService.getEmployees(query).subscribe(
      result => {
        if (!result.employees) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.hideMessage();
          this.loading = false;
          this.employees = result.employees;
          this.transaction.employeeOpening = this.employees[0];
          this.transaction.employeeClosing = this.employees[0];
          this.setValuesForm();
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public addTransactionTaxes(taxes: Taxes[]): void {
    this.taxes = taxes;
    this.updatePrices("taxes");
  }

  public updatePrices(op: string): void {
    switch(op) {
      case "basePrice":
        this.transactionForm.value.totalPrice = this.transactionForm.value.basePrice + this.transactionForm.value.exempt;
        this.updateTaxes();
        break;
      case "exempt":
        this.transactionForm.value.totalPrice = this.transactionForm.value.basePrice + this.transactionForm.value.exempt;
        this.updateTaxes();
        break;
      case "taxes":
        this.updateTaxes();
        break;
      case "totalPrice":
        this.updateTaxes();
        break;
    }

    this.transactionForm.value.basePrice = this.roundNumber.transform(this.transactionForm.value.basePrice);
    this.transactionForm.value.exempt = this.roundNumber.transform(this.transactionForm.value.exempt);
    this.transactionForm.value.totalPrice = this.roundNumber.transform(this.transactionForm.value.totalPrice);

    this.transaction.exempt = this.transactionForm.value.exempt;
    this.transaction.totalPrice = this.transactionForm.value.totalPrice;
    this.transaction.origin = this.transactionForm.value.origin;
    if (this.transactionMovement && (this.transactionMovement !== TransactionMovement.Sale.toString())) {
      this.transaction.letter = this.transactionForm.value.letter;
      this.transaction.number = this.transactionForm.value.number;
    }

    this.transaction.observation = this.transactionForm.value.observation;
    this.setValuesForm();
  }

  public updateTaxes(): void {

    let transactionTaxes: Taxes[] = new Array();

    if (this.taxes && this.taxes.length > 0 && this.transactionForm.value.basePrice !== 0) {
      let transactionTax: Taxes = new Taxes();
      for (let taxesAux of this.taxes) {
        transactionTax.percentage = taxesAux.percentage;
        transactionTax.tax = taxesAux.tax;
        transactionTax.taxBase = this.transactionForm.value.basePrice;
        transactionTax.taxAmount = this.roundNumber.transform((transactionTax.taxBase * taxesAux.percentage / 100));
        this.transactionForm.value.totalPrice += transactionTax.taxAmount;
      }
      transactionTaxes.push(transactionTax);
    }
    this.transactionForm.value.totalPrice += this.transactionForm.value.exempt;
    this.transaction.taxes = transactionTaxes;
  }

  public addTransaction(): void {

    this.transaction.observation = this.transactionForm.value.observation;
    this.transaction.employeeOpening = this.transactionForm.value.employeeOpening;
    this.transaction.employeeClosing = this.transactionForm.value.employeeOpening;

    if ((this.transaction.type.requestEmployee &&
      this.transaction.employeeOpening) ||
      !this.transaction.type.requestEmployee) {

      this.transaction.startDate = this.datePipe.transform(this.transactionForm.value.date + " " + moment().format('HH:mm:ss'), 'YYYY-MM-DDTHH:mm:ssZ', 'YYYY-MM-DD HH:mm:ss');
      this.transaction.endDate = this.datePipe.transform(this.transactionForm.value.date + " " + moment().format('HH:mm:ss'), 'YYYY-MM-DDTHH:mm:ssZ', 'YYYY-MM-DD HH:mm:ss');
      this.transaction.VATPeriod = this.transactionForm.value.VATPeriod;
      this.transaction.expirationDate = this.transaction.endDate;
      this.transaction.origin = this.transactionForm.value.origin;
      this.transaction.letter = this.transactionForm.value.letter;
      this.transaction.number = this.transactionForm.value.number;
      this.transaction.totalPrice = this.transactionForm.value.totalPrice;
      if (this.transaction.type.requestArticles ||
        (this.transaction.totalPrice > 0 &&
        !this.transaction.type.requestArticles)) {
        if (this.transactionForm.value.state) {
          this.transaction.state = this.transactionForm.value.state;
        }

        if (this.transaction._id && this.transaction._id !== '') {
          this.updateTransaction();
        } else {
          if(this.transaction.type.transactionMovement === TransactionMovement.Sale) {
            this.getLastTransactionByType();
          } else {
            this.transaction.number = this.transactionForm.value.number;
            this.saveTransaction();
          }
        }
      } else {
        this.showMessage("El monto ingresado debe ser mayor a 0.", "info", true);
      }
    } else {
      this.showMessage("Debe asignar el empleado " + this.transaction.type.requestEmployee.description, "info", true);
    }
  }

  public getLastTransactionByType(toSave: boolean = true): void {

    this.loading = true;

    this._transactionService.getLastTransactionByTypeAndOrigin(this.transaction.type, this.transaction.origin, this.transaction.letter).subscribe(
      result => {
        if (!result.transactions) {
          this.transaction.number = 1;
        } else {
          this.transaction.number = result.transactions[0].number + 1;
        }
        if (this.transaction.type.cashBoxImpact && !this.transaction.cashBox) {
          this.getOpenCashBox(toSave);
        } else {
          if (toSave) {
            this.saveTransaction();
          } else {
            this.setValuesForm();
          }
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public saveTransaction(): void {

    this.loading = true;
    if (this.posType === "cuentas-corrientes") {
      this.posType = "mostrador";
    }
    this.transaction.madein = this.posType;

    this._transactionService.saveTransaction(this.transaction).subscribe(
      result => {
        if (!result.transaction) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.transaction = result.transaction;
          this.showMessage("La transacción se ha añadido con éxito.", 'success', true);
          this.activeModal.close({ transaction: this.transaction });
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public updateTransaction(close: boolean = true): void {

    this.loading = true;

    this._transactionService.updateTransaction(this.transaction).subscribe(
      result => {
        if (!result.transaction) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.transaction = result.transaction;
          if(close) {
            this.activeModal.close({ transaction: this.transaction });
          }
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
