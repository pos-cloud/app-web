import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { FeArService } from '../../../../core/services/fe-ar.service';

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
      this._toastService.showToast(null, 'warning', '', 'Seleccioná el Excel de Mis Comprobantes Emitidos.');
      return;
    }

    this.loading = true;
    const VATPeriod = this.form.value.year + this.form.value.month;

    this._feArService.reconcileIva(VATPeriod, file).subscribe({
      next: (response) => {
        if (response?.status === 200) {
          this._toastService.showToast(
            null,
            'success',
            '',
            response.message ||
              'La reconciliación corre en segundo plano. Te avisamos por notificación cuando termine.'
          );
          this.activeModal.close('queued');
        } else {
          this._toastService.showToast(response?.error || response);
          this.loading = false;
        }
      },
      error: (error) => {
        this._toastService.showToast(error?.error || error);
        this.loading = false;
      },
    });
  }
}
