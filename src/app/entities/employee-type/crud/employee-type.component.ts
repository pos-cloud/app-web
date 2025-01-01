import { Component, EventEmitter, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';

import { Router } from '@angular/router';
import { ApiResponse, EmployeeType } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EmployeeTypeService } from '../../../core/services/employee-type.service';

@Component({
  selector: 'app-employee-type',
  templateUrl: './employee-type.component.html',
})
export class EmployeeTypeComponent implements OnInit {
  public readonly: boolean;
  public operation: string;
  public employeeType: EmployeeType;
  public employeeTypeForm: UntypedFormGroup;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  private destroy$ = new Subject<void>();

  constructor(
    private _employeeTypeService: EmployeeTypeService,
    private _toastService: ToastService,
    private _fb: UntypedFormBuilder,
    private _router: Router
  ) {
    this.employeeTypeForm = this._fb.group({
      _id: ['', []],
      description: ['', [Validators.required]],
    });
  }

  async ngOnInit() {
    const pathUrl = this._router.url.split('/');
    const employeeTypeId = pathUrl[4];
    this.operation = pathUrl[3];

    if (pathUrl[3] === 'view' || pathUrl[3] === 'delete') this.readonly = true;
    if (employeeTypeId) this.getEmployeeType(employeeTypeId);
  }

  ngAfterViewInit(): void {
    this.focusEvent.emit(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  returnTo() {
    return this._router.navigate(['/entities/employee-types']);
  }

  handleEmployeeTypeOperation(): void {
    this.loading = true;
    this.employeeTypeForm.markAllAsTouched();
    if (this.employeeTypeForm.invalid) {
      this.loading = false;
      return;
    }

    this.employeeType = this.employeeTypeForm.value;

    switch (this.operation) {
      case 'add':
        this.saveEmployeeType();
        break;
      case 'update':
        this.updateEmployeeType();
        break;
      case 'delete':
        this.deleteEmployeeType();
      default:
        break;
    }
  }

  private saveEmployeeType(): void {
    this._employeeTypeService
      .save(this.employeeType)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  private updateEmployeeType(): void {
    this._employeeTypeService
      .update(this.employeeType)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  private deleteEmployeeType(): void {
    this._employeeTypeService
      .delete(this.employeeType._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  private setValueForm() {
    this.employeeTypeForm.setValue({
      _id: this.employeeType._id ?? '',
      description: this.employeeType.description ?? '',
    });
  }

  private getEmployeeType(id: string) {
    this.loading = true;
    this._employeeTypeService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          if (!result.result) {
            this._toastService.showToast(result);
          } else {
            this.employeeType = result.result;
            this.setValueForm();
          }
        },
        error: (error) => this._toastService.showToast(error),
        complete: () => (this.loading = false),
      });
  }
}
