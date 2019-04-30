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
  selector: 'app-config-backup',
  templateUrl: './config-backup.component.html',
  styleUrls: ['./config-backup.component.css'],
  providers: [NgbAlertConfig, DateFormatPipe]
})
export class ConfigBackupComponent implements OnInit {

  public routeFile:string;
  public filesToUpload: Array<File>;
  public userType: string;
  public identificationTypes: IdentificationType[];
  public vatConditions: VATCondition[];
  public currencies: Currency[];
  public config: Config;
  public loading: boolean = false;
  public cert: boolean = false;
  public configFormBackup: FormGroup;
  public configFormEmail: FormGroup;
  public configFormCompany: FormGroup;
  public focusEvent = new EventEmitter<boolean>();
  public alertMessage: string = "";
  public loadingCompany: boolean = false;
  public loadingEmail: boolean = false;
  public loadingBackup: boolean = false;
  public loadingLicense: boolean = false;
  public dateFormat: DateFormatPipe = new DateFormatPipe();
  public resultUpload: any;
  public imageURL: string;
  public countries : any;
  public timezones : any;
  public userCountry: string;

  public formErrors = {
    'backupTime' : '',
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
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.config = new Config();
    this.getVatConditions();
    this.getCountries();
    this.getCurrencies();
  }

  ngOnInit(): void {

    this.userCountry = Config.country;
    this.buildFormCompany();
    this.buildFormEmail();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getCountries() : void {
    this._configService.getCountry().subscribe(
      result => {
        this.countries = JSON.parse(result["_body"]);
      }
    )
  }

  public getTimeZone(country : string) {
    this._configService.getTimeZone(country).subscribe(
      result => {
        this.timezones = JSON.parse(result["_body"]);
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
          this.routeFile = '-' + this._userService.getDatabase()+ '-certificados-keys-poscloud.csr';
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

  public buildFormBackup(){
    this.configFormBackup = this._fb.group({
      '_id': [this.config._id, [
          Validators.required
        ]
      ],
      'pathMongo': [ this.config['pathMongo'], [
        ]
      ],
      'pathBackup': [this.config['pathBackup'], [
        ]
      ],
      'backupTime': [this.config['backupTime'], [
          Validators.required
        ]
      ]
    });

    this.configFormBackup.valueChanges
      .subscribe(data => this.onValueChangedBackup(data));

    this.onValueChangedBackup();
    this.focusEvent.emit(true);
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

  public onValueChangedBackup(data?: any): void {

    if (!this.configFormBackup) { return; }
    const form = this.configFormBackup;

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

  public onValueChangedEmail(data?: any): void {

    if (!this.configFormBackup) { return; }
    const form = this.configFormBackup;

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

  public onValueChangedCompany(data?: any): void {

    if (!this.configFormBackup) { return; }
    const form = this.configFormBackup;

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

    this.loadingCompany = true;

    this._identificationTypeService.getIdentificationTypes().subscribe(
      result => {
        if (!result.identificationTypes) {
        } else {
          this.identificationTypes = result.identificationTypes;
        }
        this.getConfig();
        this.loadingCompany = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loadingCompany = false;
      }
    );
  }

  public addConfigBackup() {
    this.config = this.configFormBackup.value;
    this.updateConfigBackup();
  }

  public addConfigEmail() {
    this.config = this.configFormEmail.value;
    this.updateConfigEMail();
  }

  public addConfigCompany() {
    this.config = this.configFormCompany.value;
    this.config['companyStartOfActivity'] = moment(this.config['companyStartOfActivity'], 'DD/MM/YYYY').format('YYYY-MM-DDTHH:mm:ssZ');
    this.updateConfigCompany();
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

  public updateConfigBackup(): void {

    this.loadingBackup = true;

    this._configService.updateConfigBackup(this.config).subscribe(
      result => {
        if (!result.configs) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
          this.loadingBackup = false;
        } else {
          this.config = result.configs[0];
          this.showMessage("Los cambios fueron guardados con éxito.", "success", false);
          this.setConfigurationSettings(this.config);
          this.getConfig();
        }
        this.loadingBackup = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loadingBackup = false;
      }
    )
  }

  public updateConfigEMail(): void {

    this.loadingEmail = true;

    this._configService.updateConfigEmail(this.config).subscribe(
      result => {
        if (!result.configs) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
          this.loadingEmail = false;
        } else {
          this.config = result.configs[0];
          this.showMessage("Los cambios fueron guardados con éxito.", "success", false);
          this.setConfigurationSettings(this.config);
          this.getConfig();
        }
        this.loadingEmail = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loadingEmail = false;
      }
    )
  }

  public updateConfigCompany(): void {

    this.loadingCompany = true;

    this._configService.updateConfigCompany(this.config).subscribe(
      result => {
        if (!result.configs) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
          this.loadingCompany = false;
        } else {
          this.config = result.configs[0];
          if (this.filesToUpload) {
            this._configService.makeFileRequest(this.config, this.filesToUpload)
              .then(
                (result) => {
                  this.resultUpload = result;
                  this.config["companyPicture"] = this.resultUpload.filename;
                  this.loading = false;
                  this.showMessage("Los cambios fueron guardados con éxito.", "success", false);
                  this.setConfigurationSettings(this.config);
                  this.getConfig();
                },
                (error) => {
                  this.loading = false;
                  this.showMessage(error, 'danger', false);
                }
              );
          } else {
              this.loading = false;
              this.showMessage("Los cambios fueron guardados con éxito.", "success", false);
              this.setConfigurationSettings(this.config);
              this.getConfig();
          }
        }
        this.loadingCompany = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loadingCompany = false;
      }
    )
  }

  public deletePicture(): void {

    this.loadingCompany = true;

    this._configService.deletePicture(this.config._id).subscribe(
      result => {
        if (!result.configs) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
          this.loadingCompany = false;
        } else {
          this.config = result.configs[0];
          this.showMessage("Los cambios fueron guardados con éxito.", "success", false);
          this.setConfigurationSettings(this.config);
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

  public downloadlicense(): void {
    this._configService.getlicense().subscribe(
      result => {
        if(!result.configs) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
        }
        this.loadingLicense = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loadingLicense = false;
      }
    )
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
          this.setValuesForm();
        }
      },
      error => {
        this.showMessage(error._body, "danger", false);
      }
    )
  }

  public setValuesForm(): void {

    if (!this.config['backupTime']) this.config['backupTime'] = '';
    if (!this.config['pathBackup']) this.config['pathBackup'] = '';
    if (!this.config['pathMongo']) this.config['pathMongo'] = '';
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

    this.configFormCompany.setValue({
      '_id': this.config['_id'],
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
      '_id': this.config['_id'],
      'emailAccount': this.config['emailAccount'],
      'emailPassword': this.config['emailPassword']
    });
  }

  public setConfigurationSettings(config) {
    if (config.pathBackup) Config.setConfigToBackup(config.pathBackup, config.pathMongo, config.backupTime);
    if (config.emailAccount) Config.setConfigEmail(config.emailAccount, config.emailPassword)
    if (config.companyName) Config.setConfigCompany(
          config.companyPicture, config.companyName, config.companyAddress, config.companyPhone,
          config.companyVatCondition, config.companyStartOfActivity, config.companyGrossIncome, 
          config.footerInvoice, config.companyFantasyName, config.country, config.timezone, 
          config.companyIdentificationType, config.companyIdentificationValue, config.companyLicenseCost,
          config.currency, config.companyPostalCode);
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
