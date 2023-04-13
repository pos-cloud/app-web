import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { RelationType } from '../relation-type';

import { RelationTypeService } from '../relation-type.service';

@Component({
  selector: 'app-relation-type',
  templateUrl: './relation-type.component.html',
  styleUrls: ['./relation-type.component.css'],
  providers: [NgbAlertConfig]
})

export class RelationTypeComponent implements OnInit {

  public relationType: RelationType;
  @Input() relationTypeId: string;
  @Input() operation: string;
  @Input() readonly: boolean;
  public relationTypeForm: UntypedFormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'code': '',
    'description': ''
  };

  public validationMessages = {
    'code': {
      'required': 'Este campo es requerido.'
    },
    'description': {
      'required': 'Este campo es requerido.'
    }
  };

  constructor(
    public _relationTypeService: RelationTypeService,
    public _fb: UntypedFormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) {
    this.relationType = new RelationType();
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.buildForm();
    if (this.relationTypeId) {
      this.getRelationType();
    } else {
      this.getLastRelationType();
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.relationTypeForm = this._fb.group({
      '_id': [this.relationType._id, [
        ]
      ],
      'code': [this.relationType.code, [
          Validators.required
        ]
      ],
      'description': [this.relationType.description, [
          Validators.required
        ]
      ]
    });

    this.relationTypeForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.relationTypeForm) { return; }
    const form = this.relationTypeForm;

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

  public getLastRelationType(): void {

    this.loading = true;

    let query = 'sort="code":-1&limit=1';

    this._relationTypeService.getRelationTypes(query).subscribe(
      result => {
        if (!result.relationTypes) {
          this.loading = false;
        } else {
          this.hideMessage();
          this.loading = false;
          try {
            this.relationType.code = (parseInt(result.relationTypes[0].code) + 1).toString();
            this.setValuesForm();
          } catch (e) {
          }
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }


  public getRelationType(): void {

    this.loading = true;

    this._relationTypeService.getRelationType(this.relationTypeId).subscribe(
      result => {
        if (!result.relationType) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.hideMessage();
          this.relationType = result.relationType;
          this.setValuesForm();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public setValuesForm(): void {

    if (!this.relationType._id) { this.relationType._id = ''; }
    if (!this.relationType.code) { this.relationType.code = '1'; }
    if (!this.relationType.description) { this.relationType.description = ''; }

    const values = {
      '_id': this.relationType._id,
      'code': this.relationType.code,
      'description': this.relationType.description,
    };

    this.relationTypeForm.setValue(values);
  }

  public addRelationType(): void {

    if (!this.readonly) {
      this.relationType = this.relationTypeForm.value;
      if (this.operation === 'add') {
        this.saveRelationType();
      } else if (this.operation === 'update') {
        this.updateRelationType();
      }
    }
  }

  public saveRelationType(): void {

    this.loading = true;

    this._relationTypeService.saveRelationType(this.relationType).subscribe(
      result => {
        if (!result.relationType) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.relationType = result.relationType;
          this.showMessage("El tipo de relación se ha añadido con éxito.", 'success', true);
          this.relationType = new RelationType ();
          this.buildForm();
          this.getLastRelationType();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public updateRelationType(): void {

    this.loading = true;

    this._relationTypeService.updateRelationType(this.relationType).subscribe(
      result => {
        if (!result.relationType) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.relationType = result.relationType;
          this.showMessage("El tipo de relación se ha actualizado con éxito.", 'success', true);
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public deleteRelationType(): void {

    this.loading = true;

    this._relationTypeService.deleteRelationType(this.relationType._id).subscribe(
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

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage():void {
    this.alertMessage = '';
  }
}
