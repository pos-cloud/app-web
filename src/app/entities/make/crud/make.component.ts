import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { ApiResponse, Make } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MakeService } from '../../../core/services/make.service';

@Component({
  selector: 'app-make',
  templateUrl: './make.component.html',
})
export class MakeComponent implements OnInit, OnDestroy {
  public operation: string;
  public readonly: boolean;
  public makeForm: UntypedFormGroup;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  private makeId: string;
  public make: Make;
  private destroy$ = new Subject<void>();

  constructor(
    private _makeService: MakeService,
    private _fb: UntypedFormBuilder,
    private _router: Router,
    private _toastService: ToastService
  ) {
    this.makeForm = this._fb.group({
      _id: ['', []],
      description: ['', [Validators.required]],
      visibleSale: [true, []],
    });
  }

  ngOnInit() {
    let pathUrl = this._router.url.split('/');
    this.operation = pathUrl[3];
    this.makeId = pathUrl[4];

    if (pathUrl[3] === 'view' || pathUrl[3] === 'delete') this.readonly = true;
    if (this.makeId) {
      this.getMake();
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getMake(): void {
    this._makeService
      .getById(this.makeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.make = result.result;
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.setValueForm();
          this.loading = false;
        },
      });
  }

  setValueForm(): void {
    this.makeForm.patchValue({
      _id: this.make._id ?? '',
      description: this.make.description ?? null,
      visibleSale: this.make.visibleSale ?? true,
    });
  }

  returnTo() {
    return this._router.navigate(['/entities/makes']);
  }

  addMake(): void {
    this.loading = true;
    this.make = this.makeForm.value;
    if (this.makeForm.valid) {
      switch (this.operation) {
        case 'add':
          this.saveMake();
          break;
        case 'update':
          this.updateMake();
          break;
        case 'delete':
          this.deleteMake();
        default:
          break;
      }
    } else {
      this._toastService.showToast({
        message: 'Por favor, revisa los campos en rojo para continuar.',
      });
      this.loading = false;
    }
  }

  saveMake(): void {
    this.loading = true;

    this._makeService
      .save(this.make)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
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

  updateMake(): void {
    this.loading = true;

    this._makeService
      .update(this.make)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
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

  deleteMake() {
    this.loading = true;
    this._makeService
      .delete(this.make._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
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
}
