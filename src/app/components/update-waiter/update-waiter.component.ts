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

    let locationPathURL: string;
    this._router.events.subscribe((data:any) => { 
      locationPathURL = data.url.split('/');
      this.userType = locationPathURL[1];
    });
    this.buildForm();
    this.waiterForm.setValue({
      '_id': this.waiter._id,
      'code': this.waiter.code,
      'name': this.waiter.name
    });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  private buildForm(): void {

    this.waiterForm = this._fb.group({
      '_id': [this.waiter._id, [
        ]
      ],
      'code': [this.waiter.code, [
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

  private updateWaiter (): void {

    this.loading = true;
    this.waiter = this.waiterForm.value;
    this.saveChanges();
  }

  private saveChanges(): void {
    
    this._waiterService.updateWaiter(this.waiter).subscribe(
    result => {
          this.waiter = result.waiter;
        if (!this.waiter) {
          this.alertMessage = 'Ha ocurrido un error al querer crear el artículo.';
        } else {
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