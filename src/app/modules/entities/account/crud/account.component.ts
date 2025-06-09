import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '@core/services/account.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressbarModule } from '@shared/components/progressbar/progressbar.module';
import { TypeaheadDropdownComponent } from '@shared/components/typehead-dropdown/typeahead-dropdown.component';
import { Account, ApiResponse, Modes, Types } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
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
export class AccountComponent implements OnInit {
  public accountId: string;
  public operation: string;
  public account: Account;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public accountForm: UntypedFormGroup;
  private destroy$ = new Subject<void>();
  public accounts: Account[];
  public types = Object.values(Types);
  public modes = Object.values(Modes);

  constructor(
    public _accountService: AccountService,
    public _fb: UntypedFormBuilder,
    public activeModal: NgbActiveModal,
    public _router: Router,
    private _toastService: ToastService
  ) {
    this.accountForm = this._fb.group({
      _id: ['', []],
      code: ['', [Validators.required]],
      description: ['', [Validators.required]],
      type: ['', [Validators.required]],
      mode: ['', [Validators.required]],
      parent: ['', []],
    });
  }

  ngOnInit() {
    const URL = this._router.url.split('/');
    this.operation = URL[3];
    this.accountId = URL[4];

    if (this.operation === 'view' || this.operation === 'delete') {
      this.accountForm.disable();
    }

    this.loading = true;

    combineLatest({
      accounts: this._accountService.find({ query: { operationType: { $ne: 'D' } } }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ accounts }) => {
          this.accounts = accounts ?? [];

          if (this.accountId) {
            this.getAccount(this.accountId);
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

  public setValueForm(): void {
    const accountParent = this.accounts?.find((item) => item._id === this.account?.parent?.toString());

    const values = {
      _id: this.account?._id ?? '',
      code: this.account?.code ?? '',
      description: this.account?.description ?? '',
      type: this.account?.type ?? '',
      mode: this.account?.mode ?? '',
      parent: accountParent ?? null,
    };
    this.accountForm.setValue(values);
  }

  public returnTo() {
    this._router.navigateByUrl('entities/accounts');
  }

  public getAccount(id: string) {
    this.loading = true;

    this._accountService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.account = result.result;
          if (result.status == 200) this.setValueForm();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public handleAccountOperation() {
    this.loading = true;
    this.accountForm.markAllAsTouched();
    if (this.accountForm.invalid) {
      this.loading = false;
      return;
    }

    this.account = this.accountForm.value;

    switch (this.operation) {
      case 'add':
        this.saveAccount();
        break;
      case 'update':
        this.updateAccount();
        break;
      case 'delete':
        this.deleteAccount();
        break;
      default:
        break;
    }
  }

  public updateAccount() {
    this._accountService
      .update(this.account)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public saveAccount() {
    this._accountService
      .save(this.account)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public deleteAccount() {
    this._accountService
      .delete(this.account._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }
}
