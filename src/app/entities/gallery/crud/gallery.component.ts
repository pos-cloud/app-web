import { Component, EventEmitter, OnInit } from '@angular/core';
import {
  NgForm,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiResponse, Resource } from '@types';
import { TranslateMePipe } from 'app/core/pipes/translate-me';
import { ResourceService } from 'app/core/services/resource.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GalleryService } from '../../../core/services/gallery.service';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  providers: [TranslateMePipe],
})
export class GalleryComponent implements OnInit {
  public operation: string;
  public readonly: boolean;
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
    private _route: ActivatedRoute,
    private _toastr: ToastService,
    public translatePipe: TranslateMePipe
  ) {
    this.getResources();
  }

  ngOnInit() {
    const URL = this._router.url.split('/');
    this.operation = URL[3].split('?')[0];
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    if (this.operation !== 'add') {
      this.galleryId = URL[4].split('?')[0];
    }

    this.buildForm();

    if (this.galleryId) {
      this.getGallery();
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
  }

  buildForm(): void {
    this.galleryForm = this._fb.group({
      _id: ['', []],
      name: ['', [Validators.required]],
      colddown: ['', []],
      barcode: ['', []],
      resources: this._fb.array([]),
    });
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

  getGallery() {
    this.loading = true;

    this._galleryService
      .getById(this.galleryId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (result: ApiResponse) => {
          if (!result.result) {
            this._toastr.showToast(result);
          } else {
            this.gallery = result.result;
            this.gallery.resources = this.gallery.resources.map(
              (galleryResource) => {
                const completeResource = this.resources.find(
                  (res) => res._id === galleryResource.resource
                );
                if (completeResource) {
                  return {
                    ...galleryResource,
                    resource: completeResource, // Aquí reemplazamos el ID con el objeto completo
                  };
                }
                return galleryResource; // Si no se encuentra, se deja el recurso como está
              }
            );
            this.setValueForm();
          }
        },
        (error) => this._toastr.showToast(error),
        () => (this.loading = false)
      );
  }

  setValueForm(): void {
    const values = {
      _id: this.gallery?._id ?? '',
      name: this.gallery?.name ?? '',
      colddown: this.gallery?.colddown ?? 6,
      barcode: this.gallery.barcode ? this.gallery.barcode : false,
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

  returnTo(): void {
    this._route.queryParams.subscribe((params) => {
      const returnUrl = params['returnURL']
        ? decodeURIComponent(params['returnURL'])
        : null;

      if (returnUrl) {
        // Si hay una returnURL, navegar a esa URL
        this._router.navigateByUrl(returnUrl);
      } else {
        // Navegar a una ruta por defecto si no hay returnURL
        this._router.navigate(['/entities/galleries']);
      }
    });
  }

  addGallery() {
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

    this.gallery = this.galleryForm.value;

    if (await this.isValid()) {
      this._galleryService
        .save(this.gallery)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (result: ApiResponse) => {
            if (!result.result) {
              this._toastr.showToast(result);
            } else {
              this._toastr.showToast(result);
              if (result.status == 200) return this.returnTo();
            }
          },
          (error) => this._toastr.showToast(error),
          () => (this.loading = false)
        );
    } else {
      this.loading = false;
    }
  }

  async updateGallery() {
    this.loading = true;

    this.gallery = this.galleryForm.value;

    if (await this.isValid()) {
      this._galleryService
        .update(this.gallery)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (result: ApiResponse) => {
            if (!result.result) {
              this._toastr.showToast(result);
            } else {
              this._toastr.showToast(result);
              if (result.status == 200) return this.returnTo();
            }
          },
          (error) => this._toastr.showToast(error),
          () => (this.loading = false)
        );
    } else {
      this.loading = false;
    }
  }

  deleteGallery() {
    this.loading = true;

    this._galleryService.delete(this.gallery._id).subscribe(
      (result) => {
        this.loading = false;
        if (!result.result) {
          this._toastr.showToast(result);
        } else {
          this._toastr.showToast(result);
          if (result.status == 200) return this.returnTo();
        }
      },
      (error) => this._toastr.showToast(error),
      () => (this.loading = false)
    );
  }

  getResources(): void {
    let match = `{ "operationType": { "$ne": "D" } }`;

    match = JSON.parse(match);

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project = {
      name: 1,
      type: 1,
      file: 1,
      operationType: 1,
    };
    this._resourceService
      .getAll({ project, match })
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (result: ApiResponse) => {
          if (!result.result) {
            this._toastr.showToast(result);
          } else {
            this.resources = result.result;
          }
        },
        (error) => this._toastr.showToast(error),
        () => (this.loading = false)
      );
  }

  deleteResource(index) {
    let control = <UntypedFormArray>this.galleryForm.controls.resources;
    control.removeAt(index);
  }

  public isValid(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (
        this.galleryForm.value.colddown === 0 ||
        this.gallery.colddown === 0 ||
        this.gallery.colddown === null ||
        this.gallery.colddown < 0 ||
        this.galleryForm.value.colddown < 0
      ) {
        this._toastr.showToast(
          null,
          'info',
          undefined,
          'El intervalo no puede ser 0 o negativo'
        );
        resolve(false);
      }

      resolve(true);
    });
  }
}
