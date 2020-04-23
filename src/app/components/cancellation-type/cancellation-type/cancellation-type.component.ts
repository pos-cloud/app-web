import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';


import { CancellationTypeService } from '../cancellation-type.service';
import { TransactionTypeService } from '../../transaction-type/transaction-type.service';

import { CancellationType } from '../cancellation-type';
import { TransactionType } from '../../transaction-type/transaction-type';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-cancellation-type',
  templateUrl: './cancellation-type.component.html',
  styleUrls: ['./cancellation-type.component.css'],
  providers: [NgbAlertConfig]
})
export class CancellationTypeComponent implements OnInit {

  @Input() operation: string;
  @Input() readonly: boolean;
  @Input() cancellationTypeId : string;
  public alertMessage: string = '';
  public userType: string;
  public cancellationType: CancellationType;
  public areCancellationTypeEmpty: boolean = true;
  public orderTerm: string[] = ['-origin'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public orientation: string = 'horizontal';

  public formErrors = {
    'origin': '',
    'destination': '',
  };

  public validationMessages = {
    'origin': {
      'required': 'Este campo es requerido.'
    },
    'destination': {
      'required': 'Este campo es requerido.'
    }
  };

  public cancellationTypeForm: FormGroup;
  public origins: TransactionType[] = new Array();
  public destinations: TransactionType[] = new Array();
  public originSelected: TransactionType;

  constructor(
    public alertConfig: NgbAlertConfig,
    public _cancellationTypeService: CancellationTypeService,
    public _transactionTypeService: TransactionTypeService,
    public _router: Router,
    public _fb: FormBuilder,
    public activeModal: NgbActiveModal,
  ) {
    if(window.screen.width < 1000) this.orientation = 'vertical';
    this.cancellationType = new CancellationType();
   }

  ngOnInit() {
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getOrigins();
    this.buildForm()
    
    if (this.cancellationTypeId) {
      this.getCancellationType();
    }
  }

  public getCancellationType() {

    this.loading = true;

    this._cancellationTypeService.getCancellationType(this.cancellationTypeId).subscribe(
      result => {
        if (!result.cancellationType) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.hideMessage();
          this.cancellationType = result.cancellationType;
          this.originSelected = this.cancellationType.origin;
          this.setValueForm();
          this.getDestinations();
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

    if (!this.cancellationType._id) { this.cancellationType._id = ''; }
    if (this.cancellationType.modifyBalance === undefined) { this.cancellationType.modifyBalance = true; }
    if (this.cancellationType.requestAutomatic === undefined) { this.cancellationType.requestAutomatic = false; }

    let origin;
    if (!this.cancellationType.origin) {
      origin = null;
    } else {
      if (this.cancellationType.origin._id) {
        origin = this.cancellationType.origin._id;
      } else {
        origin = this.cancellationType.origin;
      }
    }

    let destination;
    if (!this.cancellationType.destination) {
      destination = null;
    } else {
      if (this.cancellationType.destination._id) {
        destination = this.cancellationType.destination._id;
      } else {
        destination = this.cancellationType.destination;
      }
    }

    const values = {
      '_id': this.cancellationType._id,
      'origin': origin,
      'destination': destination,
      'modifyBalance': this.cancellationType.modifyBalance,
      'requestAutomatic': this.cancellationType.requestAutomatic
    };
    this.cancellationTypeForm.setValue(values);
  }

  public getOrigins(): void {

    this.loading = true;

    this._transactionTypeService.getTransactionTypes('sort="transactionMovement":1').subscribe(
      result => {
        if (!result.transactionTypes) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.origins = result.transactionTypes;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getDestinations(): void {

    this.loading = true;
    
    for(let origin of this.origins) {
      if (origin._id === this.cancellationTypeForm.value.origin) {
        this.originSelected = origin;
      }
    }

    let query = 'where="transactionMovement":"' + this.originSelected.transactionMovement + '","_id":{"$ne":"' + this.originSelected._id + '"}';
    
    this._transactionTypeService.getTransactionTypes(query).subscribe(
      result => {
        if (!result.transactionTypes) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.destinations = result.transactionTypes;
          if(this.cancellationType.origin &&
            this.cancellationType.destination) {
            this.setValueForm();
          }
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public buildForm(): void {

    this.cancellationTypeForm = this._fb.group({
      '_id' : [this.cancellationType._id, [   
        ]
      ],
      'origin': [this.cancellationType.origin, [
          Validators.required
        ]
      ],
      'destination': [this.cancellationType.destination, [
          Validators.required
        ]
      ],
      'modifyBalance': [this.cancellationType.modifyBalance, [
          Validators.required
        ]
      ],
      'requestAutomatic': [this.cancellationType.requestAutomatic, [
          Validators.required
        ]
      ]
    });

    this.cancellationTypeForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {

    if (!this.cancellationTypeForm) { return; }
    const form = this.cancellationTypeForm;

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

  public addCancellationType() {

    switch (this.operation) {
      case 'add':
        if(this.isValid()) {
          this.saveCancellationType();
        }
        break;
      case 'edit':
        if(this.isValid()) {
          this.updateCancellationType();
        }
        break;
      case 'delete' :
        this.deleteCancellationType();
      default:
        break;
    }
  }

  public isValid() {
    let valid: boolean = true;

    let destinationSelected : TransactionType;

    for(let destination of this.destinations) {
      if (destination._id === this.cancellationTypeForm.value.destination) {
        destinationSelected = destination;
      }
    }
    
    if(this.originSelected.modifyStock && destinationSelected.modifyStock) {
      if(this.originSelected.stockMovement === destinationSelected.stockMovement) {
        valid = false;
        this.showMessage('No se puede relacionar transacciones con el mismo movimiento de stock', 'info', false);
      }
    }

    if(destinationSelected._id === this.originSelected._id) {
      valid = false;
      this.showMessage('No se puede cancelar una transacción con otra del mismo tipo', 'info', false);
    }
    
    return valid;
  }

  public updateCancellationType() {

    this.loading = true;

    this.cancellationType = this.cancellationTypeForm.value;

    this._cancellationTypeService.updateCancellationType(this.cancellationType).subscribe(
      result => {
        if (!result.cancellationType) {
          this.loading = false;
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
            this.loading = false;
            this.showMessage('El tipo de cancelación se ha actualizado con éxito.', 'success', false);
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public saveCancellationType() {

    this.loading = true;

    this.cancellationType = this.cancellationTypeForm.value;

    this._cancellationTypeService.saveCancellationType(this.cancellationType).subscribe(
      result => {
        if (!result.cancellationType) {
          this.loading = false;
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
            this.loading = false;
            this.showMessage('El tipo de cancelación se ha añadido con éxito.', 'success', false);
            this.cancellationType = new CancellationType();
            this.cancellationType.origin = this.cancellationTypeForm.value.origin;
            this.cancellationType.destination = this.cancellationTypeForm.value.destination;
            this.buildForm();
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public deleteCancellationType() {

    this.loading = true;

    this.cancellationType = this.cancellationTypeForm.value;

    this._cancellationTypeService.deleteCancellationType(this.cancellationType._id).subscribe(
      result => {
        this.loading = false;
        this.activeModal.close("delete_close");
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