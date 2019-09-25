import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { PaymentMethod, CompanyType } from '../../models/payment-method';

import { PaymentMethodService } from '../../services/payment-method.service';

@Component({
  selector: 'app-payment-method',
  templateUrl: './payment-method.component.html',
  styleUrls: ['./payment-method.component.css'],
  providers: [NgbAlertConfig]
})

export class PaymentMethodComponent implements OnInit {

  @Input() paymentMethodId : string;
  @Input() readonly : boolean
  @Input() operation : string;
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

    if(this.paymentMethodId){
      this.getPaymentMetod()
    }
  }

  public getPaymentMetod() {
    this._paymentMethodService.getPaymentMethod(this.paymentMethodId).subscribe(
      result =>{
        if(result && result.paymentMethod){
          this.paymentMethod = result.paymentMethod;
          this.setValueForm();
        }
      },
      error =>{
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    )
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.paymentMethodForm = this._fb.group({
      '_id' : [this.paymentMethod._id, []],
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
      ],'observation': [this.paymentMethod.observation, [
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

  public addPaymentMethod() {

    switch (this.operation) {
      case 'add':
        this.savePaymentMethod();
        break;
      case 'update':
        this.updatePaymentMethod();
        break;
    }
  }
  
  public setValueForm(): void {

    if (!this.paymentMethod._id) this.paymentMethod._id = '';
    if (!this.paymentMethod.code) this.paymentMethod.code = 1;
    if (!this.paymentMethod.name) this.paymentMethod.name = '';
    if (!this.paymentMethod.discount) this.paymentMethod.discount = 0.00;
    if (!this.paymentMethod.surcharge) this.paymentMethod.surcharge = 0.00;
    if (this.paymentMethod.isCurrentAccount === undefined) this.paymentMethod.isCurrentAccount = false;
    if (this.paymentMethod.acceptReturned === undefined) this.paymentMethod.acceptReturned = false;
    if (this.paymentMethod.inputAndOuput === undefined) this.paymentMethod.inputAndOuput = false;
    if (this.paymentMethod.checkDetail === undefined) this.paymentMethod.checkDetail = false;
    if (this.paymentMethod.cardDetail === undefined) this.paymentMethod.cardDetail = false;
    if (this.paymentMethod.allowToFinance === undefined) this.paymentMethod.allowToFinance = false;
    if (this.paymentMethod.cashBoxImpact === undefined) this.paymentMethod.cashBoxImpact = false;
    if (this.paymentMethod.bankReconciliation === undefined) this.paymentMethod.bankReconciliation = false;
    if (!this.paymentMethod.company) this.paymentMethod.company = null;
    if (!this.paymentMethod.observation) this.paymentMethod.observation = '';



    this.paymentMethodForm.setValue({
      '_id': this.paymentMethod._id,
      'code': this.paymentMethod.code,
      'name': this.paymentMethod.name,
      'discount': this.paymentMethod.discount,
      'surcharge': this.paymentMethod.surcharge,
      'isCurrentAccount': this.paymentMethod.isCurrentAccount,
      'acceptReturned': this.paymentMethod.acceptReturned,
      'inputAndOuput': this.paymentMethod.acceptReturned,
      'checkDetail': this.paymentMethod.checkDetail,
      'cardDetail': this.paymentMethod.cardDetail,
      'allowToFinance': this.paymentMethod.allowToFinance,
      'cashBoxImpact': this.paymentMethod.cashBoxImpact,
      'bankReconciliation' :this.paymentMethod.bankReconciliation,
      'company' : this.paymentMethod.company,
      'observation' : this.paymentMethod.observation
    });
  }

  public updatePaymentMethod(): void {
    if (!this.readonly) {
      this.loading = true;
      this.paymentMethod = this.paymentMethodForm.value;
      this.saveChanges();
    }
  }

  public saveChanges(): void {

    this.loading = true;

    this._paymentMethodService.updatePaymentMethod(this.paymentMethod).subscribe(
      result => {
        if (!result.paymentMethod) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.paymentMethod = result.paymentMethod;
          this.showMessage("El método de pago se ha actualizado con éxito.", 'success', false);
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  
  public deletePaymentMethod(): void {

    this.loading = true;

    this._paymentMethodService.deletePaymentMethod(this.paymentMethodId).subscribe(
      result => {
        this.activeModal.close('delete_close');
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public savePaymentMethod(): void {

    this.paymentMethod = this.paymentMethodForm.value;

    this.loading = true;

    this._paymentMethodService.savePaymentMethod(this.paymentMethod).subscribe(
      result => {
        if (!result.paymentMethod) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.paymentMethod = result.paymentMethod;
          this.showMessage("El medio de pago se ha añadido con éxito.", 'success', true);
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
