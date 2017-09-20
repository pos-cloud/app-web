import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Category } from './../../models/category';

import { CategoryService } from './../../services/category.service';

import { Config } from './../../app.config';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.css'],
  providers: [NgbAlertConfig]
})

export class AddCategoryComponent  implements OnInit {

  public category: Category;
  public categoryForm: FormGroup;
  public alertMessage: string = "";
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public filesToUpload: Array<File>;
  public resultUpload;

  public formErrors = {
    'description': ''
  };

  public validationMessages = {
    'description': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
    public _categoryService: CategoryService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.category = new Category ();
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.categoryForm = this._fb.group({
      'description': [this.category.description, [
          Validators.required
        ]
      ],
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

  public addCategory(): void {
    this.loading = true;
    this.category = this.categoryForm.value;
    this.saveCategory();
  }

  public saveCategory(): void {
    
    this.loading = true;
    
    this._categoryService.saveCategory(this.category).subscribe(
      result => {
        if (!result.category) {
          this.showMessage(result.message, "info", true); 
          this.loading = false;
        } else {
          this.category = result.category;
          if(this.filesToUpload) {
            this._categoryService.makeFileRequest(this.category._id, this.filesToUpload)
                .then(
                  (result)=>{
                    this.resultUpload = result;
                    this.category.picture = this.resultUpload.filename;
                    this.showMessage("El rubro se ha añadido con éxito.", "success", false);
                    this.category = new Category();
                    this.filesToUpload = null;
                    this.buildForm();
                  },
                  (error) =>{
                    this.showMessage(error, "danger", false);
                  }
                );
          } else {
            this.showMessage("El rubro se ha añadido con éxito.", "success", false);
            this.category = new Category();
            this.filesToUpload = null;
            this.buildForm();
          }
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false); 
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
    this.alertMessage = "";
  }
}