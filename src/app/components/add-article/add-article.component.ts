import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Article } from './../../models/article';
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

  private article: Article;
  private articleForm: FormGroup;
  private makes: Make[] = new Array();
  private categories: Category[] = new Array();
  private alertMessage: any;
  private userType: string;
  private loading: boolean = false;
  private focusEvent = new EventEmitter<boolean>();

  private formErrors = {
    'code': 1,
    'make': '',
    'description': '',
    'salePrice': 0.00,
    'category': '',
    'unitOfMeasure': 'Unidad'
  };

  private validationMessages = {
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
    },
    'unitOfMeasure': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
    private _articleService: ArticleService,
    public _makeService: MakeService,
    public _categoryService: CategoryService,
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
    this.article = new Article ();
    this.buildForm();
    this.getMakes();
    this.getCategories();
    this.getLastArticle();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  private buildForm(): void {

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
      'unitOfMeasure': [this.article.unitOfMeasure, [
          Validators.required
        ]
      ],
      'observation': [this.article.observation, [
        ]
      ],
      'barcode': [this.article.barcode, [
        ]
      ],
    });

    this.articleForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  private onValueChanged(data?: any): void {

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

  private getLastArticle(): void {  

    this._articleService.getLastArticle().subscribe(
        result => {
          let code = 1;
          let category: Category = new Category();
          let make: Make  = new Make();
          if(result.articles){
            if(result.articles[0] !== undefined) {
              code = result.articles[0].code;
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
            'unitOfMeasure': 'Unidad',
            'observation': '',
            'barcode': ''
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

  private getMakes(): void {  

    this._makeService.getMakes().subscribe(
        result => {
          if(!result.makes) {
            this.alertMessage = result.message;
          } else {
            this.alertMessage = null;
            this.makes = result.makes;
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

  private getCategories(): void {  
    
    this._categoryService.getCategories().subscribe(
        result => {
          if(!result.categories) {
            this.alertMessage = result.message;
          } else {
            this.alertMessage = null;
            this.categories = result.categories;
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

  private addArticle(): void {
    this.loading = true;
    this.article = this.articleForm.value;
    this.saveArticle();
  }

  private saveArticle(): void {
    
    this._articleService.saveArticle(this.article).subscribe(
    result => {
        if (!result.article) {
          this.alertMessage = result.message;
        } else {
          this.article = result.article;
          this.alertConfig.type = 'success';
          this.alertMessage = "El artículo se ha añadido con éxito.";      
          this.article = new Article ();
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
