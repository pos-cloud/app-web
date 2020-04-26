import { Component, OnInit, EventEmitter, Input, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';


import { ApplicationService } from '../application.service';

import { Application, Type } from '../application';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Config } from 'app/app.config';

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None
})
export class ApplicationComponent implements OnInit {

  @Input() operation: string;
  @Input() readonly: boolean;
  @Input() applicationId : string;
  public alertMessage: string = '';
  public userType: string;
  public application: Application;
  public areApplicationEmpty: boolean = true;
  public orderTerm: string[] = ['name'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public userCountry: string;
  public applicationForm: FormGroup;
  public orientation: string = 'horizontal';
  public types: Type[] = [Type.Web,Type.App];

  public formErrors = {
    'name': '',
    'url': '',
    'type' : ''
  };

  public validationMessages = {
    'name': {
      'required': 'Este campo es requerido.'
    },
    'type': {
      'required': 'Este campo es requerido.'
    },
    'url': {
      'required': 'Este campo es requerido.'
    }
  };

  constructor(
    public alertConfig: NgbAlertConfig,
    public _applicationService: ApplicationService,
    public _router: Router,
    public _fb: FormBuilder,
    public activeModal: NgbActiveModal,
  ) {
    if(window.screen.width < 1000) this.orientation = 'vertical';
    this.application = new Application();
  }

  ngOnInit() {
    this.userCountry = Config.country;
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];;
    this.buildForm();
    
    if (this.applicationId) {
      this.getApplication();
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getApplication() {

    this.loading = true;

    this._applicationService.getApplication(this.applicationId).subscribe(
      result => {
        if (!result.application) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.hideMessage();
          this.application = result.application;
          this.setValueForm();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public setValueForm(): void {

   
    if (!this.application._id) { this.application._id = ''; }
    if (!this.application.order) { this.application.order = 0; }
    if (!this.application.name) { this.application.name = ''; }
    if (!this.application.url) { this.application.url = '0'; }
    if (!this.application.type) { this.application.type = null; }


    const values = {
      '_id': this.application._id,
      'order': this.application.order,
      'name': this.application.name,
      'url' : this.application.url,
      'type' : this.application.type,
    };
    this.applicationForm.setValue(values);
  }

  public buildForm(): void {

    this.applicationForm = this._fb.group({
      '_id' : [this.application._id, []],
      'order': [this.application.order, [
        Validators.required
        ]
      ],
      'name': [this.application.name, [
        Validators.required
        ]
      ],
      'url': [this.application.url, [
        Validators.required
        ]
      ],
      'type' : [this.application.type,[]]
    });

    this.applicationForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {

    if (!this.applicationForm) { return; }
    const form = this.applicationForm;

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

  public addApplication() {

    switch (this.operation) {
      case 'add':
        this.saveApplication();
        break;
      case 'edit':
        this.updateApplication();
        break;
    }
  }

  public updateApplication() {

    this.loading = true;

    this.application = this.applicationForm.value;

    this._applicationService.updateApplication(this.application).subscribe(
      result => {
        if (!result.application) {
          this.loading = false;
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
          this.loading = false;
          this.showMessage('El aplicación se ha actualizado con éxito.', 'success', false);
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public saveApplication() {

    this.loading = true;

    this.application = this.applicationForm.value;

    this._applicationService.saveApplication(this.application).subscribe(
      result => {
        if (!result.application) {
          this.loading = false;
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
            this.loading = false;
            this.showMessage('La aplicación se ha añadido con éxito.', 'success', false);
            this.application = new Application();
            this.buildForm();
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  /*public deleteApplication() {

    this.loading = true;

    this._applicationService.deleteApplication(this.application._id).subscribe(
      result => {
        this.loading = false;
        if (!result.application) {
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
          this.activeModal.close();
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }*/

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }
}


