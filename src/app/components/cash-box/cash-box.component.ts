import { Component, OnInit, EventEmitter, Input } from '@angular/core';
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
import { TransactionType } from 'app/models/transaction-type';

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
  public alertMessage: string = '';
  public movementsOfCashes: MovementOfCash[];
  public focusEvent = new EventEmitter<boolean>();
  @Input() transactionType: TransactionType;

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
    this.transaction.type = this.transactionType;
    this.movementOfCash = new MovementOfCash();
    this.movementsOfCashes = new Array();
  }

  ngOnInit() {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.posType = pathLocation[2];
    this.buildForm();
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
          if (this.transactionType.cashOpening) {
            this.cashBox.employee = this._userService.getIdentity().employee;
          } else if (this.transactionType.cashClosing) {
            this.showMessage("No se encuentran cajas abiertas.", 'info', true);
          }
        } else {
          this.cashBox = result.cashBoxes[0];
          if (this.transactionType.cashOpening) {
            this.showMessage("La caja ya se encuentra abierta.", 'info', true);
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

  public saveCashBox(): void {

    this.loading = true;

    this._cashBoxService.saveCashBox(this.cashBox).subscribe(
      result => {
        if (!result.cashBox) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.cashBox = result.cashBox;
          if (this.cashBoxForm.value.amount && this.cashBoxForm.value.amount > 0) {
            if (this.transactionType.fixedOrigin) {
              this.transaction.origin = this.transactionType.fixedOrigin;
            } else {
              this.transaction.origin = 0;
            }
            if (this.transactionType.fixedLetter) {
              this.transaction.letter = this.transactionType.fixedLetter;
            } else {
              this.transaction.letter = "X";
            }
            this.getLastTransactionByType();
          } else {
            this.activeModal.close({ cashBox: this.cashBox });
          }
        }
        this.loading = false;
      },
      error => {
        error => {
          this.showMessage(error._body, 'danger', true);
          this.loading = false;
        }
      }
    );
  }

  public openCashBox(): void {

    if (!this.cashBox || !this.cashBox._id) {
      this.saveCashBox();
    } else {
      this.showMessage("La caja ya se encuentra abierta.", 'info', true);
    }
  }

  public closeCashBox(): void {

    if (this.cashBox && this.cashBox._id) {
      if (this.cashBox.state === CashBoxState.Closed) {
        this.openModal("print");
      } else {
        this.getOpenTransactionsByCashBox();
      }
    } else {
      this.showMessage("No se encuentran cajas abiertas.", 'info', true);
    }
  }

  public updateCashBox(): void {

    this.loading = true;
    this.cashBox.closingDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    this.cashBox.state = CashBoxState.Closed;

    this._cashBoxService.updateCashBox(this.cashBox).subscribe(
      result => {
        if (!result.cashBox) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.cashBox = result.cashBox;
          this.openModal("print");
        }
        this.loading = false;
      },
      error => {
        error => {
          this.showMessage(error._body, 'danger', true);
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
        let del = -1;
        for (let i = 0; i < this.movementsOfCashes.length; i ++) {
          if(this.movementsOfCashes[i]._id === movement._id) {
            del = i;
          }
        }
        this.movementsOfCashes.splice(del, 1);
        break;
      default: ;
    }
  };

  public getPaymentMethods(): void {

    this.loading = true;

    this._paymentMethodService.getPaymentMethods().subscribe(
      result => {
        if (!result.paymentMethods) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.paymentMethods = result.paymentMethods;
          this.setValueForm();
          this.getOpenCashBox();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public addMovementOfCash(): void {

    this.movementOfCash.type = this.cashBoxForm.value.paymentMethod;
    if(!this.movementOfCash.type.isCurrentAccount) {
      this.movementOfCash.amountPaid = this.cashBoxForm.value.amount;
      this.movementOfCash.state = MovementOfCashState.Closed;
      let mov = new MovementOfCash();
      mov.date = this.movementOfCash.date;
      mov.quota = this.movementOfCash.quota;
      mov.expirationDate = this.movementOfCash.expirationDate;
      mov.discount = this.movementOfCash.discount;
      mov.surcharge = this.movementOfCash.surcharge;
      mov.state = this.movementOfCash.state;
      mov.amountPaid = this.movementOfCash.amountPaid;
      mov.observation = this.movementOfCash.observation;
      mov.type = this.movementOfCash.type;
      mov.transaction = this.movementOfCash.transaction;
      mov.receiver = this.movementOfCash.receiver;
      mov.number = this.movementOfCash.number;
      mov.bank = this.movementOfCash.bank;
      mov.titular = this.movementOfCash.titular;
      mov.CUIT = this.movementOfCash.CUIT;
      mov.deliveredBy = this.movementOfCash.deliveredBy;
      this.movementsOfCashes.push(mov);
    } else {
      this.showMessage('El método de pago ' + this.movementOfCash.type.name + ' no esta permitido para realizar esta acción', 'info', true);
    }
  }

  public getOpenTransactionsByCashBox(): void {

    this.loading = true;

    this._transactionService.getOpenTransactionsByCashBox(this.cashBox._id).subscribe(
      result => {
        if (!result.transactions) {
          this.getLastTransactionByType();
        } else {
          this.showMessage("No puede cerrar la caja con transacciones abiertas.", 'info', true);
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getLastTransactionByType(): void {

    this.loading = true;

    this._transactionService.getLastTransactionByTypeAndOrigin(this.transactionType, this.transaction.origin, this.transaction.letter).subscribe(
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
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public addTransaction(): void {

    this.loading = true;
    this.transaction.madein = this.posType;
    this.transaction.totalPrice = 0;
    if (this.movementsOfCashes.length > 0) {

      for (let mov of this.movementsOfCashes) {
        this.transaction.totalPrice += mov.amountPaid;
      }
      this.transaction.state = TransactionState.Closed;
      this.transaction.endDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
      this.transaction.VATPeriod = moment().format('YYYYMM');
      this.transaction.expirationDate = this.transaction.endDate;
      this.transaction.cashBox = this.cashBox;
      this.transaction.type = this.transactionType;

      this._transactionService.saveTransaction(this.transaction).subscribe(
        result => {
          if (!result.transaction) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          } else {
            this.hideMessage();
            this.transaction = result.transaction;
            for (let movementOfCash of this.movementsOfCashes) {
              movementOfCash.transaction = this.transaction;
            }
            this.saveMovementsOfCashes();
          }
          this.loading = false;
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
    } else {
      if (this.transactionType.cashOpening) {
        this.activeModal.close({ cashBox: this.cashBox });
      } else {
        this.updateCashBox();
      }
    }
  }

  public saveMovementsOfCashes(): void {

    this.loading = true;

    this._movementOfCashService.saveMovementsOfCashes(this.movementsOfCashes).subscribe(
      result => {
        if (!result.movementsOfCashes) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          if(this.transactionType.cashOpening) {
            this.activeModal.close({ cashBox: this.cashBox });
          } else {
            this.updateCashBox();
          }
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public updateTransaction(): void {

    this.loading = true;

    this._transactionService.updateTransaction(this.transaction).subscribe(
      result => {
        if (!result.transaction) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.transaction = result.transaction;
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
