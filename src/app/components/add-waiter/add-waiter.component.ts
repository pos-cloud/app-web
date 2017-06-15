import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Waiter } from './../../models/waiter';

import { WaiterService } from './../../services/waiter.service';

@Component({
  selector: 'app-add-waiter',
  templateUrl: './add-waiter.component.html',
  styleUrls: ['./add-waiter.component.css'],
  providers: [NgbAlertConfig]
})

export class AddWaiterComponent  implements OnInit {

  private waiter: Waiter;
  private waiterForm: FormGroup;
  private alertMessage: any;
  private userType: string;
  private loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  private formErrors = {
    'name': ''
  };

  private validationMessages = {
    'name': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
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

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.waiter = new Waiter ();
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  private buildForm(): void {

    this.waiterForm = this._fb.group({
      'name': [this.waiter.name, [
          Validators.required
        ]
      ]
    });

    this.waiterForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  private onValueChanged(data?: any): void {

    if (!this.waiterForm) { return; }
    const form = this.waiterForm;

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

  private addWaiter(): void {
    
    this.loading = true;
    this.waiter = this.waiterForm.value;
    this.saveWaiter();
  }

  private saveWaiter(): void {
    
    this._waiterService.saveWaiter(this.waiter).subscribe(
    result => {
        if (!result.waiter) {
          this.alertMessage = result.message;
        } else {
          this.waiter = result.waiter;
          this.alertConfig.type = 'success';
          this.alertMessage = "El mozo se ha añadido con éxito.";      
          this.waiter = new Waiter ();
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