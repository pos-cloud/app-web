import { Component, EventEmitter, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiResponse, Classification } from '@types';

import { CommonModule } from '@angular/common';
import { ClassificationService } from '@core/services/classification.service';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-classification',
  templateUrl: './classification.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FocusDirective, PipesModule, TranslateModule],
})
export class ClassificationComponent implements OnInit {
  public operation: string;
  public readonly: boolean;
  public classification: Classification;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public classificationForm: UntypedFormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    public _classificationService: ClassificationService,
    public _router: Router,
    public _fb: UntypedFormBuilder,
    private _toastService: ToastService
  ) {
    this.classificationForm = this._fb.group({
      _id: ['', []],
      name: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');

    const classification = pathUrl[4];
    this.operation = pathUrl[3];

    if (pathUrl[3] === 'view' || pathUrl[3] === 'delete') this.classificationForm.disable();
    if (classification) this.getClassification(classification);
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
      _id: this.classification?._id ?? '',
      name: this.classification?.name ?? '',
    };
    this.classificationForm.setValue(values);
  }

  returnTo() {
    return this._router.navigate(['/entities/classification']);
  }

  onEnter() {
    if (this.classificationForm.valid && this.operation !== 'view' && this.operation !== 'delete') {
      this.handleClassificationOperation();
    }
  }

  public getClassification(id: string) {
    this.loading = true;

    this._classificationService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.classification = result.result;
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

  public handleClassificationOperation() {
    this.loading = true;
    this.classificationForm.markAllAsTouched();
    if (this.classificationForm.invalid) {
      this.loading = false;
      return;
    }

    this.classification = this.classificationForm.value;

    switch (this.operation) {
      case 'add':
        this.saveClassification();
        break;
      case 'update':
        this.updateClassification();
        break;
      case 'delete':
        this.deleteClassification();
      default:
        break;
    }
  }

  public updateClassification() {
    this._classificationService
      .update(this.classification)
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

  public saveClassification() {
    this._classificationService
      .save(this.classification)
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

  public deleteClassification() {
    this._classificationService
      .delete(this.classification._id)
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
