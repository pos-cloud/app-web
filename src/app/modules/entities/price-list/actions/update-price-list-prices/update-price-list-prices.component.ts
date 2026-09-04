import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { PriceListArticleService } from '@core/services/price-list-article.service';
import { normalizeApiResponse } from '@core/http';
import { ToastService } from '@shared/components/toast/toast.service';
import { PriceList } from '@types';
import { Subject, takeUntil } from 'rxjs';

import { PipesModule } from 'app/shared/pipes/pipes.module';

/** Tipo de actualización: 1=Monto Fijo, 2=Monto Incremental, 3=Porcentaje Incremental */
export const UPDATE_TYPE = {
  FIXED_AMOUNT: 1,
  INCREMENTAL_AMOUNT: 2,
  INCREMENTAL_PERCENTAGE: 3,
} as const;

const TYPE_OPTIONS = [
  {
    value: UPDATE_TYPE.FIXED_AMOUNT,
    label: 'Monto fijo',
    valueExample: 'Ponés en Valor el precio nuevo. Ejemplo: si escribís 150, todos los precios fijos de la lista pasan a $150.',
  },
  {
    value: UPDATE_TYPE.INCREMENTAL_AMOUNT,
    label: 'Monto incremental',
    valueExample: 'Ponés en Valor cuántos pesos sumar. Ejemplo: un precio fijo de $100, escribís 20 en Valor, y pasa a $120.',
  },
  {
    value: UPDATE_TYPE.INCREMENTAL_PERCENTAGE,
    label: 'Porcentaje incremental',
    valueExample: 'Ponés en Valor el porcentaje a sumar. Ejemplo: cuesta $100, escribís 10 en Valor, y pasa a $110.',
  },
] as const;

@Component({
  selector: 'app-update-price-list-prices',
  templateUrl: './update-price-list-prices.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, PipesModule, NgbTooltipModule],
})
export class UpdatePriceListPricesComponent implements OnDestroy {
  @Input() priceList: PriceList;

  form: UntypedFormGroup;
  loading = false;
  private destroy$ = new Subject<void>();

  readonly typeOptions = TYPE_OPTIONS;
  readonly decimalOptions = [0, 1, 2];

  constructor(
    private priceListArticleService: PriceListArticleService,
    private fb: UntypedFormBuilder,
    public activeModal: NgbActiveModal,
    private toastService: ToastService
  ) {
    this.form = this.fb.group({
      type: [null, Validators.required],
      decimal: [2, Validators.required],
      amount: [null, Validators.required],
    });
  }

  getTypeTooltip(): string {
    return this.typeOptions.map((o) => `${o.label}: ${o.valueExample}`).join(' | ');
  }

  getValueExample(): string | null {
    const type = this.form.get('type')?.value;
    if (type == null) return null;
    return this.typeOptions.find((o) => o.value === type)?.valueExample ?? null;
  }

  isAmountInCurrency(): boolean {
    const type = this.form.get('type')?.value;
    return type === UPDATE_TYPE.FIXED_AMOUNT || type === UPDATE_TYPE.INCREMENTAL_AMOUNT;
  }

  getAmountPrefix(): string | null {
    const type = this.form.get('type')?.value;
    if (type == null) return null;
    return this.isAmountInCurrency() ? '$' : '%';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updatePrice(): void {
    if (this.form.invalid || !this.priceList?._id) return;

    this.loading = true;
    const { type, decimal, amount } = this.form.value;
    const payload = {
      priceListId: this.priceList._id,
      type: Number(type),
      decimal: Number(decimal),
      amount: Number(amount),
    };

    this.priceListArticleService
      .updatePrices(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          const response = normalizeApiResponse(result);
          if (response?.ok) {
            this.toastService.showToast(null, 'success', '', response.body.message);
            this.activeModal.close('success');
          } else {
            this.toastService.showToast(null, 'danger', '', response?.body.message ?? 'Algo salió mal.');
            this.loading = false;
          }
        },
        error: (error) => {
          const response = normalizeApiResponse(error);
          this.toastService.showToast(null, 'danger', '', response?.body.message ?? 'Algo salió mal.');
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        },
      });
  }
}
