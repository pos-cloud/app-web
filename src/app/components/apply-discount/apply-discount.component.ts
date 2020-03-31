import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

//PIPES
import { RoundNumberPipe } from './../../pipes/round-number.pipe';

@Component({
  selector: 'app-apply-discount',
  templateUrl: './apply-discount.component.html',
  styleUrls: ['./apply-discount.component.css'],
  providers: [NgbAlertConfig, RoundNumberPipe]
})
export class ApplyDiscountComponent implements OnInit {

  @Input() amount: number = 0;
  @Input() amountToApply: number = 0;
  @Input() percentageToApply: number = 0;
  public discountForm: FormGroup;
  public alertMessage: string = '';
  public loading: boolean = false;
  public roundNumber = new RoundNumberPipe();
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'amount': '',
    'amountToApply': '',
    'percentageToApply': '',
    'totalAmount': ''
  };

  public validationMessages = {
    'amount': {
      'required': 'Este campo es requerido.'
    },
    'amountToApply': {
      'required': 'Este campo es requerido.'
    },
    'percentageToApply': {
      'required': 'Este campo es requerido.'
    },
    'totalAmount': {
      'required': 'Este campo es requerido.'
    }
  };

  constructor(
    public _fb: FormBuilder,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
  ) { }

  ngOnInit() {

    this.amount += this.amountToApply;

    if ( this.amountToApply &&
        this.amountToApply !== 0 &&
        this.percentageToApply &&
        this.percentageToApply === 0) {
      this.percentageToApply = this.amountToApply * 100 / this.amount;
    } else if ( this.percentageToApply &&
                this.percentageToApply !== 0 &&
                this.amountToApply &&
                this.amountToApply === 0) {
      this.amountToApply = this.amount * this.percentageToApply / 100;
    }

    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.discountForm = this._fb.group({
      'amount': [this.roundNumber.transform(this.amount, 6), [
          Validators.required
        ]
      ],
      'amountToApply': [this.roundNumber.transform(this.amountToApply, 6), [
          Validators.required
        ]
      ],
      'percentageToApply': [this.roundNumber.transform(this.percentageToApply, 6), [
          Validators.required
        ]
      ],
      'totalAmount': [this.roundNumber.transform(this.amount - this.amountToApply, 6), [
          Validators.required
        ]
      ]
    });

    this.discountForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {

    if (!this.discountForm) { return; }
    const form = this.discountForm;

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

  public updateDiscounts(op: string): void {

    if (op === 'percentageToApply') {
      this.amountToApply = this.roundNumber.transform((this.amount * this.discountForm.value.percentageToApply / 100), 6);
      this.percentageToApply = this.roundNumber.transform(this.discountForm.value.percentageToApply, 6);
    } else if (op === 'amountToApply') {
      this.percentageToApply = this.roundNumber.transform((this.discountForm.value.amountToApply * 100 / this.amount), 6);
      this.amountToApply = this.roundNumber.transform(this.discountForm.value.amountToApply, 6);
    }

    this.setValueForm();
  }

  public setValueForm(): void {

    if (!this.amount) this.amount = 0;
    if (!this.amountToApply) this.amountToApply = 0;
    if (!this.percentageToApply) this.percentageToApply = 0;

    let discount = {
      'amount': this.roundNumber.transform(this.amount, 6),
      'amountToApply': this.roundNumber.transform(this.amountToApply, 6),
      'percentageToApply': this.roundNumber.transform(this.percentageToApply, 6),
      'totalAmount': this.roundNumber.transform(this.amount - this.amountToApply, 6)
    };
    this.discountForm.setValue(discount);
  }

  public applyDiscount(): void {

    if (this.discountForm.value.percentageToApply === 0 &&
      this.discountForm.value.amountToApply !== 0) {
      this.amountToApply = this.discountForm.value.amountToApply;
      this.percentageToApply = this.roundNumber.transform(this.amountToApply * 100 / this.amount, 6);
    } else if ( this.discountForm.value.percentageToApply !== 0 &&
                this.discountForm.value.amountToApply === 0) {
      this.percentageToApply = this.roundNumber.transform(this.discountForm.value.percentageToApply, 6);
      this.amountToApply = this.roundNumber.transform((this.amount * this.percentageToApply / 100), 6);
    } else if ( this.discountForm.value.percentageToApply === 0 &&
                this.discountForm.value.amountToApply === 0) {
      this.amountToApply = 0;
      this.percentageToApply = 0;
    }

    let discount = {
      'amountToApply': this.roundNumber.transform(this.amountToApply, 6),
      'percentageToApply': this.roundNumber.transform(this.percentageToApply, 6),
      'totalAmount': this.roundNumber.transform(this.amount - this.amountToApply, 6)
    };

    this.activeModal.close({
      'discount': discount
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
