import { Component, EventEmitter, OnInit, ViewEncapsulation } from '@angular/core';
import {
  NgForm,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import * as moment from 'moment';
import 'moment/locale/es';

import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';
import { Category, FormField } from '@types';
import { Config } from 'app/app.config';
import { Article } from 'app/components/article/article';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { CapitalizePipe } from 'app/shared/pipes/capitalize';
import { TranslateMePipe } from 'app/shared/pipes/translate-me';
import { Subject, Subscription } from 'rxjs';
import { ReportService } from '../../../core/services/report.service';
import { Report } from '../report.model';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
  providers: [NgbAlertConfig, TranslateMePipe, TranslatePipe],
  encapsulation: ViewEncapsulation.None,
})
export class ReportComponent implements OnInit {
  public objId: string;
  public readonly: boolean;
  public operation: string;
  public obj: Report;
  public objForm: UntypedFormGroup;
  public name;
  public loading: boolean = false;
  public param: UntypedFormArray;
  public focusEvent = new EventEmitter<boolean>();
  public title: string = 'report';
  private subscription: Subscription = new Subscription();
  private capitalizePipe: CapitalizePipe = new CapitalizePipe();
  public focus$: Subject<string>[] = new Array();
  public stateId: number;
  public filesToUpload: any[] = new Array();
  public filesToUploadHome: any[] = new Array();
  public filename: any[] = new Array();
  public typeFile: any[] = new Array();
  public oldFiles: any[];
  public database: string = Config.database;
  public home: {
    title: string;
    view: string;
    order: number;
    resources: {
      article: Article;
      category: Category;
      banner: string;
      order: number;
      link: string;
    }[];
  }[];

  public filesToArray: Array<File>;
  public fileNamePrincipal: string;

  public from;
  public to;

  public formFields: FormField[] = [
    {
      name: 'Datos del reporte',
      tag: 'separator',
      tagType: null,
      class: 'form-group col-md-12',
    },
    {
      name: 'name',
      tag: 'input',
      tagType: 'text',
      validators: [Validators.required],
      class: 'form-group col-md-8',
    },
    {
      name: 'table',
      tag: 'select',
      tagType: 'text',
      values: [
        'Transaction',
        'Movement-Of-Cash',
        'Stock',
        'Movimiento de Producto',
        'Movimiento de Cancelacion',
        'Producto',
      ],
      class: 'form-group col-md-4',
    },
    {
      name: 'query',
      tag: 'textarea',
      tagType: 'text',
      validators: [Validators.required],
      class: 'form-group col-md-12',
    },
  ];
  public formErrors: {} = {};
  public validationMessages = {
    required: 'Este campo es requerido.',
  };

  constructor(
    private _objService: ReportService,
    private _toastService: ToastService,
    private _title: Title,
    public _fb: UntypedFormBuilder,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public translatePipe: TranslateMePipe,
    private _router: Router
  ) {
    this.obj = new Report();
    for (let field of this.formFields) {
      if (field.tag !== 'separator') {
        this.formErrors[field.name] = '';
        if (field.tag === 'autocomplete') {
          this.focus$[field.name] = new Subject<string>();
        }
        if (field.default) {
          this.obj[field.name] = field.default;
        }
      }
    }

    this.home = new Array();
  }

  public async ngOnInit() {
    let pathUrl: string[] = this._router.url.split('/');
    this.operation = pathUrl[2];
    if (this.operation !== 'add' && this.operation !== 'update') this.readonly = false;
    this.title = this.translatePipe.transform(this.operation) + ' ' + this.translatePipe.transform(this.title);
    this.title = this.capitalizePipe.transform(this.title);
    this._title.setTitle(this.title);
    this.buildForm();
    this.objId = pathUrl[3];
    if (this.objId && this.objId !== '') {
      this.subscription.add(
        this._objService.getById(this.objId).subscribe(
          (result) => {
            this.loading = false;
            if (result.status === 200) {
              this.obj = result.result;
              this.setValuesForm();
            } else this._toastService.showToast(result);
          },
          (error) => this._toastService.showToast(error)
        )
      );
    }
  }

  public ngAfterViewInit(): void {
    this.focusEvent.emit(true);
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public getFiles(fieldName) {
    return eval('this.obj?.' + fieldName.split('.').join('?.'));
  }

  public onFileSelected(event, model: string) {
    this.filesToUpload[model] = event.target.files;
    this.filename[model] = '';
    let i: number = 0;
    for (let file of this.filesToUpload[model]) {
      if (i != 0) this.filename[model] += ', ';
      this.filename[model] += file.name;
      i++;
    }
    this.typeFile[model] = this.filesToUpload[model][0].type.split('/')[0];
  }

  public buildForm(): void {
    let fields: {} = {
      _id: [this.obj._id],
      params: this._fb.array([]),
    };
    for (let field of this.formFields) {
      if (field.tag !== 'separator') fields[field.name] = [this.obj[field.name], field.validators];
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
      if (field.tag !== 'separator') {
        if (field.name.split('.').length > 1) {
          let sumF: string = '';
          let entro: boolean = false;
          for (let f of field.name.split('.')) {
            sumF += `['${f}']`;
            if (eval(`this.obj${sumF}`) == null || eval(`this.obj${sumF}`) == undefined) {
              entro = true;
              eval(`this.obj${sumF} = {}`);
            }
          }
          if (entro) eval(`this.obj${sumF} = null`);
        }
        switch (field.tagType) {
          case 'date':
            values[field.name] =
              eval('this.obj.' + field.name) !== undefined
                ? moment(eval('this.obj.' + field.name)).format('YYYY-MM-DD')
                : null;
            break;
          case 'file':
            if (!this.oldFiles || !this.oldFiles[field.name]) {
              this.oldFiles = new Array();
              this.oldFiles[field.name] = eval('this.obj?.' + field.name);
            }
            break;
          default:
            if (field.tag !== 'separator')
              values[field.name] = eval('this.obj.' + field.name) !== undefined ? eval('this.obj.' + field.name) : null;
            break;
        }
      }
    }

    if (this.obj.params && this.obj.params.length > 0) {
      let params = <UntypedFormArray>this.objForm.controls.params;
      this.obj.params.forEach((x) => {
        params.push(
          this._fb.group({
            _id: null,
            name: x.name,
            type: x.type,
          })
        );
      });
    }

    this.objForm.patchValue(values);
  }

  public addParam(paramForm: NgForm): void {
    let valid = true;
    const params = this.objForm.controls.params as UntypedFormArray;

    if (paramForm.value.name === '' || paramForm.value.type === '') {
      this._toastService.showToast({
        type: 'warning',
        message: 'Debe completar todos los campos',
      });
      valid = false;
    }

    if (valid) {
      params.push(
        this._fb.group({
          _id: null,
          name: paramForm.value.name,
          type: paramForm.value.type,
        })
      );
      paramForm.resetForm();
    }
  }

  deleteParam(index) {
    let control = <UntypedFormArray>this.objForm.controls.params;
    control.removeAt(index);
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
            this.obj[field.name] = moment(this.obj[field.name]).format('YYYY-MM-DD') + moment().format('THH:mm:ssZ');
            break;
          case 'number':
            this.obj[field.name] = parseFloat(this.obj[field.name]);
            break;

          case 'boolean':
            this.obj[field.name] = this.obj[field.name] == 'true' || this.obj[field.name] == true;
          case 'text':
            if (
              field.tag === 'autocomplete' &&
              (this.obj[field.name] == '' || (this.obj[field.name] && !this.obj[field.name]['_id']))
            ) {
              this.obj[field.name] = null;
            }
            break;
          default:
            break;
        }
      }
    }

    if (isValid) {
      this.obj['design.home'] = new Array();
      this.home.forEach((element) => {
        this.obj['design.home'].push(element);
      });

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
    } else {
      this._toastService.showToast({
        type: 'info',
        message: 'Revise los errores marcados en el formulario',
      });
    }
  }

  public saveObj() {
    this.loading = true;
    this.subscription.add(
      this._objService.save(this.obj).subscribe(
        (result) => {
          this._toastService.showToast(result);
          if (result.status === 200) this._router.navigate(['/reports']);
        },
        (error) => this._toastService.showToast(error)
      )
    );
  }

  public updateObj() {
    this.loading = true;
    this.subscription.add(
      this._objService.update(this.obj).subscribe(
        (result) => {
          this._toastService.showToast(result);
          if (result.status === 200) this._router.navigate(['/reports']);
        },
        (error) => this._toastService.showToast(error)
      )
    );
  }

  public deleteObj() {
    this.loading = true;
    this.subscription.add(
      this._objService.delete(this.obj._id).subscribe(
        async (result) => {
          this._toastService.showToast(result);
          if (result.status === 200) {
            this._router.navigate(['/reports']);
          }
        },
        (error) => this._toastService.showToast(error)
      )
    );
  }

  public fileChangeEvent(fileInput: any, eCommerce: boolean): void {
    this.filesToUploadHome = <Array<File>>fileInput.target.files;
    this.fileNamePrincipal = this.filesToUploadHome[0].name;
  }
}
