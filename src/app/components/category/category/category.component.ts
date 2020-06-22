import { Component, OnInit, EventEmitter, Input, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Category } from '../category';

import { CategoryService } from '../category.service';

import { Config } from '../../../app.config';
import { ApplicationService } from 'app/components/application/application.service';
import { Application } from 'app/components/application/application.model';
import { Subscription } from 'rxjs';
import Resulteable from 'app/util/Resulteable';
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
  providers: [NgbAlertConfig, ApplicationService, TranslateMePipe],
  encapsulation: ViewEncapsulation.None
})

export class CategoryComponent implements OnInit {

  @Input() categoryId: string;
  @Input() operation: string;
  @Input() readonly: boolean;

  public category: Category;
  public categoryForm: FormGroup;
  public categories: Category[];
  public applications: Application[];
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public filesToUpload: Array<File>;
  public imageURL: string;
  public orientation: string = 'horizontal';
  private subscription: Subscription = new Subscription();

  public formErrors = { 'order': '', 'description': '' };

  public validationMessages = {
    'order': { 'required': 'Este campo es requerido.' },
    'description': { 'required': 'Este campo es requerido.' }
  };

  constructor(
    public _categoryService: CategoryService,
    public _applicationService: ApplicationService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public translatePipe: TranslateMePipe,
    private _toastr: ToastrService,
  ) {
    if (window.screen.width < 1000) this.orientation = 'vertical';
    this.category = new Category();
    this.getCategories();
  }

  async ngOnInit() {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.buildForm();

    await this.getAllApplications({})
      .then((result: Application[]) => {
        this.applications = result;
        if (!this.categoryId) {
          this.applications.forEach(x => {
            const control = new FormControl(false);
            (this.categoryForm.controls.applications as FormArray).push(control);
          })
        }
      })
      .catch((error: Resulteable) => this.showToast(error));

    if (this.categoryId) {
      this.getCategory();
    } else {
      this.imageURL = './../../../assets/img/default.jpg';
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getCategory() {

    this.loading = true;

    this._categoryService.getCategory(this.categoryId).subscribe(
      result => {
        if (!result.category) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.hideMessage();
          this.category = result.category;
          if (this.category.picture && this.category.picture !== 'default.jpg') {
            this.imageURL = Config.apiURL + 'get-image-category/' + this.category.picture + "/" + Config.database;
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
    );
  }

  public getCategories(): void {

    this.loading = true;

    let project = {
      _id: 1,
      description: 1,
      operationType: 1
    }

    let match = {
      operationType: { $ne: "D" }
    }

    this._categoryService.getCategoriesV2(project, match, { description: -1 }, {}).subscribe(
      result => {
        if (!result.categories) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.hideMessage();
          this.categories = result.categories;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public buildForm(): void {

    this.categoryForm = this._fb.group({
      '_id': [this.category._id, []],
      'order': [this.category.order, [Validators.required]],
      'description': [this.category.description, [Validators.required]],
      'visibleInvoice': [this.category.visibleInvoice, []],
      'visibleOnSale': [this.category.visibleOnSale, []],
      'visibleOnPurchase': [this.category.visibleOnPurchase, []],
      'ecommerceEnabled': [this.category.ecommerceEnabled, []],
      'isRequiredOptional': [this.category.isRequiredOptional, []],
      'parent': [this.category.parent, []],
      'applications': this._fb.array([]),
      'favourite': [this.category.favourite, []]
    });

    this.categoryForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.categoryForm) { return; }
    const form = this.categoryForm;

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

  public getLastCategory(): void {

    this.loading = true;

    let query = 'sort="order":-1&limit=1';

    this._categoryService.getCategories(query).subscribe(
      result => {
        if (!result.categories) {
          this.category.order = 1;
          this.setValueForm();
        } else {
          this.hideMessage();
          this.category.order = result.categories[0].order + 1;
          this.setValueForm();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public setValueForm(): void {

    let parent;
    if (!this.category.parent) {
      parent = null;
    } else {
      if (this.category.parent._id) {
        parent = this.category.parent._id;
      } else {
        parent = this.category.parent;
      }
    }

    this.categoryForm.patchValue({
      '_id': this.category._id,
      'order': this.category.order,
      'description': this.category.description,
      'visibleInvoice': this.category.visibleInvoice,
      'visibleOnSale': this.category.visibleOnSale,
      'visibleOnPurchase': this.category.visibleOnPurchase,
      'ecommerceEnabled': this.category.ecommerceEnabled,
      'isRequiredOptional': this.category.isRequiredOptional,
      'parent': parent,
      'favourite': this.category.favourite
    });

    if (this.applications && this.applications.length > 0) {
      this.applications.forEach(x => {
        let encontro = false;
        this.category.applications.forEach(y => {
          if (x._id === y._id) {
            encontro = true;
            const control = new FormControl(y); // if first item set to true, else false
            (this.categoryForm.controls.applications as FormArray).push(control);
          }
        })
        if (!encontro) {
          const control = new FormControl(false); // if first item set to true, else false
          (this.categoryForm.controls.applications as FormArray).push(control);
        }
      })
    }
  }

  public addCategory() {

    this.category = this.categoryForm.value;

    const selectedOrderIds = this.categoryForm.value.applications
      .map((v, i) => (v ? this.applications[i] : null))
      .filter(v => v !== null);

    this.category.applications = selectedOrderIds;

    switch (this.operation) {
      case 'add':
        this.saveCategory();
        break;
      case 'update':
        this.updateCategory();
        break;
      case 'delete':
        this.deleteCategory();
      default:
        break;
    }
  }

  public saveCategory(): void {

    this.loading = true;

    if (this.isValid()) {
      this._categoryService.saveCategory(this.category).subscribe(
        result => {
          if (!result.category) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            this.loading = false;
          } else {
            this.category = result.category;
            if (this.filesToUpload) {
              this._categoryService.makeFileRequest(this.category._id, this.filesToUpload)
                .then(
                  (result) => {
                    let resultUpload;
                    resultUpload = result;
                    this.category.picture = resultUpload.category.picture;
                    if (this.category.picture && this.category.picture !== 'default.jpg') {
                      this.imageURL = Config.apiURL + 'get-image-category/' + this.category.picture + "/" + Config.database;
                    } else {
                      this.imageURL = './../../../assets/img/default.jpg';
                    }
                    this.showMessage("El rubro se ha añadido con éxito.", 'success', false);
                    this.category = new Category();
                    this.filesToUpload = null;
                    this.buildForm();
                  },
                  (error) => {
                    this.showMessage(error, 'danger', false);
                  }
                );
            } else {
              this.showMessage("El rubro se ha añadido con éxito.", 'success', false);
              this.category = new Category();
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
    } else {
      this.loading = false;
    }

  }

  public updateCategory(): void {
    this.loading = true;

    if (this.isValid()) {

      this._categoryService.updateCategory(this.category).subscribe(
        result => {
          if (!result.category) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            this.loading = false;
          } else {
            this.category = result.category;
            if (this.filesToUpload) {
              this._categoryService.makeFileRequest(this.category._id, this.filesToUpload)
                .then(
                  (result) => {
                    let resultUpload;
                    resultUpload = result;
                    this.category.picture = resultUpload.category.picture;
                    if (this.category.picture && this.category.picture !== 'default.jpg') {
                      this.imageURL = Config.apiURL + 'get-image-category/' + this.category.picture + "/" + Config.database;
                    } else {
                      this.imageURL = './../../../assets/img/default.jpg';
                    }
                    this.showMessage("El rubro se ha actualizado con éxito.", 'success', false);
                  },
                  (error) => {
                    this.showMessage(error, 'danger', false);
                  }
                );
            } else {
              this.showMessage("El rubro se ha actualizado con éxito.", 'success', false);
            }
          }
          this.loading = false;
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
    } else {
      this.loading = false;
    }
  }

  public deleteCategory(): void {

    this.loading = true;

    this._categoryService.deleteCategory(this.category._id).subscribe(
      result => {
        this.activeModal.close('delete_close');
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  isValid(): boolean {
    if (this.category.parent != null && (this.category.parent.toString() === this.category._id || this.category._id === this.category.parent._id)) {
      this.showMessage("No puede seleccionar la misma categoria como padre", "danger", true)
      return false;
    }
    return true
  }

  public getAllApplications(match: {}): Promise<Application[]> {
    return new Promise<Application[]>((resolve, reject) => {
      this.subscription.add(this._applicationService.getAll(
        {}, // PROJECT
        match, // MATCH
        { name: 1 }, // SORT
        {}, // GROUP
        0, // LIMIT
        0 // SKIP
      ).subscribe(
        result => {
          this.loading = false;
          (result.status === 200) ? resolve(result.result) : reject(result);
        },
        error => reject(error)
      ));
    });
  }


  public fileChangeEvent(fileInput: any) {

    this.filesToUpload = <Array<File>>fileInput.target.files;
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
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
