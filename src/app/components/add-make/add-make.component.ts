import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';

import { Make } from './../../models/make';

import { MakeService } from './../../services/make.service';

@Component({
  selector: 'app-add-make',
  templateUrl: './add-make.component.html',
  styleUrls: ['./add-make.component.css'],
  providers: [NgbAlertConfig]
})

export class AddMakeComponent  implements OnInit {

  public make: Make;
  public makeForm: FormGroup;
  public alertMessage: string = "";
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  
  public formErrors = {
    'description': ''
  };

  public validationMessages = {
    'description': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
    public _makeService: MakeService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.make = new Make ();
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.makeForm = this._fb.group({
      'description': [this.make.description, [
          Validators.required
        ]
      ],
    });

    this.makeForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.makeForm) { return; }
    const form = this.makeForm;

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

  public addMake(): void {
    
    this.make = this.makeForm.value;
    this.saveMake();
  }

  public saveMake(): void {
    
    this.loading = true;
    
    this._makeService.saveMake(this.make).subscribe(
      result => {
        if (!result.make) {
          this.showMessage(result.message, "info", true); 
          this.loading = false;
        } else {
          this.make = result.make;
          this.showMessage("La marca se ha añadido con éxito.", "success", true);
          this.make = new Make ();
          this.buildForm();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage():void {
    this.alertMessage = "";
  }
}