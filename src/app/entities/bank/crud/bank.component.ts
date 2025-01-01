import { Component, EventEmitter, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { BankService } from '../../../core/services/bank.service';

import { ApiResponse, Bank } from '@types';

import { Account } from 'app/components/account/account';
import { AccountService } from 'app/core/services/account.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-bank',
  templateUrl: './bank.component.html',
})
export class BankComponent implements OnInit {
  public operation: string;
  public readonly: boolean;
  public bankId: string;
  public alertMessage: string = '';
  public userType: string;
  public bank: Bank;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public bankForm: UntypedFormGroup;
  public accounts: Account[];
  private destroy$ = new Subject<void>();

  constructor(
    public _bankService: BankService,
    public _accountService: AccountService,
    public _router: Router,
    public _fb: UntypedFormBuilder,
    private _toastService: ToastService
  ) {
    this.bankForm = this._fb.group({
      _id: ['', []],
      code: ['', [Validators.required]],
      name: ['', [Validators.required]],
      agency: ['', []],
      account: [null, []],
    });
  }

  async ngOnInit() {
    const pathUrl = this._router.url.split('/');
    const bankId = pathUrl[4];
    this.operation = pathUrl[3];
    await this.getAccount();

    if (bankId) this.getBank(bankId);
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public setValueForm(): void {
    const account = this.accounts?.find(
      (item) => item._id === this.bank?.account?.toString()
    );

    const values = {
      _id: this.bank._id ?? '',
      code: this.bank.code ?? 0,
      name: this.bank.name ?? '',
      agency: this.bank.agency ?? 0,
      account: account ?? null,
    };
    this.bankForm.setValue(values);
  }

  returnTo() {
    return this._router.navigate(['/entities/banks']);
  }

  getAccount(): Promise<void> {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this._accountService
        .getAll({})
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result: ApiResponse) => {
            this.accounts = result.result;
          },
          error: (error) => {
            this._toastService.showToast(error);
          },
          complete: () => {
            this.loading = false;
            resolve();
          },
        });
    });
  }

  public getBank(bankId: string) {
    this.loading = true;

    this._bankService
      .getById(bankId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.bank = result.result;
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

  public handleBankOperation() {
    this.loading = true;
    this.bankForm.markAllAsTouched();
    if (this.bankForm.invalid) {
      this.loading = false;
      return;
    }

    this.bank = this.bankForm.value;

    switch (this.operation) {
      case 'add':
        this.saveBank();
        break;
      case 'update':
        this.updateBank();
        break;
      case 'delete':
        this.deleteBank();
      default:
        break;
    }
  }

  public updateBank() {
    this._bankService
      .update(this.bank)
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

  public saveBank() {
    this._bankService
      .save(this.bank)
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

  public deleteBank() {
    this._bankService
      .delete(this.bank._id)
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
