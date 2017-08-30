import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Router } from '@angular/router';

import { Config } from './../../app.config';
import { ConfigService } from './../../services/config.service';

@Component({
  selector: 'app-config-backup',
  templateUrl: './config-backup.component.html',
  styleUrls: ['./config-backup.component.css']
})
export class ConfigBackupComponent implements OnInit {

  public userType: string;
  public config: Config;
  public configForm: FormGroup;
  public focusEvent = new EventEmitter<boolean>();
  public alertMessage: any;
  public loading: boolean = false;

  public formErrors = {
    'pathMongo' : '',
    'pathBackup' : '',
    'backupTime' : ''
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
    }
  };

  constructor(
    public _router: Router,
    public _serviceConfig: ConfigService,
    public _fb: FormBuilder
  ) { }

  ngOnInit(): void {
    
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.config = new Config();
    this.buildForm();
    this.getConfig();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(){
    this.configForm = this._fb.group({
      '_id': [this.config._id, [
          Validators.required
        ]
      ],
      'pathMongo': [this.config.pathMongo, [
          Validators.required
        ]
      ],
      'pathBackup' : [this.config.pathBackup, [
          Validators.required
        ]
      ],
      'backupTime' : [this.config.backupTime, [
          Validators.required
        ]
      ]
    });

    this.configForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {
    
    if (!this.configForm) { return; }
    const form = this.configForm;

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

  public addConfig(){
    this.config.pathBackup = this.configForm.value.pathBackup;
    this.config.pathMongo = this.configForm.value.pathMongo;
    this.config.backupTime = this.configForm.value.backupTime;
    this.saveConfig();
  }

  public saveConfig(): void {

    this._serviceConfig.updateConfigApi(this.config).subscribe(
      result=> {
        if(!result.config) {
          this.alertMessage = result.messages;
        } else {
          this.config = result.config;
          this.alertMessage = 'Se guardaron los cambios';
        }
      },
      error => {
        this.alertMessage = error._body;
        if(!this.alertMessage) {
            this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
        }
        this.loading = false;
      }
    )
  }

  public getConfig(): void {
    this._serviceConfig.getConfigApi().subscribe(
      result => {
        if(!result.config) {
          this.alertMessage = result.messages;
        } else {
          this.config = result.config[0];
          console.log(this.config);
          this.configForm.setValue({
            '_id' :this.config._id,
            'backupTime' : this.config.backupTime,
            'pathBackup' : this.config.pathBackup,
            'pathMongo' : this.config.pathMongo
          })
        }
      },
      error => {
        this.alertMessage = error._body;
        if(!this.alertMessage) {
          this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
        }
        this.loading = false;
      }
    )
  }
}