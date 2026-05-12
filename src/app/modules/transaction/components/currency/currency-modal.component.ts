import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { CurrencyService } from '@core/services/currency.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '@shared/components/toast/toast.service';
import { Currency } from '@types';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-currency-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './currency-modal.component.html',
})
export class CurrencyModalComponent implements OnInit {
  public currencies: Currency[] = [];
  @Input() currentCurrencyId: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    public activeModal: NgbActiveModal,
    private _currencyService: CurrencyService,
    private _toastService: ToastService
  ) {}
  ngOnInit(): void {
    combineLatest({
      currencies: this._currencyService.find({ query: { operationType: { $ne: 'D' } } }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ currencies }) => {
          this.currencies = currencies || [];
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {},
      });
  }

  public selectCurrency(currency: Currency): void {
    this.activeModal.close(currency);
  }
}
