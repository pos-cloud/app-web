import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Deposit } from 'app/models/deposit';
import { DepositService } from 'app/services/deposit.service';
import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-select-deposit',
  templateUrl: './select-deposit.component.html',
  styleUrls: ['./select-deposit.component.css']
})
export class SelectDepositComponent implements OnInit {

  @Input() op : string;
  public transferForm : FormGroup
  public deposits : Deposit[];
  public alertMessage = '';
  public loading: boolean = false;

  constructor(
    public _fb: FormBuilder,
    public _depositService : DepositService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
  ) { }

  ngOnInit() {

    this.buildForm();
    this.getDeposits();
  }

  public buildForm() : void {
    this.transferForm = this._fb.group({
      'origin': [, []],
      'destination': [, []],
      'deposit': [, []]

    })
  }

  public getDeposits() : void {
    this._depositService.getDeposits().subscribe(
      result => {
        if(result && result.deposits){
          this.deposits = result.deposits
        } else {
          this.showMessage("No se encontraron depositos" , "danger", false);
        }
      },
      error => {
        this.showMessage(error._body, "danger", false);
      }
    )
  }

  public selectTransfer() :void {

    let valid = true;

    if(this.transferForm.value.origin === this.transferForm.value.destination && this.op === 'transfer'){
      this.showMessage("No puede seleccionar el mismo deposito de origen y destino",'danger',true)
      valid = false
    }

    if(this.op === 'transfer' && (this.transferForm.value.origin === null || this.transferForm.value.destination === null)){
      this.showMessage("Debe seleccionar un deposito para origen y otro para destino",'danger',true)
      valid = false
    }

    if(valid){
      this.activeModal.close({ origin: this.transferForm.value.origin, destination: this.transferForm.value.destination, deposit: this.transferForm.value.deposit });
    }
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
