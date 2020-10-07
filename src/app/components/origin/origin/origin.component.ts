import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { OriginService } from '../origin.service';

import { Origin } from '../origin';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Config } from 'app/app.config';
import { BranchService } from 'app/components/branch/branch.service';
import { Branch } from 'app/components/branch/branch';

@Component({
  selector: 'app-origin',
  templateUrl: './origin.component.html',
  styleUrls: ['./origin.component.css'],
  providers: [NgbAlertConfig]
})

export class OriginComponent implements OnInit {

  @Input() operation: string;
  @Input() readonly: boolean;
  @Input() originId : string;
  public alertMessage: string = '';
  public userType: string;
  public origin: Origin;
  public areOriginEmpty: boolean = true;
  public orderTerm: string[] = ['number'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public userCountry: string;
  public originForm: FormGroup;
  public branches: Branch[];
  public orientation: string = 'horizontal';

  public formErrors = {
    'number': '',
    'branch': ''
  };

  public validationMessages = {
    'number': {
      'required': 'Este campo es requerido.'
    },
    'branch': {
      'required': 'Este campo es requerido.'
    }
  };

  constructor(
    private _originService: OriginService,
    private _branchService: BranchService,
    private _router: Router,
    private _fb: FormBuilder,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
  ) {
    if(window.screen.width < 1000) this.orientation = 'vertical';
    this.origin = new Origin();
    this.branches = new Array();
  }

  ngOnInit() {
    this.userCountry = Config.country;
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.buildForm();
    this.getBranches();
    
    if (this.originId) {
      this.getOrigin();
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getOrigin() {

    this.loading = true;

    this._originService.getOrigin(this.originId).subscribe(
      result => {
        if (!result.origin) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.hideMessage();
          this.origin = result.origin;
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
   
    if (!this.origin._id) { this.origin._id = ''; }
    if (!this.origin.number) { this.origin.number = 0; }

    let branch;
    if (!this.origin.branch) {
      branch = null;
    } else {
      if (this.origin.branch._id) {
        branch = this.origin.branch._id;
      } else {
        branch = this.origin.branch;
      }
    }

    const values = {
      '_id': this.origin._id,
      'number': this.origin.number,
      'branch': branch,
    };
    this.originForm.setValue(values);
  }

  public buildForm(): void {

    this.originForm = this._fb.group({
      '_id' : [this.origin._id, []],
      'number': [this.origin.number, [
        Validators.required
        ]
      ],
      'branch': [this.origin.branch, [
        Validators.required
        ]
      ]
    });

    this.originForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {

    if (!this.originForm) { return; }
    const form = this.originForm;

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

  public getBranches(): void {

   this.loading = true;
   
   this._branchService.getBranches(
       { number:1, name: 1, operationType: 1 }, // PROJECT
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

  public addOrigin() {

    switch (this.operation) {
      case 'add':
        this.saveOrigin();
        break;
      case 'update':
        this.updateOrigin();
        break;
      case 'delete' :
        this.deleteOrigin();
      default:
        break;
    }
  }

  public updateOrigin() {

    this.loading = true;

    this.origin = this.originForm.value;

    this._originService.updateOrigin(this.origin).subscribe(
      result => {
        if (!result.origin) {
          this.loading = false;
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
          this.loading = false;
          this.showMessage('El punto de venta se ha actualizado con éxito.', 'success', false);
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public saveOrigin() {

    this.loading = true;

    this.origin = this.originForm.value;

    this._originService.saveOrigin(this.origin).subscribe(
      result => {
        if (!result.origin) {
          this.loading = false;
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
            this.loading = false;
            this.showMessage('El punto de venta se ha añadido con éxito.', 'success', false);
            this.origin = new Origin();
            this.buildForm();
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public deleteOrigin() {

    this.loading = true;

    this._originService.deleteOrigin(this.origin._id).subscribe(
      result => {
        this.loading = false;
        if (!result.origin) {
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


