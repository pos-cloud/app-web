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
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';
import { FormField } from '@types';
import { Config } from 'app/app.config';
import { Article } from 'app/components/article/article';
import {
  TransactionMovement,
  TransactionType,
} from 'app/components/transaction-type/transaction-type';
import { ArticleService } from 'app/core/services/article.service';
import { BranchService } from 'app/core/services/branch.service';
import { CompanyService } from 'app/core/services/company.service';
import { EmailTemplateService } from 'app/core/services/email-template.service';
import { EmployeeTypeService } from 'app/core/services/employee-type.service';
import { PaymentMethodService } from 'app/core/services/payment-method.service';
import { PrinterService } from 'app/core/services/printer.service';
import { ShipmentMethodService } from 'app/core/services/shipment-method.service';
import { TransactionTypeService } from 'app/core/services/transaction-type.service';
import { CapitalizePipe } from 'app/shared/pipes/capitalize';
import { TranslateMePipe } from 'app/shared/pipes/translate-me';
import * as moment from 'moment';
import 'moment/locale/es';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Observable, Subject, Subscription, merge } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
} from 'rxjs/operators';

import { ToastService } from 'app/shared/components/toast/toast.service';
import { BusinessRuleService } from '../../../core/services/business-rule.service';
import { BusinessRule, Day } from '../business-rules';

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
  objForm: UntypedFormGroup;
  loading: boolean = false;
  schedule: UntypedFormArray;
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
  transactionTypes: TransactionType[] = [];
  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    defaultOpen: false,
    idField: '_id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    enableCheckAll: true,
    itemsShowLimit: 3,
    allowSearchFilter: true,
  };
  daysOfWeek: Day[] = [
    Day.Sunday,
    Day.Monday,
    Day.Tuesday,
    Day.Wednesday,
    Day.Thursday,
    Day.Friday,
    Day.Saturday,
  ];

  searchItem = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(
      debounceTime(200),
      distinctUntilChanged()
    );
    const inputFocus$ = this.focus$['article'];

    return merge(debouncedText$, inputFocus$).pipe(
      tap(() => (this.loading = true)),
      switchMap(async (term) => {
        if (term && term !== '') {
          let match: {} = { description: { $regex: term, $options: 'i' } };

          if (this.operation === 'update' && this.obj._id) {
            match['_id'] = { $ne: { $oid: this.obj._id } };
          }
          match['operationType'] = { $ne: 'D' };

          return await this.getAllArticles(match).then((result) => {
            return result;
          });
        }
      }),
      tap(() => (this.loading = false))
    );
  };

  formatterItem = (x: { name: string }) => x.name;

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
      name: 'totalStock',
      tag: 'input',
      tagType: 'number',
      class: 'form-group col-md-6',
      validators: [Validators.required, Validators.min(1)],
    },
    {
      name: 'active',
      tag: 'select',
      tagType: 'boolean',
      class: 'form-group col-md-6',
      values: ['true', 'false'],
      validators: [Validators.required],
    },
    {
      name: 'discountType',
      tag: 'select',
      tagType: 'text',
      class: 'form-group col-md-6',
      values: ['percentage', 'amount'],
      validators: [Validators.required],
    },
    {
      name: 'discountValue',
      tag: 'input',
      tagType: 'number',
      class: 'form-group col-md-6',
      validators: [Validators.required],
    },
    {
      name: 'minAmount',
      tag: 'input',
      tagType: 'number',
      class: 'form-group col-md-6',
    },
    {
      name: 'transactionAmountLimit',
      tag: 'input',
      tagType: 'number',
      class: 'form-group col-md-6',
    },
    {
      name: 'article',
      label: 'discountArticle',
      tag: 'autocomplete',
      tagType: 'text',
      search: this.searchItem,
      format: this.formatterItem,
      values: null,
      focus: false,
      class: 'form-group col-md-12',
      validators: [Validators.required],
    },
    {
      name: 'minQuantity',
      tag: 'input',
      tagType: 'number',
      class: 'form-group col-md-6',
    },
    {
      name: 'item',
      tag: 'autocomplete',
      tagType: 'text',
      search: this.searchItem,
      format: this.formatterItem,
      values: null,
      focus: false,
      class: 'form-group col-md-6',
    },
    {
      name: 'item2',
      label: 'item 2',
      tag: 'autocomplete',
      tagType: 'text',
      search: this.searchItem,
      format: this.formatterItem,
      values: null,
      focus: false,
      class: 'form-group col-md-6',
    },
    {
      name: 'item3',
      label: 'item 3',
      tag: 'autocomplete',
      tagType: 'text',
      search: this.searchItem,
      format: this.formatterItem,
      values: null,
      focus: false,
      class: 'form-group col-md-6',
    },
    {
      name: 'description',
      tag: 'textarea',
      tagType: 'text',
      class: 'form-group col-md-12',
    },
  ];
  formErrors: {} = {};
  validationMessages = {
    required: 'Este campo es requerido.',
    min: 'El campo debe ser mayor a 0.',
  };

  constructor(
    private _objService: BusinessRuleService,
    private _toastService: ToastService,
    private _title: Title,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _branchService: BranchService,
    public _articleService: ArticleService,
    public _employeeTypeService: EmployeeTypeService,
    public _paymentMethod: PaymentMethodService,
    public _emailTemplate: EmailTemplateService,
    public _shipmentMethod: ShipmentMethodService,
    public _transactionTypeService: TransactionTypeService,
    public _printer: PrinterService,
    public _company: CompanyService,
    public translatePipe: TranslateMePipe,
    private _router: Router,
    public _fb: UntypedFormBuilder
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

    await this.getTransactionTypes().then((result) => {
      if (result) {
        this.transactionTypes = result;
      }
    });

    if (this.objId && this.objId !== '') {
      let project = {
        _id: 1,
        name: 1,
        startDate: 1,
        endDate: 1,
        minAmount: 1,
        minQuantity: 1,
        transactionAmountLimit: 1,
        totalStock: 1,
        description: 1,
        discountType: 1,
        discountValue: 1,
        active: 1,
        days: 1,
        transactionTypeIds: 1,
        'article._id': 1,
        'article.name': '$article.description',
        'item._id': 1,
        'item.name': '$item.description',
        'item2._id': 1,
        'item2.name': '$item2.description',
        'item3._id': 1,
        'item3.name': '$item3.description',
      };

      this.subscription.add(
        this._objService
          .getAll({
            project: project,
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
                this._toastService.showToast(result);
              }
            },
            (error) => this._toastService.showToast(error)
          )
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
      days: [this.obj.days],
      transactionTypeIds: [this.obj.transactionTypeIds],
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

  validateAutocomplete(c: UntypedFormControl) {
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
      days: this.obj.days,
      transactionTypeIds: this.obj.transactionTypeIds,
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
                        this._toastService.showToast({
                          message: result['error'].message,
                          type: 'info',
                        });
                        isValid = false;
                      }
                    })
                    .catch((error) => {
                      this.loading = false;
                      isValid = false;
                      this._toastService.showToast({
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
      this._toastService.showToast({
        type: 'info',
        message: 'Revise los errores marcados en el formulario',
      });
    }
  }

  deleteFile(typeFile: string, fieldName: string, filename: string) {
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
                this._toastService.showToast(result);
                this.setValuesForm();
              },
              (error) => this._toastService.showToast(error)
            )
          );
        } else {
          this._toastService.showToast(result);
        }
      },
      (error) => this._toastService.showToast(error)
    );
  }

  saveObj() {
    this.loading = true;
    this.subscription.add(
      this._objService.save(this.obj).subscribe(
        (result) => {
          this._toastService.showToast(result);
          if (result.status === 200) this._router.navigate(['/business-rules']);
        },
        (error) => this._toastService.showToast(error)
      )
    );
  }

  updateObj() {
    this.loading = true;
    this.subscription.add(
      this._objService.update(this.obj).subscribe(
        (result) => {
          this._toastService.showToast(result);
          if (result.status === 200) this._router.navigate(['/business-rules']);
        },
        (error) => this._toastService.showToast(error)
      )
    );
  }

  deleteObj() {
    this.loading = true;
    this.subscription.add(
      this._objService.delete(this.obj._id).subscribe(
        async (result) => {
          this._toastService.showToast(result);
          if (result.status === 200) {
            this._router.navigate(['/business-rules']);
          }
        },
        (error) => this._toastService.showToast(error)
      )
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
            sort: { description: 1 },
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

  public getTransactionTypes(): Promise<TransactionType[]> {
    return new Promise<TransactionType[]>((resolve) => {
      let match = {};

      match = {
        transactionMovement: TransactionMovement.Sale,
        operationType: { $ne: 'D' },
      };

      this._transactionTypeService
        .getAll({
          project: {
            _id: 1,
            transactionMovement: 1,
            requestArticles: 1,
            operationType: 1,
            name: 1,
            branch: 1,
          },
          match: match,
          sort: { name: 1 },
        })
        .subscribe(
          (result) => {
            if (result) {
              resolve(result.result);
            } else {
              resolve(null);
            }
          },
          (error) => {
            this._toastService.showToast(error);
            resolve(null);
          }
        );
    });
  }
}
