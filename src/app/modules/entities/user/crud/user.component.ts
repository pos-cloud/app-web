import { Component, EventEmitter, OnInit } from '@angular/core';
import {
  FormsModule,
  FormControl,
  NgForm,
  ReactiveFormsModule,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { BranchService } from '@core/services/branch.service';
import { CashBoxTypeService } from '@core/services/cash-box-type.service';
import { CompanyService } from '@core/services/company.service';
import { EmployeeService } from '@core/services/employee.service';
import { MakeService } from '@core/services/make.service';
import { OriginService } from '@core/services/origin.service';
import { PermissionService } from '@core/services/permission.service';
import { PrinterService } from '@core/services/printer.service';
import { UserService } from '@core/services/user.service';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressbarModule } from '@shared/components/progressbar/progressbar.module';
import { Branch, CashBoxType, Company, Employee, Make, Origin, Permission, Printer, User } from '@types';
import { UserState } from 'app/components/user/user';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TypeaheadDropdownComponent } from 'app/shared/components/typehead-dropdown/typeahead-dropdown.component';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { combineLatest } from 'rxjs';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FocusDirective,
    PipesModule,
    TranslateModule,
    TypeaheadDropdownComponent,
    ProgressbarModule,
    FormsModule,
  ],
})
export class UserComponent implements OnInit {
  public operation: string;
  public user: User;
  public userForm: UntypedFormGroup;
  public loading: boolean = false;
  public employees: Employee[];
  public cashBoxTypes: CashBoxType[];
  public companies: Company[];
  public origins: Origin[];
  public branches: Branch[];
  public permissions: Permission[];
  public printers: Printer[];
  public makes: Make[] = [];
  public focusEvent = new EventEmitter<boolean>();
  private destroy$ = new Subject<void>();
  public states: UserState[] = [UserState.Enabled, UserState.Disabled];

  public dominio: string;
  public shortcut = { name: '', url: '' };
  public shortcuts: { name: string; url: string }[] = [];

  constructor(
    private _userService: UserService,
    private _fb: UntypedFormBuilder,
    private _employeeService: EmployeeService,
    private _router: Router,
    private _toastService: ToastService,
    private _cashBoxTypeService: CashBoxTypeService,
    private _companyService: CompanyService,
    private _originService: OriginService,
    private _branchService: BranchService,
    private _permissionService: PermissionService,
    private _printerService: PrinterService,
    private _makeService: MakeService
  ) {
    this.userForm = this._fb.group({
      _id: ['', []],
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      state: [UserState.Enabled, [Validators.required]],

      origin: [null, []],
      employee: [null, [Validators.required]],
      company: [null, []],
      printers: this._fb.array([]),
      shortcuts: this._fb.array([]),
      cashBoxType: [null, []],
      branch: [null, []],
      permission: [null, []],
      level: [99, []],
      tokenExpiration: [9999, []],
      makes: [[] as string[]],
    });
  }

  async ngOnInit() {
    const pathUrl = this._router.url.split('/');
    const userId = pathUrl[4];
    this.operation = pathUrl[3];
    this.dominio = window.location.origin + '/';
    if (this.operation === 'view' || this.operation === 'delete') this.userForm.disable();

    this.loading = true;
    combineLatest({
      employees: this._employeeService.find({ query: { operationType: { $ne: 'D' } } }),
      cashBoxTypes: this._cashBoxTypeService.find({ query: { operationType: { $ne: 'D' } } }),
      companies: this._companyService.find({ query: { operationType: { $ne: 'D' } } }),
      origins: this._originService.find({ query: { operationType: { $ne: 'D' } } }),
      branches: this._branchService.find({ query: { operationType: { $ne: 'D' } } }),
      permissions: this._permissionService.find({ query: { operationType: { $ne: 'D' } } }),
      printers: this._printerService.find({ query: { operationType: { $ne: 'D' } } }),
      makes: this._makeService.find({
        query: { operationType: { $ne: 'D' } },
        project: { _id: 1, description: 1 },
      }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ employees, cashBoxTypes, companies, origins, branches, permissions, printers, makes }) => {
          this.employees = employees ?? [];
          this.cashBoxTypes = cashBoxTypes ?? [];
          this.origins =
            origins.map((origin) => ({
              number: String(origin.number),
              _id: origin._id,
            })) ?? [];
          this.branches = branches ?? [];
          this.permissions = permissions ?? [];
          this.companies = companies ?? [];
          this.printers = printers ?? [];
          this.makes = (makes ?? []).sort((a, b) => (a?.description ?? '').localeCompare(b?.description ?? ''));
          this.makes.forEach((make) => {
            if (make?._id && !this.userForm.contains(make._id)) {
              this.userForm.addControl(make._id, new FormControl(false));
            }
          });

          if (userId) {
            if (userId) this.getUser(userId);
          } else {
            this.setValueForm();
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.focusEvent.complete();
  }
  returnTo() {
    return this._router.navigate(['/entities/users']);
  }

  public getUser(userId: string) {
    this.loading = true;

    this._userService
      .getById(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.user = result.result;
          this.shortcuts = this.user.shortcuts;
          this.setValueForm();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public setValueForm() {
    const employee = this.employees.find((item) => item._id == this.user?.employee?.toString());
    const cashBoxType = this.cashBoxTypes.find((item) => item._id == this.user?.cashBoxType?.toString());
    const company = this.companies.find((item) => item._id == this.user?.company?.toString());
    const origin = this.origins.find((item) => item._id == this.user?.origin?.toString());
    const branch = this.branches.find((item) => item._id == this.user?.branch?.toString());
    const permission = this.permissions.find((item) => item._id == this.user?.permission?.toString());
    const selectedMakes = ((this.user as any)?.makes ?? []).map((m: any) => (typeof m === 'string' ? m : m?._id)).filter(Boolean);

    const values = {
      _id: this.user?._id ?? '',
      name: this.user?.name ?? '',
      email: this.user?.email ?? '',
      password: this.user?.password ?? '',
      state: this.user?.state ?? UserState.Enabled,
      tokenExpiration: this.user?.tokenExpiration ?? 9999,
      employee: employee ?? null,
      cashBoxType: cashBoxType ?? null,
      company: company ?? null,
      origin: origin ?? null,
      branch: branch ?? null,
      permission: permission ?? null,
      level: this.user?.level ?? 99,
      makes: selectedMakes,
    };

    if (this.user?.shortcuts && this.user?.shortcuts?.length > 0) {
      let shortcuts = <UntypedFormArray>this.userForm.controls.shortcuts;
      this.user.shortcuts.forEach((x) => {
        shortcuts.push(
          this._fb.group({
            _id: null,
            name: x.name,
            url: x.url,
          })
        );
      });
    }

    if (this.user?.printers && this.user?.printers?.length > 0) {
      let printers = <UntypedFormArray>this.userForm.controls.printers;
      this.user.printers.forEach((x) => {
        printers.push(
          this._fb.group({
            _id: null,
            printer: x?.printer,
          })
        );
      });
    }

    this.userForm.patchValue(values);

    if (this.makes && this.makes.length > 0) {
      this.makes.forEach((make) => {
        if (make?._id && this.userForm.contains(make._id)) {
          this.userForm.get(make._id)?.setValue(selectedMakes.includes(make._id));
        }
      });
    }
  }

  onEnter(event: KeyboardEvent) {
    const el = event.target as HTMLElement | null;
    if (el?.closest?.('.tox-tinymce')) {
      event.preventDefault();
      return;
    }

    if (this.userForm.valid && this.operation !== 'view' && this.operation !== 'delete') {
      this.addUser();
    }
  }
  public addUser(): void {
    this.loading = true;
    this.userForm.markAllAsTouched();
    if (this.userForm.invalid) {
      this.loading = false;
      return;
    }
    this.user = this.buildUserPayload();

    switch (this.operation) {
      case 'add':
        this.saveUser();
        break;
      case 'update':
        this.updateUser();
        break;
      case 'delete':
        this.deleteUser();
      default:
        break;
    }
  }

  public updateUser() {
    this.loading = true;

    this._userService
      .update(this.user)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this._toastService.showToast(result);
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
          this.returnTo();
        },
      });
  }

  public saveUser(): void {
    this.loading = true;
    this._userService
      .save(this.user)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this._toastService.showToast(result);
          this.user = result.result;
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
          this.returnTo();
        },
      });
  }

  public deleteUser() {
    this.loading = true;

    this._userService.delete(this.user._id).subscribe({
      next: (result) => {
        this._toastService.showToast(result);
      },
      error: (error) => {
        this._toastService.showToast(error);
      },
      complete: () => {
        this.loading = false;
        this.returnTo();
      },
    });
  }

  public addShortcut() {
    if (
      this.shortcut &&
      this.shortcut.name &&
      this.shortcut.name !== '' &&
      this.shortcut.url &&
      this.shortcut.url !== ''
    ) {
      if (!this.existsShortcut()) {
        this.shortcuts.push(this.shortcut);
        const shortcutsFormArray = this.userForm.get('shortcuts') as UntypedFormArray;
        shortcutsFormArray.push(
          this._fb.group({
            name: this.shortcut.name,
            url: this.shortcut.url,
          })
        );
      } else {
        this._toastService.showToast({ message: 'El acceso directo ya existe.' });
      }
    } else {
      this._toastService.showToast({ message: 'Debe completar todos los campos.' });
    }
  }

  public existsShortcut(): boolean {
    let exists: boolean = false;

    if (this.shortcuts && this.shortcuts.length > 0) {
      for (let i = 0; i < this.shortcuts.length; i++) {
        if (this.shortcuts[i].name === this.shortcut.name || this.shortcuts[i].url === this.shortcut.url) {
          exists = true;
        }
      }
    }

    return exists;
  }

  public deleteShortcut(shortcut: { name: string; url: string }) {
    if (!this.shortcuts || this.shortcuts.length === 0) return;

    // Buscamos el índice en el array para mostrar
    const index = this.shortcuts.findIndex((x) => x.name === shortcut.name && x.url === shortcut.url);

    if (index >= 0) {
      // Eliminamos del array que se muestra
      this.shortcuts.splice(index, 1);

      // Eliminamos del FormArray
      const shortcutsFormArray = this.userForm.get('shortcuts') as UntypedFormArray;
      if (shortcutsFormArray && shortcutsFormArray.length > index) {
        shortcutsFormArray.removeAt(index);
      }
    }
  }
  async addPrinter(printerForm: NgForm) {
    let valid = true;

    const printers = this.userForm.controls.printers as UntypedFormArray;

    let printer = this.printers.find((item) => item._id == printerForm?.value?.printer);

    if (printerForm.value.printer == '' || printerForm.value.printer == null) {
      this._toastService.showToast({ message: 'Debe seleccionar una impresora.' });
      valid = false;
    }
    for (const element of this.userForm.controls.printers.value) {
      let printerAux = this.printers.find((item) => item._id == element?.printer?.toString());

      if (printerAux.printIn === printer.printIn && valid) {
        valid = false;
        this._toastService.showToast({ message: 'Solo puede tener una impresora de cada tipo.' });
      }
    }

    this.userForm.controls.printers.value.forEach((element) => {
      if (printerForm.value.printer == element.printer && valid) {
        this._toastService.showToast({ message: 'Esta impresora ya existe.' });
        valid = false;
      }
    });

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

  onMakeChange(event: any, makeId: string) {
    const current = (this.userForm.get('makes')?.value ?? []) as string[];
    if (event?.target?.checked) {
      this.userForm.get('makes')?.setValue([...new Set([...current, makeId])]);
    } else {
      this.userForm.get('makes')?.setValue(current.filter((id) => id !== makeId));
    }
  }

  private buildUserPayload(): User {
    const v = this.userForm.value ?? {};
    return {
      _id: v._id,
      name: v.name,
      phone: v.phone,
      email: v.email,
      password: v.password,
      state: v.state,
      token: v.token,
      tokenExpiration: v.tokenExpiration,
      employee: v.employee,
      cashBoxType: v.cashBoxType,
      company: v.company,
      origin: v.origin,
      branch: v.branch,
      shortcuts: v.shortcuts,
      permission: v.permission,
      printers: v.printers,
      level: v.level,
      ...(v.makes ? { makes: v.makes } : {}),
    } as any;
  }
}
