import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Category } from './../../models/category';

import { CategoryService } from './../../services/category.service';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.css'],
  providers: [NgbAlertConfig]
})

export class AddCategoryComponent  implements OnInit {

  private category: Category;
  private categoryForm: FormGroup;
  private alertMessage: any;
  private userType: string;
  private loading: boolean = false;
  private focusEvent = new EventEmitter<boolean>();

  private formErrors = {
    'description': ''
  };

  private validationMessages = {
    'description': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
    private _categoryService: CategoryService,
    private _fb: FormBuilder,
    private _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.category = new Category ();
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  private buildForm(): void {

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

  private onValueChanged(data?: any): void {

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

  private addCategory(): void {
    this.loading = true;
    this.category = this.categoryForm.value;
    this.saveCategory();
  }

  private saveCategory(): void {
    
    this._categoryService.saveCategory(this.category).subscribe(
    result => {
        if (!result.category) {
          this.alertMessage = result.message;
        } else {
          this.category = result.category;
          this.alertConfig.type = 'success';
          this.alertMessage = "El rubro se ha añadido con éxito.";      
          this.category = new Category ();
          this.buildForm();
        }
        this.loading = false;
      },
      error => {
        this.alertMessage = error;
        if(!this.alertMessage) {
            this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
        }
        this.loading = false;
      }
    );
  }
}