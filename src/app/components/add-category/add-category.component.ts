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
  public alertMessage: any;
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
    
    this._categoryService.saveCategory(this.category).subscribe(
    result => {
        if (!result.category) {
          this.alertMessage = result.message;
          this.alertConfig.type = 'danger';
        } else {
          this.category = result.category;
          this.makeFileRequest(this.filesToUpload)
              .then(
                (result)=>{
                  this.resultUpload = result;
                  this.category.picture = this.resultUpload.filename;
                  console.log(this.category.picture);
                },
                (error) =>{
                  console.log(error);
                }
              );
          this.alertConfig.type = 'success';
          this.alertMessage = "El rubro se ha añadido con éxito.";      
          this.category = new Category ();
          this.buildForm();
        }
        this.loading = false;
      },
      error => {
        this.alertMessage = error._body;
        if(!this.alertMessage) {
            this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
        }
        this.loading = false;
      }
    );
  }

  fileChangeEvent(fileInput: any){
    
    this.filesToUpload = <Array<File>>fileInput.target.files;
  }

  makeFileRequest(files: Array<File>){

    let idCategory = this.category._id;
    return new Promise(function(resolve, reject){
      var formData:any = new FormData();
      var xhr = new XMLHttpRequest();

      for(var i = 0; i < files.length ; i++){
        formData.append('image',files[i], files[i].name);
      }
      xhr.onreadystatechange = function(){
        if(xhr.readyState == 4){
          if(xhr.status == 200){
            resolve(JSON.parse(xhr.response));
          }else {
            reject(xhr.response);
          }
        }
      }
      
      xhr.open('POST', Config.apiURL + 'upload-imagen-category/'+idCategory,true);
      xhr.send(formData);
    });
  }
}