import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { PriceListService } from '@core/services/price-list.service';
import { NgbActiveModal, NgbAlertConfig, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PriceList } from '@types';
import { AuthService } from 'app/core/services/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-select-price-list',
  templateUrl: './select-price-list.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbModule],
})
export class SelectPriceListComponent implements OnInit, OnDestroy {
  public priceListForm: UntypedFormGroup;
  public priceLists: PriceList[] = [];
  public priceListSelected: PriceList;
  public alertMessage = '';
  public loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    public _fb: UntypedFormBuilder,
    public _priceListService: PriceListService,
    public _authService: AuthService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) {}

  ngOnInit() {
    this.buildForm();
    this.getPriceLists();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public buildForm(): void {
    this.priceListForm = this._fb.group({
      priceList: [, []],
    });
  }

  public getPriceLists(): void {
    this.loading = true;
    this._priceListService
      .find({
        query: { operationType: { $ne: 'D' } },
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result) {
            this.priceLists = result;
            if (this.priceLists.length > 0) {
              this.priceListSelected = this.priceLists[0];
              this.priceListForm.patchValue({ priceList: this.priceListSelected._id });
            }
          } else {
            this.showMessage('No se encontraron listas de precios.', 'info', false);
          }
          this.loading = false;
        },
        error: (error) => {
          this.showMessage(error._body || 'Error al cargar las listas de precios.', 'danger', false);
          this.loading = false;
        },
      });
  }

  public onPriceListChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const priceListId = select.value;
    this.priceListSelected = this.priceLists.find((p) => p._id === priceListId);
  }

  public selectPriceList(): void {
    if (this.priceListForm.valid && this.priceListSelected) {
      this.activeModal.close({ priceList: this.priceListSelected });
    } else {
      this.showMessage('Por favor seleccione una lista de precios.', 'info', true);
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
