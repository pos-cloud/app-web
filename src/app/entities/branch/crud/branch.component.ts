import { Component, EventEmitter, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiResponse, Branch } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';

import { UploadFileComponent } from 'app/shared/components/upload-file/upload-file.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BranchService } from '../../../core/services/branch.service';

@Component({
  selector: 'app-branch',
  templateUrl: './branch.component.html',
})
export class BranchComponent implements OnInit, OnDestroy {
  @ViewChild(UploadFileComponent) uploadFileComponent: UploadFileComponent;

  public operation: string;
  public branchForm: UntypedFormGroup;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public branch: Branch;
  private destroy$ = new Subject<void>();

  constructor(
    private _branchService: BranchService,
    private _fb: UntypedFormBuilder,
    private _router: Router,
    private _toastService: ToastService
  ) {
    this.branchForm = this._fb.group({
      _id: ['', []],
      number: [0, [Validators.required]],
      name: ['', [Validators.required]],
      default: [false, []],
      image: ['', []],
    });
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');
    this.operation = pathUrl[3];
    const branchId = pathUrl[4];

    if (this.operation === 'view' || this.operation === 'delete') this.branchForm.disable();
    if (branchId) {
      this.getBranch(branchId);
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

  getBranch(id: string): void {
    this._branchService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.branch = result.result;
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
    this.branchForm.patchValue({
      _id: this.branch._id ?? '',
      number: this.branch.number ?? 0,
      name: this.branch.name ?? '',
      default: this.branch.default ?? false,
      image: this.branch.image ?? '',
    });
  }

  returnTo() {
    return this._router.navigate(['/entities/branch']);
  }

  async handleBranchOperation() {
    this.loading = true;

    this.branchForm.markAllAsTouched();
    if (this.branchForm.invalid) {
      this.loading = false;
      return;
    }
    await this.uploadFileComponent.uploadImages();

    this.branch = this.branchForm.value;

    switch (this.operation) {
      case 'add':
        this.saveBranch();
        break;
      case 'update':
        this.updateBranch();
        break;
      case 'delete':
        this.deleteBranch();
        break;
    }
  }

  saveBranch(): void {
    this._branchService
      .save(this.branch)
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

  updateBranch(): void {
    this._branchService
      .update(this.branch)
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

  deleteBranch() {
    this._branchService
      .delete(this.branch._id)
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
      this.branchForm.get('image')?.setValue(urls[0]);
    }
  }
}
