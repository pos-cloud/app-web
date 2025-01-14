// ANGULAR
import {
  Component,
  EventEmitter,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// TERCEROS
import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

// MODELS
import { Config } from 'app/app.config';

// SERVICES
import { AuthService } from 'app/core/services/auth.service';
import { ConfigService } from 'app/core/services/config.service';
import { EmployeeService } from '../../core/services/employee.service';
import { TableService } from '../../core/services/table.service';
import { UserService } from '../../core/services/user.service';
//import { Socket } from 'ngx-socket-io';
import { Employee } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None,
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
    company: '',
    user: '',
    password: '',
  };

  public validationMessages = {
    company: {
      required: 'Este campo es requerido.',
    },
    user: {
      required: 'Este campo es requerido.',
    },
    password: {
      required: 'Este campo es requerido.',
    },
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
    //private socket: Socket,
    private _toastService: ToastService
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
    this.checkLockInput
      ? (this.checkLockInput = false)
      : (this.checkLockInput = true);
  }

  private processParams(): void {
    this._route.queryParams.subscribe((params) => {
      if (params['negocio']) {
        this.company = params['negocio'];
        Config.setDatabase(this.company);
      } else {
        this.company = Config.database;
      }
    });
  }

  public buildForm(): void {
    this.company = localStorage.getItem('company');

    if (this.company) {
      this.checkLockInput = true;
    } else {
      this.checkLockInput = false;
    }

    this.loginForm = this._fb.group({
      company: [this.company, [Validators.required]],
      user: [this.user, [Validators.required]],
      password: [this.password, [Validators.required]],
    });

    this.loginForm.valueChanges.subscribe((data) => this.onValueChanged(data));
    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {
    if (!this.loginForm) {
      return;
    }
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
    this.company = this.loginForm.value.company.trim();
    this.user = this.loginForm.value.user;
    this.password = this.loginForm.value.password;

    if (!this.company.match(/^[a-z0-9]+$/)) {
      this._toastService.showToast({
        message: 'El negocio ingresado no fue encontrado.',
        type: 'danger',
      });
    } else {
      this.showMessage('Comprobando usuario...', 'info', false);
      this.loading = true;
      this._authService.login(this.company, this.user, this.password).subscribe(
        async (result) => {
          this.loading = false;
          if (!result.user) {
            if (result.message && result.message !== '')
              this.showMessage(result.message, 'info', true);
          } else {
            if (result.user.employee) {
              this.showMessage('Ingresando...', 'success', false);

              this._authService.loginStorage(result.user);
              //this.initSocket();

              await this.getConfigApi().then((config) => {
                if (config) {
                  this._configService.setConfig(config);
                  this.setConfigurationSettings(config);
                }
              });
              Config.setDatabase(this.company);
              localStorage.setItem('company', this.company);

              this._route.queryParams.subscribe(
                (params) => params['return'] || '/'
              );
              this._router.navigateByUrl('/');
            } else {
              this.showMessage(
                'El usuario y/o contraseña son incorrectos',
                'info',
                true
              );
            }
          }
        },
        (error) => {
          if (error.status === 0) {
            this.showMessage(
              'Error de conexión con el servidor. Comunicarse con Soporte.',
              'danger',
              false
            );
          } else {
            this.showMessage(error._body, 'danger', false);
          }
        }
      );
    }
  }

  // private initSocket(): void {
  //   const identity: User = JSON.parse(sessionStorage.getItem('user'));

  //   if (identity && Config.database && Config.database !== '') {
  //     // INICIAMOS SOCKET
  //     this.socket.emit('start', {
  //       database: Config.database,
  //       clientType: 'pos'
  //     });

  //     // ESCUCHAMOS SOCKET
  //     this.socket.on('message', (mnj) => {
  //       this.showToast(mnj);
  //     });
  //   }
  // }

  public getConfigApi(): Promise<Config> {
    return new Promise<Config>((resolve, reject) => {
      this._configService.getConfigApi().subscribe(
        (result) => {
          if (!result.configs) {
            resolve(null);
          } else {
            resolve(result.configs[0]);
          }
        },
        (error) => {
          resolve(null);
        }
      );
    });
  }

  public setConfigurationSettings(config) {
    if (config.emailAccount) {
      Config.setConfigEmail(config.emailAccount, config.emailPassword);
    }
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
        config.companyPostalCode
      );
    }
    if (config.showLicenseNotification !== undefined) {
      Config.setConfigs(config.showLicenseNotification);
    }
    if (config.modules) {
      Config.setModules(config.modules);
    }
  }

  public showMessage(
    message: string,
    type: string,
    dismissible: boolean
  ): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
    this.loading = false;
  }

  public hideMessage(): void {
    this.alertMessage = '';
    this.loading = false;
  }
}
