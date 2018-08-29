import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

//Paquetes de terceros
import { NgbAlertConfig, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

//Modelos
import { CashBox, CashBoxState } from './../../models/cash-box';
import { PaymentMethod } from './../../models/payment-method';
import { Transaction, TransactionState } from './../../models/transaction';
import { MovementOfCash, MovementOfCashState } from './../../models/movement-of-cash';

//Servicios
import { PaymentMethodService } from './../../services/payment-method.service';
import { MovementOfCashService } from '../../services/movement-of-cash.service';
import { CashBoxService } from '../../services/cash-box.service';
import { UserService } from '../../services/user.service';
import { TransactionService } from '../../services/transaction.service';
import { TransactionTypeService } from '../../services/transaction-type.service';

//Componentes
import { DeleteMovementOfCashComponent } from './../delete-movement-of-cash/delete-movement-of-cash.component';
import { PrintComponent } from './../../components/print/print.component';

@Component({
  selector: 'app-cash-box',
  templateUrl: './cash-box.component.html',
  styleUrls: ['./cash-box.component.css']
})

export class CashBoxComponent implements OnInit {

  public cashBoxForm: FormGroup;
  public paymentMethods: PaymentMethod[];
  public transaction: Transaction;
  public cashBox: CashBox;
  public movementOfCash: MovementOfCash;
  public loading: boolean = false;
  public posType: string;
  public userType: string;
  public alertMessage: string = "";
  public movementsOfCashes: MovementOfCash[];
  public focusEvent = new EventEmitter<boolean>();
  public op: string; // valores posibles open - close
  
  constructor(
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal,
    public _paymentMethodService: PaymentMethodService,
    public _movementOfCashService: MovementOfCashService,
    public _cashBoxService: CashBoxService,
    public _userService: UserService,
    public _transactionService: TransactionService,
    public _transactionTypeService: TransactionTypeService
  ) { 
    this.paymentMethods = new Array();
    this.cashBox = new CashBox();
    this.transaction = new Transaction();
    this.movementOfCash = new MovementOfCash();
  }

  ngOnInit() {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.posType = pathLocation[2];
    this.buildForm();
    this.getOpenCashBox();
    this.getPaymentMethods();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public formErrors = {
    'paymentMethod': '',
    'amount': '',
  };

  public validationMessages = {
    'paymentMethod': {
      'required': 'Este campo es requerido.'
    },
    'amount': {
    }
  };

  public buildForm(): void {

    this.cashBoxForm = this._fb.group({
      'paymentMethod': [null, [
          Validators.required
        ]
      ],
      'amount': [0, [
        ]
      ],
    });

    this.cashBoxForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {

    if (!this.cashBoxForm) { return; }
    const form = this.cashBoxForm;

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

  public setValueForm(): void {

    let paymentMethod = this.cashBoxForm.value.paymentMethod;

    if (!paymentMethod && 
        this.paymentMethods &&
        this.paymentMethods.length > 0) paymentMethod = this.paymentMethods[0];

    let values = {
      'paymentMethod': paymentMethod,
      'amount': 0,
    };

    this.cashBoxForm.setValue(values);
  }

  public getOpenCashBox(): void {

    this.loading = true;
    
    this._cashBoxService.getOpenCashBox(this._userService.getIdentity().employee._id).subscribe(
      result => {
        if (!result.cashBoxes) {
          if(this.op === "open") {
            this.cashBox.employee = this._userService.getIdentity().employee;
          } else if (this.op === "close") {
            this.showMessage("No se encuentran cajas abiertas.", "info", true);
          }
        } else {
          this.cashBox = result.cashBoxes[0];
          if (this.op === "open") {
            this.showMessage("La caja ya se encuentra abierta.", "info", true);
          } else if (this.op === "close") {
            this.getTransactionTypeCashClosing();
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

  public saveCashBox(close?: boolean): void {

    this.loading = true;

    this._cashBoxService.saveCashBox(this.cashBox).subscribe(
      result => {
        if (!result.cashBox) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.cashBox = result.cashBox;
          if (this.cashBoxForm.value.amount && this.cashBoxForm.value.amount > 0) {
            this.getTransactionTypeCashOpening();
          } else {
            this.activeModal.close({ cashBox: this.cashBox });
          }
        }
        this.loading = false;
      },
      error => {
        error => {
          this.showMessage(error._body, "danger", true);
          this.loading = false;
        }
      }
    );
  }

  public getTransactionTypeCashOpening(): void {

    this.loading = true;

    let query = 'where="cashOpening":true';

    this._transactionTypeService.getTransactionTypes(query).subscribe(
      result => {
        if (!result.transactionTypes) {
          this.showMessage("Debe configurar un tipo de transacción como apertura de caja", "info", true);
        } else {
          this.hideMessage();
          let transactionType = result.transactionTypes[0];
          this.transaction.type = transactionType;
          if (transactionType.fixedOrigin) {
            this.transaction.origin = transactionType.fixedOrigin;
          } else {
            this.transaction.origin = 0;
          }
          if (transactionType.fixedLetter) {
            this.transaction.letter = transactionType.fixedLetter;
          } else {
            this.transaction.letter = "X";
          }
          this.loading = false;
          this.getLastTransactionByType();
        }
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public openCashBox(): void {
    
    if(!this.cashBox || !this.cashBox._id) {
      this.saveCashBox();
    } else {
      if(this.transaction._id) {
        this.activeModal.close({ cashBox: this.cashBox });
      } else {
        this.activeModal.close();
      }
    }
  }

  public closeCashBox(): void {

    if (this.cashBox && this.cashBox._id) {
      if(this.cashBox.state === CashBoxState.Closed) {
        this.openModal("print");
      } else {
        this.getOpenTransactionsByCashBox(true);
      }
    } else {
      this.activeModal.close();
    }
  }

  public updateCashBox(close?: boolean): void {

    this.loading = true;
    this.cashBox.closingDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    this.cashBox.state = CashBoxState.Closed;

    this._cashBoxService.updateCashBox(this.cashBox).subscribe(
      result => {
        if (!result.cashBox) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          this.cashBox = result.cashBox;
          if(close) {
            this.openModal("print");
          } else {
            this.getMovementOfCashesByTransaction();

          }
        }
        this.loading = false;
      },
      error => {
        error => {
          this.showMessage(error._body, "danger", true);
          this.loading = false;
        }
      }
    );
  }

  public openModal(op: string, movement?: MovementOfCash): void {

    let modalRef;
    
    switch (op) {
      case 'print':
        let modalRef = this._modalService.open(PrintComponent);
        modalRef.componentInstance.cashBox = this.cashBox;
        modalRef.componentInstance.typePrint = 'cash-box';
        modalRef.result.then((result) => {
          this.activeModal.close({ cashBox: this.cashBox });
        }, (reason) => {
          this.activeModal.close({ cashBox: this.cashBox });
        });
        break;
      case 'delete':
        modalRef = this._modalService.open(DeleteMovementOfCashComponent, { size: 'lg' });
        modalRef.componentInstance.movementOfCash = movement;
        modalRef.result.then((result) => {
          if (result === 'delete_close') {
            this.getMovementOfCashesByTransaction();
          }
        }, (reason) => {

        });
        break;
      default: ;
    }
  };

  public getPaymentMethods(): void {

    this.loading = true;

    this._paymentMethodService.getPaymentMethods().subscribe(
      result => {
        if (!result.paymentMethods) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          this.paymentMethods = result.paymentMethods;
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

  public addMovementOfCash(transaction): void {

    this.movementOfCash.amountPaid = this.cashBoxForm.value.amount;
    this.movementOfCash.type = this.cashBoxForm.value.paymentMethod;
    this.movementOfCash.state = MovementOfCashState.Closed;
    
    if(this.cashBox && this.cashBox._id) {
      if(this.op === "open" && (!this.transaction || !this.transaction._id)) {
        this.showMessage("La caja ya se encuentra abierta.", "info", true);
      } else if (this.op === "close") {
        if (!this.transaction || !this.transaction._id) {
          this.getLastTransactionByType();
        } else {
          this.saveMovementOfCash();
        }
      } else {
        this.saveMovementOfCash();
      }
    } else {
      if(this.op === "open") {
        this.saveCashBox();
      } else if (this.op === "close") {
        this.showMessage("No se encuentran cajas abiertas.", "info", true);
      }
    }
  }

  public getTransactionTypeCashClosing(): void {

    this.loading = true;

    let query = 'where="cashClosing":true';

    this._transactionTypeService.getTransactionTypes(query).subscribe(
      result => {
        if (!result.transactionTypes) {
          this.showMessage("Debe configurar un tipo de transacción como cierre de caja", "info", true);
          this.loading = false;
        } else {
          this.hideMessage();
          this.loading = false;
          let transactionType = result.transactionTypes[0];
          this.transaction.type = transactionType;
          if (transactionType.fixedOrigin) {
            this.transaction.origin = transactionType.fixedOrigin;
          } else {
            this.transaction.origin = 0;
          }
          if (transactionType.fixedLetter) {
            this.transaction.letter = transactionType.fixedLetter;
          } else {
            this.transaction.letter = "X";
          }
          this.getOpenTransactionsByCashBox();
        }
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getOpenTransactionsByCashBox(close?: boolean): void {

    this.loading = true;

    this._transactionService.getOpenTransactionsByCashBox(this.cashBox._id).subscribe(
      result => {
        console.log(result);
        if (!result.transactions) {
          if(close) {
            this.updateCashBox(true);
          } else {
            this.getTransactionsByTypeAndCashBox();
          }
        } else {
          this.showMessage("No puede cerrar la caja con transacciones abiertas.", "info", true);
        }
        this.loading = false;
      },
      error => {
        console.log(error);
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getTransactionsByTypeAndCashBox(): void {

    this.loading = true;

    let query: string = 'where="type":"' + this.transaction.type._id + '","cashBox":"' + this.cashBox._id + '"';

    this._transactionService.getTransactions(query).subscribe(
      result => {
        if (!result.transactions) {
        } else {
          this.transaction = result.transactions[0];
          this.getMovementOfCashesByTransaction();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
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
        this.loading = false;
        this.addTransaction();
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public addTransaction(): void {

    this.loading = true;
    this.transaction.madein = this.posType;
    this.transaction.totalPrice = this.cashBoxForm.value.amount;
    this.transaction.state = TransactionState.Closed;
    this.transaction.endDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    this.transaction.expirationDate = this.transaction.endDate;
    this.transaction.cashBox = this.cashBox;

    this._transactionService.saveTransaction(this.transaction).subscribe(
      result => {
        if (!result.transaction) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          this.hideMessage();
          this.transaction = result.transaction;
          this.saveMovementOfCash();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public saveMovementOfCash(): void {

    this.loading = true;

    this.movementOfCash.transaction = this.transaction;

    this._movementOfCashService.saveMovementOfCash(this.movementOfCash).subscribe(
      result => {
        if (!result.movementOfCash) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          if(this.op === "close") {
            this.updateCashBox();
          } else {
            this.getMovementOfCashesByTransaction();
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

  public getMovementOfCashesByTransaction(): void {

    this.loading = true;

    this._movementOfCashService.getMovementOfCashesByTransaction(this.transaction._id).subscribe(
      result => {
        if (!result.movementsOfCashes) {
          this.movementsOfCashes = new Array();
        } else {
          this.movementsOfCashes = result.movementsOfCashes;
          let totalPrice = 0;
          for(let movementOfCash of this.movementsOfCashes) {
            totalPrice += movementOfCash.amountPaid;
          }
          this.updateTransaction();
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

  public updateTransaction(): void {

    this.loading = true;

    this._transactionService.updateTransaction(this.transaction).subscribe(
      result => {
        if (!result.transaction) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          this.transaction = result.transaction;
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
