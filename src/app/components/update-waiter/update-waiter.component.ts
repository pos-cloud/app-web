import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Waiter } from './../../models/waiter';

import { WaiterService } from './../../services/waiter.service';

@Component({
  selector: 'app-update-waiter',
  templateUrl: './update-waiter.component.html',
  styleUrls: ['./update-waiter.component.css'],
  providers: [NgbAlertConfig]
})

export class UpdateWaiterComponent implements OnInit {

  @Input() waiter: Waiter;
  public waiterForm: FormGroup;
  public alertMessage: any;
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'name': ''
  };

  public validationMessages = {
    'name': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
    public _waiterService: WaiterService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.buildForm();
    this.waiterForm.setValue({
      '_id': this.waiter._id,
      'name': this.waiter.name
    });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.waiterForm = this._fb.group({
      '_id': [this.waiter._id, [
        ]
      ],
      'name': [this.waiter.name, [
          Validators.required
        ]
      ]
    });

    this.waiterForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {

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

  public updateWaiter (): void {

    this.loading = true;
    this.waiter = this.waiterForm.value;
    this.saveChanges();
  }

  public saveChanges(): void {
    
    this._waiterService.updateWaiter(this.waiter).subscribe(
    result => {
        if (!result.waiter) {
          this.alertMessage = result.message;
          this.alertConfig.type = 'danger';
        } else {
          this.waiter = result.waiter;
          this.alertConfig.type = 'success';
          this.alertMessage = "El artículo se ha actualizado con éxito.";
          this.activeModal.close('save_close');
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