import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

import { MovementOfArticle } from 'app/components/movement-of-article/movement-of-article';
import { PaymentMethod } from 'app/components/payment-method/payment-method';
import { Transaction } from 'app/components/transaction/transaction';

@Component({
  selector: 'app-pos-sale-lines',
  templateUrl: './pos-sale-lines.component.html',
  styleUrls: ['./pos-sale-lines.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PosSaleLinesComponent {
  @ViewChild('linesScrollContainer') linesScrollContainer?: ElementRef<HTMLElement>;

  @Input() transaction: Transaction;
  @Input() movementsOfArticles: MovementOfArticle[] = [];
  @Input() loading = false;
  @Input() areMovementsOfArticlesEmpty = true;
  @Input() transactionMovement = '';
  @Input() quantity = 0;
  @Input() totalTaxesBase = 0;
  @Input() totalTaxesAmount = 0;
  @Input() m3 = 0;
  @Input() weight = 0;

  @Output() lineClick = new EventEmitter<MovementOfArticle>();
  @Output() changeTaxesClick = new EventEmitter<void>();
  @Output() chargeClick = new EventEmitter<PaymentMethod | null>();
  @Output() addClientClick = new EventEmitter<void>();
  @Output() applyDiscountClick = new EventEmitter<void>();
  @Output() cancelClick = new EventEmitter<void>();
  @Output() finishClick = new EventEmitter<void>();

  scrollToEnd(): void {
    const el = this.linesScrollContainer?.nativeElement;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }

  onLineClick(movement: MovementOfArticle, event?: Event): void {
    event?.stopPropagation();
    if (this.loading) return;
    this.lineClick.emit(movement);
  }

  onChangeTaxesClick(event?: Event): void {
    event?.stopPropagation();
    if (this.loading) return;
    this.changeTaxesClick.emit();
  }

  onChargeClick(fastPayment: PaymentMethod | null, event?: Event): void {
    event?.stopPropagation();
    if (this.loading) return;
    this.chargeClick.emit(fastPayment);
  }

  onAddClientClick(event?: Event): void {
    event?.stopPropagation();
    if (this.loading) return;
    this.addClientClick.emit();
  }

  onApplyDiscountClick(event?: Event): void {
    event?.stopPropagation();
    if (this.loading) return;
    this.applyDiscountClick.emit();
  }

  onCancelClick(event?: Event): void {
    event?.stopPropagation();
    if (this.loading) return;
    this.cancelClick.emit();
  }

  onFinishClick(event?: Event): void {
    event?.stopPropagation();
    if (this.loading) return;
    this.finishClick.emit();
  }

  getLineUnitPrice(movement: MovementOfArticle): number {
    const priceType = this.transaction?.type?.showPriceType?.toString();
    const amount = movement.amount > 0 ? movement.amount : 1;

    if (priceType === 'Precio Base') {
      return movement.basePrice / amount;
    }
    if (priceType === 'Precio Sin Impuestos') {
      const taxAmount =
        movement.taxes && movement.taxes.length > 0 ? movement.taxes[0]?.taxAmount ?? 0 : 0;
      return movement.unitPrice - taxAmount / amount;
    }
    return movement.unitPrice;
  }

  getLineTotalPrice(movement: MovementOfArticle): number {
    const priceType = this.transaction?.type?.showPriceType?.toString();

    if (priceType === 'Precio Base') {
      return movement.basePrice;
    }
    if (priceType === 'Precio Sin Impuestos') {
      const taxAmount =
        movement.taxes && movement.taxes.length > 0 ? movement.taxes[0]?.taxAmount ?? 0 : 0;
      return movement.salePrice - taxAmount;
    }
    return movement.salePrice;
  }

  getLineUnitPriceBeforeDiscount(movement: MovementOfArticle): number {
    const amount = movement.amount > 0 ? movement.amount : 1;
    return this.getLineUnitPrice(movement) + movement.transactionDiscountAmount / amount;
  }

  getLineTotalPriceBeforeDiscount(movement: MovementOfArticle): number {
    return this.getLineTotalPrice(movement) + movement.transactionDiscountAmount;
  }
}
