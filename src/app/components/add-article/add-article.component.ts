import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Article, ArticleType } from './../../models/article';
import { Make } from './../../models/make';
import { Category } from './../../models/category';

import { ArticleService } from './../../services/article.service';
import { MakeService } from './../../services/make.service';
import { CategoryService } from './../../services/category.service';

@Component({
  selector: 'app-add-article',
  templateUrl: './add-article.component.html',
  styleUrls: ['./add-article.component.css'],
  providers: [NgbAlertConfig]
})

export class AddArticleComponent  implements OnInit {

  public article: Article;
  public articleForm: FormGroup;
  public makes: Make[] = new Array();
  public categories: Category[] = new Array();
  public types: ArticleType[] = [ArticleType.Bar, ArticleType.Kitchen, ArticleType.Counter];
  public alertMessage: any;
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'code': 1,
    'make': '',
    'description': '',
    'salePrice': 0.00,
    'category': ''
  };

  public validationMessages = {
    'code': {
      'required':       'Este campo es requerido.',
      'pattern':        'No puede exceder los 5 dígitos.',
    },
    'make': {
      'required':       'Este campo es requerido.'
    },
    'description': {
      'required':       'Este campo es requerido.'
    },
    'salePrice': {
      'required':       'Este campo es requerido.'
    },
    'category': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
    public _articleService: ArticleService,
    public _makeService: MakeService,
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
    this.article = new Article ();
    this.buildForm();
    this.getMakes();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.articleForm = this._fb.group({
      '_id': [this.article._id, [
        ]
      ],
      'code': [this.article.code, [
          Validators.required,
          Validators.pattern("[0-9]{1,5}")
        ]
      ],
      'make': [this.article.make, [
          Validators.required
        ]
      ],
      'description': [this.article.description, [
          Validators.required
        ]
      ],
      'salePrice': [this.article.salePrice, [
          Validators.required
        ]
      ],
      'category': [this.article.category, [
          Validators.required
        ]
      ],
      'observation': [this.article.observation, [
        ]
      ],
      'barcode': [this.article.barcode, [
        ]
      ],
      'type': [this.article.type, [
        ]
      ]
    });

    this.articleForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.articleForm) { return; }
    const form = this.articleForm;

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

  public getLastArticle(): void {  

    this._articleService.getLastArticle().subscribe(
        result => {
          let code = 1;
          let category: Category = new Category();
          let make: Make  = new Make();
          if(result.articles){
            if(result.articles[0] !== undefined) {
              code = result.articles[0].code + 1;
            }
          }
          if(this.categories[0] !== undefined) {
            category = this.categories[0];
          }
          if(this.makes[0] !== undefined) {
            make = this.makes[0];
          }
          this.articleForm.setValue({
            '_id': '',
            'code': code,
            'make': make,
            'description': '',
            'salePrice': 0.00,
            'category': category,
            'observation': '',
            'barcode': '',
            'type': ArticleType.Counter
          });
        },
        error => {
          this.alertMessage = error;
          if(!this.alertMessage) {
            this.alertMessage = "Error en la petición.";
          }
        }
      );
   }

  public getMakes(): void {  

    this._makeService.getMakes().subscribe(
        result => {
          if(!result.makes) {
            this.alertMessage = result.message;
            this.alertConfig.type = 'danger';
          } else {
            this.alertMessage = null;
            this.makes = result.makes;
            this.getCategories();
          }
        },
        error => {
          this.alertMessage = error;
          if(!this.alertMessage) {
            this.alertMessage = "Error en la petición.";
          }
        }
      );
   }

  public getCategories(): void {  
    
    this._categoryService.getCategories().subscribe(
        result => {
          if(!result.categories) {
            this.alertMessage = result.message;
            this.alertConfig.type = 'danger';
          } else {
            this.alertMessage = null;
            this.categories = result.categories;
            this.getLastArticle();
          }
        },
        error => {
          this.alertMessage = error;
          if(!this.alertMessage) {
            this.alertMessage = "Error en la petición.";
          }
        }
      );
   }

  public addArticle(): void {
    this.loading = true;
    this.article = this.articleForm.value;
    this.saveArticle();
  }

  public saveArticle(): void {
    
    this._articleService.saveArticle(this.article).subscribe(
    result => {
        if (!result.article) {
          this.alertMessage = result.message;
          this.alertConfig.type = 'danger';
        } else {
          this.article = result.article;
          this.alertMessage = "El artículo se ha añadido con éxito."; 
          this.alertConfig.type = 'success';
          this.article = new Article ();
          this.buildForm();
          this.getLastArticle();
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

  public filesToUpload: Array <File>;

  fileChangeEvent(fileInput: any){
    this.filesToUpload = <Array<File>>fileInput.target.files;

    console.log(this.filesToUpload);
  }

  makeFileRequest(files: Array<File>){

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
      
      xhr.open('POST','http://localhost:3000/api/upload-imagen/',true);
      xhr.send(formData);
    });
  }
}
