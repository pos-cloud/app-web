import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { TransactionMovement } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { FeArService } from '../../../../core/services/fe-ar.service';

@Component({
  selector: 'app-export-iva-arca',
  templateUrl: './export-iva-arca.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule, TranslateModule, PipesModule],
})
export class ExportIvaArcaComponent implements OnInit {
  @Input() transactionMovement: TransactionMovement = TransactionMovement.Sale;
  public exportIvaArcaForm!: UntypedFormGroup;
  public loading: boolean = false;
  public months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

  constructor(
    public _fb: UntypedFormBuilder,
    public activeModal: NgbActiveModal,
    public _feArService: FeArService,
    private _toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  public buildForm(): void {
    const previousMonthDate = new Date();
    previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);

    this.exportIvaArcaForm = this._fb.group({
      month: [String(previousMonthDate.getMonth() + 1).padStart(2, '0'), [Validators.required]],
      year: [
        String(previousMonthDate.getFullYear()),
        [Validators.required, Validators.minLength(4), Validators.maxLength(4), Validators.pattern(/^\d{4}$/)],
      ],
    });
  }

  public exportZip(): void {
    if (this.exportIvaArcaForm.invalid) {
      this.exportIvaArcaForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const VATPeriod = this.exportIvaArcaForm.value.year + this.exportIvaArcaForm.value.month;
    const fallbackFilename = `${this.exportIvaArcaForm.value.year}-${this.exportIvaArcaForm.value.month}.zip`;

    this._feArService.exportIva(VATPeriod, this.transactionMovement).subscribe({
      next: async (response) => {
        try {
          const result = response.body;
          if (!result) {
            this._toastService.showToast({ message: 'Error al generar el ZIP.' });
            this.loading = false;
            return;
          }

          if (result.type?.includes('json')) {
            const text = await result.text();
            this._toastService.showToast(JSON.parse(text));
            this.loading = false;
            return;
          }

          const filename =
            this.getFilenameFromDisposition(response.headers.get('Content-Disposition')) || fallbackFilename;
          const zipBlob = new Blob([result], { type: 'application/zip' });

          const blobUrl = URL.createObjectURL(zipBlob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(blobUrl);
          this._toastService.showToast({ message: 'El archivo ZIP se generó correctamente.', type: 'success' });
          this.activeModal.close('export');
        } catch {
          this._toastService.showToast({ message: 'Error al generar el ZIP.' });
        }
        this.loading = false;
      },
      error: (error) => {
        if (error?.status >= 400) {
          this._toastService.showToast(error);
        } else if (error?.message) {
          this._toastService.showToast({ message: error.message, type: 'danger' });
        } else {
          this._toastService.showToast({ message: 'Error al exportar IVA ARCA.' });
        }
        this.loading = false;
      },
    });
  }

  private getFilenameFromDisposition(contentDisposition: string | null): string | null {
    if (!contentDisposition) {
      return null;
    }

    const match = /filename="?([^"]+)"?/i.exec(contentDisposition);
    return match?.[1] ?? null;
  }
}
