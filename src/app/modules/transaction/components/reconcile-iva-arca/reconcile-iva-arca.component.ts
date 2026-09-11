import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { FeArService, IvaReconcileItem, IvaReconcileResult } from '../../../../core/services/fe-ar.service';

@Component({
  selector: 'app-reconcile-iva-arca',
  templateUrl: './reconcile-iva-arca.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule, TranslateModule, PipesModule],
})
export class ReconcileIvaArcaComponent implements OnInit {
  public form!: UntypedFormGroup;
  public loading = false;
  public months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  public result: IvaReconcileResult | null = null;

  constructor(
    public _fb: UntypedFormBuilder,
    public activeModal: NgbActiveModal,
    public _feArService: FeArService,
    private _toastService: ToastService
  ) {}

  ngOnInit(): void {
    const previousMonthDate = new Date();
    previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);

    this.form = this._fb.group({
      month: [String(previousMonthDate.getMonth() + 1).padStart(2, '0'), [Validators.required]],
      year: [
        String(previousMonthDate.getFullYear()),
        [Validators.required, Validators.minLength(4), Validators.maxLength(4), Validators.pattern(/^\d{4}$/)],
      ],
    });
  }

  public reconcile(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const fileInput = document.getElementById('reconcileIvaFile') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) {
      this._toastService.showToast({ message: 'Seleccioná el Excel de Mis Comprobantes Emitidos.' });
      return;
    }

    this.loading = true;
    this.result = null;
    const VATPeriod = this.form.value.year + this.form.value.month;

    this._feArService.reconcileIva(VATPeriod, file).subscribe({
      next: (response) => {
        if (response?.status === 200 && response.result) {
          this.result = response.result as IvaReconcileResult;
          this._toastService.showToast(
            null,
            'success',
            '',
            `Reconciliación lista: ${this.result.updated.length} actualizadas, ${this.result.created.length} creadas, ${this.result.unchanged.length} sin cambios, ${this.result.errors.length} errores.`
          );
        } else {
          this._toastService.showToast(response?.error || response);
        }
        this.loading = false;
      },
      error: (error) => {
        this._toastService.showToast(error?.error || error);
        this.loading = false;
      },
    });
  }

  public labelFor(item: IvaReconcileItem): string {
    const number = item.origin != null && item.letter && item.number != null ? `${item.origin}-${item.letter}-${item.number}` : '';
    return [item.cae, number].filter(Boolean).join(' · ');
  }
}
