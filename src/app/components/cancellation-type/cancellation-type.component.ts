import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';


import { CancellationTypeService } from '../../services/cancellation-type.service'
import { TransactionTypeService } from '../../services/transaction-type.service'

import { CancellationType } from '../../models/cancellation-type'
import { TransactionType } from '../../models/transaction-type'

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

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
  public hasChanged = false;

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


  constructor(
    public alertConfig: NgbAlertConfig,
    public _cancelationTypeService: CancellationTypeService,
    public transactionTypeService : TransactionTypeService,
    public _router: Router,
    public _fb: FormBuilder,
    public activeModal: NgbActiveModal
  ) {
    this.cancellationType = new CancellationType();
   }

  ngOnInit() {
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getTransactionType();
    this.buildForm()
    
    if (this.cancellationTypeId) {
      this.getCancellationType(this.cancellationTypeId);
    }
  }

  public closeModal() {
    this.activeModal.close(this.hasChanged);
  }

  public getCancellationType(id: string) {

     this._cancelationTypeService.getCancellationType(this.cancellationTypeId).subscribe(result => {

         if (result['cancellationType']) {

          this.cancellationType = result['cancellationType']
          this.setValueForm();
          
         } else {
             
         }
     });
  }


  public setValueForm(): void {

  if (!this.cancellationType._id) { this.cancellationType._id = ''; }

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
  };

    this.cancellationTypeForm.setValue(values);
  }

  public getTransactionType(): void {

    this.loading = true;

    this.transactionTypeService.getTransactionTypes().subscribe(
      result => {
        if (!result.transactionTypes) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          
          this.origins = result.transactionTypes
          this.destinations = result.transactionTypes

        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      });
  }


  public buildForm(): void {

    this.cancellationTypeForm = this._fb.group({
      '_id' : [this.cancellationType._id, []],
      'origin': [this.cancellationType.origin, [
        ]
      ],
      'destination': [this.cancellationType.destination, [
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
        this.saveCancellationType();
        break;
      case 'edit':
        this.updateCancellationType();
        break;
      case 'delete' :
        this.deleteCancellationType();
      default:
        break;
    }

  }

  public updateCancellationType() {

      this.loading = true;
  
      this._cancelationTypeService.updateCancellationType(this.cancellationTypeForm.value)
        .pipe(
           
        )
        .subscribe(result => {

          if (result && result['cancellationType']) {
              this.cancellationType = result['cancellationType'];
              this.loading = false;
              this.hasChanged = true;
              this.showMessage('La cancelacion se ha actualizado con éxito.', 'success', false);
          }
        });
        
  }

  public saveCancellationType() {
    this.loading = true;

    this.cancellationType = this.cancellationTypeForm.value;

    this._cancelationTypeService.addCancellationType(this.cancellationType).subscribe(
      result => {
        if (!result.cancellationType) {
          this.loading = false;
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
          
            this.loading = false;
            this.showMessage('La cancelacion se ha añadido con éxito.', 'success', false);
          
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  
  }

  public deleteCancellationType() {

    console.log("entro")
    
    this.loading = true;
  
    this._cancelationTypeService.deleteCancellationType(this.cancellationTypeId)
      .pipe(
         
      )
      .subscribe(result => {

        console.log(result);

        if (result && result['cancellationType']) {
            this.cancellationType = result['cancellationType'];
            this.loading = false;
            this.hasChanged = true;
            this.showMessage('La cancelacion se ha eliminado con éxito.', 'success', false);
            this.closeModal();
        }
      });
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
