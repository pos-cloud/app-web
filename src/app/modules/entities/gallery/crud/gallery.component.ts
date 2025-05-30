import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit } from '@angular/core';
import {
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { GalleryService } from '@core/services/gallery.service';
import { TranslateModule } from '@ngx-translate/core';
import { ApiResponse, Resource } from '@types';
import { ResourceService } from 'app/core/services/resource.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FocusDirective, PipesModule, TranslateModule],
})
export class GalleryComponent implements OnInit {
  public operation: string;
  public userType: string;
  public loading: boolean = false;

  public galleryId: string;
  public gallery: any;
  public galleryForm: UntypedFormGroup;
  public resourcesForm: UntypedFormArray;
  public resources: Resource[];
  public selectedResource: string | null = null;

  public focusEvent = new EventEmitter<boolean>();
  private destroy$ = new Subject<void>();

  constructor(
    public _galleryService: GalleryService,
    public _resourceService: ResourceService,
    public _fb: UntypedFormBuilder,
    public _router: Router,
    private _toastService: ToastService
  ) {
    this.galleryForm = this._fb.group({
      _id: ['', []],
      name: ['', [Validators.required]],
      interval: [10, []],
      barcode: [true, []],
      resources: this._fb.array([]),
    });
  }

  async ngOnInit() {
    await this.getResources();

    const pathUrl = this._router.url.split('/');
    const galleryId = pathUrl[4];
    this.operation = pathUrl[3];

    if (pathUrl[3] === 'view' || pathUrl[3] === 'delete') this.galleryForm.disable();
    if (galleryId) {
      this.getGallery(galleryId);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.focusEvent.emit(true);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.focusEvent.complete();
  }

  addResource(resourceForm: NgForm): void {
    let valid = true;
    const resources = this.galleryForm.controls.resources as UntypedFormArray;
    if (valid) {
      resources.push(
        this._fb.group({
          _id: null,
          resource: resourceForm.value.resource || null,
          order: resourceForm.value.order || 1,
        })
      );
      resourceForm.resetForm();
    }
  }

  getGallery(id: string) {
    this.loading = true;

    this._galleryService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.gallery = result.result;
          this.gallery.resources = this.gallery.resources.map((galleryResource) => {
            const completeResource = this.resources.find((res) => res._id === galleryResource.resource);
            if (completeResource) {
              return {
                ...galleryResource,
                resource: completeResource,
              };
            }
            return galleryResource;
          });
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

  setValueForm(): void {
    const values = {
      _id: this.gallery?._id ?? '',
      name: this.gallery?.name ?? '',
      interval: this.gallery?.interval ?? 10,
      barcode: this.gallery.barcode || false,
    };

    if (this.gallery.resources && this.gallery.resources.length > 0) {
      let resources = <UntypedFormArray>this.galleryForm.controls.resources;
      this.gallery.resources.forEach((x) => {
        let resourceId;
        if (x.resource && x.resource._id) {
          resourceId = x.resource._id;
        }

        resources.push(
          this._fb.group({
            _id: null,
            resource: resourceId,
            order: x.order,
          })
        );
      });
    }

    this.galleryForm.patchValue(values);
  }

  returnTo() {
    return this._router.navigate(['/entities/galleries']);
  }

  addGallery() {
    this.galleryForm.markAllAsTouched();
    if (this.galleryForm.invalid) {
      this.loading = false;
      return;
    }

    this.gallery = this.galleryForm.value;

    switch (this.operation) {
      case 'add':
        this.saveGallery();
        break;
      case 'update':
        this.updateGallery();
        break;
      case 'delete':
        this.deleteGallery();
      default:
        break;
    }
  }

  async saveGallery() {
    this.loading = true;

    if (await this.isValid()) {
      this._galleryService
        .save(this.gallery)
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
    } else {
      this.loading = false;
    }
  }

  async updateGallery() {
    this.loading = true;

    if (await this.isValid()) {
      this._galleryService
        .update(this.gallery)
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
    } else {
      this.loading = false;
    }
  }

  deleteGallery() {
    this.loading = true;

    this._galleryService
      .delete(this.gallery._id)
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

  getResources(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._resourceService
        .find({ query: { operationType: { $ne: 'D' } } })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            this.resources = result;
          },
          error: (error) => {
            this._toastService.showToast(error);
            reject(error);
          },
          complete: () => {
            this.loading = false;
            resolve();
          },
        });
    });
  }

  deleteResource(index) {
    let control = <UntypedFormArray>this.galleryForm.controls.resources;
    control.removeAt(index);
  }

  public isValid(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (
        this.galleryForm.value.interval === 0 ||
        this.gallery.interval === 0 ||
        this.gallery.interval === null ||
        this.gallery.interval < 0 ||
        this.galleryForm.value.interval < 0
      ) {
        this._toastService.showToast({
          message: 'El intervalo no puede ser 0 o negativo',
        });
        resolve(false);
      }

      resolve(true);
    });
  }
}
