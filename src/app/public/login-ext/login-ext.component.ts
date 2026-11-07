import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { AccessQr, ExternalSession, LoginExtService, MemberAccount } from './login-ext.service';

@Component({
  selector: 'app-login-ext',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-ext.component.html',
  styleUrls: ['./login-ext.component.scss'],
})
export class LoginExtComponent implements OnInit {
  database = '';
  session: ExternalSession | null = null;
  account: MemberAccount | null = null;
  access: AccessQr | null = null;
  loading = false;
  accessLoading = false;
  error = '';
  form: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private loginExt: LoginExtService
  ) {
    this.form = this.fb.group({
      user: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.database = params['database'] || '';
      this.access = null;
      this.account = null;
      this.error = '';
      this.session = this.loginExt.readSession(this.database);
      if (this.session) this.loadAccount();
    });
  }

  login(): void {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    this.error = '';
    const { user, password } = this.form.getRawValue();
    this.loginExt.login(this.database, user || '', password || '').subscribe((result) => {
      this.loading = false;
      if (!result.session) {
        this.error = result.message || 'No se pudo iniciar sesión.';
        return;
      }
      this.session = result.session;
      this.loadAccount();
    });
  }

  requestAccess(): void {
    if (!this.session || this.accessLoading) return;
    this.accessLoading = true;
    this.error = '';
    this.loginExt.requestAccess(this.session).subscribe((result) => {
      this.accessLoading = false;
      if (!result.access?.qr) {
        this.error = result.message || 'No se pudo generar el acceso.';
        return;
      }
      this.access = result.access;
    });
  }

  logout(): void {
    this.loginExt.clearSession(this.database);
    this.session = null;
    this.account = null;
    this.access = null;
    this.error = '';
    this.form.reset();
  }

  formatAmount(value: number): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value || 0);
  }

  get situation(): string {
    if (!this.account?.company) return 'Sin cliente vinculado';
    if (this.account.totalDue > 0) return 'Con deuda';
    if (!this.account.company.active) return 'Suscripción inactiva';
    return 'Al día';
  }

  private loadAccount(): void {
    if (!this.session) return;
    this.loading = true;
    this.loginExt.account(this.session).subscribe((result) => {
      this.loading = false;
      if (!result.account) {
        this.loginExt.clearSession(this.database);
        this.session = null;
        this.error = result.message || 'La sesión venció. Volvé a ingresar.';
        return;
      }
      this.account = result.account;
    });
  }
}
