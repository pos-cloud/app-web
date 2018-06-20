//Paquetes Angular
import { Component, OnInit, Input, EventEmitter, ChangeDetectorRef } from '@angular/core';
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
  public op: string;
  public surchargeAmount: number = 0;
  public amountToCharge: number = 0;

  public formErrors = {
    'paymentMethod': '',
    'amountPaid': '',
    'cashChange': '',
    'observation': '',
    'surchargeAmount': ''
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
    'surchargeAmount': {
    },
  };

  constructor(
    public _paymentMethodService: PaymentMethodService,
    public _movementOfCashService: MovementOfCashService,
    public _fb: FormBuilder,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    private cdref: ChangeDetectorRef
  ) {
    this.movementOfCash = new MovementOfCash();
    this.movementOfCash.type = new PaymentMethod();
    this.paymentMethods = new Array();
  }

  ngOnInit() {
    this.getMovementOfCashesByTransaction();
    this.getPaymentMethods();
    this.amountToCharge = this.transaction.totalPrice;
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getMovementOfCashesByTransaction(): void {

    this.loading = true;

    this._movementOfCashService.getMovementOfCashesByTransaction(this.transaction._id).subscribe(
      result => {
        if (!result.movementsOfCashes) {
          this.movementOfCash.amountPaid = this.amountToCharge;
          this.movementOfCash.amountCharge = this.amountToCharge;
          this.paymentChange = (this.movementOfCash.amountPaid - this.amountToCharge).toFixed(2);
          this.op = "add";
        } else {
          this.movementOfCash = result.movementsOfCashes[0];
          this.op = "update";
        }
        this.paymentChange = (this.movementOfCash.amountPaid - this.amountToCharge).toFixed(2);
        this.setValueForm();
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
        if (!result.paymentMethods){
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {  
          this.paymentMethods = result.paymentMethods;
          if(this.transaction.type.name === "Saldo Inicial (+)" || 
            this.transaction.type.name === "Saldo Inicial (-)") {
            for(let i=0; i < this.paymentMethods.length; i++) {
              if(this.paymentMethods[i].name === "Cuenta Corriente") {
                this.movementOfCash.type = this.paymentMethods[i];
              }
            }
            if(this.movementOfCash.type.name !== "Cuenta Corriente") {
              this.showMessage("No existe el medio de pago 'Cuenta Corriente', debe agregarlo.","danger",false);
            }
          } else {
            this.movementOfCash.type = this.paymentMethods[0];
          }
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

  public setValueForm(): void {

    if(!this.movementOfCash.observation) this.movementOfCash.observation = "";
    this.movementOfCash.amountPaid = parseFloat(this.movementOfCash.amountPaid.toFixed(2));
    this.movementOfCash.cashChange = parseFloat(this.movementOfCash.cashChange.toFixed(2));

    this.movementOfCashForm.setValue({
      'amountToCharge': parseFloat(this.amountToCharge.toFixed(2)),
      'paymentMethod': this.movementOfCash.type,
      'amountPaid': this.movementOfCash.amountPaid,
      'cashChange': this.movementOfCash.cashChange,
      'observation': this.movementOfCash.observation,
      'surchargeAmount': this.surchargeAmount,
    });
  }

  public buildForm(): void {
    
    this.movementOfCashForm = this._fb.group({
      'amountToCharge': [parseFloat(this.amountToCharge.toFixed(2)), [
          Validators.required
        ]
      ],
      'paymentMethod': [this.movementOfCash.type, [
          Validators.required,
          this.validatePaymentMethod()
        ]
      ],
      'amountPaid': [this.movementOfCash.amountPaid, [
          Validators.required,
          this.validateAmountPaid()
        ]
      ],
      'cashChange': [this.paymentChange, [
        ]
      ],
      'observation': [this.movementOfCash.observation, [
        ]
      ],
      'surchargeAmount': [this.surchargeAmount, [
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
        if (!this.validateAmountPaidByPaymentMethod()) {
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
    
    if (this.movementOfCashForm.value.amountPaid - this.movementOfCashForm.value.amountToCharge < 0) {
      this.paymentChange = '0.00';
    } else {
      this.paymentChange = (this.movementOfCashForm.value.amountPaid - this.movementOfCashForm.value.amountToCharge).toFixed(2);
    }

    this.movementOfCash.type = this.movementOfCashForm.value.paymentMethod;
  }

  public updateAmounts() {

    if (this.movementOfCashForm.value.surchargeAmount < 0 || 
          (this.movementOfCashForm.value.surchargeAmount >= 0 &&
          this.movementOfCashForm.value.paymentMethod.name !== "Tarjeta de Crédito")) {
      this.movementOfCashForm.value.surchargeAmount = 0;
    }

    this.surchargeAmount = this.movementOfCashForm.value.surchargeAmount;
    this.amountToCharge = this.transaction.totalPrice + (this.transaction.totalPrice * this.surchargeAmount / 100);
    this.movementOfCashForm.value.amountToCharge = this.amountToCharge;
    this.movementOfCash.amountPaid = this.amountToCharge;

    this.setValueForm();
  }

  public validateAmountPaid() {
    return function (input: FormControl) {
      let payValid = false;
      let nameMethod;
      let amountToCharge;
      if (input.parent && input.parent.controls && input.parent.controls['paymentMethod'].value.name) {
        nameMethod = input.parent.controls['paymentMethod'].value.name;
        amountToCharge = input.parent.controls['amountToCharge'].value;
        if (amountToCharge <= input.value) {
          if (amountToCharge < input.value && nameMethod !== 'Efectivo') {
            payValid = false;
          } else {
            payValid = true;
          }
        }
      }
      return payValid ? null : { payValid: true };
    };
  }

  public validateAmountPaidByPaymentMethod() {
    
    let payValid = true;
    let amountPaid = this.movementOfCashForm.value.amountPaid;
    let nameMethod = this.movementOfCashForm.value.paymentMethod.name;
      if (this.amountToCharge <= amountPaid) {
        if (this.amountToCharge < amountPaid && nameMethod !== 'Efectivo') {
          payValid = false;
        } else {
          payValid = true;
        }
    }
    return payValid;
  }

  public validatePaymentMethod() {
    return function (input: FormControl) {
      let payValid = true;
      let amountPaid;
      let amountToCharge;
      if (input.parent && input.parent.controls && input.parent.controls['amountPaid'].value) {
        amountPaid = input.parent.controls['amountPaid'].value;
        amountToCharge = input.parent.controls['amountToCharge'].value;
        if (amountToCharge <= amountPaid) {
          if (amountToCharge < amountPaid && input.value.name !== 'Efectivo') {
            payValid = false;
          } else {
            payValid = true;
          }
        } else {
          payValid = true;
        }
      }
      return payValid ? null : { payValid: true };
    };
  }

  public addMovementOfCash(): void {
    this.movementOfCash.state = MovementOfCashState.Closed;
    this.movementOfCash.amountCharge = this.movementOfCashForm.value.amountToCharge;
    this.movementOfCash.amountPaid = this.movementOfCashForm.value.amountPaid;
    this.movementOfCash.transaction = this.transaction;
    this.movementOfCash.type = this.movementOfCashForm.value.paymentMethod;
    this.movementOfCash.cashChange = this.movementOfCashForm.value.cashChange;
    this.movementOfCash.observation = this.movementOfCashForm.value.observation;
    
    if(this.op === "add") {
      this.saveMovementOfCash();
    } else if (this.op === "update"){
      this.updateMovementOfCash();
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
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.movementOfCash = result.movementOfCash;
          this.activeModal.close({ movementOfCash: this.movementOfCash});
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
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.movementOfCash = result.movementOfCash;
          this.activeModal.close({ movementOfCash: this.movementOfCash});
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
