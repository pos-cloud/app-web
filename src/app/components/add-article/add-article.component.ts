import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import {NgbAlertConfig} from '@ng-bootstrap/ng-bootstrap';

import { CustomValidation } from './../../utilities/custom-validation';

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
  private errorMessage;
  private userType: string;

  private formErrors = {
    'code': 0,
    'make': '',
    'description': '',
    'salePrice': 0.00,
    'category': '',
    'unitOfMeasure': 'Unidad'
  };

  private validationMessages = {
    'code': {
      'required':       'Este campo es requerido.' 
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
    private _route: ActivatedRoute,
    alertConfig: NgbAlertConfig
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

  ngOnInit() {

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
          Validators.required
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
      'barcode': [this.article.barcode, [
        ]
      ],
    });

    this.articleForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  private onValueChanged(data?: any) {

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

  private addArticle (): void {

    if(!this.articleExists()) {
      this.article = this.articleForm.value;
      this.saveArticle();
    } else {
      this.errorMessage = "El código del artículo ya existe.";
    }
  }

  private articleExists(): boolean {
    
        console.log("existe");
    let articleExist: boolean;

    this._route.params.forEach ((params: Params) => {

      let id = params['id'];

      this._articleService.getArticle(id).subscribe(
        result => {
          this.article = result.article;

          if (!this.article) {
            articleExist = false;
          } else {
            articleExist = true;
          }
        },
        error => {
        console.log("error al get");
        this.errorMessage = <any> error;
        if(!this.errorMessage) {
            this.errorMessage = 'Ha ocurrido un error al conectarse con el servidor.';
          }
        }
      );
    });
    return articleExist;
  }

  private saveArticle(): void {
        console.log("guarda");
    this._articleService.saveArticle(this.article).subscribe(
    result => {
        if (!this.article) {
          this.errorMessage = 'Ha ocurrido un error al querer crear el artículo.';
        } else {
          this.article = result.article;
          this.buildForm();
        }
      },
      error => {
        console.log("error al guardar");
        this.errorMessage = <any> error;
        if(!this.errorMessage) {
            this.errorMessage = 'Ha ocurrido un error al conectarse con el servidor.';
        }
      }
    );
  }
}
