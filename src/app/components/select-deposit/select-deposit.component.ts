import { Component, OnInit } from '@angular/core';
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

  public transferForm : FormGroup
  public deposits : Deposit[];
  public alertMessage = '';

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
      'destination': [, []]
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
    this.activeModal.close({ origin: this.transferForm.value.origin, destination: this.transferForm.value.destination });
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
