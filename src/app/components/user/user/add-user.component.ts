import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import {
  NgForm,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { User, UserState } from '../user';

import { Branch, Company, Employee, Permission } from '@types';
import { CashBoxType } from 'app/components/cash-box-type/cash-box-type.model';
import { Origin } from 'app/components/origin/origin';
import { Printer } from 'app/components/printer/printer';
import { AuthService } from 'app/core/services/auth.service';
import { BranchService } from 'app/core/services/branch.service';
import { CashBoxTypeService } from 'app/core/services/cash-box-type.service';
import { CompanyService } from 'app/core/services/company.service';
import { OriginService } from 'app/core/services/origin.service';
import { PermissionService } from 'app/core/services/permission.service';
import { PrinterService } from 'app/core/services/printer.service';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { EmployeeService } from '../../../core/services/employee.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css'],
  providers: [NgbAlertConfig],
})
export class AddUserComponent implements OnInit {
  @Input() userId: string;
  @Input() readonly: boolean;
  @Input() operation: string;
  public user: User;
  public identity: User;
  public userForm: UntypedFormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public states: UserState[] = [UserState.Enabled, UserState.Disabled];
  public employees: Employee[] = new Array();
  public companies: Company[] = new Array();
  public origins: Origin[] = new Array();
  public cashBoxTypes: CashBoxType[] = new Array();
  public focusEvent = new EventEmitter<boolean>();
  public AuxPrinters: Printer[] = new Array();
  public branches: Branch[];
  public permissions: Permission[];
  private subscription: Subscription = new Subscription();

  public table;
  public tables: string[] = ['Empresa', 'Producto'];
  public action;
  public actions: string[] = ['Agregar', 'Modificar', 'Eliminar', 'Ver', 'Exportar', 'Listado'];
  public level = 0;

  public searchCashBoxTypes = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.loading = true)),
      switchMap(async (term) => {
        let match: {} = term && term !== '' ? { name: { $regex: term, $options: 'i' } } : {};
        return await this.getAllCashBoxTypes(match).then((result) => {
          return result;
        });
      }),
      tap(() => (this.loading = false))
    );
  public formatterCashBoxTypes = (x: CashBoxType) => {
    return x.name;
  };

  public formErrors = {
    name: '',
    email: '',
    password: '',
    state: '',
    origin: '',
    employee: '',
    company: '',
    cashBoxType: '',
    level: '',
    tokenExpiration: '',
  };

  public validationMessages = {
    name: { required: 'Este campo es requerido.' },
    email: { required: 'Este campo es requerido.' },
    password: { required: 'Este campo es requerido.' },
    state: { required: 'Este campo es requerido.' },
    origin: {},
    employee: {},
    company: {},
    cashBoxType: { validateAutocomplete: 'Debe ingresar un valor válido' },
    level: {},
    tokenExpiration: { required: 'Este campo es requerido.' },
  };

  public searchCompanies = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.loading = true)),
      switchMap((term) =>
        this.getCompanies(`where="name": { "$regex": "${term}", "$options": "i" }&limit=10`).then((companies) => {
          return companies;
        })
      ),
      tap(() => (this.loading = false))
    );

  public formatterCompanies = (x: { name: string }) => x.name;

  constructor(
    private _userService: UserService,
    private _employeeService: EmployeeService,
    private _companyService: CompanyService,
    private _originService: OriginService,
    private _authService: AuthService,
    private _printerService: PrinterService,
    private _cashBoxTypeService: CashBoxTypeService,
    public _branchService: BranchService,
    public _permissionService: PermissionService,
    public _fb: UntypedFormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) {
    this.getEmployees();
    this.getOrigins();
    this.getPrinters();
    this.getBranches();
    this.getPermissions();
  }

  ngOnInit(): void {
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];

    this._authService.getIdentity.subscribe((identity) => {
      this.identity = identity;
    });

    this.user = new User();
    if (this.userId) {
      this.getUser();
    }
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {
    this.userForm = this._fb.group({
      _id: [this.user._id, []],
      name: [this.user.name, [Validators.required]],
      email: [this.user.email, [Validators.required]],
      password: [this.user.password, [Validators.required]],
      state: [this.user.state, [Validators.required]],
      origin: [this.user.origin, []],
      employee: [this.user.employee, []],
      company: [this.user.company, []],
      printers: this._fb.array([]),
      cashBoxType: [this.user.cashBoxType, [this.validateAutocomplete]],
      branch: [this.user.branch, []],
      permission: [this.user.permission, []],
      level: [this.user.level, []],
      tokenExpiration: [this.user.tokenExpiration, []],
    });

    this.userForm.valueChanges.subscribe((data) => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {
    if (!this.userForm) {
      return;
    }
    const form = this.userForm;

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

  public getAllCashBoxTypes(match: {}): Promise<CashBoxType[]> {
    return new Promise<CashBoxType[]>((resolve, reject) => {
      this.subscription.add(
        this._cashBoxTypeService
          .getAll({
            match,
            sort: { name: 1 },
            limit: 10,
          })
          .subscribe(
            (result) => {
              this.loading = false;
              result.status === 200 ? resolve(result.result) : reject(result);
            },
            (error) => reject(error)
          )
      );
    });
  }

  public addShortcut(shortcuts) {
    this.user.shortcuts = shortcuts;
  }

  public getUser(): void {
    this.loading = true;

    this._userService.getUser(this.userId).subscribe(
      (result) => {
        if (!result.user) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.user = result.user;
          this.setValuesForm();
        }
        this.loading = false;
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public validateAutocomplete(c: UntypedFormControl) {
    let result =
      c.value && Object.keys(c.value)[0] === '0'
        ? {
            validateAutocomplete: {
              valid: false,
            },
          }
        : null;
    return result;
  }

  public setValuesForm(): void {
    if (!this.user._id) this.user._id = '';
    if (!this.user.name) this.user.name = '';
    if (!this.user.email) this.user.email = '';
    if (!this.user.password) this.user.password = '';
    if (!this.user.state) this.user.state = UserState.Enabled;
    if (!this.user.company) this.user.company = null;
    if (this.user.level === undefined) this.user.level = 99;
    if (this.user.tokenExpiration === undefined) this.user.tokenExpiration = 1440;

    let employee;
    if (!this.user.employee) {
      employee = null;
    } else {
      if (this.user.employee._id) {
        employee = this.user.employee._id;
      } else {
        employee = this.user.employee;
      }
    }

    let origin;
    if (!this.user.origin) {
      origin = null;
    } else {
      if (this.user.origin._id) {
        origin = this.user.origin._id;
      } else {
        origin = this.user.origin;
      }
    }

    let branch;
    if (!this.user.branch) {
      branch = null;
    } else {
      if (this.user.branch._id) {
        branch = this.user.branch._id;
      } else {
        branch = this.user.branch;
      }
    }

    let permission;
    if (!this.user.permission) {
      permission = null;
    } else {
      if (this.user.permission._id) {
        permission = this.user.permission._id;
      } else {
        permission = this.user.permission;
      }
    }

    const values = {
      _id: this.user._id,
      name: this.user.name,
      email: this.user.email,
      password: this.user.password,
      state: this.user.state,
      employee: employee,
      company: this.user.company,
      origin: origin,
      cashBoxType: this.user.cashBoxType,
      branch: branch,
      permission: permission,
      level: this.user.level,
      tokenExpiration: this.user.tokenExpiration,
    };

    if (this.user.printers && this.user.printers.length > 0) {
      let printers = <UntypedFormArray>this.userForm.controls.printers;
      this.user.printers.forEach((x) => {
        let printerId;
        if (x.printer && x.printer._id) {
          printerId = x.printer._id;
        }

        printers.push(
          this._fb.group({
            _id: null,
            printer: printerId,
          })
        );
      });
    }
    this.userForm.patchValue(values);
  }

  public getPrinter(id: string): Promise<Printer> {
    return new Promise<Printer>((resolve, reject) => {
      this._printerService.getPrinter(id).subscribe((result) => {
        if (result && result.printer) {
          resolve(result.printer);
        } else {
          resolve(null);
        }
      });
    });
  }

  public addPermission(permissionForm: NgForm): void {
    let valid = true;
    const permission = this.userForm.controls.permission as UntypedFormArray;

    if (valid) {
      let field = {
        _id: null,
        type: permissionForm.value.table,
      };

      permission.push(this._fb.group(field));
    }
  }

  async addPrinter(printerForm: NgForm) {
    let valid = true;
    const printers = this.userForm.controls.printers as UntypedFormArray;

    let printer = await this.getPrinter(printerForm.value.printer);

    for (const element of this.userForm.controls.printers.value) {
      let printerAux = await this.getPrinter(element.printer);

      if (printerAux.printIn === printer.printIn) {
        valid = false;
        this.showMessage('Solo puede tener una impresora de cada tipo.', 'info', true);
      }
    }

    this.userForm.controls.printers.value.forEach((element) => {
      if (printerForm.value.printer == element.printer) {
        this.showMessage('Esta impresora ya existe', 'danger', true);
        valid = false;
      }
    });

    if (printerForm.value.printer == '' || printerForm.value.printer == null) {
      this.showMessage('Debe seleccionar una impresora', 'danger', true);
      valid = false;
    }

    if (valid) {
      printers.push(
        this._fb.group({
          _id: null,
          printer: printerForm.value.printer || null,
        })
      );
      printerForm.resetForm();
    }
  }

  deletePrinter(index) {
    let control = <UntypedFormArray>this.userForm.controls.printers;
    control.removeAt(index);
  }

  public getEmployees(): void {
    this.loading = true;

    this._employeeService.getEmployees().subscribe(
      (result) => {
        if (!result.employees) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
          this.employees = null;
        } else {
          this.hideMessage();
          this.employees = result.employees;
        }
        this.loading = false;
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  private getCompanies(query): Promise<Company[]> {
    return new Promise((resolve, reject) => {
      this._companyService.getCompanies(query).subscribe(
        (result) => {
          if (!result.companies) {
            resolve(null);
          } else {
            resolve(result.companies);
          }
        },
        (error) => {
          resolve(null);
        }
      );
    });
  }

  public getOrigins(): void {
    this.loading = true;

    this._originService
      .getOrigins(
        { number: 1, 'branch.name': 1, operationType: 1 }, // PROJECT
        { operationType: { $ne: 'D' } },
        { numnber: 1 },
        {}, // GROUP
        0,
        0 // SKIP
      )
      .subscribe(
        (result) => {
          this.loading = false;
          if (result && result.origins) {
            this.origins = result.origins;
          } else {
            this.origins = new Array();
          }
        },
        (error) => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
  }

  public getPrinters(): void {
    this.loading = true;

    this._printerService.getPrinters().subscribe(
      (result) => {
        if (!result.printers) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
          this.AuxPrinters = new Array();
        } else {
          this.hideMessage();
          this.loading = false;
          this.AuxPrinters = result.printers;
        }
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getBranches(): void {
    this.loading = true;

    this._branchService
      .getBranches(
        { name: 1, operationType: 1 }, // PROJECT
        { operationType: { $ne: 'D' } },
        { name: 1 },
        {}, // GROUP
        0,
        0 // SKIP
      )
      .subscribe(
        (result) => {
          if (result && result.branches) {
            this.branches = result.branches;
          } else {
            this.branches = new Array();
          }
          this.loading = false;
        },
        (error) => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
  }

  public getPermissions(): void {
    this.loading = true;

    this._permissionService
      .getAll({
        project: { name: 1, operationType: 1 },
        match: { operationType: { $ne: 'D' } },
        sort: { name: 1 },
      })
      .subscribe(
        (result) => {
          if (result.status === 200) {
            this.permissions = result.result;
            this.setValuesForm();
          } else {
            this.permissions = new Array();
          }
          this.loading = false;
        },
        (error) => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
  }

  public addUser(): void {
    this.loading = true;
    let shortcuts = this.user.shortcuts;
    this.user = this.userForm.value;
    this.user.shortcuts = shortcuts;
    if (this.user.cashBoxType && this.user.cashBoxType.toString() === '') this.user.cashBoxType = null;
    if (this.operation === 'add') {
      this.saveUser();
    } else if (this.operation === 'update') {
      this.updateUser();
    }
  }

  public saveUser(): void {
    this.loading = true;

    this._userService.saveUser(this.user).subscribe(
      (result) => {
        if (!result.user) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.user = result.user;
          this.showMessage('El usuario se ha añadido con éxito.', 'success', false);
          this.user = new User();
          this.buildForm();
        }
        this.loading = false;
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public updateUser(): void {
    this._userService.updateUser(this.user).subscribe(
      (result) => {
        if (!result.user) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.user = result.user;
          this.showMessage('El usuario se ha actualizado con éxito.', 'success', false);
          if (this.identity._id === this.user._id) {
            let userStorage = new User();
            userStorage._id = result.user._id;
            userStorage.name = result.user.name;
            userStorage.email = result.user.email;
            if (result.user.employee) {
              userStorage.employee._id = result.user.employee._id;
              userStorage.employee.name = result.user.employee.name;
              // userStorage.employee.type = new EmployeeType();
              userStorage.employee.type._id = result.user.employee.type._id;
              userStorage.employee.type.description = result.user.employee.type.description;
            }
            sessionStorage.setItem('user', JSON.stringify(userStorage));
          }
        }
        this.loading = false;
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }
}
