import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { User } from './../../models/user';
import { Turn } from './../../models/turn';
import { Waiter } from './../../models/waiter';

import { UserService } from './../../services/user.service';
import { TurnService } from './../../services/turn.service';
import { WaiterService } from './../../services/waiter.service';
import { TableService } from './../../services/table.service';

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
  @Input() waiterSelected: Waiter;
  private waiters: Waiter[] = new Array();

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
    private _userservice: UserService,
    private _waiterService: WaiterService,
    private _turnService: TurnService,
    private _tableService: TableService,
    private _fb: FormBuilder,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    ) { 
      alertConfig.type = 'danger';
      alertConfig.dismissible = true;
    }

  ngOnInit() {

    this.user = new User();
    if(this.waiterSelected !== undefined){
      this.getUserOfWaiter();
    }
    this.buildForm();
    this.getWaiters();
  }

  private getUserOfWaiter(): void {  
    
    this._userservice.getUserOfWaiter(this.waiterSelected._id).subscribe(
        result => {
					if(!result.users) {
						this.alertMessage = result.message;
					  this.user = null;
					} else {
            this.alertMessage = null;
					  this.user = result.users[0];
            console.log(this.user);
            this.loginForm.setValue({
              '_id': this.user._id,
              'name': this.user.name,
              'password': '',
              'type': this.user.type,
              'status': this.user.status,
              'waiter': this.user.waiter._id
            });
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

  private buildForm(): void {

    this.loginForm = this._fb.group({
      '_id': [this.user._id, [
        ]
      ],
      'name': [this.user.name, [
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
      ],
      'waiter': [this.user.waiter, [
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
  
    this.user = this.loginForm.value;
    
    this._userservice.login(this.user).subscribe(
      result => {
        if (!result.user) {
            this.alertMessage = result.message;
        } else {
          this.alertMessage = null;
          this.user = result.user;
          this.getOpenTurn();
        }
      },
      error => {
        this.alertMessage = error;
        if(!this.alertMessage) {
            this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
        }
        this.loading = false;
      }
    )
  }

  private getOpenTurn(): void {
    
    this._turnService.getOpenTurn(this.waiterSelected._id).subscribe(
        result => {
					if(!result.turns) {
						this.openTurn();
					} else {
            this.alertMessage = "El mozo " + this.user.waiter.name + " ya tiene el turno abierto" ;
            this.alertConfig.type = "danger";
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

  private openTurn(): void {

    let turn: Turn = new Turn();
    turn.waiter = this.user.waiter;

    this._turnService.saveTurn(turn).subscribe(
      result => {
        if (!result.turn) {
          this.alertMessage = result.message;
        } else {
          this.activeModal.close("turn_open");
        }
      },
      error => {
        this.alertMessage = error;
        if(!this.alertMessage) {
            this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
        }
        this.loading = false;
      }
    )
  }
}
