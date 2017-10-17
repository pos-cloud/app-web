//Paquetes Angular
import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

//Paquetes de terceros
import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

//Modelos
import { PaymentMethod } from './../../models/payment-method';
import { MovementOfCash, MovementOfCashState } from './../../models/movement-of-cash';
import { Transaction } from './../../models/transaction';

//Servicios
import { PaymentMethodService } from './../../services/payment-method.service';
import { MovementOfCashService } from './../../services/movement-of-cash.service';

@Component({
  selector: 'app-add-movement-of-cash',
  templateUrl: './add-movement-of-cash.component.html',
  styleUrls: ['./add-movement-of-cash.component.css']
})

export class AddMovementOfCashComponent implements OnInit {

  @Input() transaction: Transaction;
  public movementOfCash: MovementOfCash;
  public paymentMethods: PaymentMethod[];
  public movementOfCashForm: FormGroup;
  public paymentChange: string = '0.00';
  public alertMessage: string = "";
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'paymentMethod': '',
    'amountPaid': '',
    'cashChange': '',
    'observation': ''
  };

  public validationMessages = {
    'paymentMethod': {
      'required': 'Este campo es requerido.',
      'payValid': 'El monto ingresado es incorrecto para este medio de pago.'
    },
    'amountPaid': {
      'required': 'Este campo es requerido.',
      'payValid': 'El monto ingresado es incorrecto.'
    },
    'cashChange': {
    },
    'observation': {
    },
  };

  constructor(
    public _paymentMethodService: PaymentMethodService,
    public _movementOfCashService: MovementOfCashService,
    public _fb: FormBuilder,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) {
    this.movementOfCash = new MovementOfCash();
    this.movementOfCash.type = new PaymentMethod();
    this.paymentMethods = new Array();
  }

  ngOnInit() {
    this.getPaymentMethods();
    this.buildForm();
    this.movementOfCash.amountPaid = this.transaction.totalPrice;
    this.movementOfCash.amountCharge = this.transaction.totalPrice;
    this.paymentChange = (this.movementOfCash.amountPaid - this.transaction.totalPrice).toFixed(2);
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getPaymentMethods(): void {

    this.loading = true;

    this._paymentMethodService.getPaymentMethods().subscribe(
      result => {
        if (!result.paymentMethods){
          this.showMessage(result.message, "info", true);
        } else {  
          this.movementOfCash.type = result.paymentMethods[0];
          this.paymentMethods = result.paymentMethods;
          this.movementOfCashForm.setValue({
            'paymentMethod': this.movementOfCash.type,
            'amountPaid': this.movementOfCash.amountPaid,
            'cashChange': this.movementOfCash.cashChange,
            'observation': ''
          });
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public buildForm(): void {
    
    this.movementOfCashForm = this._fb.group({
      'paymentMethod': [this.movementOfCash.type, [
          Validators.required,
          this.validatePaymentMethod(this.transaction)
        ]
      ],
      'amountPaid': [this.movementOfCash.amountPaid, [
          Validators.required,
          this.validateAmountPaid(this.transaction)
        ]
      ],
      'cashChange': [this.paymentChange, [
        ]
      ],
      'observation': [this.movementOfCash.observation, [
        ]
      ],
    });

    this.movementOfCashForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {

    if (!this.movementOfCashForm) { return; }
    const form = this.movementOfCashForm;

    for (const field in this.formErrors) {

      this.formErrors[field] = '';

      const control = form.get(field);
      if (control && control.dirty && (field === 'paymentMethod' || field === 'amountPaid')) {
        if (!this.validateAmountPaidByPaymentMethod(this.transaction)) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            this.formErrors[field] += messages[key] + ' ';
          }
        }
      } else if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
    
    if (this.movementOfCashForm.value.amountPaid - this.transaction.totalPrice < 0) {
      this.paymentChange = '0.00';
    } else {
      this.paymentChange = (this.movementOfCashForm.value.amountPaid - this.transaction.totalPrice).toFixed(2);
    }
  }

  public validateAmountPaid(transaction) {
    return function (input: FormControl) {
      let payValid = false;
      let nameMethod;
      if (input.parent && input.parent.controls && input.parent.controls['paymentMethod'].value.name) {
        nameMethod = input.parent.controls['paymentMethod'].value.name;
        if (transaction.totalPrice <= input.value) {
          if (transaction.totalPrice < input.value && nameMethod !== 'Efectivo') {
            payValid = false;
          } else {
            payValid = true;
          }
        }
      }
      return payValid ? null : { payValid: true };
    };
  }

  public validateAmountPaidByPaymentMethod(transaction) {
    
    let payValid = true;
    let amountPaid = this.movementOfCashForm.value.amountPaid;
    let nameMethod = this.movementOfCashForm.value.paymentMethod.name;
      if (transaction.totalPrice <= amountPaid) {
        if (transaction.totalPrice < amountPaid && nameMethod !== 'Efectivo') {
          payValid = false;
        } else {
          payValid = true;
        }
      }
    return payValid;
  }

  public validatePaymentMethod(transaction) {
    return function (input: FormControl) {
      let payValid = true;
      let amountPaid;
      if (input.parent && input.parent.controls && input.parent.controls['amountPaid'].value) {
        amountPaid = input.parent.controls['amountPaid'].value;
        if (transaction.totalPrice <= amountPaid) {
          if (transaction.totalPrice < amountPaid && input.value.name !== 'Efectivo') {
            payValid = false;
          } else {
            payValid = true;
          }
        }
      }
      return payValid ? null : { payValid: true };
    };
  }

  public addMovementOfCash(): void {
    this.movementOfCash.state = MovementOfCashState.Closed;
    this.movementOfCash.amountPaid = this.movementOfCashForm.value.amountPaid;
    this.movementOfCash.transaction = this.transaction;
    this.movementOfCash.type = this.movementOfCashForm.value.paymentMethod;
    this.movementOfCash.cashChange = this.movementOfCashForm.value.cashChange;
    this.movementOfCash.observation = this.movementOfCashForm.value.observation;
    
    this.saveMovementOfCash();
  }

  public cancel(): void {
    this.activeModal.close('cancel');
  }

  public getMovementOfCashesByTransaction(): void {

    this.loading = true;
    
    this._movementOfCashService.getMovementOfCashesByTransaction(this.movementOfCash.transaction._id).subscribe(
      result => {
        if (!result.movementsOfCashes) {
          this.saveMovementOfCash();
        } else {
          this.movementOfCash = result.movementsOfCashes[0];
          this.updateMovementOfCash();
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
    
    this._movementOfCashService.saveMovementOfCash(this.movementOfCash).subscribe(
      result => {
        if (!result.movementOfCash) {
          this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.movementOfCash = result.movementOfCash;
          this.activeModal.close("add-movement-of-cash");
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public updateMovementOfCash(): void {

    this.loading = true;

    this._movementOfCashService.updateMovementOfCash(this.movementOfCash).subscribe(
      result => {
        if (!result.movementOfCash) {
          this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.movementOfCash = result.movementOfCash;
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
