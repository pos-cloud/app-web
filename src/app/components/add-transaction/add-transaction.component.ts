//Paquetes de Angular
import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

//Paquetes de terceros
import { NgbAlertConfig, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

//Modelos
import { Transaction } from './../../models/transaction';
import { TransactionMovement } from './../../models/transaction-type';
import { Company } from './../../models/company';
import { Taxes } from '../../models/taxes';

//Services
import { TransactionService } from './../../services/transaction.service';
import { TransactionTypeService } from './../../services/transaction-type.service';
import { CompanyService } from './../../services/company.service';

//Pipes
import { DateFormatPipe } from './../../pipes/date-format.pipe';
import { RoundNumberPipe } from './../../pipes/round-number.pipe';

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
  public taxes: Taxes[] = new Array();
  public alertMessage: string = "";
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public posType: string;
  public datePipe = new DateFormatPipe();
  public letters: string[] = ["A", "B", "C", "E", "M", "R", "T","X"];
  public roundNumber = new RoundNumberPipe();
  public transactionMovement: string;
  public readonly: boolean = false;

  public formErrors = {
    'date': '',
    'origin': '',
    'letter': '',
    'number': '',
    'basePrice': '',
    'exempt': '',
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
    'letter': {
      'required': 'Este campo es requerido.'
    },
    'number': {
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

    this.transactionMovement = this.transaction.type.transactionMovement.toString();

    if (!this.transaction._id || this.transaction._id === "") {
      this.readonly = false;
      if (this.transaction.type.fixedOrigin && this.transaction.type.fixedOrigin !== 0) {
        this.transaction.origin = this.transaction.type.fixedOrigin;
      }
  
      if (this.transaction.type.fixedLetter && this.transaction.type.fixedLetter !== "") {
        this.transaction.letter = this.transaction.type.fixedLetter.toUpperCase();
      }
    } else {
      this.readonly = true;
    }
    
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public setValuesForm(): void {
    
    if (!this.transaction.origin) this.transaction.origin = 0;
    if (!this.transaction.letter) this.transaction.letter = "X";     
    if(!this.transaction.number) this.transaction.number = 1;     
    if(!this.transaction.observation) this.transaction.observation = ""; 

    this.transactionForm.setValue({
      'company': this.transaction.company.name,
      'date': moment(this.transaction.startDate).format('YYYY-MM-DD'),
      'origin': this.transaction.origin,
      'letter': this.transaction.letter,
      'number': this.transaction.number,
      'basePrice': this.transactionForm.value.basePrice,
      'exempt': this.transaction.exempt,
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
    if(this.transactionMovement && (this.transactionMovement !== TransactionMovement.Sale.toString())) {
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
        transactionTax.percentage = this.roundNumber.transform(taxesAux.percentage);
        transactionTax.tax = taxesAux.tax;
        transactionTax.taxBase = this.roundNumber.transform(this.transactionForm.value.basePrice);
        transactionTax.taxAmount = this.roundNumber.transform(transactionTax.taxBase * taxesAux.percentage / 100);
        this.transactionForm.value.totalPrice += transactionTax.taxAmount;
      }
      transactionTaxes.push(transactionTax);
    }
    this.transactionForm.value.totalPrice += this.transactionForm.value.exempt;
    this.transaction.taxes = transactionTaxes;
  }

  public addTransaction(): void {
    
    this.transaction.observation = this.transactionForm.value.observation;
    
    if(!this.readonly) {
      
      this.transaction.startDate = this.datePipe.transform(this.transactionForm.value.date + " " + moment().format('HH:mm:ss'), 'YYYY-MM-DDTHH:mm:ssZ', 'YYYY-MM-DD HH:mm:ss');
      this.transaction.endDate = this.datePipe.transform(this.transactionForm.value.date + " " + moment().format('HH:mm:ss'), 'YYYY-MM-DDTHH:mm:ssZ', 'YYYY-MM-DD HH:mm:ss');
      this.transaction.expirationDate = this.transaction.endDate;
      this.transaction.origin = this.transactionForm.value.origin;
      if (this.transaction.type.fixedLetter && this.transaction.type.fixedLetter !== "") {
        this.transaction.letter = this.transaction.type.fixedLetter.toUpperCase();
      } else {
        if (this.transaction.type.transactionMovement === TransactionMovement.Sale) {
          if( this.transaction.company && 
              this.transaction.company.vatCondition && 
              this.transaction.company.vatCondition.transactionLetter &&
              this.transaction.company.vatCondition.transactionLetter !== "") {
            this.transaction.letter = this.transaction.company.vatCondition.transactionLetter;
          } else {
            this.transaction.letter = "X";
          }
        } else {
          this.transaction.letter = this.transactionForm.value.letter;
        }
      }
      this.transaction.totalPrice = this.transactionForm.value.totalPrice;
      this.getLastTransactionByType();
    } else {
      this.updateTransaction();
    }
  }

  public getLastTransactionByType(): void {

    this.loading = true;

    this._transactionService.getLastTransactionByTypeAndOrigin(this.transaction.type, this.transaction.origin, this.transaction.letter).subscribe(
      result => {
        if (!result.transactions) {
          this.transaction.number = 1;
        } else {
          this.transaction.number = result.transactions[0].number + 1;
        }
        this.saveTransaction();
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
          this.activeModal.close({ transaction: this.transaction });
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
          this.activeModal.close({ transaction: this.transaction });
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