import { Component, OnInit, EventEmitter, ViewEncapsulation, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Location } from '../location';

import { LocationService } from '../location.service';
import { Deposit } from 'app/components/deposit/deposit';
import { DepositService } from 'app/components/deposit/deposit.service';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None
})
export class LocationComponent implements OnInit {

  @Input() operation: string;
  @Input() locationId: string;
  @Input() readonly: boolean;

  public location: Location;
  public deposits : Deposit [];
  public locationForm: UntypedFormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'description': '',
    'deposit' : '',
  };

  public validationMessages = {
    'description': {
      'required': 'Este campo es requerido.'
    },
    'deposit': { 
      'required': 'Este campo es requerido.'
     }
  };

  constructor(
    public _locationService: LocationService,
    public _depositService : DepositService,
    public _fb: UntypedFormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) {
    this.getDeposits();
   }

  ngOnInit(): void {

    
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.location = new Location();
    this.buildForm();

    if(this.locationId) {
      this.getLocation();
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getDeposits() : void {
    this._depositService.getDeposits().subscribe(
      result =>{
        if(result && result.deposits) {
          this.deposits = result.deposits;
        } else {
          this.showMessage("No se encontraron depósitos cargados.", 'info', false);
          this.loading = false;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    )
  }

  public getLocation() : void {
    this._locationService.getLocation(this.locationId).subscribe(
      result =>{
        if (!result.location) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.location = result.location;
          this.setValueForm();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    )
  }

  public setValueForm() {

    if (!this.location._id) this.location._id = '';
    if (!this.location.description) this.location.description = '';
    if (!this.location.positionX) this.location.positionX = '';
    if (!this.location.positionY) this.location.positionY = '';
    if (!this.location.positionZ) this.location.positionZ = '';
    
    let deposit;
    if (!this.location.deposit) {
      deposit = null;
    } else {
      if (this.location.deposit._id) {
        deposit = this.location.deposit._id;
      } else {
        deposit = this.location.deposit;
      }
    }
    
    this.locationForm.setValue({
      '_id':this.location._id,
      'description': this.location.description,
      'positionX' : this.location.positionX,
      'positionY' : this.location.positionY,
      'positionZ' : this.location.positionZ,
      'deposit' : deposit
    });
  }
  
  public addLocation() {

    switch (this.operation) {
      case 'add':
        this.saveLocation();
        break;
      case 'update':
        this.updateLocation();
        break;
    }
  }

  public buildForm(): void {

    this.locationForm = this._fb.group({
      '_id' : [this.location._id,[]],
      'description': [this.location.description, [Validators.required]],
      'positionX' : [this.location.positionX,[]],
      'positionY' : [this.location.positionY,[]],
      'positionZ' : [this.location.positionZ,[]],
      'deposit' : [this.location.deposit,[Validators.required]]
    });

    this.locationForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public deleteLocation(): void {

    this.loading = true;

    this._locationService.deleteLocation(this.location._id).subscribe(
      result => {
        this.activeModal.close('delete_close');
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public updateLocation(): void {
    
    this.loading = true;
    this.location = this.locationForm.value;
    
    this._locationService.updateLocation(this.location).subscribe(
      result => {
        if (!result.location) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true); 
          this.loading = false;
        } else {
          this.location = result.location;
          this.showMessage("La ubicación se ha actualizado con éxito.", 'success', false);
          this.activeModal.close('save_close');
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
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

  public saveLocation(): void {

    this.loading = true;
    this.location = this.locationForm.value;

    this._locationService.saveLocation(this.location).subscribe(
      result => {
        if (!result.location) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.location = result.location;
          this.showMessage("La ubicación se ha añadido con éxito.", 'success', true);
          this.location = new Location();
          this.buildForm();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
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
    this.alertMessage = '';
  }

}
