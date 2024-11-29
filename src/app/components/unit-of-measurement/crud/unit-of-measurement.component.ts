import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import * as moment from 'moment';
import 'moment/locale/es';

import { Title } from '@angular/platform-browser';
import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';
import { FormField } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { CapitalizePipe } from 'app/shared/pipes/capitalize';
import { TranslateMePipe } from 'app/shared/pipes/translate-me';
import { Subject, Subscription } from 'rxjs';
import { UnitOfMeasurementService } from '../../../core/services/unit-of-measurement.service';
import { UnitOfMeasurement } from '../unit-of-measurement.model';

@Component({
  selector: 'app-unit-of-measurement',
  templateUrl: './unit-of-measurement.component.html',
  styleUrls: ['./unit-of-measurement.component.scss'],
  providers: [NgbAlertConfig, TranslateMePipe, TranslatePipe],
})
export class UnitOfMeasurementComponent implements OnInit {
  @Input() objId: string;
  @Input() readonly: boolean;
  @Input() operation: string;
  public obj: UnitOfMeasurement;
  public objForm: UntypedFormGroup;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public title: string = 'unit-of-measurement';
  private subscription: Subscription = new Subscription();
  private capitalizePipe: CapitalizePipe = new CapitalizePipe();
  public focus$: Subject<string>[] = new Array();
  public stateId: number;
  public filesToUpload: Array<File>;
  public selectedFile: File = null;
  public filename: string;
  public src: any;
  public imageURL: string;

  public formFields: FormField[] = [
    {
      name: 'code',
      tag: 'input',
      tagType: 'text',
      validators: [Validators.required],
      focus: true,
      class: 'form-group col-md-3',
    },
    {
      name: 'abbreviation',
      tag: 'input',
      tagType: 'text',
      validators: [Validators.required],
      class: 'form-group col-md-3',
    },
    {
      name: 'name',
      tag: 'input',
      tagType: 'text',
      validators: [Validators.required],
      class: 'form-group col-md-6',
    },
  ];
  public formErrors: {} = {};
  public validationMessages = {
    required: 'Este campo es requerido.',
  };

  constructor(
    private _objService: UnitOfMeasurementService,
    private _toast: ToastService,
    private _title: Title,
    public _fb: UntypedFormBuilder,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public translatePipe: TranslateMePipe
  ) {
    this.obj = new UnitOfMeasurement();
    for (let field of this.formFields) {
      this.formErrors[field.name] = '';
      if (field.tag === 'autocomplete') {
        this.focus$[field.name] = new Subject<string>();
      }
    }
  }

  public async ngOnInit() {
    this.title =
      this.translatePipe.transform(this.operation) +
      ' ' +
      this.translatePipe.transform(this.title);
    this.title = this.capitalizePipe.transform(this.title);
    this._title.setTitle(this.title);
    this.buildForm();
    if (this.objId && this.objId !== '') {
      this.subscription.add(
        this._objService.getById(this.objId).subscribe(
          (result) => {
            this.loading = false;
            if (result.status === 200) {
              this.obj = result.result;
              this.setValuesForm();
            } else this._toast.showToast(result);
          },
          (error) => this._toast.showToast(error)
        )
      );
    } else {
      if (this.operation !== 'add')
        this._toast.showToast({
          type: 'danger',
          message: 'Debe ingresar un identificador válido',
        });
    }
  }

  public ngAfterViewInit(): void {
    this.focusEvent.emit(true);
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public buildForm(): void {
    let fields: {} = {
      _id: [this.obj._id],
    };
    for (let field of this.formFields) {
      fields[field.name] = [this.obj[field.name], field.validators];
    }
    this.objForm = this._fb.group(fields);

    this.objForm.valueChanges.subscribe((data) => this.onValueChanged(data));
    this.focusEvent.emit(true);
  }

  public onValueChanged(fieldID?: any): void {
    if (!this.objForm) {
      return;
    }
    const form = this.objForm;
    for (const field in this.formErrors) {
      if (!fieldID || field === fieldID) {
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && !control.valid) {
          const messages = this.validationMessages;
          for (const key in control.errors) {
            this.formErrors[field] += messages[key] + ' ';
          }
        }
      }
    }
  }

  public validateAutocomplete(c: UntypedFormControl) {
    let result =
      c.value && Object.keys(c.value)[0] === '0'
        ? {
            validateAutocomplete: {
              valid: false,
            },
          }
        : null;
    return result;
  }

  public setValuesForm(): void {
    let values: {} = {
      _id: this.obj._id,
    };
    for (let field of this.formFields) {
      switch (field.tagType) {
        case 'date':
          values[field.name] =
            this.obj[field.name] !== undefined
              ? moment(this.obj[field.name]).format('YYYY-MM-DD')
              : null;
          break;
        default:
          values[field.name] =
            this.obj[field.name] !== undefined ? this.obj[field.name] : null;
          break;
      }
    }
    this.objForm.patchValue(values);
  }

  public async addObj() {
    let isValid: boolean = true;

    isValid = this.operation === 'delete' ? true : this.objForm.valid;

    if (isValid) {
      this.obj = this.objForm.value;
    } else {
      this.onValueChanged();
    }

    if (isValid) {
      for (let field of this.formFields) {
        switch (field.tagType) {
          case 'date':
            this.obj[field.name] =
              moment(this.obj[field.name]).format('YYYY-MM-DD') +
              moment().format('THH:mm:ssZ');
            break;
          case 'number':
            this.obj[field.name] = parseFloat(this.obj[field.name]);
            break;
          default:
            break;
        }
      }
    }

    if (isValid) {
      switch (this.operation) {
        case 'add':
          this.saveObj();
          break;
        case 'update':
          this.updateObj();
          break;
        case 'delete':
          this.deleteObj();
          break;
      }
    }
  }

  public saveObj() {
    this.loading = true;
    this.subscription.add(
      this._objService.save(this.obj).subscribe(
        (result) => {
          this._toast.showToast(result);
          if (result.status === 200) this.activeModal.close({ obj: this.obj });
        },
        (error) => this._toast.showToast(error)
      )
    );
  }

  public updateObj() {
    this.loading = true;
    this.subscription.add(
      this._objService.update(this.obj).subscribe(
        (result) => {
          this._toast.showToast(result);
          if (result.status === 200) this.activeModal.close({ obj: this.obj });
        },
        (error) => this._toast.showToast(error)
      )
    );
  }

  public deleteObj() {
    this.loading = true;
    this.subscription.add(
      this._objService.delete(this.obj._id).subscribe(
        async (result) => {
          this._toast.showToast(result);
          if (result.status === 200) this.activeModal.close({ obj: this.obj });
        },
        (error) => this._toast.showToast(error)
      )
    );
  }
}
