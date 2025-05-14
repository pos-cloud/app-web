import { Component, EventEmitter, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiResponse, RelationType } from '@types';

import { CommonModule } from '@angular/common';
import { RelationTypeService } from '@core/services/relation-type.service';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-relation-type',
  templateUrl: './relation-type.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FocusDirective, PipesModule, TranslateModule],
})
export class RelationTypeComponent implements OnInit {
  public operation: string;
  public readonly: boolean;
  public relationType: RelationType;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public relationTypeForm: UntypedFormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    public _relationTypeService: RelationTypeService,
    public _router: Router,
    public _fb: UntypedFormBuilder,
    private _toastService: ToastService
  ) {
    this.relationTypeForm = this._fb.group({
      _id: ['', []],
      code: ['', [Validators.required]],
      description: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');

    const relationTypeId = pathUrl[4];
    this.operation = pathUrl[3];

    if (pathUrl[3] === 'view' || pathUrl[3] === 'delete') this.relationTypeForm.disable();
    if (relationTypeId) this.getRelationType(relationTypeId);
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
      _id: this.relationType?._id ?? '',
      code: this.relationType?.code ?? '',
      description: this.relationType?.description ?? '',
    };
    this.relationTypeForm.setValue(values);
  }

  returnTo() {
    return this._router.navigate(['/entities/relation-type']);
  }

  onEnter() {
    if (this.relationTypeForm.valid && this.operation !== 'view' && this.operation !== 'delete') {
      this.handleRelationTypeOperation();
    }
  }

  public getRelationType(id: string) {
    this.loading = true;

    this._relationTypeService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.relationType = result.result;
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

  public handleRelationTypeOperation() {
    this.loading = true;
    this.relationTypeForm.markAllAsTouched();
    if (this.relationTypeForm.invalid) {
      this.loading = false;
      return;
    }

    this.relationType = this.relationTypeForm.value;

    switch (this.operation) {
      case 'add':
        this.saveRelationType();
        break;
      case 'update':
        this.updateRelationType();
        break;
      case 'delete':
        this.deleteRelationType();
      default:
        break;
    }
  }

  public updateRelationType() {
    this._relationTypeService
      .update(this.relationType)
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

  public saveRelationType() {
    this._relationTypeService
      .save(this.relationType)
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

  public deleteRelationType() {
    this._relationTypeService
      .delete(this.relationType._id)
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
