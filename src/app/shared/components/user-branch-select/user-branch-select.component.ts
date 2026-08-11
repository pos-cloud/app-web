import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Branch, User } from '@types';
import { AuthService } from 'app/core/services/auth.service';
import { BranchService } from 'app/core/services/branch.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-user-branch-select',
  templateUrl: './user-branch-select.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UserBranchSelectComponent),
      multi: true,
    },
  ],
})
export class UserBranchSelectComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() showLabel = true;
  @Input() label = 'Sucursal';
  @Input() showAllOption = true;
  @Input() allOptionLabel = 'Todas';
  @Output() branchChange = new EventEmitter<string | null>();

  branches: Branch[] = [];
  branchSelectedId: string | null = null;
  allowChangeBranch = true;
  formDisabled = false;

  private destroy$ = new Subject<void>();
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};
  private cvaReady = false;
  private branchInitialized = false;

  constructor(
    private _branchService: BranchService,
    private _authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadBranches();
    this._authService.getIdentity.pipe(takeUntil(this.destroy$)).subscribe((identity) => {
      this.applyUserBranch(identity);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  writeValue(value: string | null): void {
    if (this.allowChangeBranch) {
      this.branchSelectedId = value ?? null;
    }
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
    this.cvaReady = true;
    this.emitBranchValue();
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled = isDisabled;
  }

  onBranchChange(): void {
    this.onTouched();
    this.onChange(this.branchSelectedId);
    this.branchChange.emit(this.branchSelectedId);
  }

  private loadBranches(): void {
    this._branchService
      .getBranches({}, { operationType: { $ne: 'D' } }, { number: 1 }, {}, 0, 0)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.branches = result?.branches ?? [];
        },
      });
  }

  private applyUserBranch(user: User | null): void {
    if (!user) {
      return;
    }

    const branchId = this.getUserBranchId(user);

    if (branchId) {
      this.allowChangeBranch = false;
      this.branchSelectedId = branchId;
    } else {
      this.allowChangeBranch = true;
    }

    this.branchInitialized = true;
    this.emitBranchValue();
  }

  private emitBranchValue(): void {
    // Diferir para evitar ExpressionChangedAfterItHasBeenCheckedError (NG0100)
    queueMicrotask(() => {
      this.onChange(this.branchSelectedId);
      if (this.cvaReady && this.branchInitialized) {
        this.branchChange.emit(this.branchSelectedId);
      }
    });
  }

  private getUserBranchId(user: User | null): string | null {
    if (!user) {
      return null;
    }

    const branchId = this.resolveBranchRef(user.branch);
    if (branchId) {
      return branchId;
    }

    return this.resolveBranchRef(user.origin?.branch);
  }

  private resolveBranchRef(branch: unknown): string | null {
    if (branch == null) {
      return null;
    }

    if (typeof branch === 'string') {
      return branch;
    }

    if (typeof branch === 'object') {
      const branchRef = branch as {
        _id?: string | { $oid?: string; toString?: () => string };
        $oid?: string;
      };

      if (branchRef._id != null) {
        if (typeof branchRef._id === 'string') {
          return branchRef._id;
        }

        if (typeof branchRef._id === 'object' && branchRef._id !== null && '$oid' in branchRef._id) {
          return (branchRef._id as { $oid: string }).$oid;
        }

        return typeof branchRef._id.toString === 'function' ? branchRef._id.toString() : String(branchRef._id);
      }

      if (branchRef.$oid) {
        return branchRef.$oid;
      }
    }

    return null;
  }
}
