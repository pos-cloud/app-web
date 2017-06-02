import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { User, UserTypes, UserState } from './../../models/user';
import { Waiter } from './../../models/waiter';

import { UserService } from './../../services/user.service';
import { WaiterService } from './../../services/waiter.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css'],
  providers: [NgbAlertConfig]
})

export class AddUserComponent  implements OnInit {

  private user: User;
  private userForm: FormGroup;
  private alertMessage: any;
  private userType: string;
  private loading: boolean = false;
  private states: UserState[] = [UserState.Enabled, UserState.Disabled];
  private types: UserTypes[] = [UserTypes.Supervisor, UserTypes.Waiter];
  private waiters: Waiter[] = new Array();
  public focusEvent = new EventEmitter<boolean>();

  private formErrors = {
    'name': '',
    'password': '',
    'type': '',
    'state': '',
    'waiter': ''
  };

  private validationMessages = {
    'name': {
      'required':       'Este campo es requerido.'
    },
    'password': {
      'required':       'Este campo es requerido.'
    },
    'type': {
    },
    'state': {
    },
    'waiter': {
    }
  };

  constructor(
    private _userService: UserService,
    private _waiterService: WaiterService,
    private _fb: FormBuilder,
    private _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

  ngOnInit(): void {

    let locationPathURL: string;
    this._router.events.subscribe((data:any) => { 
      locationPathURL = data.url.split('/');
      this.userType = locationPathURL[1];
    });
    this.user = new User ();
    this.buildForm();
    this.getWaiters();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  private buildForm(): void {

    this.userForm = this._fb.group({
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
      'state': [this.user.state, [
        ]
      ],
      'waiter': [this.user.waiter, [
        ]
      ]
    });

    this.userForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  private onValueChanged(data?: any): void {

    if (!this.userForm) { return; }
    const form = this.userForm;

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

  private getWaiters(): void {  

    this._waiterService.getWaiters().subscribe(
        result => {
					if(!result.waiters) {
						this.alertMessage = result.message;
					  this.waiters = null;
					} else {
            this.alertMessage = null;
					  this.waiters = result.waiters;
          }
				},
				error => {
					this.alertMessage = error;
					if(!this.alertMessage) {
						this.alertMessage = "Error en la petición.";
					}
				}
      );
   }

  private addUser(): void {
    
    this.loading = true;
    this.user = this.userForm.value;
    this.saveUser();
  }

  private saveUser(): void {
    
    this._userService.saveUser(this.user).subscribe(
    result => {
        if (!result.user) {
          this.alertMessage = result.message;
        } else {
          this.user = result.user;
          this.alertMessage = "El usuario se ha añadido con éxito.";  
          this.alertConfig.type = 'success';    
          this.user = new User ();
          this.buildForm();
        }
        this.loading = false;
      },
      error => {
        this.alertMessage = error;
        if(!this.alertMessage) {
            this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
        }
        this.loading = false;
      }
    );
  }
}