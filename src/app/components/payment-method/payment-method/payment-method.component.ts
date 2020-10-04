import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as $ from 'jquery';
import { PaymentMethod, CompanyType } from '../payment-method';

import { PaymentMethodService } from '../payment-method.service';
import { Application } from 'app/components/application/application.model';
import { Subscription, Subject, Observable } from 'rxjs';
import { ApplicationService } from 'app/components/application/application.service';
import Resulteable from 'app/util/Resulteable';
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { Article } from 'app/components/article/article';
import { ArticleService } from 'app/components/article/article.service';

@Component({
  selector: 'app-payment-method',
  templateUrl: './payment-method.component.html',
  styleUrls: ['./payment-method.component.css'],
  providers: [NgbAlertConfig, TranslateMePipe]
})

export class PaymentMethodComponent implements OnInit {

  @Input() paymentMethodId: string;
  @Input() readonly: boolean
  @Input() operation: string;
  public paymentMethod: PaymentMethod;
  public paymentMethodForm: FormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public companyTypes: CompanyType[] = [CompanyType.None, CompanyType.Client, CompanyType.Provider];
  public applications: Application[];
  private subscription: Subscription = new Subscription();
  public focus$: Subject<string>[] = new Array();

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

  public html = '';

  public tinyMCEConfigBody = {
    selector: "textarea",
    theme: "modern",
    paste_data_images: true,
    plugins: [
      "advlist autolink lists link image charmap print preview hr anchor pagebreak",
      "searchreplace wordcount visualblocks visualchars code fullscreen",
      "insertdatetime media nonbreaking table contextmenu directionality",
      "emoticons template paste textcolor colorpicker textpattern"
    ],
    toolbar1: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media | forecolor backcolor emoticons | print preview fullscreen",
    image_advtab: true,
    height: 250,
    file_picker_types: 'file image media',
    images_dataimg_filter: function (img) {
      return img.hasAttribute('internal-blob');
    },
    /*file_picker_callback: function (callback, value, meta) {
        if (meta.filetype == 'image') {
            $('#upload').trigger('click');
            $('#upload').on('change', function () {
                var file = this.files[0];
                var reader = new FileReader();
                reader.onload = function (e) {
                    callback(e.target['result'], {
                        alt: ''
                    });
                };
                reader.readAsDataURL(file);
            });
        }
    },*/
    file_picker_callback: function (callback, value, meta) {
      if (meta.filetype == 'image') {
        $('#upload').trigger('click');
        $('#upload').on('change', function () {
          var file = this.files[0];
          var reader = new FileReader();
          reader.onload = function (e) {

            callback(e.target['result'], {
              alt: ''
            });
          };
          reader.readAsDataURL(file);
        });
      }
    },
  }

  public searchArticles = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.loading = true),
      switchMap(async term => {
        let match: {} = (term && term !== '') ? { description: { $regex: term, $options: 'i' } } : {};
        return await this.getAllArticles(match).then(
          result => {
            return result;
          }
        )
      }),
      tap(() => this.loading = false)
    )
  public formatterArticles = (x: Article) => { return x.description; };

  constructor(
    private _paymentMethodService: PaymentMethodService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    private _applicationService: ApplicationService,
    public translatePipe: TranslateMePipe,
    private _toastr: ToastrService,
    private _articleService: ArticleService
  ) { }

  async ngOnInit() {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.paymentMethod = new PaymentMethod();
    this.buildForm();

    await this.getAllApplications({})
      .then((result: Application[]) => {
        this.applications = result;
        if (!this.paymentMethodId) {
          this.setValuesArray();
        }
      })
      .catch((error: Resulteable) => this.showToast(error));

    if (this.paymentMethodId) {
      this.getPaymentMetod()
    }
  }

  public getPaymentMetod() {
    this._paymentMethodService.getPaymentMethod(this.paymentMethodId).subscribe(
      result => {
        if (result && result.paymentMethod) {
          this.paymentMethod = result.paymentMethod;
          this.setValueForm();
          this.setValuesArray();
        }
      },
      error => {
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
      '_id': [this.paymentMethod._id, []],
      'code': [this.paymentMethod.code, []],
      'name': [this.paymentMethod.name, [Validators.required]],
      'discount': [this.paymentMethod.discount, []],
      'surcharge': [this.paymentMethod.surcharge, []],
      'commission': [this.paymentMethod.commission, []],
      'commissionArticle': [this.paymentMethod.commissionArticle, []],
      'administrativeExpense': [this.paymentMethod.administrativeExpense, []],
      'administrativeExpenseArticle': [this.paymentMethod.administrativeExpenseArticle, []],
      'otherExpense': [this.paymentMethod.otherExpense, []],
      'otherExpenseArticle': [this.paymentMethod.otherExpenseArticle, []],
      'isCurrentAccount': [this.paymentMethod.isCurrentAccount, []],
      'acceptReturned': [this.paymentMethod.acceptReturned, []],
      'inputAndOuput': [this.paymentMethod.inputAndOuput, []],
      'checkDetail': [this.paymentMethod.checkDetail, []],
      'checkPerson': [this.paymentMethod.checkPerson, []],
      'cardDetail': [this.paymentMethod.cardDetail, []],
      'allowToFinance': [this.paymentMethod.allowToFinance, []],
      'cashBoxImpact': [this.paymentMethod.cashBoxImpact, []],
      'company': [this.paymentMethod.company, []],
      'allowCurrencyValue': [this.paymentMethod.allowCurrencyValue, []],
      'observation': [this.paymentMethod.observation, [],],
      'allowBank': [this.paymentMethod.allowBank, [],],
      'bankReconciliation': [this.paymentMethod.bankReconciliation, []],
      'mercadopagoAPIKey': [this.paymentMethod.mercadopagoAPIKey, []],
      'whatsappNumber': [this.paymentMethod.whatsappNumber, []],
      'applications': this._fb.array([]),
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

    this.paymentMethod = this.paymentMethodForm.value;
    const selectedOrderIds = this.paymentMethodForm.value.applications
      .map((v, i) => (v ? this.applications[i] : null))
      .filter(v => v !== null);
    this.paymentMethod.applications = selectedOrderIds;

    if (!this.readonly) {
      switch (this.operation) {
        case 'add':
          this.savePaymentMethod();
          break;
        case 'update':
          this.updatePaymentMethod();
          break;
      }
    }
  }

  public getAllArticles(match: {}): Promise<Article[]> {
    return new Promise<Article[]>((resolve, reject) => {
      this.subscription.add(this._articleService.getAll({
        match,
        sort: { description: 1 },
        limit: 10,
      }).subscribe(
        result => {
          this.loading = false;
          (result.status === 200) ? resolve(result.result) : reject(result);
        },
        error => reject(error)
      ));
    });
  }

  public setValueForm(): void {

    if (!this.paymentMethod._id) this.paymentMethod._id = '';
    if (!this.paymentMethod.code) this.paymentMethod.code = 1;
    if (!this.paymentMethod.name) this.paymentMethod.name = '';
    if (!this.paymentMethod.discount) this.paymentMethod.discount = 0.00;
    if (!this.paymentMethod.surcharge) this.paymentMethod.surcharge = 0.00;
    if (!this.paymentMethod.commission) this.paymentMethod.commission = 0.00;
    if (!this.paymentMethod.commissionArticle) this.paymentMethod.commissionArticle = null;
    if (!this.paymentMethod.administrativeExpense) this.paymentMethod.administrativeExpense = 0.00;
    if (!this.paymentMethod.administrativeExpenseArticle) this.paymentMethod.administrativeExpenseArticle = null;
    if (!this.paymentMethod.otherExpense) this.paymentMethod.otherExpense = 0.00;
    if (!this.paymentMethod.otherExpenseArticle) this.paymentMethod.otherExpenseArticle = null;
    if (this.paymentMethod.isCurrentAccount === undefined) this.paymentMethod.isCurrentAccount = false;
    if (this.paymentMethod.acceptReturned === undefined) this.paymentMethod.acceptReturned = false;
    if (this.paymentMethod.inputAndOuput === undefined) this.paymentMethod.inputAndOuput = false;
    if (this.paymentMethod.checkDetail === undefined) this.paymentMethod.checkDetail = false;
    if (this.paymentMethod.checkPerson === undefined) this.paymentMethod.checkPerson = false;
    if (this.paymentMethod.cardDetail === undefined) this.paymentMethod.cardDetail = false;
    if (this.paymentMethod.allowToFinance === undefined) this.paymentMethod.allowToFinance = false;
    if (this.paymentMethod.cashBoxImpact === undefined) this.paymentMethod.cashBoxImpact = false;
    if (this.paymentMethod.bankReconciliation === undefined) this.paymentMethod.bankReconciliation = false;
    if (this.paymentMethod.allowCurrencyValue === undefined) this.paymentMethod.allowCurrencyValue = false;
    if (this.paymentMethod.allowBank === undefined) this.paymentMethod.allowBank = false;
    if (!this.paymentMethod.company) this.paymentMethod.company = null;
    if (!this.paymentMethod.mercadopagoAPIKey) this.paymentMethod.mercadopagoAPIKey = null;
    if (!this.paymentMethod.whatsappNumber) this.paymentMethod.whatsappNumber = null;
    if (!this.paymentMethod.observation) this.paymentMethod.observation = '';

    this.paymentMethodForm.patchValue({
      '_id': this.paymentMethod._id,
      'code': this.paymentMethod.code,
      'name': this.paymentMethod.name,
      'discount': this.paymentMethod.discount,
      'surcharge': this.paymentMethod.surcharge,
      'commission': this.paymentMethod.commission,
      'commissionArticle': this.paymentMethod.commissionArticle,
      'administrativeExpense': this.paymentMethod.administrativeExpense,
      'administrativeExpenseArticle': this.paymentMethod.administrativeExpenseArticle,
      'otherExpense': this.paymentMethod.otherExpense,
      'otherExpenseArticle': this.paymentMethod.otherExpenseArticle,
      'isCurrentAccount': this.paymentMethod.isCurrentAccount,
      'acceptReturned': this.paymentMethod.acceptReturned,
      'inputAndOuput': this.paymentMethod.inputAndOuput,
      'checkDetail': this.paymentMethod.checkDetail,
      'cardDetail': this.paymentMethod.cardDetail,
      'allowToFinance': this.paymentMethod.allowToFinance,
      'cashBoxImpact': this.paymentMethod.cashBoxImpact,
      'bankReconciliation': this.paymentMethod.bankReconciliation,
      'company': this.paymentMethod.company,
      'observation': this.paymentMethod.observation,
      'allowCurrencyValue': this.paymentMethod.allowCurrencyValue,
      'allowBank': this.paymentMethod.allowBank,
      'mercadopagoAPIKey': this.paymentMethod.mercadopagoAPIKey,
      'whatsappNumber': this.paymentMethod.whatsappNumber,
      'checkPerson': this.paymentMethod.checkPerson
    });
  }

  public setValuesArray(): void {

    if (this.applications && this.applications.length > 0) {
      this.applications.forEach(x => {
        let exists = false;
        if (this.paymentMethod.applications) {
          this.paymentMethod.applications.forEach(y => {
            if (x._id === y._id) {
              exists = true;
              const control = new FormControl(y); // if first item set to true, else false
              (this.paymentMethodForm.controls.applications as FormArray).push(control);
            }
          })
        }
        if (!exists) {
          const control = new FormControl(false); // if first item set to true, else false
          (this.paymentMethodForm.controls.applications as FormArray).push(control);
        }
      })
    }
  }

  public getAllApplications(match: {}): Promise<Application[]> {
    return new Promise<Application[]>((resolve, reject) => {
      this.subscription.add(this._applicationService.getAll({
        match,
        sort: { name: 1 },
      }).subscribe(
        result => {
          this.loading = false;
          (result.status === 200) ? resolve(result.result) : reject(result);
        },
        error => reject(error)
      ));
    });
  }

  public updatePaymentMethod(): void {

    this.loading = true;

    this._paymentMethodService.updatePaymentMethod(this.paymentMethod).subscribe(
      result => {
        if (!result.paymentMethod) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.paymentMethod = result.paymentMethod;
          this.showToast(null, 'success', 'El método de pago se ha actualizado con éxito.');
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

    this.loading = true;

    this._paymentMethodService.savePaymentMethod(this.paymentMethod).subscribe(
      result => {
        if (!result.paymentMethod) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.paymentMethod = result.paymentMethod;
          this.showToast(null, 'success', 'El medio de pago se ha añadido con éxito.');
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

  public showToast(result, type?: string, title?: string, message?: string): void {
    if (result) {
      if (result.status === 200) {
        type = 'success';
        title = result.message;
      } else if (result.status >= 400) {
        type = 'danger';
        title = (result.error && result.error.message) ? result.error.message : result.message;
      } else {
        type = 'info';
        title = result.message;
      }
    }
    switch (type) {
      case 'success':
        this._toastr.success(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
      case 'danger':
        this._toastr.error(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
      default:
        this._toastr.info(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
    }
    this.loading = false;
  }
}
