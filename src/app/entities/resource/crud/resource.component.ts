import { Component, EventEmitter, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { MediaCategory, Resource, User } from '@types';
import { Config } from 'app/app.config';
import { UserService } from 'app/components/user/user.service';
import { TranslateMePipe } from 'app/core/pipes/translate-me';
import { ToastrService } from 'ngx-toastr';
import { ResourceService } from '../resource.service';

@Component({
  selector: 'app-resource',
  templateUrl: './resource.component.html',
  providers: [NgbAlertConfig, TranslateMePipe],
})
export class ResourceComponent implements OnInit {
  public operation: string;
  public readonly: boolean;
  public resourceId: string;
  public alertMessage: string = '';
  public userType: string;
  public resource: Resource;
  public areResourceEmpty: boolean = true;
  public orderTerm: string[] = ['name'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public userCountry: string;
  public resourceForm: UntypedFormGroup;
  public orientation: string = 'horizontal';

  public selectedFile: File = null;
  public typeSelectFile: string;
  public message: string;
  public src: any = './../../../assets/img/default.jpg';
  public typeFile;
  users: User[];
  creationUser: User;
  updateUser: User;

  public filesToUpload: Array<File>;

  public fileCtrl = new UntypedFormControl();

  public formErrors = {
    name: '',
  };

  public validationMessages = {
    name: {
      required: 'Este campo es requerido.',
    },
  };

  constructor(
    private _resourceService: ResourceService,
    private _fb: UntypedFormBuilder,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _toastr: ToastrService,
    public translatePipe: TranslateMePipe,
    public _router: Router,
    private _route: ActivatedRoute,
    public _userService: UserService
  ) {
   
    this.getUsers();
  }

  ngOnInit() {
    const URL = this._router.url.split('/');
    this.operation = URL[3].split('?')[0];
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    if (this.operation !== 'add') {
      this.resourceId = URL[4].split('?')[0];
    }
    this.userCountry = Config.country;
    this.userType = pathLocation[1];
    this.buildForm();

    if (this.resourceId) {
      this.getResource();
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getResource() {
    this.loading = true;

    this._resourceService.getById(this.resourceId).subscribe(
      (result) => {
        if (!result.result) {
          this.showToast(result);
        } else {
          this.resource = result.result;
          this.src = this.resource.file;

          this.creationUser = this.users.find(
            (user: User) =>
              user._id ===
              (typeof this.resource.creationUser === 'string'
                ? this.resource.creationUser
                : typeof this.resource.creationUser !== 'undefined'
                  ? this.resource.creationUser._id
                  : '')
          );
          if (this.resource.updateUser) {
            this.updateUser = this.users.find(
              (user: User) =>
                user._id ===
                (typeof this.resource.updateUser === 'string'
                  ? this.resource.updateUser
                  : typeof this.resource.updateUser !== 'undefined'
                    ? this.resource.updateUser._id
                    : '')
            );
          }
          this.setValueForm();
        }
        this.loading = false;
      },
      (error) => {
        this.showToast(error);
        this.loading = false;
      }
    );
  }

  public setValueForm(): void {
    if (!this.resource._id) {
      this.resource._id = '';
    }
    if (!this.resource.name) {
      this.resource.name = '';
    }

    const values = {
      _id: this.resource._id,
      name: this.resource.name,
    };
    this.resourceForm.setValue(values);
  }

  public buildForm(): void {
    this.resourceForm = this._fb.group({
      _id: [this.resource._id, []],
      name: [this.resource.name, [Validators.required]],
    });

    this.resourceForm.valueChanges.subscribe((data) =>
      this.onValueChanged(data)
    );
    this.onValueChanged();
  }

  public getUsers() {
    this.loading = true;
    let project = {
      _id: 1,
      name: 1,
      operationType: 1,
    };
    let match = {
      operationType: { $ne: 'D' },
    };
    this._userService.getAll({ project, match }).subscribe(
      (result) => {
        if (!result) {
          this.loading = false;
          this.users = new Array();
        } else {
          this.loading = false;
          this.users = result.result;
        }
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  public onValueChanged(data?: any): void {
    if (!this.resourceForm) {
      return;
    }
    const form = this.resourceForm;

    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);

      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
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

    this._resourceService.update(this.resource).subscribe(
      (result) => {
        if (!result.result) {
          this.loading = false;
          if (result.message && result.message !== '') {
            this.showToast(result);
          }
        } else {
          this.loading = false;
          this.showToast(result);
          this.returnTo();
        }
      },
      (error) => {
        this.showToast(error);
        this.loading = false;
      }
    );
  }

  public returnTo(): void {
    this._route.queryParams.subscribe((params) => {
      const returnUrl = params['returnURL']
        ? decodeURIComponent(params['returnURL'])
        : null;

      if (returnUrl) {
        // Si hay una returnURL, navegar a esa URL
        this._router.navigateByUrl(returnUrl);
      } else {
        // Navegar a una ruta por defecto si no hay returnURL
        this._router.navigate(['/admin/recource']);
      }
    });
  }

  async saveResource() {
    this.loading = true;

    if (this.selectedFile) {
      if (this.selectedFile)
        this.resource.file = await this.uploadFile(this.resource.file);

      this._resourceService.save(this.resource).subscribe(
        (result) => {
          if (!result.result) {
            this.loading = false;
            if (result.message && result.message !== '') {
              this.showToast(result);
            }
          } else {
            this.resource = result.resource;
            this.showToast(result);
            this.returnTo();
            //this.onUpload();
          }
        },
        (error) => {
          this.showToast(error);
          this.loading = false;
        }
      );
    } else {
      this.loading = false;
      this.showToast({
        message: 'Debe seleccionar un archivo.',
      });
    }
  }

  async deleteResource() {
    this.loading = true;

    await this.deleteFile(this.resource.file);

    this._resourceService.delete(this.resource._id).subscribe(
      (result) => {
        this.loading = false;
        if (!result.result) {
          this.showToast(result);
        } else {
          this.showToast(result);
          this.returnTo();
        }
      },
      (error) => {
        this.showToast(error);
        this.loading = false;
      }
    );
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
      this.showToast({
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
      console.log(MediaCategory.RESOURCE);
      this._resourceService
        .makeFileRequest(MediaCategory.RESOURCE, this.selectedFile)
        .then(
          (result: string) => {
            this.resource.file = result;
            resolve(result);
          },
          (error) => this.showToast(error)
        );
    });
  }

  async deleteFile(pictureDelete: string): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      this._resourceService.deleteImageGoogle(pictureDelete).subscribe(
        (result) => {
          resolve(true);
        },
        (error) => {
          this.showToast(error);
          resolve(true);
        }
      );
    });
  }

  showToast(result, type?: string, title?: string, message?: string): void {
    if (result) {
      if (result.status === 200) {
        type = 'success';
        message = result.message;
      } else if (result.status >= 400) {
        type = 'danger';
        message = result.error?.message || result.message;
      } else {
        type = 'info';
        message = result.message;
      }
    }

    switch (type) {
      case 'success':
        this._toastr.success(
          this.translatePipe.translateMe(message),
          this.translatePipe.translateMe(title)
        );
        break;
      case 'danger':
        this._toastr.error(
          this.translatePipe.translateMe(message),
          this.translatePipe.translateMe(title)
        );
        break;
      default:
        this._toastr.info(
          this.translatePipe.translateMe(message),
          this.translatePipe.translateMe(title)
        );
        break;
    }

    this.loading = false;
  }
}
