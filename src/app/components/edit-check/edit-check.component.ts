import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { MovementOfCash, StatusCheck } from 'app/models/movement-of-cash';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { MovementOfCashService } from 'app/services/movement-of-cash.service';
import * as moment from 'moment';
import 'moment/locale/es';
@Component({
  selector: 'app-edit-check',
  templateUrl: './edit-check.component.html',
  styleUrls: ['./edit-check.component.css']
})
export class EditCheckComponent implements OnInit {

  @Input() movementOfCashId : string;
  public movementOfCash: MovementOfCash;
  public statusChecks: StatusCheck[] = [StatusCheck.Rejected, StatusCheck.Available, StatusCheck.Closed, StatusCheck.Deposit];
  public checkForm: FormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'expirationDate': '',
    'statusCheck': ''
  };

  public validationMessages = {
    'expirationDate': {
      'required': 'Este campo es requerido.'
    },
    'statusCheck': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
    public _fb: FormBuilder,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _movementOfCashService : MovementOfCashService

  ) { 
    this.movementOfCash = new MovementOfCash();

  }

  ngOnInit() {

    if(this.movementOfCashId){
      this.getMovementOfCash()
    }

    this.buildForm();
  }

  public getMovementOfCash() : void {
    this._movementOfCashService.getMovementOfCash(this.movementOfCashId).subscribe(
      result => {
        console.log(result)
        if (!result.movementOfCash) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.movementOfCash = result.movementOfCash;
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

  public setValueForm() : void {

    console.log(this.movementOfCash)
    
    if (!this.movementOfCash.expirationDate) { this.movementOfCash.expirationDate = ''; }
    if (!this.movementOfCash.statusCheck) { this.movementOfCash.statusCheck = StatusCheck.Available; }

    
    this.checkForm.setValue({
      'expirationDate': moment(this.movementOfCash.expirationDate).format('YYYY-MM-DD'),
      'statusCheck': this.movementOfCash.statusCheck
    });
  }

  public buildForm(): void {

    this.checkForm = this._fb.group({
      'expirationDate': [moment(this.movementOfCash.expirationDate).format('YYYY-MM-DD'), [
          Validators.required
        ]
      ],
      'statusCheck': [this.movementOfCash.statusCheck, [
          Validators.required
        ]
      ]
    });

    this.checkForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.checkForm) { return; }
    const form = this.checkForm;

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

  public updateCheck() {

    this.movementOfCash.expirationDate = this.checkForm.value.expirationDate;
    this.movementOfCash.statusCheck = this.checkForm.value.statusCheck;

      this._movementOfCashService.updateMovementOfCash(this.movementOfCash).subscribe(
        result => {
          if (!result.movementOfCash) {
            if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
            this.loading = false;
          } else {
            this.movementOfCash = result.movementOfCash;
            this.showMessage("Se actualizo con exito", 'info', true);
          }
          this.loading = false;
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      )
  }
  

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage():void {
    this.alertMessage = '';
  }

}
