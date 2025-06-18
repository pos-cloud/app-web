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
        article: this._fb.group({
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
    if (this.permission && this.transactionTypes.length > 0) {
      this.permissionForm.patchValue(this.permission);

      const selectedTypes = (this.permission.transactionTypes || []).map((t: any) =>
        typeof t === 'string' ? t : t._id
      );
      this.permissionForm.get('transactionTypes').setValue(selectedTypes);

      this.transactionTypes.forEach((type) => {
        if (this.permissionForm.contains(type._id)) {
          this.permissionForm.get(type._id).setValue(selectedTypes.includes(type._id));
        }
      });

      setTimeout(() => {
        this.permissionForm.updateValueAndValidity();
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
          if (result.status === 200) {
            this.permission = result.result;
            this.setValueForm();
          }
          this.loading = false;
        },
        error: (error) => {
          this._toast.showToast(error);
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

    this.permission = this.permissionForm.value;

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
