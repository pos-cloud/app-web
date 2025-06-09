import { Component, EventEmitter, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiResponse, CompanyGroup } from '@types';

import { CommonModule } from '@angular/common';
import { CompanyGroupService } from '@core/services/company-group.service';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-company-group',
  templateUrl: './company-group.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FocusDirective, PipesModule, TranslateModule],
})
export class CompanyGroupComponent implements OnInit {
  public operation: string;
  public readonly: boolean;
  public companyGroup: CompanyGroup;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public companyGroupForm: UntypedFormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    public _companyGroupService: CompanyGroupService,
    public _router: Router,
    public _fb: UntypedFormBuilder,
    private _toastService: ToastService
  ) {
    this.companyGroupForm = this._fb.group({
      _id: ['', []],
      description: ['', [Validators.required]],
      discount: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');

    const companyGroup = pathUrl[4];
    this.operation = pathUrl[3];

    if (pathUrl[3] === 'view' || pathUrl[3] === 'delete') this.companyGroupForm.disable();
    if (companyGroup) this.getCompanyGroup(companyGroup);
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.focusEvent.complete();
  }

  public setValueForm(): void {
    const values = {
      _id: this.companyGroup?._id ?? '',
      description: this.companyGroup?.description ?? '',
      discount: this.companyGroup?.discount ?? 0,
    };
    this.companyGroupForm.setValue(values);
  }

  returnTo() {
    return this._router.navigate(['/entities/company-group']);
  }

  onEnter() {
    if (this.companyGroupForm.valid && this.operation !== 'view' && this.operation !== 'delete') {
      this.handleCompanyGroupOperation();
    }
  }

  public getCompanyGroup(id: string) {
    this.loading = true;

    this._companyGroupService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.companyGroup = result.result;
          if (result.status == 200) this.setValueForm();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public handleCompanyGroupOperation() {
    this.loading = true;
    this.companyGroupForm.markAllAsTouched();
    if (this.companyGroupForm.invalid) {
      this.loading = false;
      return;
    }

    this.companyGroup = this.companyGroupForm.value;

    switch (this.operation) {
      case 'add':
        this.saveCompanyGroup();
        break;
      case 'update':
        this.updateCompanyGroup();
        break;
      case 'delete':
        this.deleteCompanyGroup();
      default:
        break;
    }
  }

  public updateCompanyGroup() {
    this._companyGroupService
      .update(this.companyGroup)
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

  public saveCompanyGroup() {
    this._companyGroupService
      .save(this.companyGroup)
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

  public deleteCompanyGroup() {
    this._companyGroupService
      .delete(this.companyGroup._id)
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
