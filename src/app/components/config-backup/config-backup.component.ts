import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Router } from '@angular/router';

import { Config } from './../../app.config';
import { VATCondition } from 'app/models/vat-condition';

import { ConfigService } from './../../services/config.service';
import { VATConditionService } from './../../services/vat-condition.service';

@Component({
  selector: 'app-config-backup',
  templateUrl: './config-backup.component.html',
  styleUrls: ['./config-backup.component.css'],
  providers: [NgbAlertConfig]
})
export class ConfigBackupComponent implements OnInit {

  public userType: string;
  public vatConditions: VATCondition[];
  public config: Config;
  public configFormBackup: FormGroup;
  public configFormEmail: FormGroup;
  public configFormCompany: FormGroup;
  public configFormLabel: FormGroup;
  public focusEvent = new EventEmitter<boolean>();
  public alertMessage: string = "";
  public loading: boolean = false;

  public formErrors = {
    'backupTime' : '',
    'emailAccount': '',
    'emailPassword': '',
    'companyName': '',
    'companyCUIT': '',
    'companyVatCondition': '',
    'companyStartOfActivity': '',
    'companyGrossIncome': '',
    'companyAddress': '',
    'companyPhone': '',
    'footerInvoice': '',
    'heightLabel' : '',
    'widthLabel' : ''
  };

  public validationMessages = {
    'backupTime' : {
      'required':     'Este campo es requerido.'
    },
    'emailAccount': {
      'required': 'Este campo es requerido'
    },
    'emailPassword': {
      'required': 'Este campo es requerido'
    },
    'companyName': {
      'required': 'Este campo es requerido'
    },
    'companyCUIT': {
    },
    'companyVatCondition': {
    },
    'companyStartOfActivity': {
    },
    'companyGrossIncome': {
    },
    'companyAddress': {
    },
    'companyPhone': {
    },
    'footerInvoice': {
    },
    'heightLabel' : {
    },
    'widthLabel' : {
    }
  };

  constructor(
    public _router: Router,
    public _configService: ConfigService,
    public _vatCondition: VATConditionService,
    public _fb: FormBuilder,
    public alertConfig: NgbAlertConfig,
  ) { }

  ngOnInit(): void {
    
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.config = new Config();
    this.getVatConditions();
    this.buildFormBackup();
    this.buildFormEmail();
    this.buildFormCompany();
    this.buildFormLabel();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildFormBackup(){
    this.configFormBackup = this._fb.group({
      '_id': [this.config._id, [
          Validators.required
        ]
      ],
      'pathMongo': [ Config.pathMongo, [
        ]
      ],
      'pathBackup' : [ Config.pathBackup, [
        ]
      ],
      'backupTime' : [ Config.backupTime, [
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
      'emailAccount' : [ Config.emailAccount, [
          Validators.required
        ]
      ],
      'emailPassword' : [ Config.emailPassword, [
          Validators.required
        ]
      ]
    });

    this.configFormEmail.valueChanges
      .subscribe(data => this.onValueChangedEmail(data));

    this.onValueChangedEmail();
    this.focusEvent.emit(true);
  }

  public buildFormCompany() {
    this.configFormCompany = this._fb.group({
      '_id': [this.config._id, [
        Validators.required
        ]
      ],
      'companyName': [Config.companyName, [
        Validators.required
        ]
      ],
      'companyCUIT': [Config.companyCUIT, [
        ]
      ],
      'companyVatCondition': [Config.companyVatCondition, [
        ]
      ],
      'companyStartOfActivity': [Config.companyStartOfActivity, [
        ]
      ],
      'companyGrossIncome': [Config.companyGrossIncome, [
        ]
      ],
      'companyAddress': [Config.companyAddress, [
        ]
      ],
      'companyPhone': [Config.companyPhone, [
        ]
      ],
      'footerInvoice': [Config.footerInvoice, [ 
        ]
      ]
    });

    this.configFormCompany.valueChanges
      .subscribe(data => this.onValueChangedCompany(data));

    this.onValueChangedCompany();
    this.focusEvent.emit(true);
  }

  public buildFormLabel() {
    this.configFormLabel = this._fb.group({
      '_id': [this.config._id, [
        Validators.required
        ]
      ],
      'heightLabel': [Config.heightLabel, [
        Validators.required
        ]
      ],
      'widthLabel': [Config.widthLabel, [
        ]
      ]
    });

    this.configFormLabel.valueChanges
      .subscribe(data => this.onValueChangedLabel(data));

    this.onValueChangedLabel();
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

  public onValueChangedLabel(data?: any): void {

    if (!this.configFormLabel) { return; }
    const form = this.configFormLabel;

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

  public getVatConditions(): void {

    this.loading = true;

    this._vatCondition.getVATConditions().subscribe(
      result => {
        if (!result.vatConditions) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.vatConditions = result.vatConditions;
          this.getConfig();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public addConfigBackup() {
    this.config = this.configFormBackup.value;
    this.setConfigurationSettings(this.config);
    this.updateConfigBackup();
  }

  public addConfigEmail() {
    this.config = this.configFormEmail.value;
    this.setConfigurationSettings(this.config);
    this.updateConfigEMail();
  }

  public addConfigCompany() {
    this.config = this.configFormCompany.value;
    this.setConfigurationSettings(this.config);
    this.updateConfigCompany();
  }

  public addConfigLabel() {
    this.config = this.configFormLabel.value;
    this.setConfigurationSettings(this.config);
    this.updateConfigLabel();
  }

  public setConfigurationSettings(config) {
    if (config.pathBackup) Config.setConfigToBackup(config.pathBackup, config.pathMongo, config.backupTime);
    if (config.emailAccount) Config.setConfigEmail(config.emailAccount, config.emailPassword)
    if (config.companyName) Config.setConfigCompany(config.companyName, config.companyCUIT, config.companyAddress, 
                                                    config.companyPhone, config.companyVatCondition, 
                                                    config.companyStartOfActivity, config.companyGrossIncome, config.footerInvoice);
    if (config.heightLabel) Config.setConfigLabel (config.heightLabel, config.widthLabel);
    if (config.modules) Config.setModules(config.modules[0]);
  }


  public updateConfigBackup(): void {

    this.loading = true;

    this._configService.updateConfigBackup(this.config).subscribe(
      result => {
        if (!result.configs) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.config = result.configs[0];
          this.showMessage("Los cambios fueron guardados con éxito.", "success", false);
          this.getConfig();
          this.buildFormBackup();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    )
  }

  public updateConfigEMail(): void {

    this.loading = true;

    this._configService.updateConfigEmail(this.config).subscribe(
      result => {
        if (!result.configs) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.config = result.configs[0];
          this.showMessage("Los cambios fueron guardados con éxito.", "success", false);
          this.getConfig();
          this.buildFormEmail();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    )
  }

  public updateConfigCompany(): void {

    this.loading = true;

    this._configService.updateConfigCompany(this.config).subscribe(
      result => {
        if (!result.configs) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.config = result.configs[0];
          this.showMessage("Los cambios fueron guardados con éxito.", "success", false);
          this.getConfig();
          this.buildFormCompany();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    )
  }

  public updateConfigLabel(): void {

    this.loading = true;

    this._configService.updateConfigLabel(this.config).subscribe(
      result => {
        if (!result.configs) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.config = result.configs[0];
          this.showMessage("Los cambios fueron guardados con éxito.", "success", false);
          this.getConfig();
          this.buildFormLabel();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
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
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    )
  }

  public getConfig(): void {

    this.loading = true;
    
    this._configService.getConfigApi().subscribe(
      result => {
        if(!result.configs) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true); 
        } else {
          let config = result.configs[0];
          this.config = config;
          this.setProperties(config);
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    )
  }

  public setProperties(config): void {
    
    if (!config.backupTime) config.backupTime = "";
    if (!config.pathBackup) config.pathBackup = "";
    if (!config.pathMongo) config.pathMongo = "";
    if (!config.emailAccount) config.emailAccount = "";
    if (!config.emailPassword) config.emailPassword = "";
    if (!config.companyName) config.companyName = "";
    if (!config.companyCUIT) config.companyCUIT = "";
    if (!config.companyVatCondition) config.companyVatCondition = null;
    if (!config.companyStartOfActivity) config.companyStartOfActivity = "";
    if (!config.companyGrossIncome) config.companyGrossIncome = "";
    if (!config.companyAddress) config.companyAddress = "";
    if (!config.companyPhone) config.companyPhone = "";
    if (!config.footerInvoice) config.footerInvoice = "";
    if (!config.heightLabel) config.heightLabel = "";
    if (!config.widthLabel) config.widthLabel = "";
    
    this.configFormBackup.setValue({
      '_id': config._id,
      'backupTime': config.backupTime,
      'pathBackup': config.pathBackup,
      'pathMongo': config.pathMongo,
    });

    this.configFormEmail.setValue({
      '_id': config._id,
      'emailAccount': config.emailAccount,
      'emailPassword': config.emailPassword
    });

    this.configFormCompany.setValue({
      '_id': config._id,
      'companyName': config.companyName,
      'companyCUIT': config.companyCUIT,
      'companyAddress': config.companyAddress,
      'companyPhone': config.companyPhone,
      'companyVatCondition': config.companyVatCondition,
      'companyStartOfActivity': config.companyStartOfActivity,
      'companyGrossIncome': config.companyGrossIncome,
      'footerInvoice': config.footerInvoice
    });

    this.configFormLabel.setValue({
      '_id': config._id,
      'heightLabel': config.heightLabel,
      'widthLabel': config.widthLabel,
    });
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