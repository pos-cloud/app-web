import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { combineLatest, Subject, takeUntil } from 'rxjs';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import * as printJS from 'print-js';

import { ApiResponse, Category, Make, PriceList, PrintType } from '@types';

import { PrintService } from '@core/services/print.service';
import { MultiSelectDropdownComponent } from '@shared/components/multi-select-dropdown/multi-select-dropdown.component';
import { ToastService } from '@shared/components/toast/toast.service';
import { PipesModule } from '@shared/pipes/pipes.module';
import { MakeService } from 'app/core/services/make.service';
import { PriceListService } from 'app/core/services/price-list.service';
import { CategoryService } from '../../../../core/services/category.service';

@Component({
  selector: 'app-print-price-list',
  templateUrl: './print-price-list.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, PipesModule, TranslateModule, MultiSelectDropdownComponent],
})
export class PrintPriceListComponent implements OnInit {
  private destroy$ = new Subject<void>();

  public loading: boolean = false;
  public makes: Make[];
  public categories: Category[];
  public priceLists: PriceList[];

  public filters = {
    makes: [],
    categories: [],
    priceList: '',
    image: 'false',
  };

  constructor(
    public activeModal: NgbActiveModal,
    private _makeService: MakeService,
    private _categoryService: CategoryService,
    private _priceListService: PriceListService,
    private _printService: PrintService,
    private _toastService: ToastService
  ) {}

  ngOnInit(): void {
    combineLatest({
      categories: this._categoryService.find({ query: { operationType: { $ne: 'D' } } }),
      makes: this._makeService.find({ query: { operationType: { $ne: 'D' } } }),
      priceLists: this._priceListService.find({ query: { operationType: { $ne: 'D' } } }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ categories, makes, priceLists }) => {
          this.categories = categories || [];
          this.makes = makes || [];
          this.priceLists = priceLists || [];
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public toPrint(): void {
    this.loading = true;

    const filters = {
      ...this.filters,
      image: this.filters.image == 'true' ? true : false,
    };

    this._printService
      .toPrint(PrintType.PriceList, filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: Blob | ApiResponse) => {
          if (!result) {
            this._toastService.showToast({ message: 'Error al generar el PDF' });
            return;
          }
          if (result instanceof Blob) {
            try {
              const blobUrl = URL.createObjectURL(result);
              printJS(blobUrl);
            } catch (e) {
              this._toastService.showToast({ message: 'Error al generar el PDF' });
            }
          } else {
            this._toastService.showToast(result);
          }
        },
        error: (error) => {
          this._toastService.showToast({ message: 'Error al generar el PDF' });
        },
        complete: () => {
          this.loading = false;
        },
      });
  }
}
