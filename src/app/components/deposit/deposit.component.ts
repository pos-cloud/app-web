import { Component, OnInit, EventEmitter, ViewEncapsulation, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Deposit } from '../../models/deposit';

import { DepositService } from '../../services/deposit.service';
import { BranchService } from 'app/services/branch.service';
import { Branch } from 'app/models/branch';
import { VirtualTimeScheduler } from 'rxjs';

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None
})

export class DepositComponent implements OnInit {

  @Input() depositId: string;
  @Input() operation: string;
  @Input() readonly: boolean;
  
  public deposit: Deposit;
  public deposits : Deposit[];
  public branches: Branch[];
  public depositForm: FormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'name': '',
    'capacity': '',
    'branch': '',
    'default': ''
  };

  public validationMessages = {
    'name': {
      'required': 'Este campo es requerido.'
    },
    'branch': {
      'required': 'Este campo es requerido.'
    },
    'capacity' : {
    }
  };

  constructor(
    public _depositService: DepositService,
    public _branchService: BranchService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) {
    this.getDeposits();
   }

  ngOnInit(): void {
    
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.deposit = new Deposit();
    this.branches = new Array();
    this.buildForm();
    this.getBranches();

    if(this.depositId) {
      this.getDeposit();
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getDeposit() : void {
    this._depositService.getDeposit(this.depositId).subscribe(
      result => {
        if(result && result.deposit) {
          this.deposit = result.deposit;
          this.setValuesForm();
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    )
  }

  public buildForm(): void {

    this.depositForm = this._fb.group({
      '_id': [this.deposit._id,[]],
      'name': [this.deposit.name, [
        Validators.required
        ]
      ],
      'branch': [this.deposit.branch, [
        Validators.required
        ]
      ],
      'capacity' : [this.deposit.capacity, []],
      'default' : [this.deposit.default, []]
    });

    this.depositForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.depositForm) { return; }
    const form = this.depositForm;

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

  public deleteDeposit(): void {

    this.loading = true;

    this._depositService.deleteDeposit(this.deposit._id).subscribe(
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

  public getBranches(): void {

    this.loading = true;
    
    this._branchService.getBranches(
        { name: 1, operationType: 1 }, // PROJECT
        { operationType: { $ne: 'D' } }, // MATCH
        { name: 1 }, // SORT
        {}, // GROUP
        0, // LIMIT
        0 // SKIP
    ).subscribe(
      result => {
        if (result && result.branches) {
          this.branches = result.branches;
        } else {
          this.branches = new Array();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getDeposits() : void {
    this._depositService.getDeposits().subscribe(
      result =>{
        if(result && result.deposits) {
          this.deposits = result.deposits
          console.log(this.deposits)
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    )
  }

  /*public isValid() : boolean {
    
    let valid = true;

    if(this.deposit.default === null) {
      this.showMessage("Debe seleccionar si es primario", 'danger', true);
      valid = false;
    }

    if(this.deposits && this.deposits.length > 0 && this.deposit.default !== null) {
      for (const element of this.deposits) {
        if(this.deposit.default === true && element.default === this.deposit.default && element.branch._id.toString() === this.deposit.branch.toString()) {
          this.showMessage("Solo puede existir un depósito principal por sucursal.", 'danger', true);
          valid = false;
        }
      }
    }
    
    return valid
  }*/

  public isValid(): Promise<boolean> {

    return new Promise((resolve, reject) => {

        if (this.deposits && this.deposits.length > 0 && this.deposit.default !== null) {
            for (const element of this.deposits) {
                if (this.operation === "add" && 
                        this.deposit.default && 
                        element.default === this.deposit.default &&
                        element.branch._id === this.deposit.branch.toString()) {
                    this.showMessage("Solo puede existir un depósito principal por sucursal.", 'danger', true);
                            resolve(false)
                }

                if (this.operation === "update" && 
                        this.deposit.default && 
                        element.default === this.deposit.default && 
                        element.branch._id === this.deposit.branch.toString() &&
                        element._id !== this.deposit._id){
                            this.showMessage("Solo puede existir un depósito principal por sucursal.", 'danger', true);
                            resolve(false)
                }
            }
            resolve(true)
        } else {
            resolve(true)
        }

    })
}

  public addDeposit(): void {

    switch (this.operation) {
      case 'add':
        this.saveDeposit();
        break;
      case 'update':
        this.updateDeposit();
        break;
    }

  }

  public setValuesForm(): void {

    if(!this.deposit._id) this.deposit._id = '';
    if(!this.deposit.name) this.deposit.name = '';
    if(!this.deposit.capacity) this.deposit.capacity = 0;
    if(!this.deposit.default) this.deposit.default = false;


    let branch;
    if (!this.deposit.branch) {
      branch = null;
    } else {
      if (this.deposit.branch._id) {
        branch = this.deposit.branch._id;
      } else {
        branch = this.deposit.branch;
      }
    }
    
    this.depositForm.setValue({
      '_id': this.deposit._id,
      'name': this.deposit.name,
      'branch': branch,
      'capacity' : this.deposit.capacity,
      'default' : this.deposit.default
    });
  }

  async updateDeposit() {


    this.deposit = this.depositForm.value;

    this.loading = true;

    if(await this.isValid()) {
      this._depositService.updateDeposit(this.deposit).subscribe(
        result => {
          if (!result.deposit) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            this.loading = false;
          } else {
            this.deposit = result.deposit;
            this.showMessage("El depósito se ha actualizado con éxito.", 'success', false);
          }
          this.loading = false;
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
    } else {
      this.loading = false
    }
  }

  async saveDeposit() {

    this.deposit = this.depositForm.value;

    this.loading = true;

    if(await this.isValid()) {
      this._depositService.saveDeposit(this.deposit).subscribe(
        result => {
          if (!result.deposit) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            this.loading = false;
          } else {
            this.deposit = result.deposit;
            this.showMessage("El depósito se ha añadido con éxito.", 'success', true);
            this.deposit = new Deposit();
            this.buildForm();
          }
          this.loading = false;
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
    } else {
      this.loading = false
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
