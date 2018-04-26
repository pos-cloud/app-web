import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';

import { ArticleStock } from './../../models/article-stock';

import { ArticleStockService } from './../../services/article-stock.service';

@Component({
  selector: 'app-add-article-stock',
  templateUrl: './add-article-stock.component.html',
  styleUrls: ['./add-article-stock.component.css'],
  providers: [NgbAlertConfig]
})

export class AddArticleStockComponent implements OnInit {

  public articleStock: ArticleStock;
  public articleStockForm: FormGroup;
  public alertMessage: string = "";
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'article': ''
  };

  public validationMessages = {
    'article': {
      'required': 'Este campo es requerido.'
    }
  };

  constructor(
    public _articleStockService: ArticleStockService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

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

  public addArticleStock(): void {

    this.articleStock = this.articleStockForm.value;
    this.saveArticleStock();
  }

  public saveArticleStock(): void {

    this.loading = true;

    this._articleStockService.saveArticleStock(this.articleStock).subscribe(
      result => {
        if (!result.articleStock) {
          this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.articleStock = result.articleStock;
          this.showMessage("La marca se ha añadido con éxito.", "success", true);
          this.articleStock = new ArticleStock();
          this.buildForm();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
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