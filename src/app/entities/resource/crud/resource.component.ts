import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiResponse, Resource } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { UploadFileComponent } from 'app/shared/components/upload-file/upload-file.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ResourceService } from '../../../core/services/resource.service';

@Component({
  selector: 'app-resource',
  templateUrl: './resource.component.html',
})
export class ResourceComponent implements OnInit {
  @ViewChild(UploadFileComponent) uploadFileComponent: UploadFileComponent;
  public operation: string;
  public resource: Resource;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public resourceForm: UntypedFormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private _resourceService: ResourceService,
    private _fb: UntypedFormBuilder,
    private _router: Router,
    private _toastService: ToastService
  ) {
    this.resourceForm = this._fb.group({
      _id: ['', []],
      name: ['', [Validators.required]],
      file: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');
    const resourceId = pathUrl[4];
    this.operation = pathUrl[3];

    if (this.operation === 'view' || this.operation === 'delete') this.resourceForm.disable();
    if (resourceId) this.getResource(resourceId);
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.focusEvent.complete();
  }

  public getResource(id: string) {
    this.loading = true;
    this._resourceService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.resource = result.result;
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
          this.setValueForm();
        },
      });
  }

  public setValueForm(): void {
    this.resourceForm.patchValue({
      _id: this.resource?._id ?? '',
      name: this.resource?.name ?? '',
      file: this.resource?.file ?? '',
    });
  }

  public returnTo() {
    return this._router.navigate(['/entities/resources']);
  }

  async handleCurrencyOperation() {
    this.loading = true;
    await this.uploadFileComponent.uploadImages();
    this.resourceForm.markAllAsTouched();
    if (this.resourceForm.invalid) {
      this.loading = false;
      return;
    }

    this.resource = this.resourceForm.value;

    switch (this.operation) {
      case 'add':
        this.saveResource();
        break;
      case 'update':
        this.updateResource();
        break;
      case 'delete':
        this.deleteResource();
        break;
    }
  }

  async updateResource() {
    this.loading = true;
    this._resourceService
      .update(this.resource)
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

  async saveResource() {
    this.loading = true;

    this._resourceService
      .save(this.resource)
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

  async deleteResource() {
    this.loading = true;

    this._resourceService
      .delete(this.resource._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
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
      this.resourceForm.get('file')?.setValue(urls[0]);
    }
  }
}
