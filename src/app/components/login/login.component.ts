// ANGULAR
import { Component, OnInit, EventEmitter, ViewEncapsulation } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// TERCEROS
import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

// MODELS
import { Config } from 'app/app.config';

// SERVICES
import { UserService } from '../user/user.service';
import { EmployeeService } from '../employee/employee.service';
import { TableService } from '../table/table.service';
import { AuthService } from 'app/components/login/auth.service';
import { ConfigService } from 'app/components/config/config.service';
import { User } from 'app/components/user/user';
import { ToastrService } from 'ngx-toastr';
//import { Socket } from 'ngx-socket-io';
import { Employee } from '../employee/employee';
import { SocketService } from 'app/main/services/socket.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None
})

export class LoginComponent implements OnInit {
  public loginForm: UntypedFormGroup;
  public alertMessage: string;
  public loading: boolean = false;
  public employees: Employee[] = new Array();
  public focusEvent = new EventEmitter<boolean>();
  public company: string;
  public user: string;
  public password: string;
  public checkLockInput: boolean = false;

  public formErrors = {
    'company': '',
    'user': '',
    'password': ''
  };

  public validationMessages = {
    'company': {
      'required': 'Este campo es requerido.'
    },
    'user': {
      'required': 'Este campo es requerido.'
    },
    'password': {
      'required': 'Este campo es requerido.'
    }
  };

  constructor(
    public _userService: UserService,
    private _authService: AuthService,
    public _employeeService: EmployeeService,
    public _tableService: TableService,
    public _fb: UntypedFormBuilder,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _router: Router,
    private _configService: ConfigService,
    private _route: ActivatedRoute,
    private _socket: SocketService,
    private _toastr: ToastrService,
  ) {
    this.alertMessage = '';
  }

  async ngOnInit() {
    this.processParams();
    this.buildForm();
  }

  ngAfterContentInit(): void {
    this.focusEvent.emit(true);
  }

  async lockInput() {
    this.checkLockInput ? this.checkLockInput = false : this.checkLockInput = true;
  }

  private processParams(): void {
    this._route.queryParams.subscribe(params => {
      if (params['negocio']) {
        this.company = params['negocio'];
        Config.setDatabase(this.company);
      } else {
        this.company = Config.database;
      }
    });
  }

  public buildForm(): void {
    this.company = localStorage.getItem("company");

    if (this.company) {
      this.checkLockInput = true
    } else {
      this.checkLockInput = false
    }

    this.loginForm = this._fb.group({
      'company': [this.company, [Validators.required]],
      'user': [this.user, [Validators.required]],
      'password': [this.password, [Validators.required]]
    });

    this.loginForm.valueChanges.subscribe(data => this.onValueChanged(data));
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
    this.company = this.loginForm.value.company.trim()
    this.user = this.loginForm.value.user
    this.password = this.loginForm.value.password

    if (!this.company.match(/^[a-z0-9]+$/)) {
      this.showToast("El negocio ingresado no fue encontrado.", "danger");
    } else {
      this.showMessage("Comprobando usuario...", 'info', false);
      this.loading = true;
      this._authService.login(this.company, this.user, this.password).subscribe(async result => {
          this.loading = false;
          if (!result.user) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          } else {
            if (result.user.employee) {
              this.showMessage("Ingresando...", 'success', false);

              this._authService.loginStorage(result.user);
  
              await this.getConfigApi().then(config => {
                if (config) {
                  this._configService.setConfig(config);
                  this.setConfigurationSettings(config);
                }
              });
              Config.setDatabase(this.company);
              localStorage.setItem("company", this.company);
              this._socket.initSocket();

              this._route.queryParams.subscribe(params => params['return'] || '/');
              this._router.navigateByUrl('/');
             } else {
              this.showMessage('El usuario y/o contraseña son incorrectos', 'info', true);
            }
          }
        },
        error => {
          if (error.status === 0) {
            this.showMessage("Error de conexión con el servidor. Comunicarse con Soporte.", 'danger', false);
          } else {
            this.showMessage(error._body, 'danger', false);
          }
        }
      );
    }
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
    this.loading = false;
  }

  public hideMessage(): void {
    this.alertMessage = '';
    this.loading = false;
  }

  public showToast(message: string, type: string = 'success'): void {
    switch (type) {
      case 'success':
        this._toastr.success('', message);
        break;
      case 'info':
        this._toastr.info('', message);
        break;
      case 'warning':
        this._toastr.warning('', message);
        break;
      case 'danger':
        this._toastr.error('', message);
        break;
      default:
        this._toastr.success('', message);
        break;
    }
    this.loading = false;
  }
}
