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

//Pipes
import { DecimalPipe } from '@angular/common'; 

@Component({
  selector: 'app-update-article',
  templateUrl: './update-article.component.html',
  styleUrls: ['./update-article.component.css'],
  providers: [NgbAlertConfig, DecimalPipe]
})

export class UpdateArticleComponent implements OnInit {

  @Input() article: Article;
  @Input() readonly: boolean;
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
    'code': "1",
    'make': '',
    'description': '',
    'posDescription': '',
    'costPrice': 0.00,
    'VATPercentage': 0.00,
    'VATPrice': 0.00,
    'markupPercentage': 0.00,
    'markupPrice': 0.00,
    'salePrice': 0.00,
    'category': ''
  };

  public validationMessages = {
    'code': {
      'required': 'Este campo es requerido.',
      'maxlength': 'No puede exceder los 5 carácteres.'
    },
    'make': {
    },
    'description': {
      'required': 'Este campo es requerido.'
    },
    'posDescription': {
      'maxlength': 'No puede exceder los 20 carácteres.'
    },
    'costPrice': {
      'required': 'Este campo es requerido.'
    },
    'VATPercentage': {
      'required': 'Este campo es requerido.'
    },
    'VATAmount': {
      'required': 'Este campo es requerido.'
    },
    'markupPercentage': {
      'required': 'Este campo es requerido.'
    },
    'markupPrice': {
      'required': 'Este campo es requerido.'
    },
    'salePrice': {
      'required': 'Este campo es requerido.'
    },
    'category': {
      'required': 'Este campo es requerido.'
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
    this.setValuesForm();
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
      'VATPercentage': [this.article.VATPercentage, [
          Validators.required
        ]
      ],
      'VATAmount': [this.article.VATAmount, [
          Validators.required
        ]
      ],
      'markupPercentage': [this.article.markupPercentage, [
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
          } else {
            this.hideMessage();
            this.makes = result.makes;
          }
          this.loading = false;
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
          } else {
            this.hideMessage();
            this.categories = result.categories;
          }
          this.loading = false;
        },
        error => {
          this.showMessage(error._body, "danger", false);
          this.loading = false;
        }
      );
   }

  public updateArticle (): void {
    if(!this.readonly) {
      this.loading = true;
      if(this.articleForm.value.posDescription === "") {
        let slicePipe = new SlicePipe();
        this.articleForm.value.posDescription = slicePipe.transform(this.articleForm.value.description,1,10);
      }
      this.article = this.articleForm.value;
      if(this.articleForm.value.make) {
        this.getMake();
      } else {
        this.getCategory();
      }
    }
  }

  public getMake(): void {

    this.loading = true;

    this._makeService.getMake(this.articleForm.value.make).subscribe(
      result => {
        if (!result.make) {
          this.showMessage(result.message, "info", true);
        } else {
          this.hideMessage();
          this.loading = false;
          this.article.make = result.make;
          this.getCategory();
        }
        this.loading = false;
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
        if (!result.category) {
          this.showMessage(result.message, "info", true);
        } else {
          this.article.category = result.category;
          this.loadPosDescription();
          this.saveChanges();
        }
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public updatePrices(op): void {

    switch (op) {
      case 'costPrice':
        this.articleForm.value.markupPrice = ((this.articleForm.value.costPrice + this.articleForm.value.VATAmount) * this.articleForm.value.markupPercentage) / 100;
        this.articleForm.value.VATAmount = (this.articleForm.value.costPrice * this.articleForm.value.VATPercentage) / 100;
        this.articleForm.value.salePrice = this.articleForm.value.VATAmount + this.articleForm.value.markupPrice + this.articleForm.value.costPrice;
        break;
      case 'VATPercentage':
        this.articleForm.value.VATAmount = (this.articleForm.value.costPrice * this.articleForm.value.VATPercentage) / 100;
        this.articleForm.value.salePrice = this.articleForm.value.VATAmount + this.articleForm.value.markupPrice + this.articleForm.value.costPrice;
        break;
      case 'markupPercentage':
        this.articleForm.value.markupPrice = ((this.articleForm.value.costPrice + this.articleForm.value.VATAmount) * this.articleForm.value.markupPercentage) / 100;
        this.articleForm.value.salePrice = this.articleForm.value.VATAmount + this.articleForm.value.markupPrice + this.articleForm.value.costPrice;
        break;
      case 'markupPrice':
        this.articleForm.value.markupPercentage = (this.articleForm.value.markupPrice / (this.articleForm.value.costPrice + this.articleForm.value.VATAmount)) * 100;
        this.articleForm.value.salePrice = this.articleForm.value.VATAmount + this.articleForm.value.markupPrice + this.articleForm.value.costPrice;
        break;
      case 'salePrice':
        if (this.articleForm.value.costPrice === 0) {
          this.articleForm.value.VATPercentage = 0;
          this.articleForm.value.VATAmount = 0;
          this.articleForm.value.markupPercentage = 0;
          this.articleForm.value.markupPricet = 0;
        } else {
          this.articleForm.value.markupPrice = this.articleForm.value.salePrice - (this.articleForm.value.costPrice + this.articleForm.value.VATAmount);
          this.articleForm.value.markupPercentage = (this.articleForm.value.markupPrice / (this.articleForm.value.costPrice + this.articleForm.value.VATAmount)) * 100;
        }
        break;
      default:
        this.articleForm.value.markupPrice = ((this.articleForm.value.costPrice + this.articleForm.value.VATAmount) * this.articleForm.value.markupPercentage) / 100;
        this.articleForm.value.salePrice = this.articleForm.value.VATAmount + this.articleForm.value.markupPrice + this.articleForm.value.costPrice;
        break;
    }

    this.articleForm.value.costPrice = parseFloat(this.articleForm.value.costPrice.toFixed(2));
    this.articleForm.value.VATPercentage = parseFloat(this.articleForm.value.VATPercentage.toFixed(2));
    this.articleForm.value.VATAmount = parseFloat(this.articleForm.value.VATAmount.toFixed(2));
    this.articleForm.value.markupPercentage = parseFloat(this.articleForm.value.markupPercentage.toFixed(2));
    this.articleForm.value.markupPrice = parseFloat(this.articleForm.value.markupPrice.toFixed(3));
    this.articleForm.value.salePrice = parseFloat(this.articleForm.value.salePrice.toFixed(2));

    this.article.costPrice = this.articleForm.value.costPrice;
    this.article.VATPercentage = this.articleForm.value.VATPercentage;
    this.article.VATAmount = this.articleForm.value.VATAmount;
    this.article.markupPercentage = this.articleForm.value.markupPercentage;
    this.article.markupPrice = this.articleForm.value.markupPrice;
    this.article.salePrice = this.articleForm.value.salePrice;    
    this.setValuesForm();
  }

  public loadPosDescription(): void {
    if (this.articleForm.value.posDescription === "") {
      let slicePipe = new SlicePipe();
      this.articleForm.value.posDescription = slicePipe.transform(this.articleForm.value.description, 0, 20);
      this.article.posDescription = this.articleForm.value.posDescription;
      this.setValuesForm();
    }
  }

  public setValuesForm(): void {

    if (!this.article._id) this.article._id = "";
    if (!this.article.code) this.article.code = "1";

    let make;
    if (!this.article.make) {
      make = null;
    } else {
      if (this.article.make._id) {
        make = this.article.make._id;
      } else {
        make = this.article.make;
      }
    }

    if (!this.article.description) this.article.description = "";
    if (!this.article.posDescription) this.article.posDescription = "";
    if (!this.article.costPrice) this.article.costPrice = 0.00;
    if (!this.article.VATPercentage) this.article.VATPercentage = 0.00;
    if (!this.article.VATAmount) this.article.VATAmount = 0.00;
    if (!this.article.markupPercentage) this.article.markupPercentage = 0.00;
    if (!this.article.markupPrice) this.article.markupPrice = 0.00;
    if (!this.article.salePrice) this.article.salePrice = 0.00;

    let category;
    if (!this.article.category) {
      category = null;
    } else {
      if (this.article.category._id) {
        category = this.article.category._id;
      } else {
        category = this.article.category;
      }
    }

    if (!this.article.observation) this.article.observation = "";
    if (!this.article.barcode) this.article.barcode = "";
    if (!this.article.type) this.article.type = ArticleType.Counter;

    this.articleForm.setValue({
      '_id': this.article._id,
      'code': this.article.code,
      'make': make,
      'description': this.article.description,
      'posDescription': this.article.posDescription,
      'costPrice': this.article.costPrice,
      'VATPercentage': this.article.VATPercentage,
      'VATAmount': this.article.VATAmount,
      'markupPercentage': this.article.markupPercentage,
      'markupPrice': this.article.markupPrice,
      'salePrice': this.article.salePrice,
      'category': category,
      'observation': this.article.observation,
      'barcode': this.article.barcode,
      'type': this.article.type
    });
  }

  public saveChanges(): void {
    
    this.loading = true;
    
    this._articleService.updateArticle(this.article).subscribe(
      result => {
        if (!result.article) {
          this.showMessage(result.message, "info", true);
        } else {
          this.article = result.article;
          if (this.filesToUpload) {
            this._articleService.makeFileRequest(this.article._id, this.filesToUpload)
              .then(
              (result) => {
                this.resultUpload = result;
                this.article.picture = this.resultUpload.filename;
                this.showMessage("El artículo se ha actualizado con éxito.", "success", false);
                this.activeModal.close('save_close');
              },
              (error) => {
                this.showMessage(error, "danger", false);
              }
              );
          } else {
            this.showMessage("El artículo se ha actualizado con éxito.", "success", false);
            this.activeModal.close('save_close');
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

  public makeFileRequest(files: Array<File>){

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

  public hideMessage():void {
    this.alertMessage = "";
  }
}
