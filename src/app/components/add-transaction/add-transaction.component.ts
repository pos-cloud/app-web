//Paquetes de Angular
import { Component, OnInit, EventEmitter, Input, transition } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

//Paquetes de terceros
import { NgbAlertConfig, NgbActiveModal, NgbAlertModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

//Modelos
import { Transaction, TransactionState } from './../../models/transaction';
import { TransactionType } from './../../models/transaction-type';
import { Company } from './../../models/company';

//Services
import { TransactionService } from './../../services/transaction.service';
import { TransactionTypeService } from './../../services/transaction-type.service';
import { CompanyService } from './../../services/company.service';

//Pipes
import { DateFormatPipe } from './../../pipes/date-format.pipe';

@Component({
  selector: 'app-add-transaction',
  templateUrl: './add-transaction.component.html',
  styleUrls: ['./add-transaction.component.css'],
  providers: [NgbAlertConfig, DateFormatPipe]
})

export class AddTransactionComponent implements OnInit {

  public transactionForm: FormGroup;
  public companies: Company[];
  @Input() transaction: Transaction;
  public alertMessage: string = "";
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public posType: string;
  public datePipe = new DateFormatPipe();

  public formErrors = {
    'date': '',
    'origin': '',
    'number': '',
    'amount': '',
    'paymentMethod': '',
    'totalPrice': '',
    'company': ''
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
    public _transactionService: TransactionService,
    public _transactionTypeService: TransactionTypeService,
    public _companyService: CompanyService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal
  ) { 
    
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.posType = pathLocation[2];
    
    if (this.transaction.type.fixedOrigin && this.transaction.type.fixedOrigin !== 0) {
      this.transaction.origin = this.transaction.type.fixedOrigin;
    }
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public setValueForm(): void {
    
    if(!this.transaction.origin) this.transaction.origin = 0;
    if(!this.transaction.number) this.transaction.number = 1;     
    if(!this.transaction.observation) this.transaction.observation = ""; 

    this.transactionForm.setValue({
      'company': this.transaction.company.name,
      'date': moment(this.transaction.startDate).format('YYYY-MM-DD'),
      'origin': this.transaction.origin,
      'number': this.transaction.number,
      'totalPrice': this.transaction.totalPrice,
      'observation': this.transaction.observation
    });
  }

  public buildForm(): void {
    
    this.transactionForm = this._fb.group({
      'company': [this.transaction.company.name, [
          Validators.required
        ]
      ],
      'date': [moment(this.transaction.startDate).format('YYYY-MM-DD'), [
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
      'totalPrice': [this.transaction.totalPrice, [
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
    
    this.transaction.startDate = this.datePipe.transform(this.transactionForm.value.date + " " + moment().format('HH:mm:ss'), 'YYYY-MM-DDTHH:mm:ssZ', 'YYYY-MM-DD HH:mm:ss');
    this.transaction.endDate = this.datePipe.transform(this.transactionForm.value.date + " " + moment().format('HH:mm:ss'), 'YYYY-MM-DDTHH:mm:ssZ', 'YYYY-MM-DD HH:mm:ss');
    this.transaction.origin = this.transactionForm.value.origin;
    
    if (this.transaction.type.fixedLetter && this.transaction.type.fixedLetter !== "") {
      this.transaction.letter = this.transaction.type.fixedLetter;
    } else {
      this.transaction.letter = this.transaction.company.vatCondition.transactionLetter;
    }
    this.transaction.totalPrice = this.transactionForm.value.totalPrice;
    this.transaction.observation = this.transactionForm.value.observation;

    this.getLastTransactionByType();
  }

  public getLastTransactionByType(): void {

    this.loading = true;

    this._transactionService.getLastTransactionByTypeAndOrigin(this.transaction.type, this.transaction.origin, this.transaction.letter).subscribe(
      result => {
        if (!result.transactions) {
          this.transaction.number = 1;
          if(this.transaction.state === TransactionState.Open) {
            this.transaction.state = TransactionState.Pending;
            this.saveTransaction();
          } else {
            this.updateTransaction();
          }
        } else {
          this.transaction.number = result.transactions[0].number + 1;
          if(this.transaction.state === TransactionState.Open) {
            this.transaction.state = TransactionState.Pending;
            this.saveTransaction();
          } else {
            this.updateTransaction();
          }
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public saveTransaction(): void {

    this.loading = true;
    if(this.posType === "cuentas-corrientes") {
      this.posType = "mostrador";
    }
    this.transaction.madein = this.posType;
    
    this._transactionService.saveTransaction(this.transaction).subscribe(
      result => {
        if (!result.transaction) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          this.transaction = result.transaction;
          this.showMessage("La transacción se ha añadido con éxito.", "success", true);
          this.activeModal.close(this.transaction);
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }
  
  public updateTransaction(): void {
    
    this.loading = true;
    
    this._transactionService.updateTransaction(this.transaction).subscribe(
      result => {
        if (!result.transaction) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          this.transaction = result.transaction;
          this.showMessage("La transacción se ha actualizado con éxito.", "success", true);
          this.activeModal.close(this.transaction);
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