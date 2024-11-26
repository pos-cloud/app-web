import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { ApiResponse, Employee, EmployeeType } from '@types';
import { TranslateMePipe } from 'app/core/pipes/translate-me';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { merge, Observable, OperatorFunction, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  takeUntil,
} from 'rxjs/operators';
import { EmployeeTypeService } from '../../../core/services/employee-type.service';
import { EmployeeService } from '../../../core/services/employee.service';

@Component({
  selector: 'app-add-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css'],
  providers: [TranslateMePipe],
})
export class EmployeeComponent implements OnInit {
  public operation: string;
  public readonly: boolean;
  public employeeId: string;

  public employee: Employee;
  public employeeTypes: EmployeeType[];
  public employeeForm: UntypedFormGroup;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  private destroy$ = new Subject<void>();
  @ViewChild('instance', { static: true }) instance: NgbTypeahead;

  employeeTypeFocus$ = new Subject<string>();
  employeeTypeClick$ = new Subject<string>();

  searchEmployeeType: OperatorFunction<string, readonly any[]> = (
    text$: Observable<string>
  ) => {
    const debouncedText$ = text$.pipe(
      debounceTime(200),
      distinctUntilChanged()
    );
    const clicksWithClosedPopup$ = this.employeeTypeClick$.pipe(
      filter(() => !this.instance.isPopupOpen())
    );
    const inputFocus$ = this.employeeTypeFocus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map((term) =>
        (term === ''
          ? this.employeeTypes
          : this.employeeTypes.filter((v) =>
              v.description.toLowerCase().includes(term.toLowerCase())
            )
        ).slice()
      )
    );
  };

  formatResult = (x: any) => {
    let valueId = x._id === undefined ? x : x._id;
    const employeeType = this.employeeTypes?.find(
      (u: EmployeeType) => u._id === valueId
    );
    return employeeType?.description;
  };

  public formErrors = {
    code: '',
    name: '',
    type: '',
  };

  public validationMessages = {
    code: {
      required: 'Este campo es requerido.',
      pattern: 'No puede exceder los 5 dígitos.',
    },
    name: {
      required: 'Este campo es requerido.',
    },
    type: {
      required: 'Este campo es requerido.',
      validateAutocomplete: 'Debe ingresar un valor válido',
    },
  };

  constructor(
    public _employeeService: EmployeeService,
    public _employeeTypeService: EmployeeTypeService,
    public _fb: UntypedFormBuilder,
    public _router: Router,
    private _toastService: ToastService
  ) {
    this.getAllEmployeeTypes();
  }

  ngOnInit(): void {
    let pathUrl = this._router.url.split('/');
    this.operation = pathUrl[3];
    this.employeeId = pathUrl[4];
    this.buildForm();

    if (pathUrl[3] === 'view' || pathUrl[3] === 'delete') this.readonly = true;
    if (this.employeeId) {
      this.getEmployee();
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public buildForm(): void {
    this.employeeForm = this._fb.group({
      _id: ['', []],
      name: ['', [Validators.required]],
      phone: ['', []],
      address: ['', []],
      type: ['', []],
    });
  }

  public onValueChanged(data?: any): void {
    if (!this.employeeForm) {
      return;
    }
    const form = this.employeeForm;

    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);

      if (control && control.dirty && !control.valid) {
        const npm = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += npm[key] + ' ';
        }
      }
    }
  }

  public setValueForm() {
    this.employeeForm.setValue({
      _id: this.employee._id ?? '',
      name: this.employee.name ?? '',
      phone: this.employee.phone ?? '',
      address: this.employee.address ?? '',
      type: this.employee.type ?? null,
    });
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

  returnTo() {
    return this._router.navigate(['/entities/employees']);
  }

  public getAllEmployeeTypes() {
    let match = {
      operationType: { $ne: 'D' },
    };
    this._employeeTypeService
      .getAll({
        match,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (result: ApiResponse) => {
          if (!result.result) {
            this._toastService.showToast(result);
          } else {
            this.employeeTypes = result.result;
          }
        },
        (error) => this._toastService.showToast(error),
        () => (this.loading = false)
      );
  }

  public getEmployee() {
    this.loading = true;
    this._employeeService
      .getById(this.employeeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (result: ApiResponse) => {
          if (!result.result) {
            this._toastService.showToast(result);
          } else {
            this.employee = result.result;
            this.setValueForm();
          }
        },
        (error) => this._toastService.showToast(error),
        () => (this.loading = false)
      );
  }

  public addEmployee(): void {
    this.loading = true;
    this.employee = this.employeeForm.value;

    switch (this.operation) {
      case 'add':
        this.saveEmployee();
        break;
      case 'update':
        this.updateEmployee();
        break;
      case 'delete':
        this.deleteEmployee();
      default:
        break;
    }
  }

  public saveEmployee(): void {
    this.loading = true;

    this._employeeService
      .save(this.employee)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) return this.returnTo();
        },
        (error) => this._toastService.showToast(error),
        () => (this.loading = false)
      );
  }

  public updateEmployee(): void {
    this.loading = true;

    this._employeeService
      .update(this.employee)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) return this.returnTo();
        },
        (error) => this._toastService.showToast(error),
        () => (this.loading = false)
      );
  }

  public deleteEmployee(): void {
    this.loading = true;

    this._employeeService
      .delete(this.employee._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) return this.returnTo();
        },
        (error) => this._toastService.showToast(error),
        () => (this.loading = false)
      );
  }
}
