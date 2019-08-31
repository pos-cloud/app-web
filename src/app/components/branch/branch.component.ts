import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';


import { BranchService } from '../../services/branch.service';

import { Branch } from '../../models/branch';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Config } from 'app/app.config';

@Component({
  selector: 'app-branch',
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.css'],
  providers: [NgbAlertConfig]
})

export class BranchComponent implements OnInit {

  @Input() operation: string;
  @Input() readonly: boolean;
  @Input() branchId : string;
  public alertMessage: string = '';
  public userType: string;
  public branch: Branch;
  public areBranchEmpty: boolean = true;
  public orderTerm: string[] = ['name'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public userCountry: string;
  public orientation: string = 'horizontal';

  public formErrors = {
    'number': '',
    'name': ''
  };

  public validationMessages = {
    'number': {
      'required': 'Este campo es requerido.'
    },
    'name': {
      'required': 'Este campo es requerido.'
    }
  };

  public branchForm: FormGroup;

  constructor(
    public alertConfig: NgbAlertConfig,
    public _branchService: BranchService,
    public _router: Router,
    public _fb: FormBuilder,
    public activeModal: NgbActiveModal,
  ) {
    if(window.screen.width < 1000) this.orientation = 'vertical';
    this.branch = new Branch();
  }

  ngOnInit() {
    this.userCountry = Config.country;
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];;
    this.buildForm();
    
    if (this.branchId) {
      this.getBranch();
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getBranch() {

    this.loading = true;

    this._branchService.getBranch(this.branchId).subscribe(
      result => {
        if (!result.branch) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.hideMessage();
          this.branch = result.branch;
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

  public setValueForm(): void {
   
    if (!this.branch._id) { this.branch._id = ''; }
    if (!this.branch.number) { this.branch.number = 0; }
    if (!this.branch.name) { this.branch.name = ''; }

    const values = {
      '_id': this.branch._id,
      'number': this.branch.number,
      'name': this.branch.name,
    };
    this.branchForm.setValue(values);
  }

  public buildForm(): void {

    this.branchForm = this._fb.group({
      '_id' : [this.branch._id, []],
      'number': [this.branch.number, [
        Validators.required
        ]
      ],
      'name': [this.branch.name, [
        Validators.required
        ]
      ]
    });

    this.branchForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {

    if (!this.branchForm) { return; }
    const form = this.branchForm;

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

  public addBranch() {

    switch (this.operation) {
      case 'add':
        this.saveBranch();
        break;
      case 'edit':
        this.updateBranch();
        break;
      case 'delete' :
        this.deleteBranch();
      default:
        break;
    }
  }

  public updateBranch() {

    this.loading = true;

    this.branch = this.branchForm.value;

    this._branchService.updateBranch(this.branch).subscribe(
      result => {
        if (!result.branch) {
          this.loading = false;
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
          this.loading = false;
          this.showMessage('La sucursal se ha actualizado con éxito.', 'success', false);
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public saveBranch() {

    this.loading = true;

    this.branch = this.branchForm.value;

    this._branchService.saveBranch(this.branch).subscribe(
      result => {
        if (!result.branch) {
          this.loading = false;
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
            this.loading = false;
            this.showMessage('La sucursal se ha añadido con éxito.', 'success', false);
            this.branch = new Branch();
            this.buildForm();
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public deleteBranch() {

    this.loading = true;

    this._branchService.deleteBranch(this.branch._id).subscribe(
      result => {
        this.loading = false;
        if (!result.branch) {
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
            this.activeModal.close();
        }
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


