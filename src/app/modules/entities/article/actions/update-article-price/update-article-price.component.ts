import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ArticleService } from '@core/services/article.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { ApiResponse, Article } from '@types';
import { Subject, takeUntil } from 'rxjs';

import { PipesModule } from 'app/shared/pipes/pipes.module';

/** Tipo de actualización: 1=Monto Fijo, 2=Monto Incremental, 3=Porcentaje Incremental, 4=Porcentaje Fijo */
export const UPDATE_TYPE = {
  FIXED_AMOUNT: 1,
  INCREMENTAL_AMOUNT: 2,
  INCREMENTAL_PERCENTAGE: 3,
  FIXED_PERCENTAGE: 4,
} as const;

const FIELD_OPTIONS = [
  { value: 'basePrice', label: 'Precio Base' },
  { value: 'salePrice', label: 'Precio de Venta' },
  { value: 'markupPercentage', label: 'Margen %' },
] as const;

const TYPE_OPTIONS = {
  basePrice: [
    {
      value: UPDATE_TYPE.FIXED_AMOUNT,
      label: 'Monto fijo',
      valueExample:
        'Ponés en Valor el precio nuevo que querés. Ejemplo: si escribís 150, todos pasan a costar $150.',
    },
    {
      value: UPDATE_TYPE.INCREMENTAL_AMOUNT,
      label: 'Monto incremental',
      valueExample:
        'Ponés en Valor cuántos pesos sumar. Ejemplo: un producto cuesta $100, escribís 20 en Valor, y pasa a $120.',
    },
    {
      value: UPDATE_TYPE.INCREMENTAL_PERCENTAGE,
      label: 'Porcentaje incremental',
      valueExample:
        'Ponés en Valor el porcentaje que querés sumar. Ejemplo: cuesta $100, escribís 10 en Valor, y pasa a $110.',
    },
  ],
  salePrice: [
    {
      value: UPDATE_TYPE.FIXED_AMOUNT,
      label: 'Monto fijo',
      valueExample:
        'Ponés en Valor el precio nuevo. Ejemplo: si escribís 250, todos los precios de venta pasan a $250.',
    },
    {
      value: UPDATE_TYPE.INCREMENTAL_AMOUNT,
      label: 'Monto incremental',
      valueExample:
        'Ponés en Valor cuántos pesos sumar al precio. Ejemplo: cuesta $200, escribís 25 en Valor, pasa a $225.',
    },
    {
      value: UPDATE_TYPE.INCREMENTAL_PERCENTAGE,
      label: 'Porcentaje incremental',
      valueExample:
        'Ponés en Valor el % a sumar. Ejemplo: cuesta $200, escribís 15 en Valor, pasa a $230.',
    },
  ],
  markupPercentage: [
    {
      value: UPDATE_TYPE.INCREMENTAL_PERCENTAGE,
      label: 'Porcentaje incremental',
      valueExample:
        'Ponés en Valor el % a sumar al margen actual. Ejemplo: tiene 30%, escribís 5 en Valor, pasa a 35%.',
    },
    {
      value: UPDATE_TYPE.FIXED_PERCENTAGE,
      label: 'Porcentaje fijo',
      valueExample:
        'Ponés en Valor el nuevo margen. Ejemplo: escribís 40 en Valor y todos pasan a tener 40% de margen.',
    },
  ],
} as const;

@Component({
  selector: 'app-update-article-price',
  templateUrl: './update-article-price.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, PipesModule, NgbTooltipModule],
})
export class UpdateArticlePriceComponent {
  @Input() articles: Article[] = [];

  form: UntypedFormGroup;
  loading = false;
  private destroy$ = new Subject<void>();

  readonly fieldOptions = FIELD_OPTIONS;
  readonly updateType = UPDATE_TYPE;
  readonly decimalOptions = [0, 1, 2];

  constructor(
    private articleService: ArticleService,
    private fb: UntypedFormBuilder,
    public activeModal: NgbActiveModal,
    private toastService: ToastService
  ) {
    this.form = this.fb.group({
      optionUpdate: ['all', Validators.required],
      field: [null, Validators.required],
      type: [null, Validators.required],
      decimal: [2, Validators.required],
      amount: [null, Validators.required],
    });

    this.form.get('field')?.valueChanges.subscribe((field) => {
      const typeControl = this.form.get('type');
      const currentType = typeControl?.value;
      const validTypes = this.getTypeOptionsForField(field).map((t) => t.value);
      if (currentType != null && !validTypes.includes(currentType)) {
        typeControl?.setValue(null);
      }
    });
  }

  getTypeOptionsForField(field: string) {
    const key = field as keyof typeof TYPE_OPTIONS;
    return TYPE_OPTIONS[key] ?? [];
  }

  getTypeTooltip(): string {
    const field = this.form.get('field')?.value;
    if (!field) return 'Selecciona primero el campo a actualizar';
    const opts = this.getTypeOptionsForField(field);
    return opts.length
      ? opts.map((o) => `${o.label}: ${(o as { valueExample: string }).valueExample}`).join(' | ')
      : 'Selecciona el campo primero';
  }

  /** Ejemplo explicativo para el input Valor, debajo del mismo. Referencia "Valor" explícitamente. */
  getValueExample(): string | null {
    const field = this.form.get('field')?.value;
    const type = this.form.get('type')?.value;
    if (!field || type == null) return null;
    const opts = this.getTypeOptionsForField(field) as { value: number; valueExample: string }[];
    const opt = opts.find((o) => o.value === type);
    return opt?.valueExample ?? null;
  }

  isAmountInCurrency(): boolean {
    const type = this.form.get('type')?.value;
    return type === UPDATE_TYPE.FIXED_AMOUNT || type === UPDATE_TYPE.INCREMENTAL_AMOUNT;
  }

  /** Prefijo del input: $ para montos, % para porcentajes. Null si no hay tipo seleccionado. */
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
    if (this.form.invalid) return;

    this.loading = true;
    const { optionUpdate, field, type, decimal, amount } = this.form.value;

    const articlesCode: string[] =
      optionUpdate === 'filter' && this.articles?.length ? this.articles.map((a) => a.code) : [];

    const payload = { articlesCode, field, type, decimal, amount };

    this.articleService
      .updatePrices(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.toastService.showToast(result);
          this.activeModal.close('success');
        },
        error: (error) => {
          this.toastService.showToast(error);
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        },
      });
  }
}
