import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Location } from './../../models/location';

import { LocationService } from './../../services/location.service';

@Component({
  selector: 'app-add-location',
  templateUrl: './add-location.component.html',
  styleUrls: ['./add-location.component.css'],
  providers: [NgbAlertConfig]
})
export class AddLocationComponent implements OnInit {

  public location: Location;
  public locationForm: FormGroup;
  public alertMessage: string = "";
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'description': '',
    'positionX' : '',
    'positionY' : '',
    'positionZ' : ''
  };

  public validationMessages = {
    'description': {
      'required': 'Este campo es requerido.'
    },
    'positionX': { 
      'required': 'Este campo es requerido.'
     },
    'positionY': {  'required': 'Este campo es requerido.'
      },
    'positionZ': { 'required': 'Este campo es requerido.'  }
  };

  constructor(
    public _locationService: LocationService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {

    
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.location = new Location();
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.locationForm = this._fb.group({
      'description': [this.location.description, [
        Validators.required
        ]
      ],
      'positionX' : [this.location.positionX,[
        Validators.required
      ]],
      'positionY' : [this.location.positionY,[
        Validators.required
      ]],
      'positionZ' : [this.location.positionZ,[
        Validators.required
      ]]
    });

    this.locationForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.locationForm) { return; }
    const form = this.locationForm;

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

  public addLocation(): void {

    this.location = this.locationForm.value;
    this.saveLocation();
  }

  public saveLocation(): void {

    this.loading = true;

    this._locationService.saveLocation(this.location).subscribe(
      result => {
        if (!result.location) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.location = result.location;
          this.showMessage("El depósito se ha añadido con éxito.", "success", true);
          this.location = new Location();
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

  public hideMessage(): void {
    this.alertMessage = "";
  }

}
