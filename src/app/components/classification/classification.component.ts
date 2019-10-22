import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';


import { ClassificationService } from '../../services/classification.service';

import { Classification } from '../../models/classification';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Config } from 'app/app.config';


@Component({
  selector: 'app-classification',
  templateUrl: './classification.component.html',
  styleUrls: ['./classification.component.css']
})
export class ClassificationComponent implements OnInit {

  @Input() operation: string;
  @Input() readonly: boolean;
  @Input() classificationId : string;
  public alertMessage: string = '';
  public userType: string;
  public classification: Classification;
  public areClassificationEmpty: boolean = true;
  public orderTerm: string[] = ['name'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public userCountry: string;
  public classificationForm: FormGroup;
  public orientation: string = 'horizontal';

  public formErrors = {
    'name': '',
  };

  public validationMessages = {
    'name': {
      'required': 'Este campo es requerido.'
    }
  };

  constructor(
    public alertConfig: NgbAlertConfig,
    public _classificationService: ClassificationService,
    public _router: Router,
    public _fb: FormBuilder,
    public activeModal: NgbActiveModal,
  ) {
    if(window.screen.width < 1000) this.orientation = 'vertical';
    this.classification = new Classification();
  }

  ngOnInit() {
    this.userCountry = Config.country;
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];;
    this.buildForm();
    
    if (this.classificationId) {
      this.getClassification();
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getClassification() {

    this.loading = true;

    this._classificationService.getClassification(this.classificationId).subscribe(
      result => {
        if (!result.classification) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.hideMessage();
          this.classification = result.classification;
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

   
    if (!this.classification._id) { this.classification._id = ''; }
    if (!this.classification.name) { this.classification.name = ''; }


    const values = {
      '_id': this.classification._id,
      'name': this.classification.name
    };
    this.classificationForm.setValue(values);
  }

  public buildForm(): void {

    this.classificationForm = this._fb.group({
      '_id' : [this.classification._id, []],
      'name': [this.classification.name, [
        Validators.required
        ]
      ]
    });

    this.classificationForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {

    if (!this.classificationForm) { return; }
    const form = this.classificationForm;

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

  public addClassification() {

    switch (this.operation) {
      case 'add':
        this.saveClassification();
        break;
      case 'edit':
        this.updateClassification();
        break;
      case 'delete' :
        this.deleteClassification();
      default:
        break;
    }
  }

  public updateClassification() {

    this.loading = true;

    this.classification = this.classificationForm.value;

    this._classificationService.updateClassification(this.classification).subscribe(
      result => {
        if (!result.classification) {
          this.loading = false;
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
          this.loading = false;
          this.showMessage('La clasificación se ha actualizado con éxito.', 'success', false);
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public saveClassification() {

    this.loading = true;

    this.classification = this.classificationForm.value;

    this._classificationService.saveClassification(this.classification).subscribe(
      result => {
        if (!result.classification) {
          this.loading = false;
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
            this.loading = false;
            this.showMessage('La clasificación se ha añadido con éxito.', 'success', false);
            this.classification = new Classification();
            this.buildForm();
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public deleteClassification() {

    this.loading = true;

    this._classificationService.deleteClassification(this.classification._id).subscribe(
      result => {
        this.loading = false;
        if (!result.classification) {
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
