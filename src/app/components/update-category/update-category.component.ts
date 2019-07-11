import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Category } from './../../models/category';

import { CategoryService } from './../../services/category.service';

import { Config } from './../../app.config';

@Component({
  selector: 'app-update-category',
  templateUrl: './update-category.component.html',
  styleUrls: ['./update-category.component.css'],
  providers: [NgbAlertConfig]
})

export class UpdateCategoryComponent implements OnInit {

  @Input() category: Category;
  @Input() readonly: boolean;
  public categoryForm: FormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public filesToUpload: Array<File>;
  public imageURL: string;


  public formErrors = {
    'order': '',
    'description': '',
    'visibleInvoice' : ''
  };

  public validationMessages = {
    'order': {
      'required': 'Este campo es requerido.'
    },
    'description': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
    public _categoryService: CategoryService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) {
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    if (this.category.picture && this.category.picture !== 'default.jpg') {
      this.imageURL = Config.apiURL + 'get-image-category/' + this.category.picture;
    } else {
      this.imageURL = './../../../assets/img/default.jpg';
    }
    this.buildForm();
    this.setValueForm();
  }

  public setValueForm(): void {

    this.categoryForm.setValue({
      '_id': this.category._id,
      'order': this.category.order,
      'description': this.category.description,
      'visibleInvoice': this.category.visibleInvoice,
      'ecommerceEnabled': this.category.ecommerceEnabled
    });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.categoryForm = this._fb.group({
      '_id': [this.category._id, [
        ]
      ],
      'order': [this.category.order, [
          Validators.required
        ]
      ],
      'description': [this.category.description, [
          Validators.required
        ]
      ],
      'visibleInvoice' : [this.category.visibleInvoice,[
        ]
      ],
      'ecommerceEnabled' : [this.category.ecommerceEnabled,[
        ]
      ]
    });

    this.categoryForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
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

  public updateCategory (): void {
    if (!this.readonly) {
      this.loading = true;
      this.category = this.categoryForm.value;
      this.saveChanges();
    }
  }

  public saveChanges(): void {

    this.loading = true;

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
                    this.imageURL = Config.apiURL + 'get-image-category/' + this.category.picture;
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
  }

  public fileChangeEvent(fileInput: any){

    this.filesToUpload = <Array<File>>fileInput.target.files;
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage():void {
    this.alertMessage = '';
  }
}
