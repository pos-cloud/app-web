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
import { MovementOfCash, StatusCheck } from './../../models/movement-of-cash';

//Servicios
import { PaymentMethodService } from './../../services/payment-method.service';
import { MovementOfCashService } from '../../services/movement-of-cash.service';
import { CashBoxService } from '../../services/cash-box.service';
import { AuthService } from 'app/services/auth.service';
import { TransactionService } from '../../services/transaction.service';
import { TransactionTypeService } from '../../services/transaction-type.service';

//Componentes
import { PrintComponent } from './../../components/print/print.component';
import { TransactionType } from 'app/models/transaction-type';
import { Config } from 'app/app.config';

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
    public _authService: AuthService,
    public _transactionService: TransactionService,
    public _transactionTypeService: TransactionTypeService
  ) {
    this.paymentMethods = new Array();
    this.cashBox = new CashBox();
    this.movementOfCash = new MovementOfCash();
    this.movementsOfCashes = new Array();
    this.transaction = new Transaction();
  }

  async ngOnInit() {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.posType = pathLocation[2];
    this.transaction.type = this.transactionType;
    this.buildForm();
    await this.getPaymentMethods('where="cashBoxImpact":true').then(
      async paymentMethods => {
        if(paymentMethods) {
          this.paymentMethods = paymentMethods;
          this.setValueForm();
          await this.getCashBoxes('where="state":"' + CashBoxState.Open + '"&sort="number":-1&limit=1').then(
            cashBoxes => {
              if(cashBoxes) {
                this.cashBox = cashBoxes[0];
                if (this.transactionType.cashOpening) {
                  this.showMessage("La caja ya se encuentra abierta.", 'info', true);
                }
              } else {
                if (this.transactionType.cashOpening) {
                  this._authService.getIdentity.subscribe(
                    identity => {
                      this.cashBox.employee = identity.employee;
                    }
                  );
                } else if (this.transactionType.cashClosing) {
                  this.showMessage("No se encuentran cajas abiertas.", 'info', true);
                }
              }
            }
          );
        }
      }
    );
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

  public getCashBoxes(query?: string): Promise<CashBox[]> {

    return new Promise<CashBox[]>((resolve, reject) => {
    
      this._cashBoxService.getCashBoxes(query).subscribe(
        result => {
          if (!result.cashBoxes) {
            resolve(null);
          } else {
            resolve(result.cashBoxes);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public saveCashBox(): Promise<CashBox> {

    return new Promise<CashBox>((resolve, reject) => {
      this._cashBoxService.saveCashBox(this.cashBox).subscribe(
        result => {
          if (!result.cashBox) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.cashBox);
          }
        },
        error => {
          error => {
            this.showMessage(error._body, 'danger', true);
            resolve(null);
          }
        }
      );
    });
  }

  async openCashBox() {

    if (!this.cashBox || !this.cashBox._id) {
      await this.getCashBoxes('sort="number":-1&limit=1').then(
        async cashBoxes => {
          if(cashBoxes) {
            this.cashBox.number = cashBoxes[0].number + 1;
          } else {
            this.cashBox.number = 1;
          }
          await this.saveCashBox().then(
            async cashBox => {
              if(cashBox) {
                this.cashBox = cashBox;
                if (this.cashBoxForm.value.amount && this.cashBoxForm.value.amount > 0) {
                  if (this.transactionType.fixedOrigin) {
                    this.transaction.origin = this.transactionType.fixedOrigin;
                  } else {
                    this.transaction.origin = 0;
                  }
                  if (this.transactionType.fixedLetter) {
                    this.transaction.letter = this.transactionType.fixedLetter;
                  } else {
                    if(Config.country === "AR") {
                      this.transaction.letter = "X";
                    } else {
                      this.transaction.letter = "";
                    }
                  }
                  await this.getLastTransactionByType().then(
                    transaction => {
                      if(transaction) {
                        this.transaction.number = transaction.number + 1;
                      } else {
                        this.transaction.number = 1;
                      }
                      this.addTransaction();
                    }
                  );
                } else {
                  this.activeModal.close({ cashBox: this.cashBox });
                }
              }
            }
          );
        }
      );
    } else {
      this.showMessage("La caja ya se encuentra abierta.", 'info', true);
    }
  }

  async closeCashBox() {

    if (this.cashBox && this.cashBox._id) {
      if (this.cashBox.state === CashBoxState.Closed) {
        this.openModal("print");
      } else {
        let query = 'where="$and":[{"state":{"$ne": "' + TransactionState.Closed + '"}},{"state":{"$ne": "' + TransactionState.Canceled + '"}},{"cashBox":"' + this.cashBox._id + '"}]';
        await this.getTransactions(query).then(
          async transactions => {
            if(transactions) {
              this.showMessage("No puede cerrar la caja con transacciones abiertas.", 'info', true);
            } else {
              await this.getLastTransactionByType().then(
                transaction => {
                  if(transaction) {
                    this.transaction.number = transaction.number + 1;
                  } else {
                    this.transaction.number = 1;
                  }
                  this.addTransaction();
                }
              );
            }
          }
        );
      }
    } else {
      this.showMessage("No se encuentran cajas abiertas.", 'info', true);
    }
  }

  public updateCashBox(): Promise<CashBox> {

    return new Promise<CashBox>((resolve, reject) => {
  
      this._cashBoxService.updateCashBox(this.cashBox).subscribe(
        result => {
          if (!result.cashBox) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.cashBox);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', true);
          resolve(null);
        }
      );
    });
  }

  public openModal(op: string, movement?: MovementOfCash): void {

    let modalRef;

    switch (op) {
      case 'print':
        let modalRef = this._modalService.open(PrintComponent);
        modalRef.componentInstance.cashBox = this.cashBox;
        modalRef.componentInstance.typePrint = 'cash-box';
        modalRef.componentInstance.printer = this.transactionType.defectPrinter;
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

  async getPaymentMethods(query?: string): Promise<PaymentMethod[]> {

    return new Promise<PaymentMethod[]>((resolve, reject) => {
  
      this._paymentMethodService.getPaymentMethods(query).subscribe(
        result => {
          if (!result.paymentMethods) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.paymentMethods);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public addMovementOfCash(): void {

    this.movementOfCash.type = this.cashBoxForm.value.paymentMethod;
    if(this.movementOfCash.type.cashBoxImpact) {
      this.movementOfCash.amountPaid = this.cashBoxForm.value.amount;
      //this.movementOfCash.state = MovementOfCashState.Closed;
      let mov = new MovementOfCash();
      mov.date = this.movementOfCash.date;
      mov.quota = this.movementOfCash.quota;
      mov.expirationDate = this.movementOfCash.expirationDate;
      mov.discount = this.movementOfCash.discount;
      mov.surcharge = this.movementOfCash.surcharge;
      //mov.state = this.movementOfCash.state;
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
      this.showMessage('El método de pago ' + this.movementOfCash.type.name + ' no impacta en la caja.', 'info', true);
    }
  }

  public getTransactions(query?: string): Promise<Transaction[]> {

    return new Promise<Transaction[]>((resolve, reject) => {

      this._transactionService.getTransactions(query).subscribe(
        result => {
          if (!result.transactions) {
            resolve(null);
          } else {
            resolve(result.transactions);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public getLastTransactionByType(): Promise<Transaction> {

    return new Promise<Transaction>((resolve, reject) => {
      this._transactionService.getLastTransactionByTypeAndOrigin(this.transaction.type, 0, this.transaction.letter).subscribe(
        result => {
          if (!result.transactions) {
            resolve(null);
          } else {
            resolve(result.transactions[0]);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  async addTransaction() {

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

      await this.saveTransaction().then(
        async transaction => {
          if(transaction) {
            this.transaction = transaction;
            for (let movementOfCash of this.movementsOfCashes) {
              movementOfCash.transaction = this.transaction;
            }
            await this.saveMovementsOfCashes().then(
              async movementsOfCashes => {
                if(movementsOfCashes) {
                  if(this.transactionType.cashOpening) {
                    this.activeModal.close({ cashBox: this.cashBox });
                  } else {
                    this.cashBox.closingDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
                    this.cashBox.state = CashBoxState.Closed;
        
                    await this.updateCashBox().then(
                      cashBox => {
                        if(cashBox) {
                          this.cashBox = cashBox;
                          this.openModal("print");
                        }
                      }
                    );
                  }
                }
              }
            );
          }
        }
      );
    } else {
      if (this.transactionType.cashOpening) {
        this.activeModal.close({ cashBox: this.cashBox });
      } else {

        this.cashBox.closingDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
        this.cashBox.state = CashBoxState.Closed;

        await this.updateCashBox().then(
          cashBox => {
            if(cashBox) {
              this.cashBox = cashBox;
              this.openModal("print");
            }
          }
        );
      }
    }
  }

  public saveTransaction(): Promise<Transaction> {

    return new Promise<Transaction>((resolve, reject) => {

      this.transaction.madein = this.posType;
  
      this._transactionService.saveTransaction(this.transaction).subscribe(
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

  async saveMovementsOfCashes(): Promise<MovementOfCash[]> {

    return new Promise<MovementOfCash[]>((resolve, reject) => {

      this._movementOfCashService.saveMovementsOfCashes(this.movementsOfCashes).subscribe(
        async result => {
          if (!result.movementsOfCashes) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.movementsOfCashes);
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
