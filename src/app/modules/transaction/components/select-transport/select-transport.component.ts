import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { NgbActiveModal, NgbAlertConfig, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Transport } from '@types';
import { TransportService } from 'app/core/services/transport.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-select-transport',
  templateUrl: './select-transport.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbModule],
})
export class SelectTransportComponent implements OnInit, OnDestroy {
  public transportForm: UntypedFormGroup;
  public transports: Transport[] = [];
  public transportSelected: Transport;
  public alertMessage = '';
  public loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    public _fb: UntypedFormBuilder,
    public _transportService: TransportService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) {}

  ngOnInit() {
    this.buildForm();
    this.getTransports();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public buildForm(): void {
    this.transportForm = this._fb.group({
      transport: [, []],
      declaredValue: [, []],
      package: [, []],
    });
  }

  public getTransports(): void {
    this.loading = true;
    this._transportService
      .find({
        project: { name: 1 },
        query: { operationType: { $ne: 'D' } },
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result) {
            this.transports = result;
            if (this.transports.length > 0) {
              this.transportSelected = this.transports[0];
              this.transportForm.patchValue({ transport: this.transportSelected._id });
            }
          } else {
            this.showMessage('No se encontraron transportes.', 'info', false);
          }
          this.loading = false;
        },
        error: (error) => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        },
      });
  }

  public onTransportChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const transportId = select.value;
    this.transportSelected = this.transports.find((t) => t._id === transportId);
  }

  public selectTransport(): void {
    if (this.transportForm.valid) {
      this.activeModal.close({
        transport: this.transportSelected,
        declaredValue: this.transportForm.value.declaredValue,
        package: this.transportForm.value.package,
      });
    } else {
      this.showMessage('Por favor complete todos los campos requeridos.', 'info', true);
    }
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
