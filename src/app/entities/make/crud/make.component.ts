import { Component, EventEmitter, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiResponse, Make } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';

import { UploadFileComponent } from 'app/shared/components/upload-file/upload-file.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MakeService } from '../../../core/services/make.service';

@Component({
  selector: 'app-make',
  templateUrl: './make.component.html',
})
export class MakeComponent implements OnInit, OnDestroy {
  @ViewChild(UploadFileComponent) uploadFileComponent: UploadFileComponent;

  public operation: string;
  public makeForm: UntypedFormGroup;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
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
      picture: ['', []],
      visibleSale: [true, []],
    });
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');
    this.operation = pathUrl[3];
    const makeId = pathUrl[4];

    if (this.operation === 'view' || this.operation === 'delete') this.makeForm.disable();
    if (makeId) {
      this.getMake(makeId);
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.focusEvent.complete();
  }

  getMake(id: string): void {
    this._makeService
      .getById(id)
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
      description: this.make.description ?? '',
      picture: this.make.picture ?? '',
      visibleSale: this.make.visibleSale ?? true,
    });
  }

  returnTo() {
    return this._router.navigate(['/entities/makes']);
  }

  async handleMakeOperation() {
    this.loading = true;

    this.makeForm.markAllAsTouched();
    if (this.makeForm.invalid) {
      this.loading = false;
      return;
    }
    await this.uploadFileComponent.uploadImages();

    this.make = this.makeForm.value;

    switch (this.operation) {
      case 'add':
        this.saveMake();
        break;
      case 'update':
        this.updateMake();
        break;
      case 'delete':
        this.deleteMake();
        break;
    }
  }

  saveMake(): void {
    this._makeService
      .save(this.make)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status === 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  updateMake(): void {
    this._makeService
      .update(this.make)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status === 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  deleteMake() {
    this._makeService
      .delete(this.make._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status === 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  onImagesUploaded(urls: string[]): void {
    if (urls && urls.length > 0) {
      this.makeForm.get('picture')?.setValue(urls[0]);
    }
  }
}
