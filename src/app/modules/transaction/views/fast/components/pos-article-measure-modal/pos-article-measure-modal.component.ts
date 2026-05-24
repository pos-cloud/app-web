import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Article } from 'app/components/article/article';

@Component({
  selector: 'app-pos-article-measure-modal',
  templateUrl: './pos-article-measure-modal.component.html',
  styleUrls: ['./pos-article-measure-modal.component.scss'],
})
export class PosArticleMeasureModalComponent implements OnInit {
  @Input() article!: Article;

  amount = 1;

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    const qpm = Number(this.article?.quantityPerMeasure);
    if (qpm > 0) {
      this.amount = qpm;
    }
  }

  get articleLabel(): string {
    return this.article?.posDescription || this.article?.description || this.article?.code || '';
  }

  get unitLabel(): string {
    const u = this.article?.unitOfMeasurement as { description?: string } | undefined;
    return u?.description?.trim() || '';
  }

  confirm(): void {
    const quantity = Number(this.amount);
    if (!quantity || quantity <= 0 || isNaN(quantity)) {
      return;
    }
    const unitSale = Number(this.article?.salePrice) || 0;
    this.activeModal.close({
      quantity,
      salePrice: unitSale,
    });
  }

  dismiss(): void {
    this.activeModal.dismiss();
  }
}
