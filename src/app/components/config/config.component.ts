import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Config } from './../../app.config';

import { ConfigService } from './../../services/config.service';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css'],
  providers: [NgbAlertConfig]
})

export class ConfigComponent implements OnInit {

  public config: Config;
  public configForm: FormGroup;
  public alertMessage: string = "";
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'apiHost': '',
    'apiPort': '',
    'apiConnectionPassword': ''
  };

  public validationMessages = {
    'apiHost': {
      'required': 'Este campo es requerido.'
    }, 
    'apiPort': {
    },
    'apiConnectionPassword': {
      'required': 'Este campo es requerido.'
    },
  };

  constructor(
    public activeModal: NgbActiveModal,
    public _configService: ConfigService,
    public _fb: FormBuilder,
    public _router: Router,
    public alertConfig: NgbAlertConfig
  ) {  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.buildForm();
    this.getConfigLocal();
  }

  public getConfigLocal() {
    
    let result = this._configService.getConfigLocal();
    if (result) {
      if (result.config) {
        let config = result.config;
        this.configForm.setValue({
          'apiHost': config.apiHost,
          'apiPort': config.apiPort,
          'apiConnectionPassword': config.apiConnectionPassword
        });
      }
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.configForm = this._fb.group({
      'apiHost': [Config.apiHost, [
          Validators.required
        ]
      ],
      'apiPort': [Config.apiPort, [
        ]
      ],
      'apiConnectionPassword': [Config.apiConnectionPassword, [
          Validators.required
        ]
      ],
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

  public addConfig(): void {
    this.loading = true;
    this.config = this.configForm.value;
    this.setConfigurationSettings(this.config);
    this.getConfig();
  }

  public getConfig() {
    
    this._configService.getConfigApi().subscribe(
      result => {
        if (!result.config) {
          this.saveConfig();
        } else {
          this.updateConfig(result.config[0]);
        }
      },
      error => {
        this.showMessage("No se ha podido establecer conexión con el servidor.\nVerifique los datos ingresados.\nVerifique si el servidor está encendido.", "danger", false);
        this.loading = false;
      }
    );
  }

  public updateConfig(config: Config): void {

    this.config._id = config._id;
    
    this._configService.updateConfigApi(this.config).subscribe(
      result => {
        if (!result) {
          this.showMessage(result.message, "info", true); 
          this.loading = false;
        } else {
          this.config = result;
          if (this._configService.saveConfigLocal(this.config)) {
            location.reload();
          } else {
            this.showMessage("Ha ocurrido un error en el navegador. Recarge la página.", "danger", false);
            this.loading = false;
          }
        }
      },
      error => {
        this.showMessage("No se ha podido establecer conexión con el servidor.\nVerifique los datos ingresados.\nVerifique si el servidor está encendido.", "danger", false);
        this.loading = false;
      }
    );
  }

  public saveConfig(): void {
    
    this._configService.saveConfigApi(this.config).subscribe(
      result => {
        if (!result) {
          this.showMessage(result.message, "info", true); 
          this.loading = false;
        } else {
          this.config = result;
          if (this._configService.saveConfigLocal(this.config)) {
            this.showMessage("La conexión es exitosa.", "success", false);
            location.reload();
          } else {
            this.showMessage("Ha ocurrido un error en el navegador. Recarge la página.", "danger", false);
            this.loading = false;
          }
        }
        this.loading = false;
      },
      error => {
        this.showMessage("No se ha podido establecer conexión con el servidor.\nVerifique los datos ingresados.\nVerifique si el servidor está encendido.", "danger", false);
        this.loading = false;
      }
    );
  }

  public setConfigurationSettings(config) {
    Config.setApiHost(config.apiHost);
    Config.setApiPort(config.apiPort);
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