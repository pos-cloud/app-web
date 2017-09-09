import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { SlicePipe } from '@angular/common'; 

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Article, ArticleType } from './../../models/article';
import { Make } from './../../models/make';
import { Category } from './../../models/category';

import { ArticleService } from './../../services/article.service';
import { MakeService } from './../../services/make.service';
import { CategoryService } from './../../services/category.service';

import { Config } from './../../app.config';

@Component({
  selector: 'app-update-article',
  templateUrl: './update-article.component.html',
  styleUrls: ['./update-article.component.css'],
  providers: [NgbAlertConfig]
})

export class UpdateArticleComponent implements OnInit {

  @Input() article: Article;
  public articleForm: FormGroup;
  public makes: Make[] = new Array();
  public categories: Category[] = new Array();
  public types: ArticleType[] = [ArticleType.Bar, ArticleType.Kitchen, ArticleType.Counter];
  public alertMessage: string = "";
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public filesToUpload: Array<File>;
  public resultUpload;
  public apiURL = Config.apiURL;

  public formErrors = {
    'code': 1,
    'make': '',
    'description': '',
    'posDescription': '',
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
    'posDescription': {
      'required':       'Este campo es requerido.',
      'maxlength':      'No puede exceder los 10 carácteres.'
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
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.buildForm();
    this.getMakes();
    this.getCategories();
    this.articleForm.setValue({
      '_id':this.article._id,
      'code':this.article.code,
      'make': this.article.make._id,
      'description': this.article.description,
      'posDescription': this.article.posDescription,
      'salePrice': this.article.salePrice,
      'category': this.article.category._id,
      'observation': this.article.observation,
      'barcode': this.article.barcode,
      'type': this.article.type
    });
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
      'posDescription': [this.article.posDescription, [
          Validators.maxLength(10)
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
  
  public getMakes(): void {  

    this.loading = true;
    
    this._makeService.getMakes().subscribe(
        result => {
          if(!result.makes) {
            this.showMessage(result.message, "info", true); 
            this.loading = false;
          } else {
            this.hideMessage();
            this.loading = false;
            this.makes = result.makes;
          }
        },
        error => {
          this.showMessage(error._body, "danger", false);
          this.loading = false;
        }
      );
   }

  public getCategories(): void {  
    
    this.loading = true;
    
    this._categoryService.getCategories().subscribe(
        result => {
          if(!result.categories) {
            this.showMessage(result.message, "info", true); 
            this.loading = false;
          } else {
            this.hideMessage();
            this.loading = false;
            this.categories = result.categories;
          }
        },
        error => {
          this.showMessage(error._body, "danger", false);
          this.loading = false;
        }
      );
   }

  public updateArticle (): void {
    
    this.loading = true;
    if(this.articleForm.value.posDescription === "") {
      let slicePipe = new SlicePipe();
      this.articleForm.value.posDescription = slicePipe.transform(this.articleForm.value.description,1,10);
    }
    this.article = this.articleForm.value;
    this.getMake();
  }

  public getMake(): void {  
    
    this.loading = true;
    
    this._makeService.getMake(this.articleForm.value.make).subscribe(
        result => {
          if(!result.make) {
            this.showMessage(result.message, "info", true); 
            this.loading = false;
          } else {
            this.hideMessage();
            this.loading = false;
            this.article.make = result.make;
            this.getCategory();
          }
        },
        error => {
          this.showMessage(error._body, "danger", false);
          this.loading = false;
        }
      );
   }

  public getCategory(): void {  
    
    this.loading = true;
    
    this._categoryService.getCategory(this.articleForm.value.category).subscribe(
        result => {
          if(!result.category) {
            this.showMessage(result.message, "info", true); 
          } else {
            this.article.category = result.category;
            if(this.filesToUpload) {
              this.makeFileRequest(this.filesToUpload)
                .then(
                  (result)=>{
                    this.resultUpload = result;
                    this.article.picture = this.resultUpload.filename;
                  },
                  (error) =>{
                    this.showMessage(error, "danger", false);
                    this.loading = false;
                  }
                );
            }
            this.saveChanges();
          }
        },
        error => {
          this.showMessage(error._body, "danger", false);
          this.loading = false;
        }
      );
   }

  public saveChanges(): void {
    
    this.loading = true;
    
    this._articleService.updateArticle(this.article).subscribe(
      result => {
        if (!result.article) {
          this.showMessage(result.message, "info", true); 
          this.loading = false;
        } else {
          this.article = result.article;
          this.showMessage("El artículo se ha actualizado con éxito.", "success", false); 
          this.activeModal.close('save_close');
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

  public makeFileRequest(files: Array<File>){

    let idArticulo = this.article._id;
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
      
      xhr.open('POST', Config.apiURL + 'upload-imagen/'+idArticulo,true);
      xhr.send(formData);
    });
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
