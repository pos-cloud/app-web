import { Component, OnInit, EventEmitter, Input, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Make } from '../make';

import { MakeService } from '../make.service';
import { Config } from 'app/app.config';
import { ApplicationService } from 'app/components/application/application.service';
import { Application } from 'app/components/application/application.model';
import { Subscription } from 'rxjs';
import Resulteable from 'app/util/Resulteable';
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-make',
  templateUrl: './make.component.html',
  styleUrls: ['./make.component.scss'],
  providers: [NgbAlertConfig, ApplicationService, TranslateMePipe],
  encapsulation: ViewEncapsulation.None
})

export class MakeComponent implements OnInit {

  @Input() makeId: string;
  @Input() operation: string;
  @Input() readonly: boolean;
  public make: Make;
  public makeForm: FormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public filesToUpload: Array<File>;
  public imageURL: string;
  public orientation: string = 'horizontal';
  public applications: Application[];
  private subscription: Subscription = new Subscription();
  public formErrors = {
    'description': ''
  };

  public validationMessages = {
    'description': {
      'required': 'Este campo es requerido.'
    }
  };

  constructor(
    public _makeService: MakeService,
    public _applicationService: ApplicationService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public translatePipe: TranslateMePipe,
    private _toastr: ToastrService,
  ) {
    this.make = new Make();
    if (window.screen.width < 1000) this.orientation = 'vertical';
  }

  async ngOnInit() {

    this.buildForm();
    this.imageURL = './../../../assets/img/default.jpg';
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];

    await this.getAllApplications({})
      .then((result: Application[]) => {
        this.applications = result;
        if (!this.makeId) {
          this.applications.forEach(x => {
            const control = new FormControl(false);
            (this.makeForm.controls.applications as FormArray).push(control);
          })
        }
      })
      .catch((error: Resulteable) => this.showToast(error));

    if (this.makeId) {
      this.getMake();
    } else {
      this.imageURL = './../../../assets/img/default.jpg';
    }
  }

  public getMake(): void {
    this._makeService.getMake(this.makeId).subscribe(
      result => {
        if (!result.make) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.hideMessage();
          this.make = result.make;
          if (this.make.picture && this.make.picture !== 'default.jpg') {
            this.imageURL = Config.apiURL + 'get-image-make/' + this.make.picture + "/" + Config.database;
          } else {
            this.imageURL = './../../../assets/img/default.jpg';
          }
          this.setValueForm();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    )
  }

  public setValueForm(): void {

    if (!this.make._id) { this.make._id = ''; }
    if (!this.make.description) { this.make.description = ''; }
    if (!this.make.visibleSale) { this.make.visibleSale = false; }
    if (!this.make.ecommerceEnabled) { this.make.ecommerceEnabled = false; }

    this.makeForm.patchValue({
      '_id': this.make._id,
      'description': this.make.description,
      'visibleSale': this.make.visibleSale,
      'ecommerceEnabled': this.make.ecommerceEnabled
    });


    if (this.applications && this.applications.length > 0) {
      this.applications.forEach(x => {
        let encontro = false;
        this.make.applications.forEach(y => {
          if (x._id === y._id) {
            encontro = true;
            const control = new FormControl(y); // if first item set to true, else false
            (this.makeForm.controls.applications as FormArray).push(control);
          }
        })
        if (!encontro) {
          const control = new FormControl(false); // if first item set to true, else false
          (this.makeForm.controls.applications as FormArray).push(control);
        }
      })
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.makeForm = this._fb.group({
      '_id': [this.make._id, []],
      'description': [this.make.description, [Validators.required]],
      'visibleSale': [this.make.visibleSale, []],
      'ecommerceEnabled': [this.make.ecommerceEnabled, []],
      'applications': this._fb.array([])
    });

    this.makeForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.makeForm) { return; }
    const form = this.makeForm;

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

  public addMake(): void {
    this.loading = true;
    this.make = this.makeForm.value;

    const selectedOrderIds = this.makeForm.value.applications
      .map((v, i) => (v ? this.applications[i] : null))
      .filter(v => v !== null);

    this.make.applications = selectedOrderIds;

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
  }

  public saveMake(): void {

    this.loading = true;

    this._makeService.saveMake(this.make).subscribe(
      result => {
        if (!result.make) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.make = result.make;
          if (this.filesToUpload) {
            this._makeService.makeFileRequest(this.make._id, this.filesToUpload)
              .then(
                (result) => {
                  let resultUpload;
                  resultUpload = result;
                  this.make.picture = resultUpload.make.picture;
                  if (this.make.picture && this.make.picture !== 'default.jpg') {
                    this.imageURL = Config.apiURL + 'get-image-make/' + this.make.picture + "/" + Config.database;
                  } else {
                    this.imageURL = './../../../assets/img/default.jpg';
                  }
                  this.showMessage("La marca se ha añadido con éxito.", 'success', false);
                  this.make = new Make();
                  this.filesToUpload = null;
                  this.buildForm();
                },
                (error) => {
                  this.showMessage(error, 'danger', false);
                }
              );
          } else {
            this.showMessage("El rubro se ha añadido con éxito.", 'success', false);
            this.make = new Make();
            this.filesToUpload = null;
            this.buildForm();
          }
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public updateMake(): void {

    this.loading = true;

    this._makeService.updateMake(this.make).subscribe(
      result => {
        if (!result.make) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.make = result.make;
          if (this.filesToUpload) {
            this._makeService.makeFileRequest(this.make._id, this.filesToUpload)
              .then(
                (result) => {
                  let resultUpload;
                  resultUpload = result;
                  this.make.picture = resultUpload.make.picture;
                  if (this.make.picture && this.make.picture !== 'default.jpg') {
                    this.imageURL = Config.apiURL + 'get-image-make/' + this.make.picture + "/" + Config.database;
                  } else {
                    this.imageURL = './../../../assets/img/default.jpg';
                  }
                  this.showMessage("La Marca se ha actualizado con éxito.", 'success', false);
                },
                (error) => {
                  this.showMessage(error, 'danger', false);
                }
              );
          } else {
            this.showMessage("La Marca se ha actualizado con éxito.", 'success', false);
          }
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public fileChangeEvent(fileInput: any) {
    this.filesToUpload = <Array<File>>fileInput.target.files;
  }

  public getAllApplications(match: {}): Promise<Application[]> {
    return new Promise<Application[]>((resolve, reject) => {
      this.subscription.add(this._applicationService.getAll({
        match,
        sort: { name: 1 },
      }).subscribe(
        result => {
          this.loading = false;
          (result.status === 200) ? resolve(result.result) : reject(result);
        },
        error => reject(error)
      ));
    });
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
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
        async result => {
          this.showToast(result);
          if (result.status === 200) this.activeModal.close({ make: this.make });
        },
        error => this.showToast(error)
      )
    );
  }

  public showToast(result, type?: string, title?: string, message?: string): void {
    if (result) {
      if (result.status === 200) {
        type = 'success';
        title = result.message;
      } else if (result.status >= 400) {
        type = 'danger';
        title = (result.error && result.error.message) ? result.error.message : result.message;
      } else {
        type = 'info';
        title = result.message;
      }
    }
    switch (type) {
      case 'success':
        this._toastr.success(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
      case 'danger':
        this._toastr.error(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
      default:
        this._toastr.info(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
    }
    this.loading = false;
  }
}
