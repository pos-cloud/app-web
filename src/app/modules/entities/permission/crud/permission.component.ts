import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressbarModule } from '@shared/components/progressbar/progressbar.module';

import { Permission, TransactionMovement, TransactionType } from '@types';
import { PermissionService } from 'app/core/services/permission.service';
import { TransactionTypeService } from 'app/core/services/transaction-type.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-permission',
  templateUrl: './permission.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FocusDirective, PipesModule, TranslateModule, ProgressbarModule],
})
export class PermissionComponent implements OnInit {
  public operation: string;
  public readonly: boolean;
  public permission: Permission;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public permissionForm: FormGroup;
  public transactionTypes: TransactionType[] = [];
  public transactionTypeGroups: [string, TransactionType[]][] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private _service: PermissionService,
    private _transactionTypeService: TransactionTypeService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _toast: ToastService
  ) {
    this.permissionForm = this._fb.group({
      _id: ['', []],
      name: ['', [Validators.required]],
      collections: this._fb.group({
        transactions: this._fb.group({
          view: [true],
          add: [true],
          edit: [true],
          delete: [true],
          export: [true],
        }),
        articles: this._fb.group({
          view: [true],
          add: [true],
          edit: [true],
          delete: [true],
          export: [true],
        }),
        companies: this._fb.group({
          view: [true],
          add: [true],
          edit: [true],
          delete: [true],
          export: [true],
        }),
        movementsOfArticles: this._fb.group({
          view: [true],
          add: [true],
          edit: [true],
          delete: [true],
          export: [true],
        }),
      }),
      menu: this._fb.group({
        sales: this._fb.group({
          counter: [true],
          tiendaNube: [true],
          wooCommerce: [true],
          delivery: [true],
          voucherReader: [true],
          resto: [true],
        }),
        money: [true],
        production: [true],
        purchases: [true],
        stock: [true],
        articles: [true],
        companies: this._fb.group({
          client: [true],
          provider: [true],
        }),
        report: [true],
        config: [true],
        gallery: [true],
        resto: [true],
      }),
      filterTransaction: [false],
      filterCompany: [false],
      transactionTypes: [[]],
      editArticle: [true],
      allowDiscount: [true],
      allowPayment: [true],
    });
  }

  get collections() {
    return this.permissionForm.get('collections') as FormGroup;
  }

  get transactionTypesArray(): FormArray {
    return this.permissionForm.get('transactionTypes') as FormArray;
  }

  ngOnInit() {
    this.loading = true;
    const pathUrl = this._router.url.split('/');
    const permissionId = pathUrl[4];
    this.operation = pathUrl[3];

    if (pathUrl[3] === 'view' || pathUrl[3] === 'delete') this.permissionForm.disable();

    this._transactionTypeService
      .find({
        project: { _id: 1, name: 1, transactionMovement: 1 },
        query: { operationType: { $ne: 'D' } },
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (transactionTypes) => {
          this.transactionTypes = transactionTypes || [];
          this.transactionTypes.forEach((type) => {
            if (!this.permissionForm.contains(type._id)) {
              this.permissionForm.addControl(type._id, new FormControl(false));
            }
          });
          this.transactionTypeGroups = this.groupTransactionTypes();

          if (permissionId) {
            this.getPermission(permissionId);
          } else {
            this.loading = false;
          }
        },
        error: (error) => {
          this._toast.showToast(error);
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

  public setValueForm(): void {
    this.permissionForm.patchValue({
      _id: this.permission._id ?? '',
      name: this.permission.name ?? '',
      collections: {
        transactions: {
          view: this.permission.collections?.transactions?.view ?? true,
          add: this.permission.collections?.transactions?.add ?? true,
          edit: this.permission.collections?.transactions?.edit ?? true,
          delete: this.permission.collections?.transactions?.delete ?? true,
          export: this.permission.collections?.transactions?.export ?? true,
        },
        articles: {
          view: this.permission.collections?.articles?.view ?? true,
          add: this.permission.collections?.articles?.add ?? true,
          edit: this.permission.collections?.articles?.edit ?? true,
          delete: this.permission.collections?.articles?.delete ?? true,
          export: this.permission.collections?.articles?.export ?? true,
        },
        companies: {
          view: this.permission.collections?.companies?.view ?? true,
          add: this.permission.collections?.companies?.add ?? true,
          edit: this.permission.collections?.companies?.edit ?? true,
          delete: this.permission.collections?.companies?.delete ?? true,
          export: this.permission.collections?.companies?.export ?? true,
        },
        movementsOfArticles: {
          view: this.permission.collections?.movementsOfArticles?.view ?? true,
          add: this.permission.collections?.movementsOfArticles?.add ?? true,
          edit: this.permission.collections?.movementsOfArticles?.edit ?? true,
          delete: this.permission.collections?.movementsOfArticles?.delete ?? true,
          export: this.permission.collections?.movementsOfArticles?.export ?? true,
        },
      },
      menu: {
        sales: {
          counter: this.permission.menu?.sales?.counter ?? true,
          tiendaNube: this.permission.menu?.sales?.tiendaNube ?? true,
          wooCommerce: this.permission.menu?.sales?.wooCommerce ?? true,
          delivery: this.permission.menu?.sales?.delivery ?? true,
          voucherReader: this.permission.menu?.sales?.voucherReader ?? true,
          resto: this.permission.menu?.sales?.resto ?? true,
        },
        money: this.permission.menu?.money ?? true,
        production: this.permission.menu?.production ?? true,
        purchases: this.permission.menu?.purchases ?? true,
        stock: this.permission.menu?.stock ?? true,
        articles: this.permission.menu?.articles ?? true,
        companies: {
          client: this.permission.menu?.companies?.client ?? true,
          provider: this.permission.menu?.companies?.provider ?? true,
        },
        report: this.permission.menu?.report ?? true,
        config: this.permission.menu?.config ?? true,
        gallery: this.permission.menu?.gallery ?? true,
        resto: this.permission.menu?.resto ?? true,
      },
      filterTransaction: this.permission.filterTransaction ?? false,
      filterCompany: this.permission.filterCompany ?? false,
      transactionTypes: [],
      editArticle: this.permission.editArticle ?? true,
      allowDiscount: this.permission.allowDiscount ?? true,
      allowPayment: this.permission.allowPayment ?? true,
    });

    // Solo manejar transactionTypes si ya están cargados
    if (this.transactionTypes.length > 0) {
      // Manejar transactionTypes de forma separada
      const selectedTypes = (this.permission.transactionTypes || []).map((t: any) =>
        typeof t === 'string' ? t : t._id
      );
      this.permissionForm.get('transactionTypes').setValue(selectedTypes);

      // Establecer los controles dinámicos de transactionTypes
      this.transactionTypes.forEach((type) => {
        if (this.permissionForm.contains(type._id)) {
          this.permissionForm.get(type._id).setValue(selectedTypes.includes(type._id));
        }
      });
    }
  }

  public returnTo() {
    return this._router.navigate(['/entities/permissions']);
  }

  public getPermission(id: string): void {
    this._service
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.permission = result.result;
        },
        error: (error) => {
          this._toast.showToast(error);
          this.loading = false;
        },
        complete: () => {
          this.setValueForm();
          this.loading = false;
        },
      });
  }

  public handlePermissionOperation() {
    this.loading = true;
    this.permissionForm.markAllAsTouched();
    if (this.permissionForm.invalid) {
      this.loading = false;
      return;
    }

    const formValues = this.permissionForm.value;
    this.permission = {
      ...this.permission,
      ...formValues,
    };

    switch (this.operation) {
      case 'add':
        this.savePermission();
        break;
      case 'update':
        this.updatePermission();
        break;
      case 'delete':
        this.deletePermission();
        break;
    }
  }

  public savePermission() {
    this._service
      .save(this.permission)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this._toast.showToast(result);
          if (result.status === 200) this.returnTo();
        },
        error: (error) => {
          this._toast.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public updatePermission() {
    this._service
      .update(this.permission)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this._toast.showToast(result);
          if (result.status === 200) this.returnTo();
        },
        error: (error) => {
          this._toast.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public deletePermission() {
    this._service
      .delete(this.permission._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this._toast.showToast(result);
          if (result.status === 200) this.returnTo();
        },
        error: (error) => {
          this._toast.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  onTransactionTypeChange(event: any, typeId: string) {
    const currentTypes = this.permissionForm.get('transactionTypes').value || [];
    if (event.target.checked) {
      this.permissionForm.get('transactionTypes').setValue([...currentTypes, typeId]);
    } else {
      this.permissionForm.get('transactionTypes').setValue(currentTypes.filter((id: string) => id !== typeId));
    }
  }

  private groupTransactionTypes(): [string, TransactionType[]][] {
    const groups = this.transactionTypes.reduce((acc, type) => {
      const movement = type.transactionMovement;
      if (!acc[movement]) {
        acc[movement] = [];
      }
      acc[movement].push(type);
      return acc;
    }, {} as Record<string, TransactionType[]>);

    return Object.entries(groups);
  }

  getTransactionMovements(): TransactionMovement[] {
    return [...new Set(this.transactionTypes.map((type) => type.transactionMovement))].sort();
  }

  getTransactionTypesByMovement(movement: string): FormGroup[] {
    return this.transactionTypesArray.controls.filter(
      (control) => control.get('transactionMovement').value === movement
    ) as FormGroup[];
  }
}
