import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { CompanyType, PaymentMethod } from '../payment-method';

import { Account, ApiResponse, Currency } from '@types';
import { Application } from 'app/components/application/application.model';
import { Article } from 'app/components/article/article';
import { AccountService } from 'app/core/services/account.service';
import { ApplicationService } from 'app/core/services/application.service';
import { ArticleService } from 'app/core/services/article.service';
import { CurrencyService } from 'app/core/services/currency.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TranslateMePipe } from 'app/shared/pipes/translate-me';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { PaymentMethodService } from '../../../core/services/payment-method.service';

@Component({
  selector: 'app-payment-method',
  templateUrl: './payment-method.component.html',
  styleUrls: ['./payment-method.component.css'],
  providers: [NgbAlertConfig, TranslateMePipe],
})
export class PaymentMethodComponent implements OnInit {
  @Input() paymentMethodId: string;
  @Input() readonly: boolean;
  @Input() operation: string;
  public paymentMethod: PaymentMethod;
  public paymentMethodForm: UntypedFormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public companyTypes: CompanyType[] = [CompanyType.None, CompanyType.Client, CompanyType.Provider];
  public applications: Application[];
  private subscription: Subscription = new Subscription();
  public focus$: Subject<string>[] = new Array();

  public formErrors = {
    code: '',
    name: '',
  };

  public validationMessages = {
    code: {
      required: 'Este campo es requerido.',
    },
    name: {
      required: 'Este campo es requerido.',
    },
  };

  public searchArticles = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.loading = true)),
      switchMap(async (term) => {
        let match: {} = term && term !== '' ? { description: { $regex: term, $options: 'i' } } : {};
        return await this.getAllArticles(match).then((result) => {
          return result;
        });
      }),
      tap(() => (this.loading = false))
    );
  public formatterArticles = (x: Article) => {
    return x.description;
  };

  public searchCurrencies = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.loading = true)),
      switchMap(async (term) => {
        let match: {} = term && term !== '' ? { name: { $regex: term, $options: 'i' } } : {};
        return await this.getAllCurrencies(match).then((result) => {
          return result;
        });
      }),
      tap(() => (this.loading = false))
    );
  public formatterCurrencies = (x: Currency) => {
    return x.name;
  };

  public searchAccounts = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.loading = true)),
      switchMap(async (term) => {
        let match: {} =
          term && term !== ''
            ? {
                description: { $regex: term, $options: 'i' },
                mode: 'Analitico',
                operationType: { $ne: 'D' },
              }
            : {};
        return await this.getAllAccounts(match).then((result) => {
          return result;
        });
      }),
      tap(() => (this.loading = false))
    );
  public formatterAccounts = (x: Account) => {
    return x.description;
  };

  constructor(
    private _paymentMethodService: PaymentMethodService,
    public _fb: UntypedFormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    private _applicationService: ApplicationService,
    public _accountService: AccountService,
    public translatePipe: TranslateMePipe,
    private _toastService: ToastService,
    private _articleService: ArticleService,
    private _currencyService: CurrencyService
  ) {}

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
      .catch((error: ApiResponse) => this._toastService.showToast(error));

    if (this.paymentMethodId) {
      this.getPaymentMetod();
    }
  }

  public getPaymentMetod() {
    this._paymentMethodService.getPaymentMethod(this.paymentMethodId).subscribe(
      (result) => {
        if (result && result.paymentMethod) {
          this.paymentMethod = result.paymentMethod;
          this.setValueForm();
          this.setValuesArray();
        }
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {
    this.paymentMethodForm = this._fb.group({
      _id: [this.paymentMethod._id, []],
      order: [this.paymentMethod.order, []],
      code: [this.paymentMethod.code, []],
      name: [this.paymentMethod.name, [Validators.required]],
      discount: [this.paymentMethod.discount, []],
      discountArticle: [this.paymentMethod.discountArticle, []],
      surcharge: [this.paymentMethod.surcharge, []],
      surchargeArticle: [this.paymentMethod.surchargeArticle, []],
      commission: [this.paymentMethod.commission, []],
      commissionArticle: [this.paymentMethod.commissionArticle, []],
      administrativeExpense: [this.paymentMethod.administrativeExpense, []],
      administrativeExpenseArticle: [this.paymentMethod.administrativeExpenseArticle, []],
      otherExpense: [this.paymentMethod.otherExpense, []],
      otherExpenseArticle: [this.paymentMethod.otherExpenseArticle, []],
      isCurrentAccount: [this.paymentMethod.isCurrentAccount, []],
      acceptReturned: [this.paymentMethod.acceptReturned, []],
      inputAndOuput: [this.paymentMethod.inputAndOuput, []],
      checkDetail: [this.paymentMethod.checkDetail, []],
      checkPerson: [this.paymentMethod.checkPerson, []],
      cardDetail: [this.paymentMethod.cardDetail, []],
      allowToFinance: [this.paymentMethod.allowToFinance, []],
      payFirstQuota: [this.paymentMethod.payFirstQuota, []],
      cashBoxImpact: [this.paymentMethod.cashBoxImpact, []],
      company: [this.paymentMethod.company, []],
      currency: [this.paymentMethod.currency, []],
      allowCurrencyValue: [this.paymentMethod.allowCurrencyValue, []],
      observation: [this.paymentMethod.observation, []],
      allowBank: [this.paymentMethod.allowBank, []],
      bankReconciliation: [this.paymentMethod.bankReconciliation, []],
      mercadopagoAPIKey: [this.paymentMethod.mercadopagoAPIKey, []],
      mercadopagoClientId: [this.paymentMethod.mercadopagoClientId, []],
      mercadopagoAccessToken: [this.paymentMethod.mercadopagoAccessToken, []],
      whatsappNumber: [this.paymentMethod.whatsappNumber, []],
      applications: this._fb.array([]),
      account: [this.paymentMethod.account, []],
      expirationDays: [this.paymentMethod.expirationDays, []],
    });

    this.paymentMethodForm.valueChanges.subscribe((data) => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {
    if (!this.paymentMethodForm) {
      return;
    }
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
    if (!this.paymentMethod.discountArticle || !this.paymentMethod.discountArticle._id)
      this.paymentMethod.discountArticle = null;
    if (!this.paymentMethod.surchargeArticle || !this.paymentMethod.surchargeArticle._id)
      this.paymentMethod.surchargeArticle = null;
    if (!this.paymentMethod.commissionArticle || !this.paymentMethod.commissionArticle._id)
      this.paymentMethod.commissionArticle = null;
    if (!this.paymentMethod.administrativeExpenseArticle || !this.paymentMethod.administrativeExpenseArticle._id)
      this.paymentMethod.administrativeExpenseArticle = null;
    if (!this.paymentMethod.otherExpenseArticle || !this.paymentMethod.otherExpenseArticle._id)
      this.paymentMethod.otherExpenseArticle = null;
    if (!this.paymentMethod.currency || !this.paymentMethod.currency._id) this.paymentMethod.currency = null;

    const selectedOrderIds = this.paymentMethodForm.value.applications
      .map((v, i) => (v ? this.applications[i] : null))
      .filter((v) => v !== null);
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

  public getAllCurrencies(match: {}): Promise<Currency[]> {
    return new Promise<Currency[]>((resolve, reject) => {
      match['operationType'] = { $ne: 'D' };
      this.subscription.add(
        this._currencyService
          .getAll({
            match,
            sort: { name: 1 },
            limit: 10,
          })
          .subscribe(
            (result) => {
              this.loading = false;
              result.status === 200 ? resolve(result.result) : reject(result);
            },
            (error) => reject(error)
          )
      );
    });
  }

  public getAllArticles(match: {}): Promise<Article[]> {
    return new Promise<Article[]>((resolve, reject) => {
      match['type'] = 'Final';
      match['operationType'] = { $ne: 'D' };
      this.subscription.add(
        this._articleService
          .getAll({
            match,
            sort: { description: 1 },
            limit: 10,
          })
          .subscribe(
            (result) => {
              this.loading = false;
              result.status === 200 ? resolve(result.result) : reject(result);
            },
            (error) => reject(error)
          )
      );
    });
  }

  public setValueForm(): void {
    if (!this.paymentMethod._id) this.paymentMethod._id = '';
    if (!this.paymentMethod.code) this.paymentMethod.code = 1;
    if (!this.paymentMethod.order) this.paymentMethod.order = 1;
    if (!this.paymentMethod.name) this.paymentMethod.name = '';
    if (!this.paymentMethod.discount) this.paymentMethod.discount = 0.0;
    if (!this.paymentMethod.discountArticle) this.paymentMethod.discountArticle = null;
    if (!this.paymentMethod.surcharge) this.paymentMethod.surcharge = 0.0;
    if (!this.paymentMethod.surchargeArticle) this.paymentMethod.surchargeArticle = null;
    if (!this.paymentMethod.commission) this.paymentMethod.commission = 0.0;
    if (!this.paymentMethod.commissionArticle) this.paymentMethod.commissionArticle = null;
    if (!this.paymentMethod.administrativeExpense) this.paymentMethod.administrativeExpense = 0.0;
    if (!this.paymentMethod.administrativeExpenseArticle) this.paymentMethod.administrativeExpenseArticle = null;
    if (!this.paymentMethod.otherExpense) this.paymentMethod.otherExpense = 0.0;
    if (!this.paymentMethod.otherExpenseArticle) this.paymentMethod.otherExpenseArticle = null;
    if (this.paymentMethod.isCurrentAccount === undefined) this.paymentMethod.isCurrentAccount = false;
    if (this.paymentMethod.acceptReturned === undefined) this.paymentMethod.acceptReturned = false;
    if (this.paymentMethod.inputAndOuput === undefined) this.paymentMethod.inputAndOuput = false;
    if (this.paymentMethod.checkDetail === undefined) this.paymentMethod.checkDetail = false;
    if (this.paymentMethod.checkPerson === undefined) this.paymentMethod.checkPerson = false;
    if (this.paymentMethod.cardDetail === undefined) this.paymentMethod.cardDetail = false;
    if (this.paymentMethod.allowToFinance === undefined) this.paymentMethod.allowToFinance = false;
    if (this.paymentMethod.payFirstQuota === undefined) this.paymentMethod.payFirstQuota = false;
    if (this.paymentMethod.cashBoxImpact === undefined) this.paymentMethod.cashBoxImpact = false;
    if (this.paymentMethod.bankReconciliation === undefined) this.paymentMethod.bankReconciliation = false;
    if (this.paymentMethod.allowCurrencyValue === undefined) this.paymentMethod.allowCurrencyValue = false;
    if (this.paymentMethod.allowBank === undefined) this.paymentMethod.allowBank = false;
    if (!this.paymentMethod.company) this.paymentMethod.company = null;
    if (!this.paymentMethod.mercadopagoAPIKey) this.paymentMethod.mercadopagoAPIKey = null;
    if (!this.paymentMethod.mercadopagoClientId) this.paymentMethod.mercadopagoClientId = null;
    if (!this.paymentMethod.mercadopagoAccessToken) this.paymentMethod.mercadopagoAccessToken = null;
    if (!this.paymentMethod.whatsappNumber) this.paymentMethod.whatsappNumber = null;
    if (!this.paymentMethod.observation) this.paymentMethod.observation = '';
    if (!this.paymentMethod.currency) this.paymentMethod.currency = null;
    if (!this.paymentMethod.account) this.paymentMethod.account = null;
    if (!this.paymentMethod.expirationDays) this.paymentMethod.expirationDays = 30;

    this.paymentMethodForm.patchValue({
      _id: this.paymentMethod._id,
      order: this.paymentMethod.order,
      code: this.paymentMethod.code,
      name: this.paymentMethod.name,
      discount: this.paymentMethod.discount,
      discountArticle: this.paymentMethod.discountArticle,
      surcharge: this.paymentMethod.surcharge,
      surchargeArticle: this.paymentMethod.surchargeArticle,
      commission: this.paymentMethod.commission,
      commissionArticle: this.paymentMethod.commissionArticle,
      administrativeExpense: this.paymentMethod.administrativeExpense,
      administrativeExpenseArticle: this.paymentMethod.administrativeExpenseArticle,
      otherExpense: this.paymentMethod.otherExpense,
      otherExpenseArticle: this.paymentMethod.otherExpenseArticle,
      isCurrentAccount: this.paymentMethod.isCurrentAccount,
      acceptReturned: this.paymentMethod.acceptReturned,
      inputAndOuput: this.paymentMethod.inputAndOuput,
      checkDetail: this.paymentMethod.checkDetail,
      cardDetail: this.paymentMethod.cardDetail,
      allowToFinance: this.paymentMethod.allowToFinance,
      payFirstQuota: this.paymentMethod.payFirstQuota,
      cashBoxImpact: this.paymentMethod.cashBoxImpact,
      bankReconciliation: this.paymentMethod.bankReconciliation,
      company: this.paymentMethod.company,
      observation: this.paymentMethod.observation,
      currency: this.paymentMethod.currency,
      allowCurrencyValue: this.paymentMethod.allowCurrencyValue,
      allowBank: this.paymentMethod.allowBank,
      mercadopagoAPIKey: this.paymentMethod.mercadopagoAPIKey,
      mercadopagoClientId: this.paymentMethod.mercadopagoClientId,
      mercadopagoAccessToken: this.paymentMethod.mercadopagoAccessToken,
      whatsappNumber: this.paymentMethod.whatsappNumber,
      checkPerson: this.paymentMethod.checkPerson,
      account: this.paymentMethod.account,
      expirationDays: this.paymentMethod.expirationDays,
    });
  }

  public setValuesArray(): void {
    if (this.applications && this.applications.length > 0) {
      this.applications.forEach((x) => {
        let exists = false;
        if (this.paymentMethod.applications) {
          this.paymentMethod.applications.forEach((y) => {
            if (x._id === y._id) {
              exists = true;
              const control = new UntypedFormControl(y); // if first item set to true, else false
              (this.paymentMethodForm.controls.applications as UntypedFormArray).push(control);
            }
          });
        }
        if (!exists) {
          const control = new UntypedFormControl(false); // if first item set to true, else false
          (this.paymentMethodForm.controls.applications as UntypedFormArray).push(control);
        }
      });
    }
  }

  public getAllApplications(match: {}): Promise<Application[]> {
    return new Promise<Application[]>((resolve, reject) => {
      this.subscription.add(
        this._applicationService
          .getAll({
            match,
            sort: { name: 1 },
          })
          .subscribe(
            (result) => {
              this.loading = false;
              result.status === 200 ? resolve(result.result) : reject(result);
            },
            (error) => reject(error)
          )
      );
    });
  }

  public getAllAccounts(match: {}): Promise<Account[]> {
    return new Promise<Account[]>((resolve, reject) => {
      this.subscription.add(
        this._accountService
          .getAll({
            match,
            sort: { description: 1 },
          })
          .subscribe(
            (result) => {
              this.loading = false;
              result.status === 200 ? resolve(result.result) : reject(result);
            },
            (error) => reject(error)
          )
      );
    });
  }

  public updatePaymentMethod(): void {
    this.loading = true;

    this._paymentMethodService.updatePaymentMethod(this.paymentMethod).subscribe(
      (result) => {
        if (!result.paymentMethod) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.paymentMethod = result.paymentMethod;
          this._toastService.showToast({
            type: 'success',
            message: 'El método de pago se ha actualizado con éxito.',
          });
        }
        this.loading = false;
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public deletePaymentMethod(): void {
    this.loading = true;

    this._paymentMethodService.deletePaymentMethod(this.paymentMethodId).subscribe(
      (result) => {
        this.activeModal.close('delete_close');
        this.loading = false;
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public savePaymentMethod(): void {
    this.loading = true;

    this._paymentMethodService.savePaymentMethod(this.paymentMethod).subscribe(
      (result) => {
        if (!result.paymentMethod) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.paymentMethod = result.paymentMethod;
          this._toastService.showToast({
            type: 'success',
            message: 'El medio de pago se ha añadido con éxito.',
          });
          this.paymentMethod = new PaymentMethod();
          this.buildForm();
        }
        this.loading = false;
      },
      (error) => {
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
