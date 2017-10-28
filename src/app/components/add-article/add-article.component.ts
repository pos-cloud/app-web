import { Component, OnInit, EventEmitter } from '@angular/core';
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

//Pipes
import { DecimalPipe } from '@angular/common'; 

@Component({
  selector: 'app-add-article',
  templateUrl: './add-article.component.html',
  styleUrls: ['./add-article.component.css'],
  providers: [NgbAlertConfig, DecimalPipe]
})

export class AddArticleComponent  implements OnInit {

  public article: Article;
  public articleForm: FormGroup;
  public makes: Make[] = new Array();
  public categories: Category[] = new Array();
  public types: ArticleType[] = [ArticleType.Bar, ArticleType.Kitchen, ArticleType.Counter];
  public alertMessage: string = "";
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public resultUpload;
  public apiURL = Config.apiURL;

  public formErrors = {
    'code': "1",
    'make': '',
    'description': '',
    'posDescription': '',
    'costPrice': 0.00,
    'markupPorcent': 0.00,
    'markupPrice': 0.00,
    'salePrice': 0.00,
    'category': ''
  };

  public validationMessages = {
    'code': {
      'required':       'Este campo es requerido.',
      'maxlength':      'No puede exceder los 5 carácteres.'
    },
    'make': {
      'required':       'Este campo es requerido.'
    },
    'description': {
      'required':       'Este campo es requerido.'
    },
    'posDescription': {
      'maxlength':      'No puede exceder los 20 carácteres.'
    },
    'costPrice': {
      'required': 'Este campo es requerido.'
    },
    'markupPorcent': {
      'required': 'Este campo es requerido.'
    },
    'markupPrice': {
      'required': 'Este campo es requerido.'
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
          Validators.maxLength(5)
        ]
      ],
      'make': [this.article.make, [
        ]
      ],
      'description': [this.article.description, [
          Validators.required
        ]
      ],
      'posDescription': [this.article.posDescription, [
          Validators.maxLength(20)
        ]
      ],
      'costPrice': [this.article.costPrice, [
        Validators.required
        ]
      ],
      'markupPorcent': [this.article.markupPorcent, [
        Validators.required
        ]
      ],
      'markupPrice': [this.article.markupPrice, [
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

    this.loading = true;
    
    this._articleService.getLastArticle().subscribe(
        result => {
          let code = "1";
          let category: Category = new Category();
          if(result.articles){
            if(result.articles[0] !== undefined) {
              if (!isNaN(parseInt(result.articles[0].code))) {
                code = (parseInt(result.articles[0].code) + 1) + "";
              } else {
                code = "1";
              }
            }
          }
          if(this.categories[0] !== undefined) {
            category = this.categories[0];
          }

          this.article.code = code;
          this.article.make = this.makes[0];
          this.article.category = category;
          this.setValuesForm();
          this.loading = false;
        },
        error => {
          this.showMessage(error._body, "danger", false);
          this.loading = false;
        }
      );
   }

  public getMakes(): void {  

    this.loading = true;
    
    this._makeService.getMakes().subscribe(
        result => {
          if(!result.makes) {
            this.getCategories();
          } else {
            this.hideMessage();
            this.loading = false;
            this.makes = result.makes;
            this.getCategories();
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
            this.getLastArticle();
          }
        },
        error => {
          this.showMessage(error._body, "danger", false);
          this.loading = false;
        }
      );
  }

  public updatePrices(op): void {
    
    switch(op) {
      case 'costPrice':
          this.articleForm.value.markupPrice = (this.articleForm.value.costPrice * this.articleForm.value.markupPorcent) / 100;
          this.articleForm.value.salePrice = this.articleForm.value.markupPrice + this.articleForm.value.costPrice;
        break;
      case 'markupPorcent':
        this.articleForm.value.markupPrice = (this.articleForm.value.costPrice * this.articleForm.value.markupPorcent) / 100;
        this.articleForm.value.salePrice = this.articleForm.value.markupPrice + this.articleForm.value.costPrice;
        break;
      case 'markupPrice':
        this.articleForm.value.markupPorcent = (this.articleForm.value.markupPrice / this.articleForm.value.costPrice) * 100;
        this.articleForm.value.salePrice = this.articleForm.value.markupPrice + this.articleForm.value.costPrice;
        break;
      case 'salePrice':
        if(this.articleForm.value.costPrice === 0) {
          this.articleForm.value.markupPorcent = 0;
          this.articleForm.value.markupPricet = 0;
        } else {
          this.articleForm.value.markupPrice = this.articleForm.value.salePrice - this.articleForm.value.costPrice;
          this.articleForm.value.markupPorcent = (this.articleForm.value.markupPrice / this.articleForm.value.costPrice) * 100;
        }
        break;
      default:
        this.articleForm.value.markupPrice = (this.articleForm.value.costPrice * this.articleForm.value.markupPorcent) / 100;
        this.articleForm.value.salePrice = this.articleForm.value.markupPrice + this.articleForm.value.costPrice;
        break;
    }

    this.articleForm.value.costPrice = parseFloat(this.articleForm.value.costPrice.toFixed(2));
    this.articleForm.value.markupPorcent = parseFloat(this.articleForm.value.markupPorcent.toFixed(2));
    this.articleForm.value.markupPrice = parseFloat(this.articleForm.value.markupPrice.toFixed(2));
    this.articleForm.value.salePrice = parseFloat(this.articleForm.value.salePrice.toFixed(2));

    this.article = this.articleForm.value;
    this.setValuesForm();

  }

  public loadPosDescription(): void {
    if (this.articleForm.value.posDescription === "") {
      let slicePipe = new SlicePipe();
      this.articleForm.value.posDescription = slicePipe.transform(this.articleForm.value.description, 0, 20);
      this.article = this.articleForm.value;
      this.setValuesForm();
    }
  }

  public setValuesForm(): void {

    if (!this.article._id) this.article._id = "";
    if (!this.article.code) this.article.code = "1";
    if (!this.article.make) this.article.make = null;
    if (!this.article.description) this.article.description = "";
    if (!this.article.posDescription) this.article.posDescription = "";
    if (!this.article.costPrice) this.article.costPrice = 0.00;
    if (!this.article.markupPorcent) this.article.markupPorcent = 0.00;
    if (!this.article.markupPrice) this.article.markupPrice = 0.00;
    if (!this.article.salePrice) this.article.salePrice = 0.00;
    if (!this.article.category) this.article.category = null;
    if (!this.article.observation) this.article.observation = "";
    if (!this.article.barcode) this.article.barcode = "";
    if (!this.article.type) this.article.type = ArticleType.Counter;
    
    this.articleForm.setValue({
      '_id': this.article._id,
      'code': this.article.code,
      'make': this.article.make,
      'description': this.article.description,
      'posDescription': this.article.posDescription,
      'costPrice': this.article.costPrice,
      'markupPorcent': this.article.markupPorcent,
      'markupPrice': this.article.markupPrice,
      'salePrice': this.article.salePrice,
      'category': this.article.category,
      'observation': this.article.observation,
      'barcode': this.article.barcode,
      'type': this.article.type
    });
  }

  public addArticle(): void {
    
    this.loadPosDescription();
    this.article = this.articleForm.value;
    this.saveArticle();
  }

  public saveArticle(): void {
    
    this.loading = true;
    
    this._articleService.saveArticle(this.article).subscribe(
    result => {
        if (!result.article) {
          this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.article = result.article;
          if (this.filesToUpload) {
            this._articleService.makeFileRequest(this.article._id, this.filesToUpload)
              .then(
              (result) => {
                this.resultUpload = result;
                this.article.picture = this.resultUpload.filename;
                this.showMessage("El artículo se ha añadido con éxito.", "success", false);
                this.article = new Article();
                this.filesToUpload = null;
                this.buildForm();
                this.getLastArticle();
              },
              (error) => {
                this.showMessage(error, "danger", false);
              }
              );
          } else {
            this.showMessage("El artículo se ha añadido con éxito.", "success", false);
            this.article = new Article();
            this.filesToUpload = null;
            this.buildForm();
            this.getLastArticle();
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

  public filesToUpload: Array <File>;

  public fileChangeEvent(fileInput: any): void {

    this.filesToUpload = <Array<File>>fileInput.target.files;
  }

  public makeFileRequest(files: Array<File>) {
    
    let articleId = this.article._id;
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
      
      xhr.open('POST', Config.apiURL + 'upload-image/'+articleId,true);
      xhr.send(formData);
    });
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = "";
  }
}
