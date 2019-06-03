import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { PaymentMethod, CompanyType } from './../../models/payment-method';

import { PaymentMethodService } from './../../services/payment-method.service';

@Component({
  selector: 'app-add-payment-method',
  templateUrl: './add-payment-method.component.html',
  styleUrls: ['./add-payment-method.component.css'],
  providers: [NgbAlertConfig]
})

export class AddPaymentMethodComponent implements OnInit {

  public paymentMethod: PaymentMethod;
  public paymentMethodForm: FormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public companyTypes: CompanyType[] = [CompanyType.None, CompanyType.Client, CompanyType.Provider];


  public formErrors = {
    'code': '',
    'name': ''
  };

  public validationMessages = {
    'code': {
      'required': 'Este campo es requerido.'
    },
    'name': {
      'required': 'Este campo es requerido.'
    }
  };

  constructor(
    public _paymentMethodService: PaymentMethodService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.paymentMethod = new PaymentMethod();
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.paymentMethodForm = this._fb.group({
      'code': [this.paymentMethod.code, [
        ]
      ],
      'name': [this.paymentMethod.name, [
          Validators.required
        ]
      ],'discount': [this.paymentMethod.discount, [
        ]
      ],'surcharge': [this.paymentMethod.surcharge, [
        ]
      ],'isCurrentAccount': [this.paymentMethod.isCurrentAccount, [
        ]
      ],'acceptReturned': [this.paymentMethod.acceptReturned, [
        ]
      ],'inputAndOuput': [this.paymentMethod.inputAndOuput, [
        ]
      ],'checkDetail': [this.paymentMethod.checkDetail, [
        ]
      ],'cardDetail': [this.paymentMethod.cardDetail, [
        ]
      ],'allowToFinance': [this.paymentMethod.allowToFinance, [
        ]
      ],'cashBoxImpact': [this.paymentMethod.cashBoxImpact, [
        ]
      ],'company': [this.paymentMethod.company, [
        ]
      ],'bankReconciliation': [this.paymentMethod.bankReconciliation, [
      ]]
    });

    this.paymentMethodForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.paymentMethodForm) { return; }
    const form = this.paymentMethodForm;

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

  public addPaymentMethod(): void {

    this.paymentMethod = this.paymentMethodForm.value;
    this.savePaymentMethod();
  }

  public savePaymentMethod(): void {

    this.loading = true;

    this._paymentMethodService.savePaymentMethod(this.paymentMethod).subscribe(
      result => {
        if (!result.paymentMethod) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.paymentMethod = result.paymentMethod;
          this.showMessage("La marca se ha añadido con éxito.", 'success', true);
          this.paymentMethod = new PaymentMethod();
          this.buildForm();
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
