import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import {
  UntypedFormBuilder,
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
  providers: [TranslateMePipe],
})
export class EmployeeComponent implements OnInit {
  public operation: string;
  public readonly: boolean;
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

  constructor(
    private _employeeService: EmployeeService,
    private _employeeTypeService: EmployeeTypeService,
    private _fb: UntypedFormBuilder,
    private _router: Router,
    private _toastService: ToastService
  ) {
    this.getAllEmployeeTypes();
  }

  ngOnInit(): void {
    const pathUrl = this._router.url.split('/');
    const employeeId = pathUrl[4];
    this.operation = pathUrl[3];
    this.buildForm();

    if (pathUrl[3] === 'view' || pathUrl[3] === 'delete') this.readonly = true;
    if (employeeId) {
      this.getEmployee(employeeId);
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
      type: ['', [Validators.required]],
    });
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

  public getEmployee(employeeId: string) {
    this.loading = true;
    this._employeeService
      .getById(employeeId)
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
