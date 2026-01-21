import { CommonModule } from '@angular/common';
import { Component, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service';

import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from '@shared/components/toast/toast.service';
import { FocusDirective } from '@shared/directives/focus.directive';
import { PipesModule } from '@shared/pipes/pipes.module';
import { ApiResponse } from '@types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  standalone: true,
  imports: [CommonModule, FocusDirective, PipesModule, TranslateModule, NgbModule, ReactiveFormsModule],
})
export class ChangePasswordComponent {
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public showPassword: boolean = false;
  public form: FormGroup;
  public user: any;
  private destroy$ = new Subject<void>();
  public data: any;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    public _toastService: ToastService,
    public _authService: AuthService,
    public _userService: UserService
  ) {
    this._authService.getIdentity.subscribe((identity) => {
      if (identity) {
        this.user = identity;
      }
    });
    this.form = this.fb.group({
      _id: [this.user._id, []],
      password: ['', [Validators.required, Validators.minLength(6)]],
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

  onEnter() {
    const isInQuill = event.target instanceof HTMLDivElement && event.target.classList.contains('ql-editor');

    if (isInQuill) {
      event.preventDefault();
      return;
    }
    this.changePassword();
  }

  changePassword() {
    this.loading = true;
    if (this.form.invalid) {
      this.loading = false;
      return;
    }

    this.data = this.form.value;
    this._userService
      .update(this.data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
          this.activeModal.dismiss('cancel');
          this._authService.logoutStorage();
        },
      });
  }
}
