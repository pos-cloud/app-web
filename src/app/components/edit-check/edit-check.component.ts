import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { MovementOfCash, StatusCheck } from 'app/models/movement-of-cash';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { MovementOfCashService } from 'app/services/movement-of-cash.service';
import * as moment from 'moment';
import 'moment/locale/es';
import { BankService } from 'app/services/bank.service';
import { Bank } from 'app/models/bank';
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
  public banks : Bank[]

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
    public _movementOfCashService : MovementOfCashService,
    public _bankService : BankService

  ) { 
    this.getBanks();
    this.movementOfCash = new MovementOfCash();
    this.banks = new Array;
  }

  ngOnInit() {

    if(this.movementOfCashId){
      this.getMovementOfCash()
    }

    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }
  
  public getMovementOfCash() : void {
    this._movementOfCashService.getMovementOfCash(this.movementOfCashId).subscribe(
      result => {
        if (!result.movementOfCash) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'success', true);
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
    
    if (!this.movementOfCash.expirationDate) { this.movementOfCash.expirationDate = ''; }
    if (!this.movementOfCash.statusCheck) { this.movementOfCash.statusCheck = StatusCheck.Available; }
    if (!this.movementOfCash.bank) { this.movementOfCash.bank = null; }
    if (!this.movementOfCash.deliveredBy) { this.movementOfCash.deliveredBy = '' }
    if (!this.movementOfCash.receiver) { this.movementOfCash.receiver = '' }
    if (!this.movementOfCash.titular) { this.movementOfCash.titular = '' }
    if (!this.movementOfCash.CUIT) { this.movementOfCash.CUIT = '' }

    
    this.checkForm.setValue({
      'expirationDate': moment(this.movementOfCash.expirationDate).format('YYYY-MM-DD'),
      'statusCheck': this.movementOfCash.statusCheck,
      'bank' : this.movementOfCash.bank,
      'deliveredBy':this.movementOfCash.deliveredBy,
      'receiver':this.movementOfCash.receiver,
      'titular':this.movementOfCash.titular,
      'CUIT':this.movementOfCash.CUIT,
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
      ],
      'bank' : [this.movementOfCash.bank,[]],
      'deliveredBy':[this.movementOfCash.deliveredBy,[]],
      'receiver':[this.movementOfCash.receiver,[]],
      'titular':[this.movementOfCash.titular,[]],
      'CUIT':[this.movementOfCash.CUIT,[]],
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

    this.movementOfCash.expirationDate = moment(this.checkForm.value.expirationDate, "YYYY-MM-DD").format("YYYY-MM-DDTHH:mm:ssZ");;
    this.movementOfCash.statusCheck = this.checkForm.value.statusCheck;
    this.movementOfCash.bank = this.checkForm.value.bank;
    this.movementOfCash.deliveredBy = this.checkForm.value.deliveredBy;
    this.movementOfCash.receiver = this.checkForm.value.receiver;
    this.movementOfCash.titular = this.checkForm.value.titular;
    this.movementOfCash.CUIT = this.checkForm.value.CUIT;

      this._movementOfCashService.updateMovementOfCash(this.movementOfCash).subscribe(
        result => {
          if (!result.movementOfCash) {
            if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
            this.loading = false;
          } else {
            this.movementOfCash = result.movementOfCash;
            this.showMessage("Se actualizo con exito", 'success', true);
          }
          this.loading = false;
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      )
  }
  
  public getBanks() {
    
    this.loading = true;
    
    let project = {
      "_id" : 1,
      "name": 1,
      "code" :1,
      "operationType": 1,
    };

    this._bankService.getBanks(
      project, // PROJECT
      { "operationType": { "$ne": "D" } }, // MATCH
      { name: 1 }, // SORT
      {}, // GROUP
      0, // LIMIT
      0 // SKIP
    ).subscribe(result => {
      this.loading = false;
      if (result && result.banks) {
        this.banks = result.banks;
      } else {
        this.banks = new Array();
      }
    },
    error => {
      this.showMessage(error._body, 'danger', false);
      this.loading = false;
    });
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
