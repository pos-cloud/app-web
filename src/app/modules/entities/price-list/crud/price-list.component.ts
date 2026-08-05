import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressbarModule } from '@shared/components/progressbar/progressbar.module';
import { ApiResponse, PriceList } from '@types';
import { SearchableDropdownComponent } from 'app/shared/components/searchable-dropdown/searchable-dropdown.component';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ArticleService } from '../../../../core/services/article.service';
import { CategoryService } from '../../../../core/services/category.service';
import { MakeService } from '../../../../core/services/make.service';
import { PriceListService } from '../../../../core/services/price-list.service';

@Component({
  selector: 'app-price-list',
  templateUrl: './price-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PipesModule,
    TranslateModule,
    SearchableDropdownComponent,
    ProgressbarModule,
  ],
})
export class PriceListComponent implements OnInit {
  public priceListId: string;
  public operation: string;
  public priceList: PriceList;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public priceListForm: UntypedFormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    public _priceListService: PriceListService,
    public _articleService: ArticleService,
    public _categoryService: CategoryService,
    public _makeService: MakeService,
    public _fb: UntypedFormBuilder,
    public _router: Router,
    private _toastService: ToastService
  ) {
    this.priceListForm = this._fb.group({
      _id: ['', []],
      name: ['', [Validators.required]],
      pricingMode: ['dynamic', [Validators.required]],
      percentage: ['', [Validators.required]],
      percentageType: ['final', [Validators.required]],
      allowSpecialRules: [false, []],
      default: [false, [Validators.required]],
      rules: this._fb.array([]),
      exceptions: this._fb.array([]),
    });
  }

  get rulesArray(): UntypedFormArray {
    return this.priceListForm.get('rules') as UntypedFormArray;
  }

  get exceptionsArray(): UntypedFormArray {
    return this.priceListForm.get('exceptions') as UntypedFormArray;
  }

  private createRuleFormGroup(rule?: PriceList['rules'][number]): UntypedFormGroup {
    return this._fb.group({
      _id: [rule?._id || null, []],
      category: [rule?.category || null, []],
      make: [rule?.make || null, []],
      percentage: [rule?.percentage ?? 0, []],
    });
  }

  private createExceptionFormGroup(exception?: PriceList['exceptions'][number]): UntypedFormGroup {
    return this._fb.group({
      _id: [exception?._id || null, []],
      article: [exception?.article || null, []],
      percentage: [exception?.percentage ?? 0, []],
    });
  }

  public addRule(): void {
    this.rulesArray.push(this.createRuleFormGroup());
  }

  public removeRule(index: number): void {
    this.rulesArray.removeAt(index);
  }

  public addException(): void {
    this.exceptionsArray.push(this.createExceptionFormGroup());
  }

  public removeException(index: number): void {
    this.exceptionsArray.removeAt(index);
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');
    this.operation = pathUrl[3];
    this.priceListId = pathUrl[4];

    if (this.operation === 'view' || this.operation === 'delete') {
      this.priceListForm.disable();
    }

    if (this.priceListId) {
      this.getPriceList(this.priceListId);
    } else {
      this.setValueForm();
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public getPriceList(id: string) {
    this.loading = true;
    this._priceListService
      .getPriceListObjById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse) => {
          if (response.status === 200) {
            this.priceList = Array.isArray(response.result) ? response.result[0] : response.result;
            this.setValueForm();
          } else {
            this._toastService.showToast(response.message);
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  private setValueForm() {
    while (this.rulesArray.length !== 0) {
      this.rulesArray.removeAt(0);
    }
    while (this.exceptionsArray.length !== 0) {
      this.exceptionsArray.removeAt(0);
    }

    if (this.priceList) {
      (this.priceList.rules || []).forEach((rule) => {
        this.rulesArray.push(this.createRuleFormGroup(rule));
      });

      (this.priceList.exceptions || []).forEach((exception) => {
        this.exceptionsArray.push(this.createExceptionFormGroup(exception));
      });

      this.priceListForm.patchValue({
        _id: this.priceList._id || '',
        name: this.priceList.name || '',
        pricingMode: this.priceList.pricingMode || 'dynamic',
        percentage: this.priceList.percentage ?? 0,
        percentageType: this.priceList.percentageType || 'final',
        allowSpecialRules: this.priceList.allowSpecialRules || false,
        default: this.priceList.default || false,
      });
    } else {
      this.priceListForm.patchValue({
        _id: '',
        name: '',
        pricingMode: 'dynamic',
        percentage: 0,
        percentageType: 'final',
        allowSpecialRules: false,
        default: false,
      });
    }
  }

  public handlePriceListOperation() {
    this.loading = true;
    this.priceListForm.markAllAsTouched();

    if (this.priceListForm.invalid) {
      this.loading = false;
      return;
    }

    const formValue = this.priceListForm.value;
    const priceListData: PriceList = {
      ...this.priceList,
      ...formValue,
    };

    switch (this.operation) {
      case 'add':
        this.savePriceList(priceListData);
        break;
      case 'update':
        this.updatePriceList(priceListData);
        break;
      case 'delete':
        this.deletePriceList();
        break;
      default:
        break;
    }
  }

  public savePriceList(priceList: PriceList) {
    this._priceListService
      .save(priceList)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse) => {
          this._toastService.showToast(response);
          if (response.status === 200) {
            this.returnTo();
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public updatePriceList(priceList: PriceList) {
    this._priceListService
      .update(priceList)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse) => {
          if (response.status === 200) {
            this.returnTo();
          }
          this._toastService.showToast(response);
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public deletePriceList() {
    this._priceListService
      .delete(this.priceList._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse) => {
          if (response.status === 200) {
            this.returnTo();
          }
          this._toastService.showToast(response);
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public returnTo() {
    this._router.navigateByUrl('entities/price-list');
  }
}
