import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import * as moment from 'moment';
import 'moment/locale/es';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CashBoxType } from '../cash-box-type.model';
import { CashBoxTypeService } from '../cash-box-type.service';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';
import { CapitalizePipe } from 'app/main/pipes/capitalize';
import { Subscription, Subject } from 'rxjs';
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { TranslatePipe } from '@ngx-translate/core';
import { FormField } from 'app/util/formField.interface';

@Component({
  selector: 'app-cash-box-type',
  templateUrl: './cash-box-type.component.html',
  styleUrls: ['./cash-box-type.component.scss'],
  providers: [NgbAlertConfig, TranslateMePipe, TranslatePipe]
})

export class CashBoxTypeComponent implements OnInit {

  @Input() objId: string;
  @Input() readonly: boolean;
  @Input() operation: string;
  public obj: CashBoxType;
  public objForm: FormGroup;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public title: string = 'cash-box-type';
  private subscription: Subscription = new Subscription();
  private capitalizePipe: CapitalizePipe = new CapitalizePipe();
  public focus$: Subject<string>[] = new Array();
  public stateId: number;
  public filesToUpload: Array<File>;
  public selectedFile: File = null;
  public filename: string;
  public src: any;
  public imageURL: string;

  public formFields: FormField[] = [{
    name: 'name',
    tag: 'input',
    tagType: 'text',
    validators: [Validators.required],
    focus: true,
    class: 'form-group col-md-12'
  }];
  public formErrors: {} = {};
  public validationMessages = {
    'required': 'Este campo es requerido.',
  };

  constructor(
    private _objService: CashBoxTypeService,
    private _toastr: ToastrService,
    private _title: Title,
    public _fb: FormBuilder,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public translatePipe: TranslateMePipe
  ) {
    this.obj = new CashBoxType();
    for (let field of this.formFields) {
      this.formErrors[field.name] = '';
      if (field.tag === 'autocomplete') {
        this.focus$[field.name] = new Subject<string>();
      }
    }
  }

  public async ngOnInit() {
    this.title = this.translatePipe.transform(this.operation) + " " + this.translatePipe.transform(this.title);
    this.title = this.capitalizePipe.transform(this.title);
    this._title.setTitle(this.title);
    this.buildForm();
    if (this.objId && this.objId !== '') {
      this.subscription.add(this._objService.getById(this.objId).subscribe(
        result => {
          this.loading = false;
          if (result.status === 200) {
            this.obj = result.result;
            this.setValuesForm();
          }
          else this.showToast(result);
        },
        error => this.showToast(error)
      ));
    } else {
      if (this.operation !== 'add') this.showToast(null, 'danger', 'Debe ingresar un identificador válido')
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
      _id: [this.obj._id]
    };
    for (let field of this.formFields) {
      fields[field.name] = [this.obj[field.name], field.validators]
    }
    this.objForm = this._fb.group(fields);

    this.objForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.focusEvent.emit(true);
  }

  public onValueChanged(fieldID?: any): void {
    if (!this.objForm) { return; }
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

  public validateAutocomplete(c: FormControl) {
    let result = (c.value && Object.keys(c.value)[0] === '0') ? {
      validateAutocomplete: {
        valid: false
      }
    } : null;
    return result;
  }

  public setValuesForm(): void {
    let values: {} = {
      _id: this.obj._id
    }
    for (let field of this.formFields) {
      switch (field.tagType) {
        case 'date':
          values[field.name] = (this.obj[field.name] !== undefined) ? moment(this.obj[field.name]).format('YYYY-MM-DD') : null
          break;
        default:
          values[field.name] = (this.obj[field.name] !== undefined) ? this.obj[field.name] : null
          break;
      }
    }
    this.objForm.patchValue(values);
  }

  public async addObj() {

    let isValid: boolean = true;

    isValid = (this.operation === 'delete') ? true : this.objForm.valid;

    if (isValid) {
      this.obj = this.objForm.value;
    } else {
      this.onValueChanged();
    }

    if (isValid) {
      for (let field of this.formFields) {
        switch (field.tagType) {
          case 'date':
            this.obj[field.name] = moment(this.obj[field.name]).format('YYYY-MM-DD') + moment().format('THH:mm:ssZ');
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
        result => {
          this.showToast(result);
          if (result.status === 200) this.activeModal.close({ obj: this.obj });
        },
        error => this.showToast(error)
      )
    );
  }

  public updateObj() {
    this.loading = true;
    this.subscription.add(
      this._objService.update(this.obj).subscribe(
        result => {
          this.showToast(result);
          if (result.status === 200) this.activeModal.close({ obj: this.obj });
        },
        error => this.showToast(error)
      )
    );
  }

  public deleteObj() {
    this.loading = true;
    this.subscription.add(
      this._objService.delete(this.obj._id).subscribe(
        async result => {
          this.showToast(result);
          if (result.status === 200) this.activeModal.close({ obj: this.obj });
        },
        error => this.showToast(error)
      )
    );
  }

  public showToast(result, type?: string, title?: string, message?: string): void {
    if (result) {
      if (result.status === 200) {
        type = 'success';
        title = result.message;
      } else if (result.status >= 400) {
        type = 'danger';
        title = (result.error && result.error.message) ? result.error.message : result.message;
      } else {
        type = 'info';
        title = result.message;
      }
    }
    switch (type) {
      case 'success':
        this._toastr.success(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
      case 'danger':
        this._toastr.error(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
      default:
        this._toastr.info(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
    }
    this.loading = false;
  }
}
