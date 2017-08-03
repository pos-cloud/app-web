import { Component, OnInit, EventEmitter } from '@angular/core';
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
  public alertMessage: any;
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'apiHost': '',
    'apiPort': ''
  };

  public validationMessages = {
    'apiHost': {
      'required': 'Este campo es requerido.'
    }, 
    'apiPort': {
    }
  };

  constructor(
    public _configService: ConfigService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
  ) {
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.config = new Config();
    this.buildForm();
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
    this.saveConfig();
  }

  public saveConfig(): void {
    
    this._configService.saveConfigApi(this.config).subscribe(
      result => {
        if (!result) {
          this.alertMessage = result.message;
          this.alertConfig.type = 'danger';
        } else {
          this.config = result;
          if (this._configService.saveConfigLocal(this.config)) {
            this.setConfigurationSettings(this.config);
            this.activeModal.close("save_close");
          } else {
            this.alertMessage = "Ha ocurrido un error en el navegador. Recarge la página.";
            this.alertConfig.type = 'danger';
          }
        }
        this.loading = false;
      },
      error => {
        this.alertMessage = 'No se ha podido establecer conexión con el servidor.\nVerifique los datos ingresados.\nVerifique si el servidor está encendido.';
        this.loading = false;
      }
    );
  }

  public setConfigurationSettings(config) {
    Config.setApiHost(config.apiHost);
    Config.setApiPort(config.apiPort);
    // Config.setPrintHost(config.printHost);
    // Config.setPrintPort(config.printPort);
  }
}