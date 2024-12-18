import {
  Component,
  EventEmitter,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {
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
import { FormField } from '@types';
import { Config } from 'app/app.config';
import { VariantType } from 'app/components/variant-type/variant-type';
import { ApplicationService } from 'app/core/services/application.service';
import { VariantTypeService } from 'app/core/services/variant-type.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { CapitalizePipe } from 'app/shared/pipes/capitalize';
import { TranslateMePipe } from 'app/shared/pipes/translate-me';
import { Observable, Subject, Subscription, merge } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
} from 'rxjs/operators';
import { VariantValueService } from '../../../core/services/variant-value.service';
import { VariantValue } from '../variant-value';

@Component({
  selector: 'app-variant-value',
  templateUrl: './variant-value.component.html',
  styleUrls: ['./variant-value.component.scss'],
  providers: [NgbAlertConfig, TranslateMePipe, TranslatePipe],
  encapsulation: ViewEncapsulation.None,
})
export class VariantValueComponent implements OnInit {
  public objId: string;
  public readonly: boolean;
  public operation: string;
  public obj: VariantValue;
  public objForm: UntypedFormGroup;
  public loading: boolean = false;
  public schedule: UntypedFormArray;
  public focusEvent = new EventEmitter<boolean>();
  public title: string = 'variant-value';
  private subscription: Subscription = new Subscription();
  private capitalizePipe: CapitalizePipe = new CapitalizePipe();
  public focus$: Subject<string>[] = new Array();
  public stateId: number;
  public filesToUpload: any[] = new Array();
  public filename: any[] = new Array();
  public typeFile: any[] = new Array();
  public oldFiles: any[];
  public database: string = Config.database;
  public selectedFile: File = null;
  public src: any;
  public imageURL: string;
  public variantTypes: VariantType[];

  public searchVariantTypes = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(
      debounceTime(200),
      distinctUntilChanged()
    );
    const inputFocus$ = this.focus$['type'];
    return merge(debouncedText$, inputFocus$).pipe(
      tap(() => (this.loading = true)),
      switchMap(async (term) => {
        let match: {} =
          term && term !== '' ? { name: { $regex: term, $options: 'i' } } : {};
        match['operationType'] = { $ne: 'D' };
        return await this.getAllVariantTypes(match).then((result) => {
          return result;
        });
      }),
      tap(() => (this.loading = false))
    );
  };

  public formatterVariantTypes = (x: { name: string }) => x.name;

  public formFields: FormField[] = [
    {
      name: 'order',
      tag: 'input',
      tagType: 'number',
      class: 'form-group col-md-2',
    },
    {
      name: 'type',
      tag: 'autocomplete',
      tagType: 'text',
      search: this.searchVariantTypes,
      format: this.formatterVariantTypes,
      values: null,
      focus: false,
      class: 'form-group col-md-4',
    },
    {
      name: 'description',
      tag: 'input',
      tagType: 'text',
      validators: [Validators.required],
      class: 'form-group col-md-12',
    },

    {
      name: 'picture',
      tag: 'input',
      tagType: 'file',
      search: null,
      format: 'image',
      class: 'form-group col-md-12',
    },
  ];
  public formErrors: {} = {};
  public validationMessages = {
    required: 'Este campo es requerido.',
  };

  constructor(
    private _objService: VariantValueService,
    private _variantTypeService: VariantTypeService,
    private _toast: ToastService,
    private _title: Title,
    public _fb: UntypedFormBuilder,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _applicationService: ApplicationService,
    public translatePipe: TranslateMePipe,
    private _router: Router
  ) {
    this.obj = new VariantValue();
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
  }

  public async ngOnInit() {
    let pathUrl: string[] = this._router.url.split('/');
    this.operation = pathUrl[2];
    if (this.operation !== 'add' && this.operation !== 'update')
      this.readonly = false;
    this.title =
      this.translatePipe.transform(this.operation) +
      ' ' +
      this.translatePipe.transform(this.title);
    this.title = this.capitalizePipe.transform(this.title);
    this._title.setTitle(this.title);
    this.buildForm();
    this.objId = pathUrl[3];
    if (this.objId && this.objId !== '') {
      let project = {
        _id: 1,
        operationType: 1,
        description: 1,
        'type._id': 1,
        'type.name': 1,
        picture: 1,
        order: 1,
      };

      this.subscription.add(
        this._objService
          .getAll({
            project,
            match: {
              operationType: { $ne: 'D' },
              _id: { $oid: this.objId },
            },
          })
          .subscribe(
            (result) => {
              this.loading = false;
              if (result.status === 200) {
                this.obj = result.result[0];
                this.setValuesForm();
              } else {
                this._toast.showToast(result);
              }
            },
            (error) => this._toast.showToast(error)
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
      applications: this._fb.array([]),
    };
    for (let field of this.formFields) {
      if (field.tag !== 'separator')
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
      if (field.tag !== 'separator') {
        if (field.name.split('.').length > 1) {
          let sumF: string = '';
          let entro: boolean = false;
          for (let f of field.name.split('.')) {
            sumF += `['${f}']`;
            if (
              eval(`this.obj${sumF}`) == null ||
              eval(`this.obj${sumF}`) == undefined
            ) {
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
              values[field.name] =
                eval('this.obj.' + field.name) !== undefined
                  ? eval('this.obj.' + field.name)
                  : null;
            break;
        }
      }
    }

    this.objForm.patchValue(values);
  }

  public async addObj() {
    let isValid: boolean = true;

    isValid = this.operation === 'delete' ? true : this.objForm.valid;

    if (isValid) {
      this.obj = Object.assign(this.obj, this.objForm.value);
    } else {
      this.onValueChanged();
    }

    if (isValid) {
      for (let field of this.formFields) {
        switch (field.tagType) {
          case 'date':
            this.obj[field.name] = moment(this.obj[field.name]).isValid()
              ? moment(this.obj[field.name]).format('YYYY-MM-DD') +
                moment().format('THH:mm:ssZ')
              : null;
            break;
          case 'number':
            this.obj[field.name] = parseFloat(this.obj[field.name]);
            break;
          case 'file':
            if (
              this.filesToUpload &&
              this.filesToUpload[field.name] &&
              this.filesToUpload[field.name].length > 0
            ) {
              this.loading = true;
              this._objService.deleteFile(this.obj[field.name]);
              if (
                this.filesToUpload[field.name] &&
                this.filesToUpload[field.name].length > 0
              ) {
                this.obj[field.name] = this.oldFiles[field.name];
                if (
                  field.multiple &&
                  (!this.obj ||
                    !this.obj[field.name] ||
                    this.obj[field.name].length === 0)
                ) {
                  this.obj[field.name] = new Array();
                }
                for (let file of this.filesToUpload[field.name]) {
                  await this._objService
                    .uploadFile(null, file)
                    .then((result) => {
                      this.loading = false;
                      if (result['result']) {
                        if (!field.multiple) {
                          this.obj[field.name] = result['result'];
                        } else {
                          this.obj[field.name].push(result['result']);
                        }
                      } else {
                        this._toast.showToast({
                          message: result['error'].message,
                          type: 'info',
                        });
                        isValid = false;
                      }
                    })
                    .catch((error) => {
                      this.loading = false;
                      isValid = false;
                      this._toast.showToast({
                        message: error.message,
                        type: 'danger',
                      });
                    });
                }
              }
              this.loading = false;
            } else {
              if (this.oldFiles)
                this.obj[field.name] = this.oldFiles[field.name];
            }
            break;
          case 'boolean':
            this.obj[field.name] =
              this.obj[field.name] == 'true' || this.obj[field.name] == true;
          case 'text':
            if (
              field.tag === 'autocomplete' &&
              (this.obj[field.name] == '' ||
                (this.obj[field.name] && !this.obj[field.name]['_id']))
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
      this._toast.showToast({
        type: 'info',
        message: 'Revise los errores marcados en el formulario',
      });
    }
  }

  public deleteFile(typeFile: string, fieldName: string, filename: string) {
    this._objService.deleteFile(filename).subscribe(
      (result) => {
        if (result.status === 200) {
          try {
            eval(
              'this.obj.' +
                fieldName +
                ' = this.obj.' +
                fieldName +
                '.filter(item => item !== filename)'
            );
          } catch (error) {
            eval('this.obj.' + fieldName + ' = null');
          }
          this.loading = true;
          this.subscription.add(
            this._objService.update(this.obj).subscribe(
              (result) => {
                this._toast.showToast(result);
                this.setValuesForm();
              },
              (error) => this._toast.showToast(error)
            )
          );
        } else {
          this._toast.showToast(result);
        }
      },
      (error) => this._toast.showToast(error)
    );
  }

  public saveObj() {
    this.loading = true;
    this.subscription.add(
      this._objService.save(this.obj).subscribe(
        (result) => {
          this._toast.showToast(result);
          if (result.status === 200) this._router.navigate(['/variant-values']);
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
          if (result.status === 200) this._router.navigate(['/variant-values']);
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
          if (result.status === 200) {
            this._router.navigate(['/variant-values']);
          }
        },
        (error) => this._toast.showToast(error)
      )
    );
  }

  public getAllVariantTypes(match: {}): Promise<VariantType[]> {
    return new Promise<VariantType[]>((resolve, reject) => {
      this.subscription.add(
        this._variantTypeService
          .getAll({
            project: { name: 1, operationType: 1 },
            match,
            sort: { name: 1 },
            limit: 10,
          })
          .subscribe(
            (result) => {
              this.loading = false;
              result.status === 200 ? resolve(result.result) : reject(result);
            },
            (error) => reject(error)
          )
      );
    });
  }
}
