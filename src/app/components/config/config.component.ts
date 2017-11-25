import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Config } from './../../app.config';
import { Employee } from './../../models/employee';
import { EmployeeType } from './../../models/employee-type';
import { User, UserState } from './../../models/user';

import { ConfigService } from './../../services/config.service';
import { UserService } from './../../services/user.service';
import { EmployeeService } from './../../services/employee.service';
import { EmployeeTypeService } from './../../services/employee-type.service';

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
  public accessTypes: string[] = ["Cloud", "Local"];
  public accessTypeSelected: string = "Cloud";
  public showAdvancedOptions: boolean = false;

  public formErrors = {
    'apiHost': '',
    'apiPort': '',
    'apiConnectionPassword': '',
    'accessType': ''
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
    'accessType': {
      'required': 'Este campo es requerido.'
    },
  };

  constructor(
    public activeModal: NgbActiveModal,
    public _configService: ConfigService,
    public _userService: UserService,
    public _employeeService: EmployeeService,
    public _employeeTypeService: EmployeeTypeService,
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
    if (result && result.config) {
      let config = result.config[0];
      this.configForm.setValue({
        'apiHost': config.apiHost,
        'apiPort': config.apiPort,
        'apiConnectionPassword': config.apiConnectionPassword
      });
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
      'accessType': [Config.accessType, [
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
    
    this.accessTypeSelected = this.configForm.value.accessType;
  }

  public addConfig(): void {
    
    this.loading = true;
    this.config = this.configForm.value;
    this.setConfigurationSettings(this.config);
    this.getConfig();
  }

  public getConfig() {

    this.loading = true;

    this._configService.getConfigApi().subscribe(
      result => {
        this.showMessage("Configurando tu POS Cloud...", "success", false); 
        if (!result.configs) {
          this.saveConfig();
        } else {
          this.updateConfig(result.configs[0]);
        }
        this.loading = false;
      },
      error => {
        this.showMessage("No se ha podido establecer conexión con el servidor.\nVerifique los datos ingresados.\nVerifique si el servidor está encendido.", "danger", false);
        this.loading = false;
      }
    );
  }

  public updateConfig(config: Config): void {

    this.loading = true;
    this.config._id = config._id;
    
    this._configService.updateConfig(this.config).subscribe(
      result => {
        if (!result.configs) {
          this.showMessage(result.message, "info", true); 
        } else {
          this.config = result.configs[0];
          if (this._configService.saveConfigLocal(this.config)) {
            this.configUser();
          } else {
            this.showMessage("Ha ocurrido un error en el navegador. Recarge la página.", "danger", false);
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

  public saveConfig(): void {

    this.loading = true;

    this._configService.saveConfigApi(this.config).subscribe(
      result => {
        if (!result.configs) {
          this.showMessage(result.message, "info", true); 
        } else {
          this.config = result.configs[0];
          if (this._configService.saveConfigLocal(this.config)) {
            this.showMessage("La conexión es exitosa.", "success", false);
            this.configUser();
          } else {
            this.showMessage("Ha ocurrido un error en el navegador. Recarge la página.", "danger", false);
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
    Config.setAccessType(config.accessType);
    Config.setApiHost(config.apiHost);
    Config.setApiPort(config.apiPort);
  }

  //METODO PARA INICIALIZAR EL SISTEMA CON UN USUARIO
  public configUser() {
    this.getUsers();
  }

  public getUsers(): void {

    this.loading = true;

    this._userService.getUsers("", "config").subscribe(
      result => {
        if (!result.users) {
          this.addEmployeeTypeWaiter();
        } else {
          location.reload();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public addEmployeeTypeWaiter() {

    let employeeType: EmployeeType = new EmployeeType();
    employeeType.description = "Mozo";
    this.loading = true;

    this._employeeTypeService.saveEmployeeType(employeeType).subscribe(
      result => {
        if (!result.employeeType) {
          this.showMessage(result.message, "info", true);
        } else {
          employeeType = result.employeeType;
          this.addEmployeeTypeSupervisor();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public addEmployeeTypeSupervisor() {

    let employeeType: EmployeeType = new EmployeeType();
    employeeType.description = "Supervisor";
    this.loading = true;

    this._employeeTypeService.saveEmployeeType(employeeType).subscribe(
      result => {
        if (!result.employeeType) {
          this.showMessage(result.message, "info", true);
        } else {
          employeeType = result.employeeType;
          this.saveEmployee(employeeType);
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public saveEmployee(employeeType: EmployeeType): void {

    let employee: Employee = new Employee();
    employee.code = 1;
    employee.name = "Soporte";
    employee.type = employeeType;
    this.loading = true;

    this._employeeService.saveEmployee(employee).subscribe(
      result => {
        if (!result.employee) {
          this.showMessage(result.message, "info", true);
        } else {
          employee = result.employee;
          this.saveUser(employee);
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public saveUser(employee: Employee): void {

    let user = new User();
    user.name = "Soporte";
    user.password = "PosRest@";
    user.state = UserState.Enabled;
    user.tokenExpiration = 60;
    user.employee = employee;
    this.loading = true;

    this._userService.saveUser(user).subscribe(
      result => {
        if (!result.user) {
          this.showMessage(result.message, "info", true);
        } else {
          location.reload();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
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