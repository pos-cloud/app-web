import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';

import { Article } from '../../article/article';
import { ArticleStock } from '../article-stock';

import { ArticleStockService } from '../article-stock.service';

@Component({
  selector: 'app-add-article-stock',
  templateUrl: './add-article-stock.component.html',
  styleUrls: ['./add-article-stock.component.css'],
  providers: [NgbAlertConfig]
})

export class AddArticleStockComponent implements OnInit {

  public articleStock: ArticleStock;
  @Input() article: Article;
  public articleStockForm: FormGroup;
  public alertMessage = '';
  public userType: string;
  public loading = false;
  public focusEvent = new EventEmitter<boolean>();
  @Output() eventAddStock: EventEmitter<ArticleStock> = new EventEmitter<ArticleStock>();

  public formErrors = {
    'article': '',
    'realStock': '',
    'minStock': ''
  };

  public validationMessages = {
    'article': {
      'required': 'Este campo es requerido.'
    },
    'realStock': {
      'required': 'Este campo es requerido.'
    },
    'minStock': {
      'required': 'Este campo es requerido.'
    }
  };

  constructor(
    public _articleStockService: ArticleStockService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) {
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.articleStock = new ArticleStock();
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.articleStockForm = this._fb.group({
      'article': [this.articleStock.article, [
          Validators.required
        ]
      ],
      'realStock': [this.articleStock.realStock, [
          Validators.required
        ]
      ],
      'minStock': [this.articleStock.minStock, [
          Validators.required
        ]
      ],
    });

    this.articleStockForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.articleStockForm) { return; }
    const form = this.articleStockForm;

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

  public addStock() {
    this.articleStock = this.articleStockForm.value;
    this.eventAddStock.emit(this.articleStock);
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }
}
