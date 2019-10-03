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
import { Config } from 'app/app.config';
import { MovementOfCancellationComponent } from '../movement-of-cancellation/movement-of-cancellation.component';
import { MovementOfCancellation } from 'app/models/movement-of-cancellation';
import { MovementOfCancellationService } from 'app/services/movement-of-cancellation.service';
import { CancellationTypeService } from 'app/services/cancellation-type.service';
import { TaxClassification } from 'app/models/tax';

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
  public transaction: Transaction;
  public taxes: Taxes[] = new Array();
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public posType: string;
  public datePipe = new DateFormatPipe();
  public letters: string[] = ["", "A", "B", "C", "E", "M", "R", "T","X"];
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
  public transactionDate: string;
  public userCountry: string;
  public showButtonCancelation: boolean;
  public filtersTaxClassification: TaxClassification[] = [ TaxClassification.Perception, TaxClassification.Withholding ];

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
    public _movementOfCancellationService : MovementOfCancellationService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal,
    public _cashBoxService: CashBoxService,
    public _userService: UserService,
    public _cancellationTypeService: CancellationTypeService,
  ) {
    this.transaction = new Transaction();
    this.transactionDate = this.transaction.startDate;
  }

  ngOnInit(): void {

    this.userCountry = Config.country;
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.posType = pathLocation[2];
    this.buildForm();
    
    if (this.transactionId) {
      this.getTransaction();
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
          this.getCancellationTypes();
          if(this.transaction.endDate) {
            this.transactionDate = this.transaction.endDate;
          } else {
            this.transactionDate = this.transaction.startDate;
          }
          this.transactionMovement = this.transaction.type.transactionMovement.toString();
          this.transaction.totalPrice = this.roundNumber.transform(this.transaction.totalPrice);
          this.transaction.balance = this.roundNumber.transform(this.transaction.balance);
          if(this.transaction.company) {
            this.companyName = this.transaction.company.name;
          }
          this.setValuesForm();
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

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.transactionForm = this._fb.group({
      'company': [this.companyName, [
          Validators.required
        ]
      ],
      'date': [moment(this.transactionDate).format('YYYY-MM-DD'), [
          Validators.required
        ]
      ],
      'letter': [this.transaction.letter, [
        ]
      ],
      'origin': [this.transaction.origin, [
        ]
      ],
      'number': [this.transaction.number, [
          Validators.required
        ]
      ],
      'basePrice': [this.transaction.basePrice, [
        ]
      ],
      'exempt': [this.transaction.exempt, [
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
      'balance': [this.transaction.balance, [
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
    if (!this.transaction.letter) this.transaction.letter = "";
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
      'date': moment(this.transactionDate).format('YYYY-MM-DD'),
      'origin': this.transaction.origin,
      'letter': this.transaction.letter,
      'number': this.transaction.number,
      'basePrice': this.transaction.basePrice,
      'exempt': this.transaction.exempt,
      'totalPrice': this.transaction.totalPrice,
      'observation': this.transaction.observation,
      'employeeOpening': employeeOpening,
      'state': this.transaction.state,
      'VATPeriod': this.transaction.VATPeriod,
      'balance' : this.transaction.balance
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

  public getCancellationTypes() : void {

    this.loading = true;

    this._cancellationTypeService.getCancellationTypes(
      { "destination._id": 1, "operationType" : 1 }, // PROJECT
      { "destination._id": { $oid: this.transaction.type._id} , "operationType": { "$ne": "D" } }, // MATCH
      { order: 1 }, // SORT
      {}, // GROUP
      0, // LIMIT
      0 // SKIP
    ).subscribe(result => {
      if (result && result.cancellationTypes && result.cancellationTypes.length > 0) {
        if(!this.transaction.type.requestArticles) {
          this.showButtonCancelation = true;
        }
      } else {
        this.showButtonCancelation = false;
      }
      this.loading = false;
    },
    error => {
      this.showMessage(error._body, 'danger', false);
      this.showButtonCancelation = false;
      this.loading = false;
    });
  }

  public changeCompany(): void {
    if (this.transaction._id && this.transaction._id !== '') {
      this.openModal('change-company', this.transaction);
    } else {
      this.activeModal.close('change-company');
    }
  }

  public validateBalance(){
    if(this.transactionForm.value.balance > this.transaction.totalPrice){
      this.showMessage("El saldo no puede ser mayor a: $" + this.transaction.totalPrice , 'danger', false);
      this.setValuesForm();
    } 
  }

  async openModal(
    op: string,
    transaction?: Transaction) {

    let modalRef;

    switch (op) {
      case 'list-cancellations':
        modalRef = this._modalService.open(MovementOfCancellationComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.transactionDestinationId = this.transaction._id;
        modalRef.componentInstance.totalPrice = this.transactionForm.value.totalPrice;
        modalRef.result.then(async (result) => {
          if(result && result.movementsOfCancellations) {
            await this.daleteMovementsOfCancellations('{"transactionDestination":"'+this.transaction._id+'"}').then(
              async movementsOfCancellations => {
                if(movementsOfCancellations) {
                  await this.saveMovementsOfCancellations(result.movementsOfCancellations).then(
                    movementsOfCancellations => {
                      if(movementsOfCancellations) {
                        let balanceTotal = 0;
                        for(let mov of result.movementsOfCancellations) {
                          balanceTotal += mov.balance;
                        }
                        this.transaction.totalPrice = balanceTotal;
                        this.updateTransaction().then(
                          transaction => {
                            if(transaction) {
                              this.transaction = transaction;
                              this.setValuesForm();
                            }
                          }
                        );
                      }
                    }
                  );
                }
              }
            );
          }
        }, (reason) => {
        });
        break;
      case 'change-company':
        modalRef = this._modalService.open(ListCompaniesComponent, { size: 'lg', backdrop: 'static' });
        if (transaction.type.transactionMovement === TransactionMovement.Purchase) {
          modalRef.componentInstance.type = CompanyType.Provider;
        } else if (transaction.type.transactionMovement === TransactionMovement.Sale) {
          modalRef.componentInstance.type = CompanyType.Client;
        }
        modalRef.result.then(
          (result) => {
            if (result.company) {
              transaction.company = result.company;
              this.companyName = transaction.company.name;
              this.setValuesForm();
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

  async addTransaction() {

    this.transaction.observation = this.transactionForm.value.observation;
    this.transaction.balance = this.transactionForm.value.balance;
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
      this.transaction.basePrice = this.transactionForm.value.basePrice;
      this.transaction.totalPrice = this.transactionForm.value.totalPrice;
      if (this.transaction.type.requestArticles ||
        (this.transaction.totalPrice > 0 &&
        !this.transaction.type.requestArticles) || 
        (this.transaction.totalPrice === 0 &&
        !this.transaction.type.requestArticles &&
        this.transaction.type.allowZero)) {
        if (this.transactionForm.value.state) {
          this.transaction.state = this.transactionForm.value.state;
        }

        await this.updateTransaction().then(
          transaction => {
            if(transaction) {
              this.transaction = transaction;
              this.activeModal.close({ transaction: this.transaction });
            }
          }
        );
      } else {
        this.showMessage("El importe total ingresado debe ser mayor a 0.", "info", true);
      }
    } else {
      this.showMessage("Debe asignar el empleado " + this.transaction.type.requestEmployee.description, "info", true);
    }
  }

  public addTransactionTaxes(taxes: Taxes[]): void {
    this.taxes = taxes;
    this.updatePrices("taxes");
  }

  public updatePrices(op: string): void {
    switch(op) {
      case "basePrice":
        this.updateTaxes();
        break;
      case "exempt":
        this.updateTaxes();
        break;
      case "taxes":
        this.updateTaxes();
        break;
      case "totalPrice":
        this.updateTaxes();
        break;
    }

    this.transaction.basePrice = this.roundNumber.transform(this.transactionForm.value.basePrice);
    this.transaction.exempt = this.roundNumber.transform(this.transactionForm.value.exempt);
    this.transaction.totalPrice = this.roundNumber.transform(this.transactionForm.value.totalPrice);
    this.transaction.origin = this.transactionForm.value.origin;
    if (this.transactionMovement && (this.transactionMovement !== TransactionMovement.Sale.toString())) {
      this.transaction.letter = this.transactionForm.value.letter;
      this.transaction.number = this.transactionForm.value.number;
    }
    
    this.transactionDate = this.transactionForm.value.date;

    this.transaction.observation = this.transactionForm.value.observation;
    this.setValuesForm();
  }

  public updateTaxes(): void {

    let transactionTaxes: Taxes[] = new Array();

    if(this.transactionForm.value.exempt > 0 && this.transactionForm.value.basePrice > 0) {
      this.transactionForm.value.totalPrice = this.transactionForm.value.exempt + this.transactionForm.value.basePrice;
    }

    if (this.taxes && this.taxes.length > 0 && this.transaction.basePrice !== 0) {
      for (let taxesAux of this.taxes) {
        let transactionTax: Taxes = new Taxes();
        transactionTax.percentage = taxesAux.percentage;
        transactionTax.tax = taxesAux.tax;
        transactionTax.taxBase = this.transaction.basePrice;
        if(transactionTax.percentage && transactionTax.percentage !== 0) {
          transactionTax.taxAmount = this.roundNumber.transform((transactionTax.taxBase * transactionTax.percentage / 100));
        } else {
          transactionTax.taxAmount = taxesAux.taxAmount;
        }
        this.transactionForm.value.totalPrice += transactionTax.taxAmount;
        transactionTaxes.push(transactionTax);
      }
    }
    this.transaction.taxes = transactionTaxes;
  }

  public updateTransaction(): Promise<Transaction> {

    return new Promise<Transaction>((resolve, reject) => {
      this._transactionService.updateTransaction(this.transaction).subscribe(
        result => {
          if (!result.transaction) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.transaction);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public saveMovementsOfCancellations(movementsOfCancellations: MovementOfCancellation[]): Promise<MovementOfCancellation[]> {

    return new Promise<MovementOfCancellation[]>((resolve, reject) => {
    
      this._movementOfCancellationService.saveMovementsOfCancellations(movementsOfCancellations).subscribe(
        async result => {
          if (!result.movementsOfCancellations) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.movementsOfCancellations);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public daleteMovementsOfCancellations(query: string): Promise<boolean> {

    return new Promise((resolve, reject) => {

      this._movementOfCancellationService.deleteMovementsOfCancellations(query).subscribe(
        async result => {
          if (!result.movementsOfCancellations) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.movementsOfCancellations);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
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
