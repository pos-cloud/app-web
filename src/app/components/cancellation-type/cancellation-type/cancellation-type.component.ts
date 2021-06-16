import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';


import { CancellationTypeService } from '../cancellation-type.service';
import { TransactionTypeService } from '../../transaction-type/transaction-type.service';

import { CancellationType } from '../cancellation-type';
import { TransactionType } from '../../transaction-type/transaction-type';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TransactionState } from 'app/components/transaction/transaction';
import { ToastrService } from 'ngx-toastr';
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-cancellation-type',
  templateUrl: './cancellation-type.component.html',
  styleUrls: ['./cancellation-type.component.css'],
  providers: [NgbAlertConfig,TranslateMePipe,TranslatePipe]
})
export class CancellationTypeComponent implements OnInit {

  @Input() operation: string;
  @Input() readonly: boolean;
  @Input() cancellationTypeId: string;
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
    public translatePipe: TranslateMePipe,
    private _toastr: ToastrService,
    public activeModal: NgbActiveModal,
  ) {
    if (window.screen.width < 1000) this.orientation = 'vertical';
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
    if (this.cancellationType.automaticSelection === undefined) { this.cancellationType.automaticSelection = false; }
    if (this.cancellationType.modifyBalance === undefined) { this.cancellationType.modifyBalance = true; }
    if (this.cancellationType.requestAutomatic === undefined) { this.cancellationType.requestAutomatic = false; }
    if (this.cancellationType.requestCompany === undefined) { this.cancellationType.requestCompany = true; }
    if (!this.cancellationType.stateOrigin) { this.cancellationType.stateOrigin = TransactionState.Closed; }
    if (!this.cancellationType.requestStatusOrigin) { this.cancellationType.requestStatusOrigin = TransactionState.Closed; }
    if (!this.cancellationType.updatePrices) { this.cancellationType.updatePrices = false; }

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
      'automaticSelection': this.cancellationType.automaticSelection,
      'modifyBalance': this.cancellationType.modifyBalance,
      'requestAutomatic': this.cancellationType.requestAutomatic,
      'requestCompany': this.cancellationType.requestCompany,
      'stateOrigin': this.cancellationType.stateOrigin,
      'requestStatusOrigin': this.cancellationType.requestStatusOrigin,
      'updatePrices' : this.cancellationType.updatePrices
    };
    this.cancellationTypeForm.setValue(values);
  }

  public getOrigins(): void {

    this.loading = true;

    this._transactionTypeService.getAll({
      project: {
        _id: 1,
        name: 1,
        transactionMovement : 1,
        operationType: 1
      },
      match: {
        operationType: { "$ne": "D" }
      },
      sort : {
        transactionMovement : 1
      }
    }).subscribe(
      result => {
        this.loading = false;
        if(result.status == 200){
            this.origins = result.result;
        } else {
            this.showToast(result);
        }
      },
      error => {
        this.showToast(error);
        this.loading = false;
      }
    );
  }

  public getDestinations(): void {

    this.loading = true;

    for (let origin of this.origins) {
      if (origin._id === this.cancellationTypeForm.value.origin) {
        this.originSelected = origin;
      }
    }

    this._transactionTypeService.getAll({
      project: {
        name: 1,
        transactionMovement: 1,
        _id: 1
      },
      match: {
        transactionMovement: this.originSelected.transactionMovement,
        //_id: { "$ne": this.originSelected._id },
        operationType: { "$ne": "D" }
      }
    }).subscribe(
      result => {
        this.loading = false;
        if(result.status == 200){
            this.destinations = result.result;
          if (this.cancellationType.origin &&
            this.cancellationType.destination) {
            this.setValueForm();
          }
        } else {
            this.showToast(result);
        }
      },
      error => {
          this.loading = false;
          this.showToast(error);
      }
    );
  }

  public buildForm(): void {

    this.cancellationTypeForm = this._fb.group({
      '_id': [this.cancellationType._id, []],
      'origin': [this.cancellationType.origin, [Validators.required]],
      'destination': [this.cancellationType.destination, [Validators.required]],
      'automaticSelection': [this.cancellationType.automaticSelection, [Validators.required]],
      'modifyBalance': [this.cancellationType.modifyBalance, [Validators.required]],
      'requestAutomatic': [this.cancellationType.requestAutomatic, [Validators.required]],
      'requestCompany': [this.cancellationType.requestCompany, [Validators.required]],
      'stateOrigin': [this.cancellationType.stateOrigin, [Validators.required]],
      'requestStatusOrigin': [this.cancellationType.requestStatusOrigin, [Validators.required]],
      'updatePrices': [this.cancellationType.updatePrices, [Validators.required]]
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
        if (this.isValid()) {
          this.saveCancellationType();
        }
        break;
      case 'edit':
        if (this.isValid()) {
          this.updateCancellationType();
        }
        break;
      case 'delete':
        this.deleteCancellationType();
      default:
        break;
    }
  }

  public isValid() {
    let valid: boolean = true;

    let destinationSelected: TransactionType;

    for (let destination of this.destinations) {
      if (destination._id === this.cancellationTypeForm.value.destination) {
        destinationSelected = destination;
      }
    }

    if (this.originSelected.modifyStock && destinationSelected.modifyStock) {
      if (this.originSelected.stockMovement === destinationSelected.stockMovement) {
        valid = false;
        this.showMessage('No se puede relacionar transacciones con el mismo movimiento de stock', 'info', false);
      }
    }

    /*if (destinationSelected._id === this.originSelected._id) {
      valid = false;
      this.showMessage('No se puede cancelar una transacción con otra del mismo tipo', 'info', false);
    }*/

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

  public showToast(result, type?: string, title?: string, message?: string): void {
    if (result) {
        if (result.status === 200) {
            type = 'success';
            title = result.message;
        } else if (result.status >= 400) {
            type = 'danger';
            title = (result.error && result.error.message) ? result.error.message : result.message;
        } else {
            type = 'info';
            title = result.message;
        }
    }
    switch (type) {
        case 'success':
            this._toastr.success(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
            break;
        case 'danger':
            this._toastr.error(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
            break;
        default:
            this._toastr.info(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
            break;
    }
    this.loading = false;
}
}
