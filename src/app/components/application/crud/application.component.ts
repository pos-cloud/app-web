import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import * as moment from 'moment';
import 'moment/locale/es';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Application, ApplicationType } from '../application.model';
import { ApplicationService } from '../application.service';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';
import { CapitalizePipe } from 'app/main/pipes/capitalize';
import { Subscription, Subject } from 'rxjs';
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { TranslatePipe } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss'],
  providers: [NgbAlertConfig, TranslateMePipe, TranslatePipe]
})

export class ApplicationComponent implements OnInit {

  public objId: string;
  public readonly: boolean;
  public operation: string;
  public obj: Application;
  public objForm: FormGroup;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public title: string = 'application';
  private subscription: Subscription = new Subscription();
  private capitalizePipe: CapitalizePipe = new CapitalizePipe();
  public focus$: Subject<string>[] = new Array();
  public stateId: number;
  public filesToUpload: Array<File>;
  public selectedFile: File = null;
  public filename: string;
  public src: any;
  public imageURL: string;

  public formFields: {
    name: string,
    tag: string,
    tagType: string,
    search: any,
    format: any,
    values: any[],
    validators: any[],
    focus: boolean,
    class: string
  }[] = [{
    name: 'Datos',
    tag: 'separator',
    tagType: null,
    search: null,
    format: null,
    values: null,
    validators: null,
    focus: true,
    class: 'form-group col-md-12'
  }, {
    name: 'order',
    tag: 'input',
    tagType: 'number',
    search: null,
    format: null,
    values: null,
    validators: [Validators.required],
    focus: true,
    class: 'form-group col-md-2'
  }, {
    name: 'type',
    tag: 'select',
    tagType: 'text',
    search: null,
    format: null,
    values: [ApplicationType.Web, ApplicationType.App],
    validators: [Validators.required],
    focus: true,
    class: 'form-group col-md-2'
  }, {
    name: 'name',
    tag: 'input',
    tagType: 'text',
    search: null,
    format: null,
    values: null,
    validators: [Validators.required],
    focus: true,
    class: 'form-group col-md-4'
  }, {
    name: 'url',
    tag: 'input',
    tagType: 'text',
    search: null,
    format: null,
    values: null,
    validators: [Validators.required],
    focus: true,
    class: 'form-group col-md-4'
  }, {
    name: 'Redes sociales',
    tag: 'separator',
    tagType: null,
    search: null,
    format: null,
    values: null,
    validators: null,
    focus: true,
    class: 'form-group col-md-12'
  }, {
    name: 'socialNetworks.facebook',
    tag: 'input',
    tagType: 'text',
    search: null,
    format: null,
    values: null,
    validators: null,
    focus: true,
    class: 'form-group col-md-4'
  }, {
    name: 'socialNetworks.instagram',
    tag: 'input',
    tagType: 'text',
    search: null,
    format: null,
    values: null,
    validators: null,
    focus: true,
    class: 'form-group col-md-4'
  }, {
    name: 'socialNetworks.twitter',
    tag: 'input',
    tagType: 'text',
    search: null,
    format: null,
    values: null,
    validators: null,
    focus: true,
    class: 'form-group col-md-4'
  }, {
    name: 'Diseño',
    tag: 'separator',
    tagType: null,
    search: null,
    format: null,
    values: null,
    validators: null,
    focus: true,
    class: 'form-group col-md-12'
  }, {
    name: 'design.showFilters',
    tag: 'select',
    tagType: null,
    search: null,
    format: null,
    values: ['true', 'false'],
    validators: null,
    focus: true,
    class: 'form-group col-md-4'
  }, {
    name: 'design.about',
    tag: 'textarea',
    tagType: null,
    search: null,
    format: null,
    values: ['true', 'false'],
    validators: null,
    focus: true,
    class: 'form-group col-md-12'
  }];
  public formErrors: {} = {};
  public validationMessages = {
    'required': 'Este campo es requerido.',
  };

  constructor(
    private _objService: ApplicationService,
    private _toastr: ToastrService,
    private _title: Title,
    public _fb: FormBuilder,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public translatePipe: TranslateMePipe,
    private _router: Router,
  ) {
    this.obj = new Application();
    for (let field of this.formFields) {
      if (field.tag !== 'separator') {
        this.formErrors[field.name] = '';
        if (field.tag === 'autocomplete') {
          this.focus$[field.name] = new Subject<string>();
        }
      }
    }
  }

  public async ngOnInit() {
    let pathUrl: string[] = this._router.url.split('/');
    this.operation = pathUrl[2];
    if (this.operation !== 'add' && this.operation !== 'update') this.readonly = false;
    this.title = this.translatePipe.transform(this.operation) + " " + this.translatePipe.transform(this.title);
    this.title = this.capitalizePipe.transform(this.title);
    this._title.setTitle(this.title);
    this.buildForm();
    this.objId = pathUrl[3];
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
      if (field.tag !== 'separator') fields[field.name] = [this.obj[field.name], field.validators]
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
      if (field.tag !== 'separator') {
        if (field.name.split('.').length > 1) {
          for (let f of field.name.split('.')) {
            if (!eval('this.obj.' + f)) {
              this.obj[f] = {};
            }
          }
        }
        switch (field.tagType) {
          case 'date':
            values[field.name] = (eval("this.obj." + field.name) !== undefined) ? moment(eval("this.obj." + field.name)).format('YYYY-MM-DD') : null
            break;
          default:
            if (field.tag !== 'separator') values[field.name] = (eval("this.obj." + field.name) !== undefined) ? eval("this.obj." + field.name) : null
            break;
        }
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
            this.obj[field.name] = moment(eval("this.obj." + field.name)).format('YYYY-MM-DD') + moment().format('THH:mm:ssZ');
            break;
          case 'number':
            this.obj[field.name] = parseFloat(eval("this.obj." + field.name));
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
          if (result.status === 200) this._router.navigate(['/applications']);
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
          if (result.status === 200) this._router.navigate(['/applications']);
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
          if (result.status === 200) this._router.navigate(['/applications']);
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
