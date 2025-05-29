import { Component, EventEmitter, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { ArticleService } from '@core/services/article.service';
import { ShipmentMethodService } from '@core/services/shipment-method.service';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressbarModule } from '@shared/components/progressbar/progressbar.module';
import { Article, ShipmentMethod } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TypeaheadDropdownComponent } from 'app/shared/components/typehead-dropdown/typeahead-dropdown.component';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { combineLatest } from 'rxjs';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-shipment-method',
  templateUrl: './shipment-method.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FocusDirective,
    PipesModule,
    TranslateModule,
    TypeaheadDropdownComponent,
    ProgressbarModule,
  ],
})
export class ShipmentMethodComponent implements OnInit {
  public operation: string;
  public shipmentMethod: ShipmentMethod;
  public shipmentMethodForm: UntypedFormGroup;
  public loading: boolean = false;
  public articles: Article[];
  public focusEvent = new EventEmitter<boolean>();
  private destroy$ = new Subject<void>();

  constructor(
    private _shipmentMethodService: ShipmentMethodService,
    private _fb: UntypedFormBuilder,
    private _articleService: ArticleService,
    private _router: Router,
    private _toastService: ToastService
  ) {
    this.shipmentMethodForm = this._fb.group({
      _id: ['', []],
      name: ['', [Validators.required]],
      requireAddress: ['', []],
      requireTable: ['', []],
      article: ['', []],
    });
  }

  async ngOnInit() {
    const pathUrl = this._router.url.split('/');
    const shipmentMethodId = pathUrl[4];
    this.operation = pathUrl[3];
    if (this.operation === 'view' || this.operation === 'delete') this.shipmentMethodForm.disable();

    this.loading = true;
    combineLatest({
      articles: this._articleService.find({ query: { operationType: { $ne: 'D' } } }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ articles }) => {
          this.articles = articles ?? [];

          if (shipmentMethodId) {
            if (shipmentMethodId) this.getShipmentMethod(shipmentMethodId);
          } else {
            this.setValueForm();
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

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.focusEvent.complete();
  }
  returnTo() {
    return this._router.navigate(['/entities/shipment-methods']);
  }

  public getShipmentMethod(shipmentMethodId: string) {
    this.loading = true;

    this._shipmentMethodService
      .getById(shipmentMethodId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.shipmentMethod = result.result;
          this.setValueForm();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public setValueForm() {
    const article = this.articles?.find((item) => item._id == this.shipmentMethod?.article?.toString());

    this.shipmentMethodForm.setValue({
      _id: this.shipmentMethod?._id ?? '',
      name: this.shipmentMethod?.name ?? '',
      requireAddress: this.shipmentMethod?.requireAddress ?? false,
      requireTable: this.shipmentMethod?.requireTable ?? false,
      article: article ?? null,
    });
  }

  onEnter() {
    const isInQuill = event.target instanceof HTMLDivElement && event.target.classList.contains('ql-editor');

    if (isInQuill) {
      event.preventDefault();
      return;
    }

    if (this.shipmentMethodForm.valid && this.operation !== 'view' && this.operation !== 'delete') {
      this.addShipmentMethod();
    }
  }
  public addShipmentMethod(): void {
    this.loading = true;
    this.shipmentMethodForm.markAllAsTouched();
    if (this.shipmentMethodForm.invalid) {
      this.loading = false;
      return;
    }
    this.shipmentMethod = this.shipmentMethodForm.value;

    switch (this.operation) {
      case 'add':
        this.saveShipmentMethod();
        break;
      case 'update':
        this.updateShipmentMethod();
        break;
      case 'delete':
        this.deleteShipmentMethod();
      default:
        break;
    }
  }

  public updateShipmentMethod() {
    this.loading = true;

    this._shipmentMethodService
      .update(this.shipmentMethod)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this._toastService.showToast(result);
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
          this.returnTo();
        },
      });
  }

  public saveShipmentMethod(): void {
    this.loading = true;
    this._shipmentMethodService
      .save(this.shipmentMethod)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this._toastService.showToast(result);
          this.shipmentMethod = result.result;
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
          this.returnTo();
        },
      });
  }

  public deleteShipmentMethod() {
    this.loading = true;

    this._shipmentMethodService.delete(this.shipmentMethod._id).subscribe({
      next: (result) => {
        this._toastService.showToast(result);
      },
      error: (error) => {
        this._toastService.showToast(error);
      },
      complete: () => {
        this.loading = false;
        this.returnTo();
      },
    });
  }
}
