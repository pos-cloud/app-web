import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ApiResponse, Bank } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MovementOfCash } from '../../../../components/movement-of-cash/movement-of-cash';
import { BankService } from '../../../../core/services/bank.service';
import { MovementOfCashService } from '../../../../core/services/movement-of-cash.service';
import { TypeaheadDropdownComponent } from '../../../../shared/components/typehead-dropdown/typeahead-dropdown.component';

@Component({
  selector: 'app-check-wallet-edit',
  templateUrl: './check-wallet-edit.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FocusDirective,
    PipesModule,
    TranslateModule,
    TypeaheadDropdownComponent,
  ],
})
export class CheckWalletEditComponent implements OnInit, AfterViewInit, OnDestroy {
  public movementOfCashForm: UntypedFormGroup;
  public loading: boolean = false;
  @Input()
  set movementOfCashId(id: string) {
    this._movementOfCashId = id;
    if (id && this.banks?.length) {
      this.getMovementOfCash(id);
    }
  }

  get movementOfCashId(): string {
    return this._movementOfCashId;
  }

  private _movementOfCashId: string;
  public focusEvent = new EventEmitter<boolean>();
  public movementOfCash: MovementOfCash;
  public banks: Bank[];
  private destroy$ = new Subject<void>();

  constructor(
    private _movementOfCashService: MovementOfCashService,
    private _bankService: BankService,
    private _fb: UntypedFormBuilder,
    public activeModal: NgbActiveModal,
    private _toastService: ToastService
  ) {
    this.movementOfCashForm = this._fb.group({
      _id: ['', []],
      expirationDate: [0, [Validators.required]],
      bank: ['', []],
      deliveredBy: ['', []],
      receiver: ['', []],
      titular: ['', []],
      CUIT: ['', []],
    });
  }

  ngOnInit() {
    this.getBank();

    this.loading = true;
    combineLatest({
      banks: this._bankService.find({ query: { operationType: { $ne: 'D' } } }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ banks }) => {
          this.banks =
            banks.map((data) => ({
              name: `${data.code} - ${data.name} `,
              _id: data._id,
            })) ?? [];

          if (this.movementOfCashId) {
            this.getMovementOfCash(this.movementOfCashId);
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
    setTimeout(() => this.focusEvent.emit(true));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.focusEvent.complete();
  }

  getMovementOfCash(id: string): void {
    this._movementOfCashService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.movementOfCash = result.result;
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

  getBank(): void {
    this._bankService
      .find({ query: { operationType: { $ne: 'D' } } })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.banks = result;
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  setValueForm(): void {
    const bank = this.banks?.find((item) => item._id.toString() === this.movementOfCash?.bank?.toString());

    this.movementOfCashForm.patchValue({
      _id: this.movementOfCash?._id ?? '',
      expirationDate: this.movementOfCash?.expirationDate
        ? new Date(this.movementOfCash?.expirationDate).toISOString().substring(0, 10)
        : '',
      bank: bank ?? null,
      deliveredBy: this.movementOfCash?.deliveredBy ?? '',
      receiver: this.movementOfCash?.receiver ?? '',
      titular: this.movementOfCash?.titular ?? '',
      CUIT: this.movementOfCash?.CUIT ?? '',
    });
  }

  returnTo() {
    this.activeModal.dismiss();
  }

  async handleMovementOfCashOperation() {
    this.loading = true;

    this.movementOfCashForm.markAllAsTouched();
    if (this.movementOfCashForm.invalid) {
      this.loading = false;
      return;
    }

    const formValue = this.movementOfCashForm.value;

    this.movementOfCash = {
      ...this.movementOfCash,
      expirationDate: formValue.expirationDate,
      bank: formValue.bank,
      deliveredBy: formValue.deliveredBy,
      receiver: formValue.receiver,
      titular: formValue.titular,
      CUIT: formValue.CUIT,
    };

    this.updateMovementOfCash();
  }

  updateMovementOfCash(): void {
    this._movementOfCashService
      .update(this.movementOfCash)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status === 200) this.activeModal.close(result);
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
