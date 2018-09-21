//Paquetes Angular
import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

//Paquetes de terceros
import { NgbAlertConfig, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

//Modelos
import { PaymentMethod } from './../../models/payment-method';
import { MovementOfCash, MovementOfCashState } from './../../models/movement-of-cash';
import { Transaction } from './../../models/transaction';

//Servicios
import { PaymentMethodService } from './../../services/payment-method.service';
import { MovementOfCashService } from './../../services/movement-of-cash.service';
import { DeleteMovementOfCashComponent } from '../delete-movement-of-cash/delete-movement-of-cash.component';
import { TransactionService } from '../../services/transaction.service';
import { MovementOfArticle } from '../../models/movement-of-article';
import { TaxService } from '../../services/tax.service';

//PIPES
import { RoundNumberPipe } from './../../pipes/round-number.pipe';
import { Taxes } from '../../models/taxes';
import { MovementOfArticleService } from '../../services/movement-of-article.service';

@Component({
  selector: 'app-add-movement-of-cash',
  templateUrl: './add-movement-of-cash.component.html',
  styleUrls: ['./add-movement-of-cash.component.css'],
  providers: [NgbAlertConfig, RoundNumberPipe]
})

export class AddMovementOfCashComponent implements OnInit {

  @Input() transaction: Transaction;
  public movementOfCash: MovementOfCash;
  public movementsOfCashes: MovementOfCash[];
  public paymentMethods: PaymentMethod[];
  public movementOfCashForm: FormGroup;
  public paymentChange: string = '0.00';
  public alertMessage: string = '';
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public transactionAmount: number = 0.00;
  public amountToPay: number = 0.00;
  public amountPaid: number = 0.00;
  public amountDiscount: number = 0.00;
  public roundNumber = new RoundNumberPipe();

  public formErrors = {
    'paymentMethod': '',
    'amountToPay': '',
    'amountPaid': '',
    'paymentChange': '',
    'observation': '',
    'surcharge': '',
    'CUIT': ''
  };

  public validationMessages = {
    'paymentMethod': {
      'required': 'Este campo es requerido.',
      'payValid': 'El monto ingresado es incorrecto para este medio de pago.'
    },
    'amountToPay': {
    },
    'amountPaid': {
      'required': 'Este campo es requerido.',
      'payValid': 'El monto ingresado es incorrecto.'
    },
    'paymentChange': {
    },
    'observation': {
    },
    'surcharge': {
    },
    'CUIT': {
      'minlength': 'El CUIT debe contener 13 díguitos.',
      'maxlength': 'El CUIT debe contener 13 díguitos.',
      'pattern': ' Ingrese el CUIT con formato con guiones'
    }
  };

  constructor(
    public _paymentMethodService: PaymentMethodService,
    public _movementOfCashService: MovementOfCashService,
    public _transactionService: TransactionService,
    public _fb: FormBuilder,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal,
    private _taxService: TaxService,
    public _movementOfArticleService: MovementOfArticleService
  ) {
    this.movementOfCash = new MovementOfCash();
    this.movementOfCash.type = new PaymentMethod();
    this.paymentMethods = new Array();
  }

  ngOnInit() {
    this.transactionAmount = this.transaction.totalPrice;
    this.buildForm();
    this.getPaymentMethods();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.movementOfCashForm = this._fb.group({
      'transactionAmount': [parseFloat(this.transactionAmount.toFixed(2)), [
          Validators.required
        ]
      ],
      'paymentMethod': [this.movementOfCash.type, [
        ]
      ],
      'amountToPay': [this.amountToPay, [
        ]
      ],
      'amountPaid': [this.amountPaid, [
        ]
      ],
      'amountDiscount': [this.amountDiscount, [
        ]
      ],
      'paymentChange': [this.paymentChange, [
        ]
      ],
      'observation': [this.movementOfCash.observation, [
        ]
      ],
      'discount': [this.movementOfCash.type.discount, [
        ]
      ],
      'surcharge': [this.movementOfCash.type.surcharge, [
        ]
      ],
      'expirationDate': [moment(this.movementOfCash.expirationDate).format('YYYY-MM-DD'), [
        ]
      ],
      'receiver': [this.movementOfCash.receiver, [
        ]
      ],
      'number': [this.movementOfCash.number, [
        ]
      ],
      'bank': [this.movementOfCash.bank, [
        ]
      ],
      'titular': [this.movementOfCash.titular, [
        ]
      ],
      'CUIT': [this.movementOfCash.CUIT, [
          Validators.maxLength(13),
          Validators.minLength(13),
          Validators.pattern('^[0-9]{2}-[0-9]{8}-[0-9]$')
        ]
      ],
      'deliveredBy': [this.movementOfCash.deliveredBy, [
        ]
      ]
    });

    this.movementOfCashForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  public setValueForm(): void {

    if (!this.movementOfCash.observation) this.movementOfCash.observation = '';
    if (!this.movementOfCash.amountPaid) this.movementOfCash.amountPaid = 0.00;
    if (!this.movementOfCash.discount) this.movementOfCash.discount = 0.00;
    if (!this.movementOfCash.surcharge) this.movementOfCash.surcharge = 0.00;
    if (!this.movementOfCash.receiver) this.movementOfCash.receiver = '';
    if (!this.movementOfCash.number) this.movementOfCash.number = '';
    if (!this.movementOfCash.bank) this.movementOfCash.bank = '';
    if (!this.movementOfCash.titular) this.movementOfCash.titular = '';
    if (!this.movementOfCash.CUIT) this.movementOfCash.CUIT = '';
    if (!this.movementOfCash.deliveredBy) this.movementOfCash.deliveredBy = '';
    if (!this.amountToPay) this.amountToPay = 0.00;
    if (!this.amountPaid) this.amountPaid = 0.00;
    if (!this.amountDiscount) this.amountDiscount = 0.00;

    const values = {
      'transactionAmount': parseFloat(this.transactionAmount.toFixed(2)),
      'paymentMethod': this.movementOfCash.type,
      'amountToPay': parseFloat(this.amountToPay.toFixed(2)),
      'amountPaid': parseFloat(this.amountPaid.toFixed(2)),
      'amountDiscount': parseFloat(this.amountDiscount.toFixed(2)),
      'paymentChange': this.paymentChange,
      'observation': this.movementOfCash.observation,
      'discount': parseFloat(this.movementOfCash.discount.toFixed(2)),
      'surcharge': parseFloat(this.movementOfCash.surcharge.toFixed(2)),
      'expirationDate': moment(this.movementOfCash.expirationDate).format('YYYY-MM-DD'),
      'receiver': this.movementOfCash.receiver,
      'number': this.movementOfCash.number,
      'bank': this.movementOfCash.bank,
      'titular': this.movementOfCash.titular,
      'CUIT': this.movementOfCash.CUIT,
      'deliveredBy': this.movementOfCash.deliveredBy
    };

    this.movementOfCashForm.setValue(values);
  }

  public onValueChanged(data?: any): void {

    if (!this.movementOfCashForm) { return; }
    const form = this.movementOfCashForm;

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

    this.paymentChange = (this.movementOfCashForm.value.amountPaid - this.movementOfCashForm.value.transactionAmount).toFixed(2);
    if (parseFloat(this.paymentChange) < 0) {
      this.paymentChange = '0.00';
    }

    this.movementOfCash.type = this.movementOfCashForm.value.paymentMethod;
    this.movementOfCash.expirationDate = this.movementOfCashForm.value.expirationDate;
  }

  public getMovementOfCashesByTransaction(): void {

    this.loading = true;

    this._movementOfCashService.getMovementOfCashesByTransaction(this.transaction._id).subscribe(
      result => {
        if (!result.movementsOfCashes) {
          this.movementsOfCashes = new Array();
          this.amountToPay = this.transactionAmount;
          this.movementOfCash.amountPaid = this.transactionAmount;
          this.paymentChange = (this.amountPaid - this.transactionAmount).toFixed(2);
          if (parseFloat(this.paymentChange) < 0) {
            this.paymentChange = '0.00';
          }
          this.amountPaid = 0;
          this.updateAmounts();
          this.loading = false;
        } else {
          this.movementsOfCashes = result.movementsOfCashes;
          if (this.isChargedFinished()) {
            this.activeModal.close({ movementsOfCashes: this.movementsOfCashes });
          } else {
            this.updateAmounts();
          }
          this.loading = false;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public isChargedFinished(): boolean {

    let chargedFinished: boolean = false;
    let amountPaid = 0;

    if (this.movementsOfCashes && this.movementsOfCashes.length > 0) {
      for(let movement of this.movementsOfCashes) {
        amountPaid += this.roundNumber.transform(movement.amountPaid);
      }
    }

    if (this.roundNumber.transform(amountPaid) >= this.roundNumber.transform(this.transactionAmount)) {
      chargedFinished = true;
    }

    return chargedFinished;
  }

  public openModal(op: string, movement: MovementOfCash): void {

    let modalRef;
    switch(op) {
      case 'delete':
          modalRef = this._modalService.open(DeleteMovementOfCashComponent, { size: 'lg' });
          modalRef.componentInstance.movementOfCash = movement;
          modalRef.result.then((result) => {
            if (result === 'delete_close') {
              if (this.transaction.type.requestArticles) {
                this.getMovementOfArticle(movement);
              } else {
                if (movement.discount && movement.discount !== 0) {
                  this.transaction.totalPrice += movement.amountPaid * movement.discount / 100;
                } else if (movement.surcharge && movement.surcharge !== 0) {
                  this.transaction.totalPrice -= movement.amountPaid * movement.surcharge / 100;
                }
                this.updateTransaction();
              }
            }
          }, (reason) => {

          });
        break;
      default : ;
    }
  };

  public getMovementOfArticle(movementOfCash: MovementOfCash): void {

    this.loading = true;

    let salePrice = 0;
    if (movementOfCash.discount && movementOfCash.discount !== 0) {
      salePrice = movementOfCash.amountPaid * movementOfCash.discount / 100;
    } else if (movementOfCash.surcharge && movementOfCash.surcharge !== 0) {
      salePrice = movementOfCash.amountPaid * movementOfCash.surcharge / 100;
    }

    this._movementOfArticleService.getMovementsOfArticles('where="transaction":"' + this.transaction._id + '","salePrice":' + salePrice + '').subscribe(
      result => {
        if (!result.movementsOfArticles) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.deleteMovementOfArticle(result.movementsOfArticles[0]);
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public deleteMovementOfArticle(movementOfArticle: MovementOfArticle): void {

    this.loading = true;

    this._movementOfArticleService.deleteMovementOfArticle(movementOfArticle._id).subscribe(
      result => {
        if (!result.movementOfArticle) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.transaction.totalPrice -= movementOfArticle.salePrice;
          this.updateTransaction();
        }
        this.loading = false;
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
        if (!result.paymentMethods){
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.paymentMethods = result.paymentMethods;
          if (this.transaction.type.name === "Saldo Inicial (+)" ||
            this.transaction.type.name === "Saldo Inicial (-)") {
              if(this.paymentMethods && this.paymentMethods.length > 0) {
                for(let i=0; i < this.paymentMethods.length; i++) {
                  if (this.paymentMethods[i].name === "Cuenta Corriente") {
                    this.movementOfCash.type = this.paymentMethods[i];
                    if (this.paymentMethods[i].discount) {
                      this.movementOfCash.discount = this.paymentMethods[i].discount;
                    } else {
                      this.movementOfCash.discount = 0;
                    }
                    if (this.paymentMethods[i].surcharge) {
                      this.movementOfCash.surcharge = this.paymentMethods[i].surcharge;
                    } else {
                      this.movementOfCash.surcharge = 0;
                    }
                  }
                }
              }
            if (this.movementOfCash.type.name !== "Cuenta Corriente") {
              this.showMessage("No existe el medio de pago 'Cuenta Corriente', debe agregarlo.",'danger',false);
            }
          } else {
            this.movementOfCash.type = this.paymentMethods[0];
          }
          this.getMovementOfCashesByTransaction();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public updateAmounts(op?: string): void {

    if (op === 'amountToPay') {
      this.amountToPay = this.movementOfCashForm.value.amountToPay;
      if (this.amountToPay < 0) {
        this.amountToPay = 0;
      }
    } else {
      this.amountPaid = 0;
      if (this.movementsOfCashes && this.movementsOfCashes.length > 0) {
        for (let movement of this.movementsOfCashes) {
          this.amountPaid += movement.amountPaid;
        }
      }
    }


    if (op !== 'amountToPay') {
      this.amountToPay = this.transactionAmount - this.amountPaid - this.amountDiscount;
    }

    this.movementOfCash.discount = this.movementOfCash.type.discount;
    this.movementOfCash.surcharge = this.movementOfCash.type.surcharge;

    if (this.movementOfCash.discount &&
        this.movementOfCash.discount !== 0) {
      this.transactionAmount = this.transaction.totalPrice - (this.amountToPay * this.movementOfCash.discount / 100);
    } else if (this.movementOfCash.surcharge &&
              this.movementOfCash.surcharge !== 0) {
      this.transactionAmount = this.transaction.totalPrice + (this.amountToPay * this.movementOfCash.surcharge / 100);
    } else {
      this.transactionAmount = this.transaction.totalPrice;
    }

    if (op !== 'amountToPay') {
      this.amountToPay = this.transactionAmount - this.amountPaid;
    }

    this.paymentChange = (this.amountPaid + this.amountToPay - this.transactionAmount).toFixed(2);
    if (parseFloat(this.paymentChange) < 0) {
      this.paymentChange = '0.00';
    }

    this.amountDiscount = this.transactionAmount - this.transaction.totalPrice;

    this.setValueForm();
  }

  public areValidAmounts(): boolean {

    let areValid: boolean = true;

    if (this.amountToPay <= 0) {
      areValid = false;
      this.showMessage("El monto ingresado no puede ser 0 o menor.", 'info', true);
    }

    if ((parseFloat((this.amountPaid + this.amountToPay).toFixed(2)) > parseFloat(this.transactionAmount.toFixed(2))) &&
        !this.movementOfCash.type.acceptReturned) {
      areValid = false;
      this.showMessage("El medio de pago " + this.movementOfCash.type.name + " no acepta vuelto, por lo tanto el monto a pagar no puede ser mayor que el de la transacción.", 'info', true);
    }

    if ( this.movementOfCash.discount && this.movementOfCash.discount > 0 &&
      this.amountToPay > parseFloat(((this.transaction.totalPrice * this.movementOfCash.discount / 100) + this.transaction.totalPrice).toFixed(2)) &&
      !this.movementOfCash.type.acceptReturned) {
      areValid = false;
      this.showMessage("El monto ingresado no puede ser mayor a " + parseFloat(((this.transaction.totalPrice * this.movementOfCash.discount / 100) + this.transaction.totalPrice).toFixed(2)) + '.', 'info', true);
    }

    if (this.movementOfCash.surcharge && this.movementOfCash.surcharge > 0 &&
      this.amountToPay > parseFloat(((this.transaction.totalPrice * this.movementOfCash.surcharge / 100) + this.transaction.totalPrice).toFixed(2)) &&
      !this.movementOfCash.type.acceptReturned) {
      areValid = false;
      this.showMessage("El monto ingresado no puede ser mayor a " + parseFloat(((this.transaction.totalPrice * this.movementOfCash.surcharge / 100) + this.transaction.totalPrice).toFixed(2)) + '.', 'info', true);
    }

    return areValid;
  }

  public addMovementOfCash(): void {

    if (this.areValidAmounts()) {
      this.movementOfCash.amountPaid = this.movementOfCashForm.value.amountToPay;
      this.movementOfCash.transaction = this.transaction;
      this.movementOfCash.type = this.movementOfCashForm.value.paymentMethod;
      this.movementOfCash.observation = this.movementOfCashForm.value.observation;
      this.movementOfCash.expirationDate = moment(this.movementOfCash.expirationDate, "YYYY-MM-DD").format("YYYY-MM-DDTHH:mm:ssZ");

      if (this.movementOfCash.type.checkDetail) {
        this.movementOfCash.receiver = this.movementOfCashForm.value.receiver;
        this.movementOfCash.number = this.movementOfCashForm.value.number;
        this.movementOfCash.bank = this.movementOfCashForm.value.bank;
        this.movementOfCash.titular = this.movementOfCashForm.value.titular;
        this.movementOfCash.CUIT = this.movementOfCashForm.value.CUIT;
        this.movementOfCash.deliveredBy = this.movementOfCashForm.value.deliveredBy;
        // this.movementOfCash.state = MovementOfCashState.InPortafolio;
        this.movementOfCash.state = MovementOfCashState.Closed;
      } else {
        this.movementOfCash.receiver = '';
        this.movementOfCash.number = '';
        this.movementOfCash.bank = '';
        this.movementOfCash.titular = '';
        this.movementOfCash.CUIT = '';
        this.movementOfCash.deliveredBy = '';
        this.movementOfCash.state = MovementOfCashState.Closed;
      }

      this.saveMovementOfCash();
    }
  }

  public cancel(): void {
    this.activeModal.close('cancel');
  }

  public saveMovementOfCash(): void {

    this.loading = true;

    this._movementOfCashService.saveMovementOfCash(this.movementOfCash).subscribe(
      result => {
        if (!result.movementOfCash) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.movementOfCash.number = '';
          if (this.transactionAmount !== this.transaction.totalPrice) {
            this.transaction.totalPrice = this.transactionAmount;
            if (this.transaction.type.requestArticles) {
              this.addMovementOfArticle();
            } else {
              this.updateTransaction();
            }
          } else {
            this.getMovementOfCashesByTransaction();
          }
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public addMovementOfArticle(): void {

    let movementOfArticle = new MovementOfArticle();

    if (this.movementOfCash.type.surcharge && this.movementOfCash.type.surcharge > 0) {
      movementOfArticle.description = 'Recargo por pago con ' + this.movementOfCash.type.name;
      movementOfArticle.salePrice = this.movementOfCash.amountPaid * this.movementOfCash.type.surcharge / 100;
    } else if (this.movementOfCash.type.discount && this.movementOfCash.type.discount > 0) {
      movementOfArticle.description = "Descuento por pago con " + this.movementOfCash.type.name;
      movementOfArticle.salePrice = - this.movementOfCash.amountPaid * this.movementOfCash.type.discount / 100;
    }
    movementOfArticle.transaction = this.transaction;
    this.getTaxVAT(movementOfArticle);
  }

  public getTaxVAT(movementOfArticle: MovementOfArticle): void {

    this.loading = true;

    let taxes: Taxes[] = new Array();
    let tax: Taxes = new Taxes();
    tax.percentage = 21.00;
    tax.taxBase = this.roundNumber.transform(movementOfArticle.salePrice / ((tax.percentage / 100) + 1));
    tax.taxAmount = this.roundNumber.transform(tax.taxBase * tax.percentage / 100);

    this._taxService.getTaxes('where="name":"IVA"').subscribe(
      result => {
        if (!result.taxes) {
          this.loading = false;
          this.showMessage("Debe configurar el impuesto IVA para el realizar el recargo de la tarjeta", 'info', true);
        } else {
          this.hideMessage();
          tax.tax = result.taxes[0];
          taxes.push(tax);
          movementOfArticle.taxes = taxes;
          this.saveMovementOfArticle(movementOfArticle);
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public saveMovementOfArticle(movementOfArticle: MovementOfArticle): void {

    this.loading = true;

    this._movementOfArticleService.saveMovementOfArticle(movementOfArticle).subscribe(
      result => {
        if (!result.movementOfArticle) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.hideMessage();
          movementOfArticle = result.movementOfArticle;
          this.updateTransaction();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public updateTransaction(closed: boolean = false): void {

    this.loading = true;

    this._transactionService.updateTransaction(this.transaction).subscribe(
      result => {
        if (!result.transaction) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.getMovementOfCashesByTransaction();
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
