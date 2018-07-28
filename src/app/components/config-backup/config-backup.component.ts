import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { Router } from '@angular/router';

import { Config } from './../../app.config';
import { VATCondition } from 'app/models/vat-condition';

import { ConfigService } from './../../services/config.service';
import { VATConditionService } from './../../services/vat-condition.service';
import { DateFormatPipe } from '../../pipes/date-format.pipe';

@Component({
  selector: 'app-config-backup',
  templateUrl: './config-backup.component.html',
  styleUrls: ['./config-backup.component.css'],
  providers: [NgbAlertConfig, DateFormatPipe]
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
  public loadingCompany: boolean = false;
  public loadingEmail: boolean = false;
  public loadingLabel: boolean = false;
  public loadingBackup: boolean = false;
  public loadingLicense: boolean = false;
  public dateFormat: DateFormatPipe = new DateFormatPipe();

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
    this.getConfig();
    this.buildFormCompany();
    // this.buildFormBackup();
    this.buildFormEmail();
    this.buildFormLabel();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildFormCompany() {
    
    this.configFormCompany = this._fb.group({
      '_id': [this.config._id, [
          Validators.required
        ]
      ],
      'companyName': [this.config['companyName'], [
          Validators.required
        ]
      ],
      'companyCUIT': [this.config['companyCUIT'], [
        ]
      ],
      'companyVatCondition': [this.config['companyVatCondition'], [
        ]
      ],
      'companyStartOfActivity': [this.dateFormat.transform(this.config['companyStartOfActivity'], 'DD/MM/YYYY'), [
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
      'footerInvoice': [this.config['footerInvoice'], [ 
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

  public buildFormLabel() {
    this.configFormLabel = this._fb.group({
      '_id': [this.config._id, [
          Validators.required
        ]
      ],
      'heightLabel': [this.config['heightLabel'], [
          Validators.required
        ]
      ],
      'widthLabel': [this.config['widthLabel'], [
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

    this.loadingCompany = true;

    this._vatCondition.getVATConditions().subscribe(
      result => {
        if (!result.vatConditions) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
          this.loadingCompany = false;
        } else {
          this.vatConditions = result.vatConditions;
        }
        this.loadingCompany = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
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
    this.updateConfigCompany();
  }

  public addConfigLabel() {
    this.config = this.configFormLabel.value;
    this.updateConfigLabel();
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

  public updateConfigLabel(): void {

    this.loadingLabel = true;

    this._configService.updateConfigLabel(this.config).subscribe(
      result => {
        if (!result.configs) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
          this.loadingLabel = false;
        } else {
          this.config = result.configs[0];
          this.showMessage("Los cambios fueron guardados con éxito.", "success", false);
          this.getConfig();
        }
        this.loadingLabel = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loadingLabel = false;
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
          this.setValuesForm();
        }
      },
      error => {
        this.showMessage(error._body, "danger", false);
      }
    )
  }

  public setValuesForm(): void {
    
    if (!this.config['backupTime']) this.config['backupTime'] = "";
    if (!this.config['pathBackup']) this.config['pathBackup'] = "";
    if (!this.config['pathMongo']) this.config['pathMongo'] = "";
    if (!this.config['emailAccount']) this.config['emailAccount'] = "";
    if (!this.config['emailPassword']) this.config['emailPassword'] = "";
    if (!this.config['companyName']) this.config['companyName'] = "";
    if (!this.config['companyCUIT']) this.config['companyCUIT'] = "";
    if (!this.config['companyVatCondition']) this.config['companyVatCondition'] = this.vatConditions[0];
    if (!this.config['companyStartOfActivity']) this.config['companyStartOfActivity'] = "";
    if (!this.config['companyGrossIncome']) this.config['companyGrossIncome'] = "";
    if (!this.config['companyAddress']) this.config['companyAddress'] = "";
    if (!this.config['companyPhone']) this.config['companyPhone'] = "";
    if (!this.config['footerInvoice']) this.config['footerInvoice'] = "";
    if (!this.config['heightLabel']) this.config['heightLabel'] = "";
    if (!this.config['widthLabel']) this.config['widthLabel'] = "";

    this.configFormCompany.setValue({
      '_id': this.config['_id'],
      'companyName': this.config['companyName'],
      'companyCUIT': this.config['companyCUIT'],
      'companyAddress': this.config['companyAddress'],
      'companyPhone': this.config['companyPhone'],
      'companyVatCondition': this.config['companyVatCondition'],
      'companyStartOfActivity': this.dateFormat.transform(this.config['companyStartOfActivity'], 'DD/MM/YYYY'),
      'companyGrossIncome': this.config['companyGrossIncome'],
      'footerInvoice': this.config['footerInvoice']
    });

    // this.configFormBackup.setValue({
    //   '_id': this.config['_id'],
    //   'backupTime': this.config['backupTime'],
    //   'pathBackup': this.config['pathBackup'],
    //   'pathMongo': this.config['pathMongo'],
    // });

    this.configFormEmail.setValue({
      '_id': this.config['_id'],
      'emailAccount': this.config['emailAccount'],
      'emailPassword': this.config['emailPassword']
    });

    this.configFormLabel.setValue({
      '_id': this.config['_id'],
      'heightLabel': this.config['heightLabel'],
      'widthLabel': this.config['widthLabel'],
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