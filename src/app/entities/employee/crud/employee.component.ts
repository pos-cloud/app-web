import { Component, EventEmitter, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ApiResponse, Employee, EmployeeType } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TranslateMePipe } from 'app/shared/pipes/translate-me';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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

  constructor(
    private _employeeService: EmployeeService,
    private _employeeTypeService: EmployeeTypeService,
    private _fb: UntypedFormBuilder,
    private _router: Router,
    private _toastService: ToastService
  ) {
    this.employeeForm = this._fb.group({
      _id: ['', []],
      name: ['', [Validators.required]],
      phone: ['', []],
      address: ['', []],
      type: ['', [Validators.required]],
    });
  }

  async ngOnInit() {
    await this.getAllEmployeeTypes();
    const pathUrl = this._router.url.split('/');
    const employeeId = pathUrl[4];
    this.operation = pathUrl[3];

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

  public setValueForm() {
    const type = this.employeeTypes?.find(
      (item) => item._id == this.employee.type.toString()
    );

    this.employeeForm.setValue({
      _id: this.employee._id ?? '',
      name: this.employee.name ?? '',
      phone: this.employee.phone ?? '',
      address: this.employee.address ?? '',
      type: type ?? null,
    });
  }

  returnTo() {
    return this._router.navigate(['/entities/employees']);
  }

  public getAllEmployeeTypes(): Promise<void> {
    const match = {
      operationType: { $ne: 'D' },
    };

    this.loading = true;

    return new Promise((resolve, reject) => {
      this._employeeTypeService
        .getAll({
          match,
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (result: ApiResponse) => {
            if (!result.result) {
              this._toastService.showToast(result);
              reject();
            } else {
              this.employeeTypes = result.result;
              resolve();
            }
          },
          (error) => {
            this._toastService.showToast(error);
            reject(error);
          },
          () => {
            this.loading = false;
          }
        );
    });
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
    this.employeeForm.markAllAsTouched();
    if (this.employeeForm.invalid) {
      this._toastService.showToast({
        message: 'Por favor complete todos los campos obligatorios.',
      });
      this.loading = false;
      return;
    }

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
