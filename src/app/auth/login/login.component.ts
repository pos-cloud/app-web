// ANGULAR
import { Component, EventEmitter, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// TERCEROS
import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

// SERVICES
import { AuthService } from '../../core/services/auth.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None,
})
export class LoginComponent {
  public loginForm: UntypedFormGroup;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public company: string;
  public user: string;
  public password: string;
  public checkLockInput: boolean = false;
  public showPassword: boolean = false;

  constructor(
    private _authService: AuthService,
    private _fb: UntypedFormBuilder,
    private _router: Router,
    private _route: ActivatedRoute,
    private _toastService: ToastService,
    private _analyticsService: AnalyticsService
  ) {
    const savedCompany = localStorage.getItem('company');
    this.checkLockInput = !!savedCompany;

    this.loginForm = this._fb.group({
      company: [savedCompany || '', [Validators.required]],
      user: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  ngAfterContentInit(): void {
    this.focusEvent.emit(true);
  }

  async lockInput() {
    this.checkLockInput = !this.checkLockInput;
  }

  async login() {
    if (this.loginForm.invalid) {
      return;
    }

    this.company = (this.loginForm.value.company ?? '').trim();
    this.user = (this.loginForm.value.user ?? '').trim();
    this.password = this.loginForm.value.password;

    this.loading = true;

    this._authService.login(this.company, this.user, this.password).subscribe({
      next: async (result) => {
        this.loading = false;
        if (!result.user) {
          if (result.message && result.message !== '') {
            this._toastService.showToast({
              message: result.message,
              type: 'danger',
            });
          }
        } else {
          const u = result.user;
          const welcomeName = u.employee?.name ?? u.name ?? u.email ?? '';
          this._toastService.showToast({
            message: welcomeName ? `¡Bienvenido ${welcomeName}!` : '¡Bienvenido!',
            type: 'success',
          });

          this._authService.loginStorage(u);
          localStorage.setItem('company', this.company);

          this._analyticsService.updateClient(this.company);

          this._route.queryParams.subscribe({
            next: (params) => {
              const returnUrl = params['return'] || '/';
              this._router.navigateByUrl(returnUrl);
            },
          });
        }
      },
      error: (error) => {
        this.loading = false;
        if (error.status === 0) {
          this._toastService.showToast({
            message: 'Error de conexión con el servidor. Comunicarse con Soporte.',
            type: 'danger',
          });
        } else {
          this._toastService.showToast({
            message: error._body,
            type: 'danger',
          });
        }
      },
    });
  }
}
