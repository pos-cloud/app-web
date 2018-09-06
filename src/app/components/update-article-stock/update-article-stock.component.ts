import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';

import { Article } from './../../models/article';
import { ArticleStock } from './../../models/article-stock';

import { ArticleStockService } from './../../services/article-stock.service';

@Component({
  selector: 'app-update-article-stock',
  templateUrl: './update-article-stock.component.html',
  styleUrls: ['./update-article-stock.component.css'],
  providers: [NgbAlertConfig]
})

export class UpdateArticleStockComponent implements OnInit {

  @Input() articleStock: ArticleStock;
  @Input() article: Article;
  public articleStockForm: FormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  @Output() eventUpdateStock: EventEmitter<ArticleStock> = new EventEmitter<ArticleStock>();

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
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.articleStockForm = this._fb.group({
      '_id': [this.articleStock._id, [
        ]
      ],
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

  public setValueForm() {
    
    if (!this.articleStock.article) this.articleStock.article = new Article();
    if (!this.articleStock.realStock) this.articleStock.realStock = 0.00;
    if (!this.articleStock.minStock) this.articleStock.minStock = 0.00;

    this.articleStockForm.setValue({
      'article': this.articleStock.article._id,
      'realStock': this.articleStock.realStock,
      'minStock': this.articleStock.minStock
    });
  }

  public updateStock(): void {
    this.articleStock = this.articleStockForm.value;
    this.eventUpdateStock.emit(this.articleStock);
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