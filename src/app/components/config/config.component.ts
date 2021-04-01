import { Component, OnInit, EventEmitter, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import * as moment from 'moment';
import 'moment/locale/es';

import { NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Router } from '@angular/router';

import { Config } from './../../app.config';
import { VATCondition } from 'app/components/vat-condition/vat-condition';

import { ConfigService } from './config.service';
import { VATConditionService } from '../vat-condition/vat-condition.service';
import { DateFormatPipe } from '../../main/pipes/date-format.pipe';
import { UserService } from '../user/user.service';
import { IdentificationType } from 'app/components/identification-type/identification-type';
import { IdentificationTypeService } from 'app/components/identification-type/identification-type.service';

import { Currency } from 'app/components/currency/currency';
import { CurrencyService } from 'app/components/currency/currency.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss'],
  providers: [NgbAlertConfig, DateFormatPipe],
  encapsulation: ViewEncapsulation.None
})

export class ConfigComponent implements OnInit {

  public routeFile: string;
  public filesToUpload: Array<File>;
  public identificationTypes: IdentificationType[];
  public vatConditions: VATCondition[];
  public currencies: Currency[];
  public config: Config;
  public loading: boolean = false;
  public cert: boolean = false;
  public configFormEmail: FormGroup;
  public configFormCompany: FormGroup;
  public configFormSystem: FormGroup;
  public focusEvent = new EventEmitter<boolean>();
  public alertMessage: string = "";
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

  public formErrors = {
    'emailAccount': '',
    'emailPassword': '',
    'companyName': '',
    'companyStartOfActivity': '',
  };

  public validationMessages = {
    'emailAccount': { 'required': 'Este campo es requerido' },
    'emailPassword': { 'required': 'Este campo es requerido' },
    'companyName': { 'required': 'Este campo es requerido' },
    'companyStartOfActivity': { 'dateValid': 'Fecha inválida' },
  };

  constructor(
    public _router: Router,
    public _configService: ConfigService,
    public _vatCondition: VATConditionService,
    public _identificationTypeService: IdentificationTypeService,
    public _currencyService: CurrencyService,
    public _userService: UserService,
    public _fb: FormBuilder,
    public _toastr: ToastrService,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal
  ) {
    this.apiURL = Config.apiURL;
    this.getVatConditions();
    this.getCountries();
    this.getCurrencies();
  }

  async ngOnInit() {
    await this._configService.getConfig.subscribe(
      config => {
        this.config = config;
        this.buildFormCompany();
        this.buildFormEmail();
        this.buildFormSystem();
      }
    );
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getCountries(): void {
    this._configService.getCountry().subscribe(
      result => {
        this.countries = result;
      }
    )
  }

  public getTimeZone(country: string) {
    this._configService.getTimeZone(country).subscribe(
      result => {
        this.timezones = result;
        this.timezones = this.timezones.timezones
      }
    )
  }

  public upload() {


    this._configService.updloadFile(this.filesToUpload)
      .then(
        result => {
          if (result) {
            this.showToast("Certificado subido correctamente", "success")
          }
        },
        error => {
          this.showToast(error, "warning")
        }
      )
  }

  public fileChangeEvent(fileInput: any) {
    this.filesToUpload = <Array<File>>fileInput.target.files;
  }


  public buildFormCompany() {

    this.configFormCompany = this._fb.group({
      '_id': [this.config._id, [Validators.required]],
      'companyPicture': [this.config['companyPicture'], []],
      'companyName': [this.config['companyName'], [Validators.required]],
      'companyFantasyName': [this.config['companyFantasyName'], []],
      'companyIdentificationType': [this.config['companyIdentificationType'], []],
      'companyIdentificationValue': [this.config['companyIdentificationValue'], []],
      'companyVatCondition': [this.config['companyVatCondition'], []],
      'companyStartOfActivity': ['', [this.validateDate()]],
      'companyGrossIncome': [this.config['companyGrossIncome'], []],
      'companyAddress': [this.config['companyAddress'], []],
      'companyPhone': [this.config['companyPhone'], []],
      'companyPostalCode': [this.config['companyPostalCode'], []],
      'footerInvoice': [this.config['footerInvoice'], []],
      'country': [this.config['country'], []],
      'latitude': [this.config['latitude'], []],
      'longitude': [this.config['longitude'], []],
      'timezone': [this.config['timezone'], []],
      'currency': [this.config['currency'], []]
    });

    this.configFormCompany.valueChanges.subscribe(data => this.onValueChangedCompany(data));
    this.onValueChangedCompany();
    this.focusEvent.emit(true);
  }

  public onValueChangedCompany(data?: any): void {

    if (!this.configFormCompany) { return; }
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
      '_id': [this.config._id, [Validators.required]],
      'emailAccount': [this.config['emailAccount'], []],
      'emailPassword': [this.config['emailPassword'], []],
      'emailHost': [this.config['emailHost'], []],
      'emailPort': [this.config['emailPort'], []]

    });

    this.configFormEmail.valueChanges.subscribe(data => this.onValueChangedEmail(data));
    this.onValueChangedEmail();
    this.focusEvent.emit(true);
  }

  public onValueChangedEmail(data?: any): void {

    if (!this.configFormEmail) { return; }
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
        authToken: ''
      }
    }
    this.configFormSystem = this._fb.group({
      '_id': [this.config._id, [Validators.required]],
      'article.code.validators.maxLength': [this.config.article.code.validators.maxLength, []],
      'article.isWeigth.default': [this.config.article.isWeigth.default, []],
      'company.vatCondition.default': [this.config.company.vatCondition.default, []],
      'company.allowCurrentAccount.default': [this.config.company.allowCurrentAccount.default, []],
      'cashBox.perUser': [this.config.cashBox.perUser, []],
      'reports.summaryOfAccounts.detailsPaymentMethod': [this.config.reports.summaryOfAccounts.detailsPaymentMethod, []],
      'reports.summaryOfAccounts.invertedViewClient': [this.config.reports.summaryOfAccounts.invertedViewClient, []],
      'reports.summaryOfAccounts.invertedViewProvider': [this.config.reports.summaryOfAccounts.invertedViewProvider, []],
      'tradeBalance.codePrefix': [this.config.tradeBalance.codePrefix, []],
      'tradeBalance.numberOfQuantity': [this.config.tradeBalance.numberOfQuantity, []],
      'tradeBalance.numberOfIntegers': [this.config.tradeBalance.numberOfIntegers, []],
      'tradeBalance.numberOfDecimals': [this.config.tradeBalance.numberOfDecimals, []],
      'voucher.readingLimit': [this.config.voucher.readingLimit, []],
      'voucher.minutesOfExpiration': [this.config.voucher.minutesOfExpiration, []],
      'twilio.senderNumber': [this.config.twilio.senderNumber, []],
      'twilio.accountSid': [this.config.twilio.accountSid, []],
      'twilio.authToken': [this.config.twilio.authToken, []]
    });

    this.configFormSystem.valueChanges.subscribe(data => this.onValueChangedSystem(data));
    this.onValueChangedSystem();
    this.focusEvent.emit(true);
  }

  public onValueChangedSystem(data?: any): void {

    if (!this.configFormSystem) { return; }
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
    return function (input: FormControl) {
      let dateValid = false;
      let date;
      if (input.parent && input.parent.controls && input.parent.controls['companyStartOfActivity'].value) {
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
      result => {
        if (!result.vatConditions) {
        } else {
          this.vatConditions = result.vatConditions;
        }
        this.getIdentificationTypes();
        this.loadingCompany = false;
      },
      error => {
        this.showToast(error._body, "danger");
        this.loadingCompany = false;
      }
    );
  }

  public getCurrencies(): void {

    this.loadingCompany = true;

    this._currencyService.getCurrencies('sort="name":1').subscribe(
      result => {
        if (!result.currencies) {
        } else {
          this.currencies = result.currencies;
        }
        this.loadingCompany = false;
      },
      error => {
        this.showToast(error._body, "danger");
        this.loadingCompany = false;
      }
    );
  }

  public getIdentificationTypes(): void {

    let query = 'sort="name":1';

    this._identificationTypeService.getIdentificationTypes(query).subscribe(
      result => {
        if (!result.identificationTypes) {
        } else {
          this.identificationTypes = result.identificationTypes;
        }
        this.getConfig();
      },
      error => {
        this.showToast(error._body, 'danger');
      }
    );
  }

  public getConfig(): void {

    this._configService.getConfigApi().subscribe(
      result => {
        if (!result.configs) {
          if (result.message && result.message !== "") this.showToast(result.message, "info");
        } else {
          let config = result.configs[0];
          this.config = config;
          if (config['companyPicture'] && config['companyPicture'] !== 'default.jpg') {
            this.imageURL = this.apiURL + 'get-image-company/' + config['companyPicture'] + '/' + Config.database;
          } else {
            this.imageURL = './../../../assets/img/default.jpg';
          }
          this.setConfigurationSettings(this.config);
          this.setValuesForm();
        }
      },
      error => {
        this.showToast(error._body, "danger");
      }
    )
  }

  public generateCRS() {

    this.loading = true;
    this.cert = true;

    this._configService.generateCRS(this.config).subscribe(
      result => {
        if (!result) {
          if (result.message && result.message !== "") this.showToast(result.message, "info");
        } else {
          this.cert = true;
          this.showToast("Los archivos se generaron correctamente.", "success");
          this.routeFile = '-' + Config.database + '-certificados-keys-poscloud.csr';
          this.hideMessage();

        }
        this.loading = false;
      },
      error => {
        this.showToast(error._body, "danger");
        this.loading = false;
        this.cert = false
      }
    );
  }

  async addConfigCompany() {
    this.config = this.configFormCompany.value;
    this.config['companyStartOfActivity'] = moment(this.config['companyStartOfActivity'], 'DD/MM/YYYY').format('YYYY-MM-DDTHH:mm:ssZ');
    this.loadingCompany = true;
    await this.updateConfig().then(
      config => {
        if (config) {
          this.config = config;
          if (this.filesToUpload) {
            this._configService.makeFileRequest(this.config, this.filesToUpload)
              .then(
                (result) => {
                  this.config["companyPicture"] = result["filename"];
                  this.showToast("Los cambios fueron guardados con éxito.", "success");
                  this.getConfig();
                  this.loadingCompany = false;
                },
                (error) => {
                  this.showToast(error, 'danger');
                  this.loadingCompany = false;
                }
              );
          } else {
            this.showToast("Los cambios fueron guardados con éxito.", "success");
            this.getConfig();
            this.loadingCompany = false;
          }
        }
      }
    );
  }

  async addConfigEmail() {
    this.config = this.configFormEmail.value;
    this.loadingEmail = true;
    await this.updateConfig().then(
      config => {
        if (config) {
          this.config = config;
          this.showToast("Los cambios fueron guardados con éxito.", "success");
          this.getConfig();
        }
        this.loadingEmail = false;
      }
    );
  }

  async addConfigSystem() {
    this.config = this.configFormSystem.value;
    this.loadingSystem = true;
    await this.updateConfig().then(
      config => {
        if (config) {
          this.config = config;
          this.showToast("Los cambios fueron guardados con éxito.", "success");
        }
        this.loadingSystem = false;
      }
    );
  }

  public updateConfig(): Promise<Config> {

    return new Promise<Config>((resolve, reject) => {
      
      this._configService.updateConfig(this.config).subscribe(
        result => {
          if (!result.configs) {
            if (result.message && result.message !== "") this.showToast(result.message, "info");
            resolve(null);
          } else {
            resolve(result.configs[0]);
          }
        },
        error => {
          this.showToast(error._body, "danger");
          resolve(null);
        }
      )
    });
  }

  public deletePicture(): void {

    this.loadingCompany = true;

    this._configService.deletePicture(this.config._id).subscribe(
      result => {
        if (!result.configs) {
          if (result.message && result.message !== "") this.showToast(result.message, "info");
        } else {
          this.config = result.configs[0];
          this.showToast("Los cambios fueron guardados con éxito.", "success");
          this.getConfig();
        }
        this.loadingCompany = false;
      },
      error => {
        this.showToast(error._body, "danger");
        this.loadingCompany = false;
      }
    )
  }

  public setValuesForm(): void {

    if (!this.config['emailAccount']) this.config['emailAccount'] = '';
    if (!this.config['emailPassword']) this.config['emailPassword'] = '';
    if (!this.config['emailHost']) this.config['emailHost'] = '';
    if (!this.config['emailPort']) this.config['emailPort'] = '';
    if (!this.config['companyPicture']) this.config['companyPicture'] = 'default.jpg';
    if (!this.config['companyName']) this.config['companyName'] = '';
    if (!this.config['companyFantasyName']) this.config['companyFantasyName'] = '';

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
        companyIdentificationType = this.config['companyIdentificationType']._id;
      } else {
        companyIdentificationType = this.config['companyIdentificationType'];
      }
    }

    if (!this.config['companyIdentificationValue']) this.config['companyIdentificationValue'] = '';
    if (!this.config['companyStartOfActivity']) this.config['companyStartOfActivity'] = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    if (!this.config['companyGrossIncome']) this.config['companyGrossIncome'] = '';
    if (!this.config['companyAddress']) this.config['companyAddress'] = '';
    if (!this.config['companyPhone']) this.config['companyPhone'] = '';
    if (!this.config['companyPostalCode']) this.config['companyPostalCode'] = '';
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

    if (this.config.article.code.validators.maxLength === undefined) this.config.article.code.validators.maxLength = 10;
    if (this.config.article.isWeigth.default === undefined) this.config.article.isWeigth.default = false;
    if (this.config.company.allowCurrentAccount.default === undefined) this.config.company.allowCurrentAccount.default = false;
    if (this.config.cashBox.perUser === undefined) this.config.cashBox.perUser = false;
    if (this.config.reports.summaryOfAccounts.invertedViewClient === undefined) this.config.reports.summaryOfAccounts.invertedViewClient = false;
    if (this.config.reports.summaryOfAccounts.invertedViewProvider === undefined) this.config.reports.summaryOfAccounts.invertedViewProvider = false;
    if (this.config.tradeBalance.codePrefix === undefined) this.config.tradeBalance.codePrefix = 0;
    if (this.config.tradeBalance.numberOfQuantity === undefined) this.config.tradeBalance.numberOfQuantity = 2;
    if (this.config.tradeBalance.numberOfIntegers === undefined) this.config.tradeBalance.numberOfIntegers = 3;
    if (this.config.tradeBalance.numberOfDecimals === undefined) this.config.tradeBalance.numberOfDecimals = 2;
    if (this.config.voucher.readingLimit === undefined) this.config.voucher.readingLimit = 0;
    if (this.config.voucher.minutesOfExpiration === undefined) this.config.voucher.minutesOfExpiration = 720;
    if (!this.config.twilio) {
      this.config.twilio = {
        senderNumber: '',
        accountSid: '',
        authToken: ''
      }
    }
    if (!this.config.twilio.senderNumber) this.config.twilio.senderNumber = '';
    if (!this.config.twilio.accountSid) this.config.twilio.accountSid = '';
    if (!this.config.twilio.authToken) this.config.twilio.authToken = '';

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
      '_id': this.config._id,
      'companyPicture': this.config['companyPicture'],
      'companyName': this.config['companyName'],
      'companyAddress': this.config['companyAddress'],
      'companyFantasyName': this.config['companyFantasyName'],
      'companyPhone': this.config['companyPhone'],
      'companyIdentificationType': companyIdentificationType,
      'companyIdentificationValue': this.config['companyIdentificationValue'],
      'companyVatCondition': companyVatCondition,
      'companyStartOfActivity': moment(this.config['companyStartOfActivity'], 'YYYY-MM-DDTHH:mm:ssZ').format('DD/MM/YYYY'),
      'companyGrossIncome': this.config['companyGrossIncome'],
      'companyPostalCode': this.config['companyPostalCode'],
      'footerInvoice': this.config['footerInvoice'],
      'country': this.config['country'],
      'latitude': this.config['latitude'],
      'longitude': this.config['longitude'],
      'timezone': this.config['timezone'],
      'currency': currency
    });

    this.configFormEmail.setValue({
      '_id': this.config._id,
      'emailAccount': this.config['emailAccount'],
      'emailPassword': this.config['emailPassword'],
      'emailHost' : this.config['emailHost'],
      'emailPort' : this.config['emailPort']
    });

    this.configFormSystem.setValue({
      '_id': this.config._id,
      'article.code.validators.maxLength': this.config.article.code.validators.maxLength,
      'article.isWeigth.default': this.config.article.isWeigth.default,
      'company.allowCurrentAccount.default': this.config.company.allowCurrentAccount.default,
      'company.vatCondition.default': vatConfitionDefault,
      'cashBox.perUser': this.config.cashBox.perUser,
      'reports.summaryOfAccounts.detailsPaymentMethod': this.config.reports.summaryOfAccounts.detailsPaymentMethod,
      'reports.summaryOfAccounts.invertedViewClient': this.config.reports.summaryOfAccounts.invertedViewClient,
      'reports.summaryOfAccounts.invertedViewProvider': this.config.reports.summaryOfAccounts.invertedViewProvider,
      'tradeBalance.codePrefix': this.config.tradeBalance.codePrefix,
      'tradeBalance.numberOfQuantity': this.config.tradeBalance.numberOfQuantity,
      'tradeBalance.numberOfIntegers': this.config.tradeBalance.numberOfIntegers,
      'tradeBalance.numberOfDecimals': this.config.tradeBalance.numberOfDecimals,
      'voucher.readingLimit': this.config.voucher.readingLimit,
      'voucher.minutesOfExpiration': this.config.voucher.minutesOfExpiration,
      'twilio.senderNumber': this.config.twilio.senderNumber,
      'twilio.accountSid': this.config.twilio.accountSid,
      'twilio.authToken': this.config.twilio.authToken
    });
  }

  public setConfigurationSettings(config) {
    if (config.emailAccount) Config.setConfigEmail(config.emailAccount, config.emailPassword)
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
        config.companyPostalCode);
    }
  }

  public hideMessage(): void {
    this.alertMessage = "";
  }

  public showToast(message: string, type: string): void {
    switch (type) {
      case 'success':
        this._toastr.success('', message);
        break;
      case 'info':
        this._toastr.info('', message);
        break;
      case 'warning':
        this._toastr.warning('', message);
        break;
      case 'danger':
        this._toastr.error('', message);
        break;
      default:
        this._toastr.success('', message);
        break;
    }
  }
}
