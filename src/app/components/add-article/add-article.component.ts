import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Article } from './../../models/article';

import { ArticleService } from './../../services/article.service';

@Component({
  selector: 'app-add-article',
  templateUrl: './add-article.component.html',
  styleUrls: ['./add-article.component.css'],
  providers: [NgbAlertConfig]
})

export class AddArticleComponent  implements OnInit {

  private article: Article;
  private articleForm: FormGroup;
  private alertMessage: any;
  private userType: string;
  private loading: boolean = false;

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
    private _fb: FormBuilder,
    private _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
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
  }

  private buildForm(): void {

    this.articleForm = this._fb.group({
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
  }

  private onValueChanged(data?: any): void {

    if (!this.articleForm) { return; }
    const form = this.articleForm;

    for (const field in this.formErrors) {
      // clear previous error message (if any)
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

  private addArticle(): void {
    this.loading = true;
    this.article = this.articleForm.value;
    this.saveArticle();
  }

  private saveArticle(): void {
    
    this._articleService.saveArticle(this.article).subscribe(
    result => {
        if (!this.article) {
          this.alertMessage = 'Ha ocurrido un error al querer crear el artículo.';
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
