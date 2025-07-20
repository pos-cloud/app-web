import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { finalize, Subject, takeUntil } from 'rxjs';
import { BusinessRuleService } from '../../../../core/services/business-rule.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-apply-business-rule',
  templateUrl: './apply-business-rule.component.html',
  standalone: true,
  imports: [CommonModule, NgbModule, FormsModule],
})
export class ApplyBusinessRuleComponent implements OnInit, OnDestroy {
  @Input() transactionId: string = '';

  public businessRulesCode: string = '';
  public loading: boolean = false;
  public applyingAll: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    public activeModal: NgbActiveModal,
    private _businessRulesService: BusinessRuleService,
    private _toastService: ToastService
  ) {}

  ngOnInit() {
    // Inicialización del componente
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applySpecificRule() {
    if (!this.businessRulesCode || this.businessRulesCode.trim() === '') {
      this._toastService.showToast({
        message: 'Debe ingresar un código de regla de negocio',
        type: 'warning',
      });
      return;
    }

    this.loading = true;
    this.applyingAll = false;

    this._businessRulesService
      .apply(this.businessRulesCode, this.transactionId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (result) => {
          this._toastService.showToast(result);

          if (result.status === 200) {
            this.activeModal.close({
              success: true,
              message: 'Regla de negocio aplicada correctamente',
              type: 'specific',
            });
          } else {
            this.activeModal.close({
              success: false,
              message: result.message || 'Error al aplicar la regla de negocio',
              type: 'specific',
            });
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
          this.activeModal.close({
            success: false,
            message: 'Error al aplicar la regla de negocio',
            type: 'specific',
          });
        },
      });
  }

  applyAllRules() {
    this.loading = true;
    this.applyingAll = true;

    this._businessRulesService
      .applyAll(this.transactionId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (result) => {
          this._toastService.showToast(result);

          if (result.status === 200) {
            this.activeModal.close({
              success: true,
              message: 'Todas las reglas de negocio aplicadas correctamente',
              type: 'all',
            });
          } else {
            this.activeModal.close({
              success: false,
              message: result.message || 'Error al aplicar las reglas de negocio',
              type: 'all',
            });
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
          this.activeModal.close({
            success: false,
            message: 'Error al aplicar las reglas de negocio',
            type: 'all',
          });
        },
      });
  }

  cancel() {
    this.activeModal.close('cancel');
  }
}
