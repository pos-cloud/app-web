import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

//model
import { ApiResponse, Make, PrintType } from '@types';
import { Category } from '../../../category/category';

//service
import { CommonModule } from '@angular/common';
import { PrintService } from '@core/services/print.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { PriceList } from 'app/components/price-list/price-list';
import { MakeService } from 'app/core/services/make.service';
import { PriceListService } from 'app/core/services/price-list.service';
import * as printJS from 'print-js';
import { Subject, takeUntil } from 'rxjs';
import { CategoryService } from '../../../../core/services/category.service';

@Component({
  selector: 'app-print-price-list',
  templateUrl: './print-price-list.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class PrintPriceListComponent {
  private destroy$ = new Subject<void>();

  public printPriceListForm: UntypedFormGroup;
  public loading: boolean = false;
  public makes: Make;
  public categories: Category;
  public priceLists: PriceList[];

  constructor(
    private _fb: UntypedFormBuilder,
    public activeModal: NgbActiveModal,
    private _makeService: MakeService,
    private _categoryService: CategoryService,
    private _priceList: PriceListService,
    private _printService: PrintService,
    private _toastService: ToastService
  ) {
    this.getMakes();
    this.getCategories();
    this.getPriceLists();
    this.buildForm();
  }

  public getMakes(): void {
    this.loading = true;

    this._makeService.getMakes('sort="description":1').subscribe(
      (result) => {
        if (!result.makes) {
        } else {
          this.makes = result.makes;
        }
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  public getCategories(): void {
    this.loading = true;

    this._categoryService.getCategories('sort="description":1').subscribe(
      (result) => {
        if (!result.categories) {
        } else {
          this.categories = result.categories;
        }
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  public getPriceLists(): void {
    this.loading = true;

    this._priceList.getPriceLists().subscribe(
      (result) => {
        if (!result.priceLists) {
        } else {
          this.priceLists = result.priceLists;
        }
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  public buildForm(): void {
    this.printPriceListForm = this._fb.group({
      make: ['', []],
      category: ['', []],
      withImage: [false, []],
      priceList: ['', []],
    });
  }

  public toPrint(): void {
    this.loading = true;

    this._printService
      .toPrint(PrintType.PriceList, this.printPriceListForm.value)
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
