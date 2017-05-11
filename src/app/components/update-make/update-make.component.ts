import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Make } from './../../models/make';

import { MakeService } from './../../services/make.service';

@Component({
  selector: 'app-update-make',
  templateUrl: './update-make.component.html',
  styleUrls: ['./update-make.component.css'],
  providers: [NgbAlertConfig]
})

export class UpdateMakeComponent implements OnInit {

  @Input() make: Make;
  private makeForm: FormGroup;
  private alertMessage: any;
  private userType: string;
  private loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  private formErrors = {
    'description': ''
  };

  private validationMessages = {
    'description': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
    private _makeService: MakeService,
    private _fb: FormBuilder,
    private _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
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
    this.makeForm.setValue({
      '_id':this.make._id,
      'description': this.make.description
    });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  private buildForm(): void {

    this.makeForm = this._fb.group({
      '_id': [this.make._id, [
        ]
      ],
      'description': [this.make.description, [
          Validators.required
        ]
      ],
    });

    this.makeForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  private onValueChanged(data?: any): void {

    if (!this.makeForm) { return; }
    const form = this.makeForm;

    for (const field in this.formErrors) {
      // clear previous error message (if any)
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

  private updateMake (): void {
    
    this.loading = true;
    this.make = this.makeForm.value;
    this.saveChanges();
  }

  private saveChanges(): void {
    
  this._makeService.updateMake(this.make).subscribe(
    result => {
      this.make = result.make;
      if (!this.make) {
        this.alertMessage = 'Ha ocurrido un error al querer crear la marca.';
      } else {
        this.alertConfig.type = 'success';
        this.alertMessage = "La marca se ha actualizado con éxito.";
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