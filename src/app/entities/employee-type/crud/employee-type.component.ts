import { Component, EventEmitter, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';

import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ApiResponse, EmployeeType } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TranslateMePipe } from 'app/shared/pipes/translate-me';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EmployeeTypeService } from '../../../core/services/employee-type.service';

@Component({
  selector: 'app-employee-type',
  templateUrl: './employee-type.component.html',
  providers: [TranslateMePipe, TranslatePipe],
})
export class EmployeeTypeComponent implements OnInit {
  public readonly: boolean;
  public operation: string;
  public employeeType: EmployeeType;
  public employeeTypeForm: UntypedFormGroup;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public focus$: Subject<string>[] = new Array();
  private destroy$ = new Subject<void>();

  constructor(
    private _employeeTypeService: EmployeeTypeService,
    private _toastService: ToastService,
    public _fb: UntypedFormBuilder,
    public _router: Router
  ) {
    this.employeeTypeForm = this._fb.group({
      _id: ['', []],
      description: ['', [Validators.required]],
    });
  }

  public async ngOnInit() {
    const pathUrl = this._router.url.split('/');
    const employeeTypeId = pathUrl[4];
    this.operation = pathUrl[3];

    if (pathUrl[3] === 'view' || pathUrl[3] === 'delete') this.readonly = true;
    if (employeeTypeId) {
      this.getEmployeeTypes(employeeTypeId);
    }
  }

  public ngAfterViewInit(): void {
    this.focusEvent.emit(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public setValueForm() {
    this.employeeTypeForm.setValue({
      _id: this.employeeType._id ?? '',
      description: this.employeeType.description ?? '',
    });
  }

  public getEmployeeTypes(employeeTypeId: string) {
    this.loading = true;
    this._employeeTypeService
      .getById(employeeTypeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (result: ApiResponse) => {
          if (!result.result) {
            this._toastService.showToast(result);
          } else {
            this.employeeType = result.result;
            this.setValueForm();
          }
        },
        (error) => this._toastService.showToast(error),
        () => (this.loading = false)
      );
  }
  returnTo() {
    return this._router.navigate(['/entities/employee-types']);
  }

  public addEmployeeType(): void {
    this.loading = true;
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

  public saveEmployeeType(): void {
    this.loading = true;

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

  public updateEmployeeType(): void {
    this.loading = true;

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

  public deleteEmployeeType(): void {
    this.loading = true;

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
}
