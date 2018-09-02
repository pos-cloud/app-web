import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Location } from './../../models/location';

import { LocationService } from './../../services/location.service';

@Component({
  selector: 'app-update-location',
  templateUrl: './update-location.component.html',
  styleUrls: ['./update-location.component.css'],
  providers: [NgbAlertConfig]

})
export class UpdateLocationComponent implements OnInit {

  @Input() location: Location;
  @Input() readonly: boolean;
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
    this.buildForm();
    this.locationForm.setValue({
      '_id':this.location._id,
      'description': this.location.description,
      'positionX' : this.location.positionX,
      'positionY' : this.location.positionY,
      'positionZ' : this.location.positionZ,
    });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.locationForm = this._fb.group({
      '_id': [this.location._id, [
        ]
      ],
      'description': [this.location.description, [
          Validators.required
        ]
      ],
      'positionX': [this.location.positionX, [
          Validators.required
        ]
      ],
      'positionY': [this.location.positionY, [
        Validators.required
        ]
      ],
    'positionZ': [this.location.positionZ, [
      Validators.required
      ]
      ],    
    });

    this.locationForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
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

  public updateLocation (): void {
    if(!this.readonly) {
      this.loading = true;
      this.location = this.locationForm.value;
      this.saveChanges();
    }
  }

  public saveChanges(): void {
    
    this.loading = true;
    
    this._locationService.updateLocation(this.location).subscribe(
      result => {
        if (!result.location) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true); 
          this.loading = false;
        } else {
          this.location = result.location;
          this.showMessage("La marca se ha actualizado con éxito.", "success", false);
          this.activeModal.close('save_close');
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
