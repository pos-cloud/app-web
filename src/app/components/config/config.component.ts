import {
  Component,
  EventEmitter,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { User } from 'app/components/user/user';
import * as moment from 'moment';
import 'moment/locale/es';

import { NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Router } from '@angular/router';

import { VATCondition } from 'app/components/vat-condition/vat-condition';
import { Config } from './../../app.config';

import { IdentificationType } from 'app/components/identification-type/identification-type';
import { AuthService } from 'app/core/services/auth.service';
import { IdentificationTypeService } from 'app/core/services/identification-type.service';
import { ConfigService } from '../../core/services/config.service';
import { UserService } from '../../core/services/user.service';
import { VATConditionService } from '../../core/services/vat-condition.service';
import { DateFormatPipe } from '../../shared/pipes/date-format.pipe';

import { MediaCategory } from '@types';
import { Currency } from 'app/components/currency/currency';
import { CurrencyService } from 'app/core/services/currency.service';
import { FileService } from 'app/core/services/file.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { environment } from 'environments/environment';
import { Observable, Subscription } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  first,
  switchMap,
  tap,
} from 'rxjs/operators';
import { AccountService } from '../../core/services/account.service';
import { Account } from '../account/account';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss'],
  providers: [NgbAlertConfig, DateFormatPipe],
  encapsulation: ViewEncapsulation.None,
})
export class ConfigComponent implements OnInit {
  public identity: User;
  public routeFile: string;
  public filesToUpload: Array<File>;
  public identificationTypes: IdentificationType[];
  public vatConditions: VATCondition[];
  public currencies: Currency[];
  public config: Config;
  public loading: boolean = false;
  public configFormEmail: UntypedFormGroup;
  public configFormCompany: UntypedFormGroup;
  public configFormSystem: UntypedFormGroup;
  public focusEvent = new EventEmitter<boolean>();
  public alertMessage: string = '';
  public loadingCompany: boolean = false;
  public loadingEmail: boolean = false;
  public loadingLicense: boolean = false;
  public loadingSystem: boolean = false;
  public dateFormat: DateFormatPipe = new DateFormatPipe();
  public imageURL: string;
  public countries: any;
  public timezones: any;
  public userCountry: string;
  public apiURL: string;
  public apiV8URL: string;
  private subscription: Subscription = new Subscription();

  public formErrors = {
    emailAccount: '',
    emailPassword: '',
    companyName: '',
    companyStartOfActivity: '',
  };

  public validationMessages = {
    emailAccount: { required: 'Este campo es requerido' },
    emailPassword: { required: 'Este campo es requerido' },
    companyName: { required: 'Este campo es requerido' },
    companyStartOfActivity: { dateValid: 'Fecha inválida' },
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
    public _router: Router,
    public _configService: ConfigService,
    public _vatCondition: VATConditionService,
    public _identificationTypeService: IdentificationTypeService,
    public _currencyService: CurrencyService,
    public _accountService: AccountService,
    public _userService: UserService,
    public _fb: UntypedFormBuilder,
    public _toastService: ToastService,
    public alertConfig: NgbAlertConfig,
    private _authService: AuthService,
    public _modalService: NgbModal,
    public _fileService: FileService
  ) {
    this.apiURL = Config.apiURL;
    this.apiV8URL = Config.apiV8URL;
    this.getVatConditions();
    this.getCountries();
    this.getCurrencies();
  }

  async ngOnInit() {
    await this._configService.getConfig.subscribe((config) => {
      this.config = config;
      this.buildFormCompany();
      this.buildFormEmail();
      this.buildFormSystem();
    });
    this._authService.getIdentity.pipe(first()).subscribe((identity) => {
      this.identity = identity;
    });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
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

  public getCountries(): void {
    this._configService.getCountry().subscribe((result) => {
      this.countries = result;
    });
  }

  public getTimeZone(country: string) {
    this._configService.getTimeZone(country).subscribe((result) => {
      this.timezones = result;
      this.timezones = this.timezones.timezones;
    });
  }
  public async generateBackUp() {
    this._configService.generateBackUp().subscribe((result) => {
      if (result && result.archive_path) {
        let link = document.createElement('a');
        link.download = 'filename';
        link.href =
          environment.apiv2 + 'configs/downloadBD/' + result.archive_path;
        link.click();
        this._toastService.showToast({
          message: result.message,
          type: 'success',
        });
      } else {
        this._toastService.showToast({
          message: 'Error al generar el respaldo',
          type: 'error',
        });
      }
    });
  }

  public upload() {
    const companyCUIT = this.config['companyIdentificationValue'];

    this._configService.uploadCRT(this.filesToUpload, companyCUIT).then(
      (result) => {
        if (result) {
          this._toastService.showToast({
            message: result.message,
            type: 'success',
          });
        }
      },
      (error) => {
        this._toastService.showToast({ message: error, type: 'warning' });
      }
    );
  }

  public fileChangeEvent(event: any) {
    this.filesToUpload = <Array<File>>event.target.files;

    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageURL = e.target.result;
      };
      // Coloca la siguiente línea fuera del evento onload
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  public buildFormCompany() {
    this.configFormCompany = this._fb.group({
      _id: [this.config._id, [Validators.required]],
      companyPicture: [this.config['companyPicture'], []],
      companyName: [this.config['companyName'], [Validators.required]],
      companyFantasyName: [this.config['companyFantasyName'], []],
      companyIdentificationType: [this.config['companyIdentificationType'], []],
      companyIdentificationValue: [
        this.config['companyIdentificationValue'],
        [],
      ],
      companyVatCondition: [this.config['companyVatCondition'], []],
      companyStartOfActivity: ['', [this.validateDate()]],
      companyGrossIncome: [this.config['companyGrossIncome'], []],
      companyAddress: [this.config['companyAddress'], []],
      companyPhone: [this.config['companyPhone'], []],
      companyPostalCode: [this.config['companyPostalCode'], []],
      footerInvoice: [this.config['footerInvoice'], []],
      country: [this.config['country'], []],
      latitude: [this.config['latitude'], []],
      longitude: [this.config['longitude'], []],
      timezone: [this.config['timezone'], []],
      currency: [this.config['currency'], []],
    });

    this.configFormCompany.valueChanges.subscribe((data) =>
      this.onValueChangedCompany(data)
    );
    this.onValueChangedCompany();
    this.focusEvent.emit(true);
  }

  public onValueChangedCompany(data?: any): void {
    if (!this.configFormCompany) {
      return;
    }
    const form = this.configFormCompany;

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

  public buildFormEmail() {
    this.configFormEmail = this._fb.group({
      _id: [this.config._id, [Validators.required]],
      emailAccount: [this.config['emailAccount'], []],
      emailPassword: [this.config['emailPassword'], []],
      emailHost: [this.config['emailHost'], []],
      emailPort: [this.config['emailPort'], []],
    });

    this.configFormEmail.valueChanges.subscribe((data) =>
      this.onValueChangedEmail(data)
    );
    this.onValueChangedEmail();
    this.focusEvent.emit(true);
  }

  public onValueChangedEmail(data?: any): void {
    if (!this.configFormEmail) {
      return;
    }
    const form = this.configFormEmail;

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

  public buildFormSystem() {
    if (!this.config.twilio) {
      this.config.twilio = {
        senderNumber: '',
        accountSid: '',
        authToken: '',
      };
    }
    if (!this.config.tiendaNube) {
      this.config.tiendaNube = {
        token: '',
        userID: '',
        appID: '',
        clientSecret: '',
      };
    }
    this.configFormSystem = this._fb.group({
      _id: [this.config._id, [Validators.required]],
      'article.code.validators.maxLength': [
        this.config.article.code.validators.maxLength,
        [],
      ],
      'article.salesAccount.default': [
        this.config.article.salesAccount.default,
        [],
      ],
      'article.purchaseAccount.default': [
        this.config.article.purchaseAccount.default,
        [],
      ],
      'article.isWeigth.default': [this.config.article.isWeigth.default, []],
      'article.allowSaleWithoutStock.default': [
        this.config.article.allowSaleWithoutStock.default || false,
        [],
      ],
      'company.vatCondition.default': [
        this.config.company.vatCondition.default,
        [],
      ],
      // 'company.allowCurrentAccount.default': [this.config.company.allowCurrentAccount.default, []],
      'company.allowCurrentAccountProvider.default': [
        this.config.company.allowCurrentAccountProvider.default,
        [],
      ],
      'company.allowCurrentAccountClient.default': [
        this.config.company.allowCurrentAccountClient.default,
        [],
      ],
      'company.accountClient.default': [
        this.config.company.accountClient.default,
        [],
      ],
      'company.accountProvider.default': [
        this.config.company.accountProvider.default,
        [],
      ],
      'cashBox.perUser': [this.config.cashBox.perUser, []],
      'reports.summaryOfAccounts.detailsPaymentMethod': [
        this.config.reports.summaryOfAccounts.detailsPaymentMethod,
        [],
      ],
      'reports.summaryOfAccounts.invertedViewClient': [
        this.config.reports.summaryOfAccounts.invertedViewClient,
        [],
      ],
      'reports.summaryOfAccounts.invertedViewProvider': [
        this.config.reports.summaryOfAccounts.invertedViewProvider,
        [],
      ],
      'tradeBalance.codePrefix': [this.config.tradeBalance.codePrefix, []],
      'tradeBalance.numberOfCode': [this.config.tradeBalance.numberOfCode, []],
      'tradeBalance.numberOfQuantity': [
        this.config.tradeBalance.numberOfQuantity,
        [],
      ],
      'tradeBalance.numberOfIntegers': [
        this.config.tradeBalance.numberOfIntegers,
        [],
      ],
      'tradeBalance.numberOfDecimals': [
        this.config.tradeBalance.numberOfDecimals,
        [],
      ],
      'voucher.readingLimit': [this.config.voucher.readingLimit, []],
      'voucher.minutesOfExpiration': [
        this.config.voucher.minutesOfExpiration,
        [],
      ],
      'twilio.senderNumber': [this.config.twilio.senderNumber, []],
      'twilio.accountSid': [this.config.twilio.accountSid, []],
      'twilio.authToken': [this.config.twilio.authToken, []],
      'tiendaNube.token': [this.config.tiendaNube.token, []],
      'tiendaNube.userID': [this.config.tiendaNube.userID, []],
      'tiendaNube.appID': [this.config.tiendaNube.appID, []],
      'tiendaNube.clientSecret': [this.config.tiendaNube.clientSecret, []],
    });

    this.configFormSystem.valueChanges.subscribe((data) =>
      this.onValueChangedSystem(data)
    );
    this.onValueChangedSystem();
    this.focusEvent.emit(true);
  }

  public onValueChangedSystem(data?: any): void {
    if (!this.configFormSystem) {
      return;
    }
    const form = this.configFormSystem;

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

  public validateDate() {
    return function (input: UntypedFormControl) {
      let dateValid = false;
      let date;
      if (
        input.parent &&
        input.parent.controls &&
        input.parent.controls['companyStartOfActivity'].value
      ) {
        date = input.parent.controls['companyStartOfActivity'].value;
        if (moment(date, 'DD/MM/YYYY', true).isValid()) {
          dateValid = true;
        } else {
          dateValid = false;
        }
      }
      return dateValid ? null : { dateValid: true };
    };
  }

  public getVatConditions(): void {
    this.loadingCompany = true;

    this._vatCondition.getVATConditions().subscribe(
      (result) => {
        if (!result.vatConditions) {
        } else {
          this.vatConditions = result.vatConditions;
        }
        this.getIdentificationTypes();
        this.loadingCompany = false;
      },
      (error) => {
        this._toastService.showToast({ message: error._body, type: 'danger' });
        this.loadingCompany = false;
      }
    );
  }

  public getCurrencies(): void {
    this.loadingCompany = true;

    this._currencyService.getCurrencies('sort="name":1').subscribe(
      (result) => {
        if (!result.currencies) {
        } else {
          this.currencies = result.currencies;
        }
        this.loadingCompany = false;
      },
      (error) => {
        this._toastService.showToast({ message: error._body, type: 'danger' });
        this.loadingCompany = false;
      }
    );
  }

  public getIdentificationTypes(): void {
    let query = 'sort="name":1';

    this._identificationTypeService.getIdentificationTypes(query).subscribe(
      (result) => {
        if (!result.identificationTypes) {
        } else {
          this.identificationTypes = result.identificationTypes;
        }
        this.getConfig();
      },
      (error) => {
        this._toastService.showToast({ message: error._body, type: 'danger' });
      }
    );
  }

  public getConfig(): void {
    this._configService.getConfigApi().subscribe(
      (result) => {
        if (!result.configs) {
          if (result.message && result.message !== '')
            this._toastService.showToast({
              message: result.message,
              type: 'info',
            });
        } else {
          //let config = result.configs[0];
          this.config = result.configs[0];
          this.imageURL = this.config['companyPicture'];

          this.setConfigurationSettings(this.config);
          this.setValuesForm();
        }
      },
      (error) => {
        this._toastService.showToast({ message: error._body, type: 'danger' });
      }
    );
  }

  public generateCRS() {
    this.loading = true;

    this._configService
      .generateCRS(
        this.config['companyName'],
        this.config['companyIdentificationValue']
      )
      .subscribe(
        (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'poscloud.csr';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          this.loading = false;
        },
        (error) => {
          this._toastService.showToast({
            message: error._body,
            type: 'danger',
          });
          this.loading = false;
        }
      );
  }

  async addConfigCompany() {
    this.loadingCompany = true;

    this.config = this.configFormCompany.value;
    this.config['companyStartOfActivity'] = moment(
      this.config['companyStartOfActivity'],
      'DD/MM/YYYY'
    ).format('YYYY-MM-DDTHH:mm:ssZ');
    if (this.filesToUpload)
      this.config['companyPicture'] = await this.uploadFile(
        this.config['companyPicture']
      );

    await this.updateConfig().then((config) => {
      if (config) {
        this.config = config;
        this._toastService.showToast({
          message: 'La configuración de empresa se guardo con éxito ',
          type: 'success',
        });
      } else {
        this._toastService.showToast({
          message: 'No se encontro configuración de empresa',
          type: 'danger',
        });
      }
      this.loadingCompany = false;
    });
  }

  async addConfigEmail() {
    this.config = this.configFormEmail.value;
    this.loadingEmail = true;
    await this.updateConfig().then((config) => {
      if (config) {
        this.config = config;
        this._toastService.showToast({
          message: 'Los cambios fueron guardados con éxito.',
          type: 'success',
        });
        this.getConfig();
      }
      this.loadingEmail = false;
    });
  }

  async addConfigSystem() {
    this.config = this.configFormSystem.value;
    this.loadingSystem = true;
    await this.updateConfig().then((config) => {
      if (config) {
        this.config = config;
        this._toastService.showToast({
          message: 'Los cambios fueron guardados con éxito.',
          type: 'success',
        });
      }
      this.loadingSystem = false;
    });
  }

  public updateConfig(): Promise<Config> {
    return new Promise<Config>((resolve, reject) => {
      this._configService.updateConfig(this.config).subscribe(
        (result) => {
          if (!result.configs) {
            if (result.message && result.message !== '')
              this._toastService.showToast({
                message: result.message,
                type: 'info',
              });
            resolve(null);
          } else {
            resolve(result.configs[0]);
          }
        },
        (error) => {
          this._toastService.showToast({
            message: error._body,
            type: 'danger',
          });
          resolve(null);
        }
      );
    });
  }

  async deletePicture(picture: string) {
    this.config['companyPicture'] = './../../../assets/img/default.jpg';
    this.imageURL = './../../../assets/img/default.jpg';

    await this.deleteFile(picture);
  }

  public setValuesForm(): void {
    if (!this.config['emailAccount']) this.config['emailAccount'] = '';
    if (!this.config['emailPassword']) this.config['emailPassword'] = '';
    if (!this.config['emailHost']) this.config['emailHost'] = '';
    if (!this.config['emailPort']) this.config['emailPort'] = '';
    if (!this.config['companyPicture'])
      this.config['companyPicture'] = 'default.jpg';
    if (!this.config['companyName']) this.config['companyName'] = '';
    if (!this.config['companyFantasyName'])
      this.config['companyFantasyName'] = '';

    let companyVatCondition;
    if (!this.config['companyVatCondition']) {
      companyVatCondition = null;
    } else {
      if (this.config['companyVatCondition']._id) {
        companyVatCondition = this.config['companyVatCondition']._id;
      } else {
        companyVatCondition = this.config['companyVatCondition'];
      }
    }

    let companyIdentificationType;
    if (!this.config['companyIdentificationType']) {
      companyIdentificationType = null;
    } else {
      if (this.config['companyIdentificationType']._id) {
        companyIdentificationType =
          this.config['companyIdentificationType']._id;
      } else {
        companyIdentificationType = this.config['companyIdentificationType'];
      }
    }

    if (!this.config['companyIdentificationValue'])
      this.config['companyIdentificationValue'] = '';
    if (!this.config['companyStartOfActivity'])
      this.config['companyStartOfActivity'] = moment().format(
        'YYYY-MM-DDTHH:mm:ssZ'
      );
    if (!this.config['companyGrossIncome'])
      this.config['companyGrossIncome'] = '';
    if (!this.config['companyAddress']) this.config['companyAddress'] = '';
    if (!this.config['companyPhone']) this.config['companyPhone'] = '';
    if (!this.config['companyPostalCode'])
      this.config['companyPostalCode'] = '';
    if (!this.config['footerInvoice']) this.config['footerInvoice'] = '';
    if (!this.config['country']) this.config['country'] = 'AR';
    if (!this.config['latitude']) this.config['latitude'] = '';
    if (!this.config['longitude']) this.config['longitude'] = '';
    if (!this.config['timezone']) this.config['timezone'] = 'UTC-03:00';

    let currency;
    if (!this.config['currency']) {
      currency = null;
    } else {
      if (this.config['currency']._id) {
        currency = this.config['currency']._id;
      } else {
        currency = this.config['currency'];
      }
    }

    if (this.config.article.code.validators.maxLength === undefined)
      this.config.article.code.validators.maxLength = 10;
    if (this.config.article.isWeigth.default === undefined)
      this.config.article.isWeigth.default = false;
    // if (this.config.company.allowCurrentAccount.default === undefined) this.config.company.allowCurrentAccount.default = false;

    if (this.config.company.allowCurrentAccountProvider.default === undefined)
      this.config.company.allowCurrentAccountProvider.default = false;
    if (this.config.company.allowCurrentAccountClient.default === undefined)
      this.config.company.allowCurrentAccountClient.default = false;
    if (this.config.cashBox.perUser === undefined)
      this.config.cashBox.perUser = false;
    if (this.config.reports.summaryOfAccounts.invertedViewClient === undefined)
      this.config.reports.summaryOfAccounts.invertedViewClient = false;
    if (
      this.config.reports.summaryOfAccounts.invertedViewProvider === undefined
    )
      this.config.reports.summaryOfAccounts.invertedViewProvider = false;
    if (this.config.tradeBalance.codePrefix === undefined)
      this.config.tradeBalance.codePrefix = 0;
    if (this.config.tradeBalance.numberOfCode === undefined)
      this.config.tradeBalance.numberOfCode = 4;
    if (this.config.tradeBalance.numberOfQuantity === undefined)
      this.config.tradeBalance.numberOfQuantity = 2;
    if (this.config.tradeBalance.numberOfIntegers === undefined)
      this.config.tradeBalance.numberOfIntegers = 3;
    if (this.config.tradeBalance.numberOfDecimals === undefined)
      this.config.tradeBalance.numberOfDecimals = 2;
    if (this.config.voucher.readingLimit === undefined)
      this.config.voucher.readingLimit = 0;
    if (this.config.voucher.minutesOfExpiration === undefined)
      this.config.voucher.minutesOfExpiration = 720;
    // if (!this.config.twilio) {
    //   this.config.twilio = {
    //     senderNumber: '',
    //     accountSid: '',
    //     authToken: ''
    //   }
    // }
    // if (!this.config.twilio.senderNumber) this.config.twilio.senderNumber = '';
    // if (!this.config.twilio.accountSid) this.config.twilio.accountSid = '';
    // if (!this.config.twilio.authToken) this.config.twilio.authToken = '';

    // if (!this.config.tiendaNube) {
    //   this.config.tiendaNube = {
    //     appID: '',
    //     clientSecret: '',
    //     token: '',
    //     userID: ''
    //   }
    // }

    // if(!this.config.tiendaNube.appID) this.config.tiendaNube.appID;
    // if(!this.config.tiendaNube.clientSecret) this.config.tiendaNube.clientSecret;
    if (!this.config.tiendaNube.token) this.config.tiendaNube.token;
    if (!this.config.tiendaNube.userID) this.config.tiendaNube.userID;

    let vatConfitionDefault;
    if (!this.config.company.vatCondition.default) {
      vatConfitionDefault = null;
    } else {
      if (this.config.company.vatCondition.default._id) {
        vatConfitionDefault = this.config.company.vatCondition.default._id;
      } else {
        vatConfitionDefault = this.config.company.vatCondition.default;
      }
    }

    this.configFormCompany.setValue({
      _id: this.config._id,
      companyPicture: this.config['companyPicture'],
      companyName: this.config['companyName'],
      companyAddress: this.config['companyAddress'],
      companyFantasyName: this.config['companyFantasyName'],
      companyPhone: this.config['companyPhone'],
      companyIdentificationType: companyIdentificationType,
      companyIdentificationValue: this.config['companyIdentificationValue'],
      companyVatCondition: companyVatCondition,
      companyStartOfActivity: moment(
        this.config['companyStartOfActivity'],
        'YYYY-MM-DDTHH:mm:ssZ'
      ).format('DD/MM/YYYY'),
      companyGrossIncome: this.config['companyGrossIncome'],
      companyPostalCode: this.config['companyPostalCode'],
      footerInvoice: this.config['footerInvoice'],
      country: this.config['country'],
      latitude: this.config['latitude'],
      longitude: this.config['longitude'],
      timezone: this.config['timezone'],
      currency: currency,
    });

    this.configFormEmail.setValue({
      _id: this.config._id,
      emailAccount: this.config['emailAccount'],
      emailPassword: this.config['emailPassword'],
      emailHost: this.config['emailHost'],
      emailPort: this.config['emailPort'],
    });

    this.configFormSystem.setValue({
      _id: this.config._id,
      'article.code.validators.maxLength':
        this.config.article.code.validators.maxLength,
      'article.isWeigth.default': this.config.article.isWeigth.default,
      'article.salesAccount.default': this.config.article.salesAccount.default,
      'article.purchaseAccount.default':
        this.config.article.purchaseAccount.default,
      'article.allowSaleWithoutStock.default':
        this.config.article.allowSaleWithoutStock.default,
      // 'company.allowCurrentAccount.default': this.config.company.allowCurrentAccount.default,
      'company.allowCurrentAccountProvider.default':
        this.config.company.allowCurrentAccountProvider.default,
      'company.allowCurrentAccountClient.default':
        this.config.company.allowCurrentAccountClient.default,
      'company.vatCondition.default': vatConfitionDefault,
      'company.accountClient.default':
        this.config.company.accountClient.default,
      'company.accountProvider.default':
        this.config.company.accountProvider.default,
      'cashBox.perUser': this.config.cashBox.perUser,
      'reports.summaryOfAccounts.detailsPaymentMethod':
        this.config.reports.summaryOfAccounts.detailsPaymentMethod,
      'reports.summaryOfAccounts.invertedViewClient':
        this.config.reports.summaryOfAccounts.invertedViewClient,
      'reports.summaryOfAccounts.invertedViewProvider':
        this.config.reports.summaryOfAccounts.invertedViewProvider,
      'tradeBalance.codePrefix': this.config.tradeBalance.codePrefix,
      'tradeBalance.numberOfCode': this.config.tradeBalance.numberOfCode,
      'tradeBalance.numberOfQuantity':
        this.config.tradeBalance.numberOfQuantity,
      'tradeBalance.numberOfIntegers':
        this.config.tradeBalance.numberOfIntegers,
      'tradeBalance.numberOfDecimals':
        this.config.tradeBalance.numberOfDecimals,
      'voucher.readingLimit': this.config.voucher.readingLimit,
      'voucher.minutesOfExpiration': this.config.voucher.minutesOfExpiration,
      // 'twilio.senderNumber': this.config.twilio.senderNumber,
      // 'twilio.accountSid': this.config.twilio.accountSid,
      // 'twilio.authToken': this.config.twilio.authToken,
      // 'tiendaNube.appID' : this.config.tiendaNube.appID,
      // 'tiendaNube.clientSecret' : this.config.tiendaNube.clientSecret,
      'tiendaNube.token': this.config.tiendaNube.token,
      'tiendaNube.userID': this.config.tiendaNube.userID,
    });
  }

  public setConfigurationSettings(config) {
    if (config.emailAccount)
      Config.setConfigEmail(config.emailAccount, config.emailPassword);
    if (config.companyName) {
      Config.setConfigCompany(
        config.companyPicture,
        config.companyName,
        config.companyAddress,
        config.companyPhone,
        config.companyVatCondition,
        config.companyStartOfActivity,
        config.companyGrossIncome,
        config.footerInvoice,
        config.companyFantasyName,
        config.country,
        config.timezone,
        config.currency,
        config.companyIdentificationType,
        config.companyIdentificationValue,
        config.licenseCost,
        config.companyPostalCode
      );
    }
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }

  async uploadFile(pictureDelete: string): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      if (
        pictureDelete &&
        pictureDelete.includes('https://storage.googleapis')
      ) {
        await this.deleteFile(pictureDelete);
      }

      this._fileService
        .uploadImage(MediaCategory.CONFIG, this.filesToUpload)
        .then(
          (result: string) => {
            this.config['companyPicture'] = result;
            this.imageURL = result;
            resolve(result);
          },
          (error) => this._toastService.showToast({ message: error })
        );
    });
  }

  async deleteFile(pictureDelete: string): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      this._fileService.deleteImage(pictureDelete).subscribe(
        (result) => {
          resolve(true);
        },
        (error) => {
          this._toastService.showToast({ message: error.messge });
          resolve(true);
        }
      );
    });
  }
}
