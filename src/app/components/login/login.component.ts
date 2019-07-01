// ANGULAR
import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// TERCEROS
import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

// MODELS
import { Employee } from './../../models/employee';
import { Config } from 'app/app.config';

// SERVICES
import { UserService } from './../../services/user.service';
import { TurnService } from './../../services/turn.service';
import { EmployeeService } from './../../services/employee.service';
import { TableService } from './../../services/table.service';
import { AuthService } from 'app/services/auth.service';
import { ConfigService } from 'app/services/config.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [NgbAlertConfig]
})

export class LoginComponent implements OnInit {

  public loginForm: FormGroup;
  public alertMessage: string;
  public loading: boolean = false;
  public employees: Employee[] = new Array();
  public focusEvent = new EventEmitter<boolean>();
  public company: string;
  public user: string;
  public password: string;

  public formErrors = {
    'company': '',
    'user': '',
    'password': ''
  };

  public validationMessages = {
    'company': {
      'required':       'Este campo es requerido.'
    },
    'user': {
      'required':       'Este campo es requerido.'
    },
    'password': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
    public _userService: UserService,
    private _authService: AuthService,
    public _employeeService: EmployeeService,
    public _turnService: TurnService,
    public _tableService: TableService,
    public _fb: FormBuilder,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _router: Router,
    private _configService: ConfigService,
    private _route: ActivatedRoute
    ) {
      this.alertMessage = '';
    }

  ngOnInit() {
    this.company = Config.database;
    this.buildForm();
  }

  ngAfterViewInit(): void {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.loginForm = this._fb.group({
      'company': [ this.company, [
        Validators.required
        ]
      ],
      'user': [this.user, [
        Validators.required
        ]
      ],
      'password': [this.password, [
        Validators.required
        ]
      ]
    });

    this.loginForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {

    if (!this.loginForm) { return; }
    const form = this.loginForm;

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

  async login() {

    this.user = this.loginForm.value.user;
    this.password = this.loginForm.value.password;
    this.company = this.loginForm.value.company;
    Config.setDatabase(this.company);
    this.showMessage("Comprobando usuario...", 'info', false);
    this.loading = true;

    //Obtener el token del usuario
    this._authService.login(this.company, this.user, this.password).subscribe(
      async result => {
        this.loading = false;
        if (!result.user) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.showMessage("Ingresando...", 'success', false);
          this._authService.loginStorage(result.user);
          await this.getConfigApi().then(
            config => {
              if(config) {
                this._configService.setConfig(config);
                this.setConfigurationSettings(config);
              }
            }
          );

          let returnURL = '/';
          this._route.queryParams.subscribe(params => returnURL = params['return'] || '/forums');
          this._router.navigateByUrl(returnURL);
        }
      },
      error => {
        if (error.status === 0) {
          this.showMessage("Error de conexión con el servidor. Comunicarse con Soporte.", 'danger', false);
        } else {
          this.showMessage(error._body, 'danger', false);
        }
        this.loading = false;
      }
    );
  }

  public getConfigApi(): Promise<Config> {

    return new Promise<Config>((resolve, reject) => {
      this._configService.getConfigApi().subscribe(
        result => {
          if (!result.configs) {
            resolve(null);
          } else {
            resolve(result.configs[0]);
          }
        },
        error => {
          resolve(null);
        }
      );
    });
  }

  public setConfigurationSettings(config) {
    if (config.emailAccount) { Config.setConfigEmail(config.emailAccount, config.emailPassword) }
    if (config.companyName) { Config.setConfigCompany(config.companyPicture, config.companyName, config.companyAddress, config.companyPhone,
                                                    config.companyVatCondition, config.companyStartOfActivity, config.companyGrossIncome, config.footerInvoice, config.companyFantasyName,
                                                    config.country, config.timezone, config.currency, config.companyIdentificationType, config.companyIdentificationValue, config.licenseCost,
                                                    config.companyPostalCode);
    }
    if (config.showLicenseNotification !== undefined) {
      Config.setConfigs(config.showLicenseNotification);
    }
    if (config.modules) {
      Config.setModules(config.modules);
    }
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage():void {
    this.alertMessage = '';
  }
}
