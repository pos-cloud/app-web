import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import * as moment from 'moment';
import 'moment/locale/es';

import { NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Router } from '@angular/router';

import { Config } from './../../app.config';
import { VATCondition } from 'app/models/vat-condition';

import { ConfigService } from './../../services/config.service';
import { VATConditionService } from './../../services/vat-condition.service';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { UserService } from '../../services/user.service';
import { IdentificationType } from 'app/models/identification-type';
import { IdentificationTypeService } from 'app/services/identification-type.service';

import { LicensePaymentComponent} from 'app/components/license-payment/license-payment.component'
import { Currency } from 'app/models/currency';
import { CurrencyService } from 'app/services/currency.service';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css'],
  providers: [NgbAlertConfig, DateFormatPipe]
})
export class ConfigComponent implements OnInit {

  public routeFile:string;
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
  public countries : any;
  public timezones : any;
  public userCountry: string;

  public formErrors = {
    'emailAccount': '',
    'emailPassword': '',
    'companyName': '',
    'companyStartOfActivity': '',
  };

  public validationMessages = {
    'emailAccount': {
      'required': 'Este campo es requerido'
    },
    'emailPassword': {
      'required': 'Este campo es requerido'
    },
    'companyName': {
      'required': 'Este campo es requerido'
    },
    'companyStartOfActivity': {
      'dateValid': 'Fecha inválida'
    },
  };

  constructor(
    public _router: Router,
    public _configService: ConfigService,
    public _vatCondition: VATConditionService,
    public _identificationTypeService: IdentificationTypeService,
    public _currencyService: CurrencyService,
    public _userService: UserService,
    public _fb: FormBuilder,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal
  ) {
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

  public getCountries() : void {
    this._configService.getCountry().subscribe(
      result => {
        this.countries = result;
      }
    )
  }

  public getTimeZone(country : string) {
    this._configService.getTimeZone(country).subscribe(
      result => {
        this.timezones = result;
        this.timezones = this.timezones.timezones
      }
    )
  }

  public upload() {
    this.makeFileRequest(Config.apiURL + "/upload", [], this.filesToUpload).then((result) => {
    }, (error) => {
        console.error(error);
    });
  }

  public fileChangeEvent(fileInput: any){
      this.filesToUpload = <Array<File>> fileInput.target.files;
  }

  public makeFileRequest(url: string, params: Array<string>, files: Array<File>) {
      return new Promise((resolve, reject) => {
          var formData: any = new FormData();
          var xhr = new XMLHttpRequest();
          if(files && files.length > 0) {
            for(var i = 0; i < files.length; i++) {
                formData.append("poscloud", files[i], files[i].name);
            }
          }
          xhr.onreadystatechange = function () {
              if (xhr.readyState == 4) {
                  if (xhr.status == 200) {
                      resolve(JSON.parse(xhr.response));
                  } else {
                      reject(xhr.response);
                  }
              }
          }
          xhr.open("POST", url, true);
          xhr.send(formData);
      });
  }

  public buildFormCompany() {

    this.configFormCompany = this._fb.group({
      '_id': [this.config._id, [
          Validators.required
        ]
      ],
      'companyPicture': [this.config['companyPicture'], [
        ]
      ],
      'companyName': [this.config['companyName'], [
          Validators.required
        ]
      ],
      'companyFantasyName' : [this.config['companyFantasyName'],[
        ]
      ],
      'companyIdentificationType': [this.config['companyIdentificationType'], [
        ]
      ],
      'companyIdentificationValue': [this.config['companyIdentificationValue'], [
        ]
      ],
      'companyVatCondition': [this.config['companyVatCondition'], [
        ]
      ],
      'companyStartOfActivity': ['', [
          this.validateDate()
        ]
      ],
      'companyGrossIncome': [this.config['companyGrossIncome'], [
        ]
      ],
      'companyAddress': [this.config['companyAddress'], [
        ]
      ],
      'companyPhone': [this.config['companyPhone'], [
        ]
      ],
      'companyPostalCode': [this.config['companyPostalCode'], [
        ]
      ],
      'footerInvoice': [this.config['footerInvoice'], [
        ]
      ],
      'country' : [this.config['country'], [
        ]
      ],
      'timezone' : [this.config['timezone'], [
        ]
      ],
      'currency' : [this.config['currency'], [
        ]
      ]
    });

    this.configFormCompany.valueChanges
      .subscribe(data => this.onValueChangedCompany(data));

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

  public buildFormEmail(){
    this.configFormEmail = this._fb.group({
      '_id': [this.config._id, [
          Validators.required
        ]
      ],
      'emailAccount' : [ this.config['emailAccount'], [
          Validators.required
        ]
      ],
      'emailPassword' : [ this.config['emailPassword'], [
          Validators.required
        ]
      ]
    });

    this.configFormEmail.valueChanges
      .subscribe(data => this.onValueChangedEmail(data));

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

  public buildFormSystem(){
    this.configFormSystem = this._fb.group({
      '_id': [this.config._id, [
          Validators.required
        ]
      ],
      'article.code.validators.maxLength' : [ this.config.article.code.validators.maxLength, [
        ]
      ],
      'article.printLabel.value' : [ this.config.article.printLabel.value, [
        ]
      ],
      'company.vatCondition.default' : [ this.config.company.vatCondition.default, [
        ]
      ],
      'company.allowCurrentAccount.default' : [ this.config.company.allowCurrentAccount.default, [
        ]
      ],
      'reports.summaryOfAccounts.detailsPaymentMethod': [this.config.reports.summaryOfAccounts.detailsPaymentMethod, [
        ]
      ],
      'reports.summaryOfAccounts.invertedViewClient': [this.config.reports.summaryOfAccounts.invertedViewClient, [
        ]
      ],
      'reports.summaryOfAccounts.invertedViewProvider': [this.config.reports.summaryOfAccounts.invertedViewProvider, [
        ]
      ],
      'tradeBalance.codePrefix': [this.config.tradeBalance.codePrefix, [
        ]
      ]
    });

    

    this.configFormSystem.valueChanges
      .subscribe(data => this.onValueChangedSystem(data));

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
        this.showMessage(error._body, "danger", false);
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
        this.showMessage(error._body, "danger", false);
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
        this.showMessage(error._body, 'danger', false);
      }
    );
  }

  public getConfig(): void {

    this._configService.getConfigApi().subscribe(
      result => {
        if(!result.configs) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          let config = result.configs[0];
          this.config = config;
          if (config['companyPicture'] && config['companyPicture'] !== 'default.jpg') {
            this.imageURL = Config.apiURL + 'get-image-company/' + config['companyPicture'];
          } else {
            this.imageURL = './../../../assets/img/default.jpg';
          }
          this.setConfigurationSettings(this.config);
          this.setValuesForm();
        }
      },
      error => {
        this.showMessage(error._body, "danger", false);
      }
    )
  }

  public generateCRS() {

    this.loading = true;
    this.cert = true;

    this._configService.generateCRS(this.config).subscribe(
      result => {
        if (!result) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          this.cert = true;
          this.showMessage("Los archivos se generaron correctamente.", "success", false);
          this.routeFile = '-' + Config.database + '-certificados-keys-poscloud.csr';
          this.hideMessage();

        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
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
        if(config) {
          this.config = config;
          if (this.filesToUpload) {
            this._configService.makeFileRequest(this.config, this.filesToUpload)
              .then(
                (result) => {
                  this.config["companyPicture"] = result["filename"];
                  this.showMessage("Los cambios fueron guardados con éxito.", "success", false);
                  this.getConfig();
                  this.loadingCompany = false;
                },
                (error) => {
                  this.showMessage(error, 'danger', false);
                  this.loadingCompany = false;
                }
              );
          } else {
              this.showMessage("Los cambios fueron guardados con éxito.", "success", false);
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
        if(config) {
          this.config = config;
          this.showMessage("Los cambios fueron guardados con éxito.", "success", false);
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
        if(config) {
          this.config = config;
          this.showMessage("Los cambios fueron guardados con éxito.", "success", false);
        }
        this.loadingSystem = false;
      }
    );
  }

  public openModal(op: string): void {

    let modalRef;
    switch (op) {
      case 'pay-license':
        modalRef = this._modalService.open(LicensePaymentComponent, { size: 'lg' });
        break;
      default:
        break;
    }
  }

  public updateConfig(): Promise<Config> {

    return new Promise<Config>((resolve, reject) => {
      this._configService.updateConfig(this.config).subscribe(
        result => {
          if (!result.configs) {
            if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
            resolve(null);
          } else {
            resolve(result.configs[0]);
          }
        },
        error => {
          this.showMessage(error._body, "danger", false);
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
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          this.config = result.configs[0];
          this.showMessage("Los cambios fueron guardados con éxito.", "success", false);
          this.getConfig();
        }
        this.loadingCompany = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loadingCompany = false;
      }
    )
  }

  public setValuesForm(): void {

    if (!this.config['emailAccount']) this.config['emailAccount'] = '';
    if (!this.config['emailPassword']) this.config['emailPassword'] = '';
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

    if (!this.config.article.code.validators.maxLength) this.config.article.code.validators.maxLength = 10;
    if (!this.config.company.allowCurrentAccount.default) this.config.company.allowCurrentAccount.default = false;
    if (!this.config.article.printLabel.value) this.config.article.printLabel.value = 'code';
    if (!this.config.reports.summaryOfAccounts.invertedViewClient) this.config.reports.summaryOfAccounts.invertedViewClient = false;
    if (!this.config.reports.summaryOfAccounts.invertedViewProvider) this.config.reports.summaryOfAccounts.invertedViewProvider = false;
    if (!this.config.tradeBalance.codePrefix) this.config.tradeBalance.codePrefix = 0;

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
      'timezone': this.config['timezone'],
      'currency': currency
    });

    this.configFormEmail.setValue({
      '_id': this.config._id,
      'emailAccount': this.config['emailAccount'],
      'emailPassword': this.config['emailPassword']
    });

    this.configFormSystem.setValue({
      '_id': this.config._id,
      'article.code.validators.maxLength': this.config.article.code.validators.maxLength,
      'company.allowCurrentAccount.default': this.config.company.allowCurrentAccount.default,
      'company.vatCondition.default': vatConfitionDefault,
      'article.printLabel.value': this.config.article.printLabel.value,
      'reports.summaryOfAccounts.detailsPaymentMethod': this.config.reports.summaryOfAccounts.detailsPaymentMethod,
      'reports.summaryOfAccounts.invertedViewClient': this.config.reports.summaryOfAccounts.invertedViewClient,
      'reports.summaryOfAccounts.invertedViewProvider': this.config.reports.summaryOfAccounts.invertedViewProvider,
      'tradeBalance.codePrefix': this.config.tradeBalance.codePrefix
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

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage():void {
    this.alertMessage = "";
  }
}
