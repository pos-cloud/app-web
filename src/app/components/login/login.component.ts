// ANGULAR
import { Component, EventEmitter, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// TERCEROS
import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

// SERVICES
import { Employee } from '@types';
import { AuthService } from 'app/core/services/auth.service';
import { ToastService } from 'app/shared/components/toast/toast.service';

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
  public employees: Employee[] = new Array();
  public focusEvent = new EventEmitter<boolean>();
  public company: string;
  public user: string;
  public password: string;
  public checkLockInput: boolean = false;

  constructor(
    private _authService: AuthService,
    private _fb: UntypedFormBuilder,
    private _router: Router,
    private _route: ActivatedRoute,
    private _toastService: ToastService
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
    this.company = this.loginForm.value.company.trim();
    this.user = this.loginForm.value.user;
    this.password = this.loginForm.value.password;

    if (!this.company.match(/^[a-z0-9]+$/)) {
      this._toastService.showToast({
        message: 'El negocio ingresado no fue encontrado.',
        type: 'danger',
      });
    } else {
      this.loading = true;
      this._toastService.showToast({
        message: 'Comprobando usuario...',
        type: 'info',
      });

      this._authService.login(this.company, this.user, this.password).subscribe({
        next: async (result) => {
          this.loading = false;
          if (!result.user) {
            if (result.message && result.message !== '') {
              this._toastService.showToast({
                message: result.message,
                type: 'info',
              });
            }
          } else {
            if (result.user.employee) {
              this._toastService.showToast({
                message: `¡Bienvenido ${result.user.employee.name}!`,
                type: 'success',
              });

              this._authService.loginStorage(result.user);
              localStorage.setItem('company', this.company);

              // Obtener la URL de retorno y navegar a ella
              this._route.queryParams.subscribe({
                next: (params) => {
                  const returnUrl = params['return'] || '/';
                  this._router.navigateByUrl(returnUrl);
                },
              });
            } else {
              this._toastService.showToast({
                message: 'El usuario y/o contraseña son incorrectos',
                type: 'info',
              });
            }
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
}
