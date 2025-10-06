import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

//model

//service
import { Category, Make } from '@types';
import { ArticleService } from '../../../../core/services/article.service';
import { Article } from '../../article';

@Component({
  selector: 'app-update-article-price',
  templateUrl: './update-article-price.component.html',
  styleUrls: ['./update-article-price.component.css'],
})
export class UpdateArticlePriceComponent implements OnInit {
  @Input() articles: Article[];
  public updatePriceForm: UntypedFormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public makes: Make;
  public categories: Category;
  public optionUpdate: string = 'make';
  public decimal = 2;

  public formErrors = {
    optionUpdate: '',
    percentage: '',
    field: '',
    decimal: '',
  };

  public validationMessages = {
    optionUpdate: {
      required: 'Este campo es requerido.',
    },
    percentage: {
      required: 'Este campo es requerido.',
    },
    field: {
      required: 'Este campo es requerido.',
    },
    decimal: {
      required: 'Este campo es requerido.',
    },
  };

  constructor(
    public _articleService: ArticleService,
    public _fb: UntypedFormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) {}

  ngOnInit(): void {
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {
    this.updatePriceForm = this._fb.group({
      optionUpdate: [this.optionUpdate, [Validators.required]],
      percentage: [, [Validators.required]],
      field: [, [Validators.required]],
      decimal: [, [Validators.required]],
    });

    this.updatePriceForm.valueChanges.subscribe((data) => this.onValueChanged(data));

    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {
    if (!this.updatePriceForm) {
      return;
    }
    const form = this.updatePriceForm;

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

  public updatePrice(): void {
    this.loading = true;

    let articles: string[] = [];
    if (this.updatePriceForm.value.optionUpdate === 'filter') {
      for (const article of this.articles) {
        articles.push(article.code);
      }
    }
    const query = {
      articlesCode: articles,
      percentage: this.updatePriceForm.value.percentage,
      field: this.updatePriceForm.value.field,
      decimal: this.updatePriceForm.value.decimal,
    };
    this._articleService.updatePrices(query.articlesCode, query.field, query.decimal, query.percentage).subscribe(
      (result) => {
        this.showMessage(result.message, 'success', false);
        this.loading = false;
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
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
    this.alertMessage = '';
  }
}
