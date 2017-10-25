import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Router } from '@angular/router';

import { Config } from './../../app.config';
import { ConfigService } from './../../services/config.service';

@Component({
  selector: 'app-config-backup',
  templateUrl: './config-backup.component.html',
  styleUrls: ['./config-backup.component.css'],
  providers: [NgbAlertConfig]
})
export class ConfigBackupComponent implements OnInit {

  public userType: string;
  public config: Config;
  public configFormBackup: FormGroup;
  public configFormEmail: FormGroup;
  public configFormCompany: FormGroup;
  public focusEvent = new EventEmitter<boolean>();
  public alertMessage: string = "";
  public loading: boolean = false;

  public formErrors = {
    'pathMongo' : '',
    'pathBackup' : '',
    'backupTime' : '',
    'emailAccount': '',
    'emailPassword': '',
    'companyName': '',
    'companyCUIT': '',
    'companyAddress': '',
    'companyPhone': '',
    'ticketFoot': ''
  };

  public validationMessages = {
    'pathMongo': {
      'required':       'Este campo es requerido.'
    },
    'pathBackup' : {
        'required':     'Este campo es requerido.'
    },
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
    'companyAddress': {
    },
    'companyPhone': {
    },
    'ticketFoot': {
    }
  };

  constructor(
    public _router: Router,
    public _configService: ConfigService,
    public _fb: FormBuilder,
    public alertConfig: NgbAlertConfig,
  ) { }

  ngOnInit(): void {
    
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.config = new Config();
    this.buildFormBackup();
    this.buildFormEmail();
    this.buildFormCompany();
    this.getConfig();
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
          Validators.required
        ]
      ],
      'pathBackup' : [ Config.pathBackup, [
          Validators.required
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
      'companyAddress': [Config.companyAddress, [
        ]
      ],
      'companyPhone': [Config.companyPhone, [
        ]
      ],
      'ticketFoot': [Config.ticketFoot, [
        ]
      ]
    });

    this.configFormCompany.valueChanges
      .subscribe(data => this.onValueChangedCompany(data));

    this.onValueChangedCompany();
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

  public setConfigurationSettings(config) {
    if (config.pathBackup) Config.setConfigToBackup(config.pathBackup, config.pathMongo, config.backupTime);
    if (config.emailAccount) Config.setConfigEmail(config.emailAccount, config.emailPassword)
    if (config.companyName) Config.setConfigCompany(config.companyName, config.companyCUIT, config.companyAddress, config.companyPhone, config.ticketFoot);
  }


  public updateConfigBackup(): void {

    this.loading = true;

    this._configService.updateConfigBackup(this.config).subscribe(
      result => {
        if (!result.configs) {
          this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.config = result.configs[0];
          if (this._configService.saveConfigLocal(this.config)) {
            this.showMessage("Se guardaron los cambios.", "success", false);
            this.buildFormBackup();
            this.getConfig();
          } else {
            this.showMessage("Ha ocurrido un error en el navegador. Recarge la página.", "danger", false);
          }
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
          this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.config = result.configs[0];
          if (this._configService.saveConfigLocal(this.config)) {
            this.showMessage("Se guardaron los cambios.", "success", false);
            this.buildFormEmail();
            this.getConfig();
          } else {
            this.showMessage("Ha ocurrido un error en el navegador. Recarge la página.", "danger", false);
          }
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
          this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.config = result.configs[0];
          if (this._configService.saveConfigLocal(this.config)) {
            this.showMessage("Se guardaron los cambios.", "success", false);
            this.buildFormCompany();
            this.getConfig();
          } else {
            this.showMessage("Ha ocurrido un error en el navegador. Recarge la página.", "danger", false);
          }
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    )
  }

  public downloadLicence(): void {
    this._configService.getLicence().subscribe(
      result => {
        if(!result.configs) {
          this.showMessage(result.message, "info", true); 
        } else {
          this.showMessage(result.message, "info", true); 
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
          this.showMessage(result.message, "info", true); 
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
    if (!config.companyAddress) config.companyAddress = "";
    if (!config.companyPhone) config.companyPhone= "";
    if (!config.ticketFoot) config.ticketFoot = "";
    
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
      'ticketFoot': config.ticketFoot,
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