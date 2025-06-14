import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/services/auth.service';
import { ToastService } from 'app/shared/components/toast/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: any;
  company: string;
  checkLockInput: boolean;

  constructor(
    private fb: UntypedFormBuilder,
    private authService: AuthService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const company = localStorage.getItem('company');
    if (company) {
      this.company = company;
      this.checkLockInput = true;
    } else {
      this.checkLockInput = false;
    }
    this.loginForm = this.fb.group({
      company: [this.company || '', [Validators.required, Validators.pattern('^[a-z0-9]+$')]],
      user: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit() {}

  onSubmit(form: any) {
    // Handle form submission
  }
}
