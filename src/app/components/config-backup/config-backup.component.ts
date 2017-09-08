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
  public focusEvent = new EventEmitter<boolean>();
  public alertMessage: any;
  public loading: boolean = false;

  public formErrors = {
    'pathMongo' : '',
    'pathBackup' : '',
    'backupTime' : '',
    'mailAccount' : '',
    'mailPassword': ''
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
    'mailAccount' : {
      'required':     'Este campo es requerido'
    },
    'mailPassword' : {
      'required':     'Este campo es requerido'
    }
  };

  constructor(
    public _router: Router,
    public _serviceConfig: ConfigService,
    public _fb: FormBuilder,
    public alertConfig: NgbAlertConfig,
  ) { }

  ngOnInit(): void {
    
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.config = new Config();
    this.buildFormBackup();
    this.buildFormEmail();
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
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public buildFormEmail(){
    this.configFormEmail = this._fb.group({
      '_id': [this.config._id, [
          Validators.required
        ]
      ],
      'mailAccount' : [ Config.mailAccount, [
          Validators.required
        ]
      ],
      'mailPassword' : [ Config.mailPassword, [
          Validators.required
        ]
      ]
    });

    this.configFormEmail.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {
    
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
    this.saveConfigBackup();
  }

  public addConfigEmail() {
    this.config = this.configFormEmail.value;
    this.setConfigurationSettings(this.config);
    this.saveConfigMail();
  }

  public setConfigurationSettings(config) {
    Config.setConfigToBackup(config.pathBackup, config.pathMongo, config.backupTime);
    Config.setConfigMail(config.mailAccount, config.mailPassword)
  }

  public saveConfigBackup(): void {
    
    this.loading = true;
    
    this._serviceConfig.updateConfigBackup(this.config).subscribe(
      result=> {
        if(!result.config) {
          this.showMessage(result.message, "info", true); 
          this.loading = false;
        } else {
          this.config = result.config;
          this.showMessage("Se guardaron los cambios.", "success", false);
        }
        this.loading = false;
        this.buildFormBackup();
        this.getConfig();
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    )
  }

  public saveConfigMail(): void {
    
    this.loading = true;
    
    this._serviceConfig.updateConfigMail(this.config).subscribe(
      result=> {
        if(!result.config) {
          this.showMessage(result.message, "info", true); 
          this.loading = false;
        } else {
          this.config = result.config;
          this.showMessage("Se guardaron los cambios.", "success", false);
        }
        this.loading = false;
        this.buildFormEmail();
        this.getConfig();
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    )
  }

  public getConfig(): void {

    this.loading = true;
    
    this._serviceConfig.getConfigApi().subscribe(
      result => {
        if(!result.config) {
          this.showMessage(result.message, "info", true); 
          this.loading = false;
        } else {
          let config = result.config[0];
          this.config = config;
          this.configFormBackup.setValue({
            '_id' : config._id,
            'backupTime' : config.backupTime,
            'pathBackup' : config.pathBackup,
            'pathMongo' : config.pathMongo,
          });
          this.configFormEmail.setValue({
            '_id' : config._id,
            'mailAccount' : config.mailAccount,
            'mailPassword' : config.mailPassword
          });
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    )
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