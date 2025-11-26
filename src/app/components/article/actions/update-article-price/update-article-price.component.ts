import { Component, EventEmitter, Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

//model

//service
import { ToastService } from '@shared/components/toast/toast.service';
import { ApiResponse, Category } from '@types';
import { Subject, takeUntil } from 'rxjs';
import { ArticleService } from '../../../../core/services/article.service';
import { Article } from '../../article';

@Component({
  selector: 'app-update-article-price',
  templateUrl: './update-article-price.component.html',
  styleUrls: ['./update-article-price.component.css'],
})
export class UpdateArticlePriceComponent {
  @Input() articles: Article[];
  public updatePriceForm: UntypedFormGroup;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  private destroy$ = new Subject<void>();

  public categories: Category;
  public optionUpdate: string = 'make';
  public decimal = 2;

  constructor(
    public _articleService: ArticleService,
    public _fb: UntypedFormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public _toastService: ToastService
  ) {
    this.updatePriceForm = this._fb.group({
      optionUpdate: [this.optionUpdate, [Validators.required]],
      percentage: [, []],
      field: [, [Validators.required]],
      fieldsIncrease: [, [Validators.required]],
      decimal: [, [Validators.required]],
      amount: [, []],
    });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.focusEvent.complete();
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
      percentage:
        this.updatePriceForm.value.fieldsIncrease === 'percentage' ? this.updatePriceForm.value.percentage : 0,
      field: this.updatePriceForm.value.field,
      decimal: this.updatePriceForm.value.decimal,
      amount: this.updatePriceForm.value.fieldsIncrease === 'amount' ? this.updatePriceForm.value.amount : 0,
    };
    this._articleService
      .updatePrices(query.articlesCode, query.field, query.decimal, query.percentage, query.amount)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }
}
