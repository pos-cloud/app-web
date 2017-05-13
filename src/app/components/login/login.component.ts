import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { User } from './../../models/user';

import { UserService } from './../../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [NgbAlertConfig]
})

export class LoginComponent implements OnInit {

  private user: User;
  private loginForm: FormGroup;
  private alertMessage: any;
  private userType: string;
  private loading: boolean = false;

  private formErrors = {
    'name': '',
    'password': ''
  };

  private validationMessages = {
    'name': {
      'required':       'Este campo es requerido.'
    },
    'password': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
    private _fb: FormBuilder,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
    ) { 
      alertConfig.type = 'danger';
      alertConfig.dismissible = true;
    }

  ngOnInit() {

    this.user = new User();
    this.buildForm();
  }

  private buildForm(): void {

    this.loginForm = this._fb.group({
      'name': [this.user.name, [
        Validators.required
        ]
      ],
      'password': [this.user.password, [
        Validators.required
        ]
      ],
      'type': [this.user.type, [
        ]
      ],
      'status': [this.user.status, [
        ]
      ]
    });

    this.loginForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  private onValueChanged(data?: any): void {

    if (!this.loginForm) { return; }
    const form = this.loginForm;

    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);

      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  private login(): void {
    console.log("logueado");
  }
}
