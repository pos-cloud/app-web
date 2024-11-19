import { Component, EventEmitter, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { Make } from '../make.model';

import { Config } from 'app/app.config';
import { TranslateMePipe } from 'app/core/pipes/translate-me';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { MakeService } from '../make.service';

@Component({
  selector: 'app-make',
  templateUrl: './make.component.html',
  providers: [NgbAlertConfig, TranslateMePipe],
})
export class MakeComponent implements OnInit {
  public makeId: string;
  public operation: string;
  public readonly: boolean;
  public make: Make;
  public makeForm: UntypedFormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public filesToUpload: Array<File>;
  public imageURL: string = './../../../assets/img/default.jpg';
  private subscription: Subscription = new Subscription();
  public formErrors = {
    description: '',
  };

  public validationMessages = {
    description: {
      required: 'Este campo es requerido.',
    },
  };
  public pathUrl: string[];

  constructor(
    public _makeService: MakeService,
    public _fb: UntypedFormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public translatePipe: TranslateMePipe,
    private _toastr: ToastrService
  ) {
    this.make = new Make();
  }

  async ngOnInit() {
    this.buildForm();

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.pathUrl = this._router.url.split('/');
    this.operation = this.pathUrl[3];
    this.makeId = this.pathUrl[4];
    if (this.pathUrl[3] === 'view') {
      this.readonly = true;
    }
    if (this.makeId) {
      this.getMake();
    }
  }

  public getMake(): void {
    this._makeService.getById(this.makeId).subscribe(
      (result) => {
        if (!result.result) {
          this.showMessage(result.message, 'info', true);
        } else {
          this.hideMessage();
          this.make = result.result;
          if (this.make.picture && this.make.picture !== 'default.jpg') {
            this.imageURL =
              Config.apiURL +
              'get-image-make/' +
              this.make.picture +
              '/' +
              Config.database;
          } else {
            this.imageURL = './../../../assets/img/default.jpg';
          }
          this.setValueForm();
        }
        this.loading = false;
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public setValueForm(): void {
    this.makeForm.patchValue({
      _id: this.make._id ?? '',
      description: this.make.description ?? null,
      visibleSale: this.make.visibleSale ?? false,
    });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {
    this.makeForm = this._fb.group({
      _id: [this.make._id, []],
      description: [this.make.description, [Validators.required]],
      visibleSale: [this.make.visibleSale, []],
    });
  }

  onValueChanged(fieldID?: any): void {
    if (!this.makeForm) {
      return;
    }
    const form = this.makeForm;

    if (!fieldID || typeof fieldID === 'string') {
      for (const field in this.formErrors) {
        if (!fieldID || field === fieldID) {
          this.formErrors[field] = '';
          const control = form.get(field);

          if (control && !control.valid) {
            for (const key in control.errors) {
              if (
                this.validationMessages[field][key] &&
                this.validationMessages[field][key] != 'undefined'
              ) {
                this.formErrors[field] +=
                  this.validationMessages[field][key] + ' ';
              }
            }
          }
        }
      }
    }
  }

  retrunTo() {
    return this._router.navigate(['/entities/makes']);
  }

  public addMake(): void {
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
          this.deleteObj();
        default:
          break;
      }
    } else {
      this.showToast({
        message: 'Por favor, revisa los campos en rojo para continuar.',
      });
      this.onValueChanged();
    }
  }

  public saveMake(): void {
    this.loading = true;

    this._makeService.saveMake(this.make).subscribe(
      (result) => {
        if (!result.result) {
          this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.make = result.result;
          if (this.filesToUpload) {
            this._makeService
              .makeFileRequest(this.make._id, this.filesToUpload)
              .then(
                (result) => {
                  let resultUpload;
                  resultUpload = result;
                  this.make.picture = resultUpload.make.picture;
                  if (
                    this.make.picture &&
                    this.make.picture !== 'default.jpg'
                  ) {
                    this.imageURL =
                      Config.apiURL +
                      'get-image-make/' +
                      this.make.picture +
                      '/' +
                      Config.database;
                  } else {
                    this.imageURL = './../../../assets/img/default.jpg';
                  }
                  this.showMessage(
                    'La marca se ha añadido con éxito.',
                    'success',
                    false
                  );
                  this.make = new Make();
                  this.filesToUpload = null;
                  this.buildForm();
                },
                (error) => {
                  this.showMessage(error, 'danger', false);
                }
              );
          } else {
            this.make = new Make();
            this.filesToUpload = null;
            this.showToast(result, 'success');
            this.buildForm();
            return this.retrunTo();
          }
        }
        this.loading = false;
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public updateMake(): void {
    this.loading = true;

    this._makeService.updateMake(this.make).subscribe(
      (result) => {
        if (!result.result) {
          this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.make = result.result;
          if (this.filesToUpload) {
            this._makeService
              .makeFileRequest(this.make._id, this.filesToUpload)
              .then(
                (result) => {
                  let resultUpload;
                  resultUpload = result;
                  this.make.picture = resultUpload.make.picture;
                  if (
                    this.make.picture &&
                    this.make.picture !== 'default.jpg'
                  ) {
                    this.imageURL =
                      Config.apiURL +
                      'get-image-make/' +
                      this.make.picture +
                      '/' +
                      Config.database;
                  } else {
                    this.imageURL = './../../../assets/img/default.jpg';
                  }
                  this.showMessage(
                    'La Marca se ha actualizado con éxito.',
                    'success',
                    false
                  );
                },
                (error) => {
                  this.showMessage(error, 'danger', false);
                }
              );
          } else {
            this.showToast(result, 'success');
            return this.retrunTo();
          }
        }
        this.loading = false;
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public fileChangeEvent(fileInput: any) {
    this.filesToUpload = <Array<File>>fileInput.target.files;
  }

  public showMessage(
    message: string,
    type: string,
    dismissible: boolean
  ): void {
    console.log(message);
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }

  public deleteObj() {
    this.loading = true;
    this.subscription.add(
      this._makeService.delete(this.make._id).subscribe(
        async (result) => {
          this.showToast(result);
          if (result.status === 200) {
            return this.retrunTo();
          }
        },
        (error) => this.showToast(error)
      )
    );
  }

  public showToast(
    result,
    type?: string,
    title?: string,
    message?: string
  ): void {
    if (result) {
      if (result.status === 200) {
        type = 'success';
        title = result.message;
      } else if (result.status >= 400) {
        type = 'danger';
        title =
          result.error && result.error.message
            ? result.error.message
            : result.message;
      } else {
        type = 'info';
        title = result.message;
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
