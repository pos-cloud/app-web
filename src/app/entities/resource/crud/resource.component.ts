import { Component, EventEmitter, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { ApiResponse, MediaCategory, Resource } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TranslateMePipe } from 'app/shared/pipes/translate-me';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ResourceService } from '../../../core/services/resource.service';

@Component({
  selector: 'app-resource',
  templateUrl: './resource.component.html',
  providers: [NgbAlertConfig, TranslateMePipe],
})
export class ResourceComponent implements OnInit {
  public operation: string;
  public readonly: boolean;
  public resourceId: string;
  public resource: Resource;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public resourceForm: UntypedFormGroup;

  public selectedFile: File = null;
  public typeSelectFile: string;
  public message: string;
  public src: any = './../../../assets/img/default.jpg';

  private destroy$ = new Subject<void>();
  constructor(
    private _resourceService: ResourceService,
    private _fb: UntypedFormBuilder,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _toastr: ToastService,
    public translatePipe: TranslateMePipe,
    public _router: Router,
    private _toastService: ToastService
  ) {
    this.resourceForm = this._fb.group({
      _id: ['', []],
      name: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    let pathUrl = this._router.url.split('/');
    this.operation = pathUrl[3];
    this.resourceId = pathUrl[4];

    if (pathUrl[3] === 'view' || pathUrl[3] === 'delete') this.readonly = true;
    if (this.resourceId) {
      this.getResource();
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public getResource() {
    this.loading = true;
    this._resourceService
      .getById(this.resourceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.resource = result.result;
          if (this.resource?.file) this.src = this.resource.file;
          this._toastService.showToast(result);
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
    this.resourceForm.setValue({
      _id: this.resource?._id ?? '',
      name: this.resource?.name ?? '',
    });
  }

  public addResource() {
    this.resource = { ...this.resource, ...this.resourceForm.value };

    switch (this.operation) {
      case 'add':
        this.saveResource();
        break;
      case 'update':
        this.updateResource();
        break;
      case 'delete':
        this.deleteResource();
      default:
        break;
    }
  }

  async updateResource() {
    this.loading = true;

    if (this.selectedFile) {
      this.resource.file = await this.uploadFile(this.resource.file);
    }
    this._resourceService
      .update(this.resource)
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

  returnTo() {
    return this._router.navigate(['/entities/resources']);
  }

  async saveResource() {
    this.loading = true;

    if (this.selectedFile) {
      if (this.selectedFile)
        this.resource.file = await this.uploadFile(this.resource.file);

      this._resourceService
        .save(this.resource)
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
    } else {
      this.loading = false;
      this._toastService.showToast({
        message: 'Debe seleccionar un archivo.',
      });
    }
  }

  async deleteResource() {
    this.loading = true;

    await this.deleteFile(this.resource.file);

    this._resourceService
      .delete(this.resource._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
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

  public onFileSelected(event) {
    this.selectedFile = <File>event.target.files[0];

    let reader = new FileReader();
    reader.readAsDataURL(this.selectedFile);
    reader.onload = (_event) => {
      this.src = reader.result;
      this.typeSelectFile = reader.result.toString().substring(5, 10);
    };
  }

  public getFile(): void {
    if (this.resource.file) {
      this.src = `${this.resource.file}`;
    } else {
      this._toastService.showToast({
        message: 'No se encontro el archivo',
      });
      this.loading = true;
    }
  }

  async uploadFile(pictureDelete: string): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      if (
        pictureDelete &&
        pictureDelete.includes('https://storage.googleapis')
      ) {
        await this.deleteFile(pictureDelete);
      }
      this._resourceService
        .makeFileRequest(MediaCategory.RESOURCE, this.selectedFile)
        .then(
          (result: string) => {
            this.resource.file = result;
            resolve(result);
          },
          (error) => this._toastService.showToast(error)
        );
    });
  }

  async deleteFile(pictureDelete: string): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      this._resourceService
        .deleteImageGoogle(pictureDelete)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (result) => {
            resolve(true);
          },
          (error) => {
            this._toastService.showToast(error);
            resolve(true);
          }
        );
    });
  }
}
