import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Category } from './../../models/category';

import { CategoryService } from './../../services/category.service';

@Component({
  selector: 'app-update-category',
  templateUrl: './update-category.component.html',
  styleUrls: ['./update-category.component.css'],
  providers: [NgbAlertConfig]
})

export class UpdateCategoryComponent implements OnInit {

  @Input() category: Category;
  private categoryForm: FormGroup;
  private alertMessage: any;
  private userType: string;
  private loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

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
    public alertConfig: NgbAlertConfig
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

  ngOnInit(): void {

    let locationPathURL: string;
    this._router.events.subscribe((data:any) => { 
      locationPathURL = data.url.split('/');
      this.userType = locationPathURL[1];
    });
    this.buildForm();
    this.categoryForm.setValue({
      '_id':this.category._id,
      'description': this.category.description
    });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  private buildForm(): void {

    this.categoryForm = this._fb.group({
      '_id': [this.category._id, [
        ]
      ],
      'description': [this.category.description, [
          Validators.required
        ]
      ],
    });

    this.categoryForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
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

  private updateCategory (): void {
    
    this.loading = true;
    this.category = this.categoryForm.value;
    this.saveChanges();
  }

  private saveChanges(): void {
    
  this._categoryService.updateCategory(this.category).subscribe(
    result => {
      if (!this.category) {
        this.alertMessage = result.message;
      } else {
        this.category = result.category;
        this.alertConfig.type = 'success';
        this.alertMessage = "El rubro se ha actualizado con éxito.";
        this.activeModal.close('save_close');
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