import {Component, OnInit, EventEmitter, ViewEncapsulation} from '@angular/core';
import {FormGroup, FormBuilder, Validators, FormControl, FormArray} from '@angular/forms';
import {Title} from '@angular/platform-browser';
import {Router} from '@angular/router';
import {NgbAlertConfig, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {TranslatePipe} from '@ngx-translate/core';
import {Config} from 'app/app.config';
import {Article} from 'app/components/article/article';
import {ArticleService} from 'app/components/article/article.service';
import {BranchService} from 'app/components/branch/branch.service';
import {CompanyService} from 'app/components/company/company.service';
import {EmailTemplateService} from 'app/components/email-template/email-template.service';
import {EmployeeTypeService} from 'app/components/employee-type/employee-type.service';
import {PaymentMethodService} from 'app/components/payment-method/payment-method.service';
import {PrinterService} from 'app/components/printer/printer.service';
import {ShipmentMethodService} from 'app/components/shipment-method/shipment-method.service';
import {CapitalizePipe} from 'app/main/pipes/capitalize';
import {TranslateMePipe} from 'app/main/pipes/translate-me';
import {FormField} from 'app/util/formField.interface';
import * as $ from 'jquery';
import * as moment from 'moment';
import 'moment/locale/es';
import {ToastrService} from 'ngx-toastr';
import {Subscription, Subject, Observable, merge} from 'rxjs';
import {debounceTime, distinctUntilChanged, tap, switchMap} from 'rxjs/operators';

import {BusinessRuleService} from '../business-rule.service';
import {BusinessRule} from '../business-rules';

@Component({
  selector: 'app-business-rules',
  templateUrl: './business-rule.component.html',
  styleUrls: ['./business-rule.component.scss'],
  providers: [NgbAlertConfig, TranslateMePipe, TranslatePipe],
  encapsulation: ViewEncapsulation.None,
})
export class BusinessRuleComponent implements OnInit {
  private subscription: Subscription = new Subscription();
  private capitalizePipe: CapitalizePipe = new CapitalizePipe();
  objId: string;
  readonly: boolean;
  operation: string;
  obj: BusinessRule;
  objForm: FormGroup;
  loading: boolean = false;
  schedule: FormArray;
  focusEvent = new EventEmitter<boolean>();
  title: string = 'business-rule';
  focus$: Subject<string>[] = new Array();
  stateId: number;
  filesToUpload: any[] = new Array();
  filename: any[] = new Array();
  typeFile: any[] = new Array();
  oldFiles: any[];
  apiURL: string = Config.apiV8URL;
  database: string = Config.database;

  searchArticle = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const inputFocus$ = this.focus$['article'];

    return merge(debouncedText$, inputFocus$).pipe(
      tap(() => (this.loading = true)),
      switchMap(async (term) => {
        let match: {} =
          term && term !== '' ? {description: {$regex: term, $options: 'i'}} : {};

        if (this.operation === 'update' && this.obj._id) {
          match['_id'] = {$ne: {$oid: this.obj._id}};
        }
        match['operationType'] = {$ne: 'D'};

        return await this.getAllArticles(match).then((result) => {
          return result;
        });
      }),
      tap(() => (this.loading = false)),
    );
  };

  formatterArticle = (x: {name: string}) => x.name;

  formFields: FormField[] = [
    {
      name: 'name',
      tag: 'input',
      tagType: 'text',
      validators: [Validators.required],
      class: 'form-group col-md-6',
    },
    {
      name: 'startDate',
      tag: 'input',
      tagType: 'date',
      class: 'form-group col-md-3',
    },
    {
      name: 'endDate',
      tag: 'input',
      tagType: 'date',
      class: 'form-group col-md-3',
    },
    {
      name: 'minAmount',
      tag: 'input',
      tagType: 'number',
      class: 'form-group col-md-2',
    },
    {
      name: 'minQuantity',
      tag: 'input',
      tagType: 'number',
      class: 'form-group col-md-2',
    },
    {
      name: 'transactionAmountLimit',
      tag: 'input',
      tagType: 'number',
      class: 'form-group col-md-2',
    },
    {
      name: 'totalStock',
      tag: 'input',
      tagType: 'number',
      class: 'form-group col-md-2',
      validators: [Validators.required],
    },
    {
      name: 'discountType',
      tag: 'select',
      tagType: 'text',
      class: 'form-group col-md-2',
      values: ['percentage', 'amount'],
      validators: [Validators.required],
    },
    {
      name: 'discountValue',
      tag: 'input',
      tagType: 'number',
      class: 'form-group col-md-2',
      validators: [Validators.required],
    },
    {
      name: 'article',
      tag: 'autocomplete',
      tagType: 'text',
      search: this.searchArticle,
      format: this.formatterArticle,
      values: null,
      focus: false,
      class: 'form-group col-md-6',
      validators: [Validators.required],
    },
    {
      name: 'item',
      tag: 'autocomplete',
      tagType: 'text',
      search: this.searchArticle,
      format: this.formatterArticle,
      values: null,
      focus: false,
      class: 'form-group col-md-6',
    },
  ];
  formErrors: {} = {};
  validationMessages = {
    required: 'Este campo es requerido.',
  };

  tinyMCEConfigBody = {
    selector: 'textarea',
    theme: 'modern',
    paste_data_images: true,
    plugins: [
      'advlist autolink lists link image charmap print preview hr anchor pagebreak',
      'searchreplace wordcount visualblocks visualchars code fullscreen',
      'insertdatetime media nonbreaking table contextmenu directionality',
      'emoticons template paste textcolor colorpicker textpattern',
    ],
    toolbar1:
      'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media | forecolor backcolor emoticons | print preview fullscreen',
    image_advtab: true,
    height: 150,
    file_picker_types: 'file image media',
    images_dataimg_filter: function (img) {
      return img.hasAttribute('internal-blob');
    },
    file_picker_callback: function (callback, value, meta) {
      if (meta.filetype == 'image') {
        $('#upload').trigger('click');
        $('#upload').on('change', function () {
          let file = this.files[0];
          let reader = new FileReader();

          reader.onload = function (e) {
            callback(e.target['result'], {
              alt: '',
            });
          };
          reader.readAsDataURL(file);
        });
      }
    },
  };

  constructor(
    private _objService: BusinessRuleService,
    private _toastr: ToastrService,
    private _title: Title,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _branchService: BranchService,
    public _articleService: ArticleService,
    public _employeeTypeService: EmployeeTypeService,
    public _paymentMethod: PaymentMethodService,
    public _emailTemplate: EmailTemplateService,
    public _shipmentMethod: ShipmentMethodService,
    public _printer: PrinterService,
    public _company: CompanyService,
    public translatePipe: TranslateMePipe,
    private _router: Router,
    public _fb: FormBuilder,
  ) {
    this.obj = new BusinessRule();
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

  async ngOnInit() {
    let pathUrl: string[] = this._router.url.split('/');

    this.operation = pathUrl[2];
    if (this.operation !== 'add' && this.operation !== 'update') this.readonly = false;
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
        name: 1,
        startDate: 1,
        endDate: 1,
        quantity: 1,
        discountAmount: 1,
        discountPercent: 1,
        newUser: 1,
        'article._id': 1,
        'article.name': '$article.description',
      };

      this.subscription.add(
        this._objService
          .getAll({
            project: project,
            match: {
              operationType: {$ne: 'D'},
              _id: {$oid: this.objId},
            },
          })
          .subscribe(
            (result) => {
              this.loading = false;
              if (result.status === 200) {
                this.obj = result.result[0];
                this.setValuesForm();
              } else {
                this.showToast(result);
              }
            },
            (error) => this.showToast(error),
          ),
      );
    }
  }

  ngAfterViewInit(): void {
    this.focusEvent.emit(true);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getFiles(fieldName) {
    return eval('this.obj?.' + fieldName.split('.').join('?.'));
  }

  onFileSelected(event, model: string) {
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

  buildForm(): void {
    let fields: {} = {
      _id: [this.obj._id],
    };

    for (let field of this.formFields) {
      if (field.tag !== 'separator')
        fields[field.name] = [this.obj[field.name], field.validators];
    }
    this.objForm = this._fb.group(fields);
    this.objForm.valueChanges.subscribe((data) => this.onValueChanged(data));
    this.focusEvent.emit(true);
  }

  onValueChanged(fieldID?: any): void {
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

  validateAutocomplete(c: FormControl) {
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

  setValuesForm(): void {
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

  async addObj() {
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
              this._objService.deleteFile(
                this.typeFile[field.name],
                field.name.split('.')[field.name.split('.').length - 1],
                this.obj[field.name],
              );
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
                    .uploadFile(
                      this.typeFile[field.name],
                      field.name.split('.')[field.name.split('.').length - 1],
                      file,
                    )
                    .then((result) => {
                      this.loading = false;
                      if (result['result']) {
                        if (!field.multiple) {
                          this.obj[field.name] = result['result'];
                        } else {
                          this.obj[field.name].push(result['result']);
                        }
                      } else {
                        this.showToast(result['error'].message, 'info');
                        isValid = false;
                      }
                    })
                    .catch((error) => {
                      this.loading = false;
                      isValid = false;
                      this.showToast(error.message, 'danger');
                    });
                }
              }
              this.loading = false;
            } else {
              if (this.oldFiles) this.obj[field.name] = this.oldFiles[field.name];
            }
            break;
          case 'boolean':
            this.obj[field.name] =
              this.obj[field.name] == 'true' || this.obj[field.name] == true;
            break;
          case 'text':
            if (this.obj[field.name] === 'null') this.obj[field.name] = null;
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
      this.showToast(null, 'info', 'Revise los errores marcados en el formulario');
    }
  }

  deleteFile(typeFile: string, fieldName: string, filename: string) {
    this._objService
      .deleteFile(
        typeFile,
        fieldName.split('.')[fieldName.split('.').length - 1],
        filename,
      )
      .subscribe(
        (result) => {
          if (result.status === 200) {
            try {
              eval(
                'this.obj.' +
                  fieldName +
                  ' = this.obj.' +
                  fieldName +
                  '.filter(item => item !== filename)',
              );
            } catch (error) {
              eval('this.obj.' + fieldName + ' = null');
            }
            this.loading = true;
            this.subscription.add(
              this._objService.update(this.obj).subscribe(
                (result) => {
                  this.showToast(result);
                  this.setValuesForm();
                },
                (error) => this.showToast(error),
              ),
            );
          } else {
            this.showToast(result);
          }
        },
        (error) => this.showToast(error),
      );
  }

  saveObj() {
    this.loading = true;
    this.subscription.add(
      this._objService.save(this.obj).subscribe(
        (result) => {
          this.showToast(result);
          if (result.status === 200) this._router.navigate(['/business-rules']);
        },
        (error) => this.showToast(error),
      ),
    );
  }

  updateObj() {
    this.loading = true;
    this.subscription.add(
      this._objService.update(this.obj).subscribe(
        (result) => {
          this.showToast(result);
          if (result.status === 200) this._router.navigate(['/business-rules']);
        },
        (error) => this.showToast(error),
      ),
    );
  }

  deleteObj() {
    this.loading = true;
    this.subscription.add(
      this._objService.delete(this.obj._id).subscribe(
        async (result) => {
          this.showToast(result);
          if (result.status === 200) {
            this._router.navigate(['/business-rules']);
          }
        },
        (error) => this.showToast(error),
      ),
    );
  }

  getAllArticles(match: {}): Promise<Article[]> {
    return new Promise<Article[]>((resolve, reject) => {
      this.subscription.add(
        this._articleService
          .getAll({
            project: {
              name: '$description',
              description: 1,
              operationType: 1,
            },
            match,
            sort: {description: 1},
            limit: 10,
          })
          .subscribe(
            (result) => {
              this.loading = false;
              result.status === 200 ? resolve(result.result) : reject(result);
            },
            (error) => reject(error),
          ),
      );
    });
  }

  showToast(result, type?: string, title?: string, message?: string): void {
    if (result) {
      if (result.status === 200) {
        type = 'success';
        title = result.message;
      } else if (result.status >= 400) {
        type = 'danger';
        title =
          result.error && result.error.message ? result.error.message : result.message;
      } else {
        type = 'info';
        title = result.message;
      }
    }
    switch (type) {
      case 'success':
        this._toastr.success(
          this.translatePipe.translateMe(message),
          this.translatePipe.translateMe(title),
        );
        break;
      case 'danger':
        this._toastr.error(
          this.translatePipe.translateMe(message),
          this.translatePipe.translateMe(title),
        );
        break;
      default:
        this._toastr.info(
          this.translatePipe.translateMe(message),
          this.translatePipe.translateMe(title),
        );
        break;
    }
    this.loading = false;
  }
}
