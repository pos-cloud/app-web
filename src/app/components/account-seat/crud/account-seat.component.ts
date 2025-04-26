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
import { AccountPeriod, FormField } from '@types';
import { Config } from 'app/app.config';
import { Account } from 'app/components/account/account';
import { AccountPeriodService } from 'app/core/services/account-period.service';
import { AccountService } from 'app/core/services/account.service';
import { ApplicationService } from 'app/core/services/application.service';
import { BranchService } from 'app/core/services/branch.service';
import { CompanyService } from 'app/core/services/company.service';
import { EmailTemplateService } from 'app/core/services/email-template.service';
import { EmployeeTypeService } from 'app/core/services/employee-type.service';
import { PaymentMethodService } from 'app/core/services/payment-method.service';
import { PrinterService } from 'app/core/services/printer.service';
import { ShipmentMethodService } from 'app/core/services/shipment-method.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { CapitalizePipe } from 'app/shared/pipes/capitalize';
import { TranslateMePipe } from 'app/shared/pipes/translate-me';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { AccountSeatService } from '../../../core/services/account-seat.service';
import { AccountSeat } from '../account-seat';

@Component({
  selector: 'app-account-seat',
  templateUrl: './account-seat.component.html',
  styleUrls: ['./account-seat.component.scss'],
  providers: [NgbAlertConfig, TranslateMePipe, TranslatePipe],
  encapsulation: ViewEncapsulation.None,
})
export class AccountSeatComponent implements OnInit {
  public objId: string;
  public readonly: boolean;
  public operation: string;
  public obj: AccountSeat;
  public objForm: UntypedFormGroup;
  public loading: boolean = false;
  public schedule: UntypedFormArray;
  public focusEvent = new EventEmitter<boolean>();
  public title: string = 'account-seat';
  private subscription: Subscription = new Subscription();
  private capitalizePipe: CapitalizePipe = new CapitalizePipe();
  public focus$: Subject<string>[] = new Array();
  public stateId: number;
  public filesToUpload: any[] = new Array();
  public filename: any[] = new Array();
  public typeFile: any[] = new Array();
  public oldFiles: any[];
  public database: string = Config.database;
  public debit = 0;
  public credit = 0;
  public accounts: Account[];
  public totalDebit = 0;
  public totalHaber = 0;

  public searchPeriods = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.loading = true)),
      switchMap(async (term) => {
        let match: {} = term && term !== '' ? { name: { $regex: term, $options: 'i' } } : {};
        match['status'] = 'Abierto';
        return await this.getAllPeriods(match).then((result) => {
          return result;
        });
      }),
      tap(() => (this.loading = false))
    );
  public formatterPeriods = (x: AccountPeriod) => {
    return x['name'];
  };

  public searchAccount = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.loading = true)),
      switchMap(async (term) => {
        let match: {} =
          term && term !== ''
            ? {
                description: { $regex: term, $options: 'i' },
                mode: 'Analitico',
                operationType: { $ne: 'D' },
              }
            : {};
        return await this.getAllAccounts(match).then((result) => {
          return result;
        });
      }),
      tap(() => (this.loading = false))
    );
  public formatterAccount = (x: Account) => {
    return x.description;
  };

  public formFields: FormField[] = [
    {
      name: 'date',
      tag: 'input',
      tagType: 'date',
      class: 'form-group col-md-2',
      validators: [Validators.required],
    },
    {
      name: 'period',
      tag: 'autocomplete',
      tagType: 'text',
      search: this.searchPeriods,
      format: this.formatterPeriods,
      class: 'form-group col-md-4',
      validators: [Validators.required],
    },
    {
      name: 'observation',
      tag: 'input',
      tagType: 'text',
      class: 'form-group col-md-6',
    },
  ];
  public formErrors: {} = {};
  public validationMessages = {
    required: 'Este campo es requerido.',
  };

  constructor(
    private _objService: AccountSeatService,
    private _toastService: ToastService,
    private _title: Title,
    public _fb: UntypedFormBuilder,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _branchService: BranchService,
    public _applicationService: ApplicationService,
    public _accountService: AccountService,
    public _periodService: AccountPeriodService,
    public _employeeTypeService: EmployeeTypeService,
    public _paymentMethod: PaymentMethodService,
    public _emailTemplate: EmailTemplateService,
    public _shipmentMethod: ShipmentMethodService,
    public _printer: PrinterService,
    public _company: CompanyService,
    public translatePipe: TranslateMePipe,
    private _router: Router
  ) {
    this.getAllAccounts2();
    this.obj = new AccountSeat();
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
    if (this.operation !== 'add' && this.operation !== 'update') this.readonly = false;
    this.title = this.translatePipe.transform(this.operation) + ' ' + this.translatePipe.transform(this.title);
    this.title = this.capitalizePipe.transform(this.title);
    this._title.setTitle(this.title);
    this.buildForm();
    this.objId = pathUrl[3];
    if (this.objId && this.objId !== '') {
      let query = [];

      query.push(
        {
          $lookup: {
            from: 'account-periods',
            foreignField: '_id',
            localField: 'period',
            as: 'period',
          },
        },
        { $unwind: { path: '$period', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'accounts',
            localField: 'items.account',
            foreignField: '_id',
            as: 'accountDetails',
          },
        },
        {
          $addFields: {
            items: {
              $map: {
                input: '$items',
                as: 't',
                in: {
                  $mergeObjects: [
                    '$$t',
                    {
                      account: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: '$accountDetails',
                              as: 'td',
                              cond: {
                                $eq: ['$$td._id', '$$t.account'],
                              },
                            },
                          },
                          0,
                        ],
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        {
          $match: {
            operationType: { $ne: 'D' },
            _id: { $oid: this.objId },
          },
        }
      );

      this.subscription.add(
        this._objService.getFullQuery(query).subscribe(
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
      items: this._fb.array([]),
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

    if (this.obj.items && this.obj.items.length > 0) {
      let items = <UntypedFormArray>this.objForm.controls.items;
      this.obj.items.forEach((x) => {
        this.totalDebit = this.totalDebit + +x.debit;
        this.totalHaber = this.totalHaber + +x.credit;
        items.push(
          this._fb.group({
            _id: null,
            account: x.account,
            debit: x.debit,
            credit: x.credit,
          })
        );
      });
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
              ? moment(this.obj[field.name]).format('YYYY-MM-DD') + moment().format('THH:mm:ssZ')
              : null;
            break;
          case 'number':
            this.obj[field.name] = parseFloat(this.obj[field.name]);
            break;
          case 'file':
            if (this.filesToUpload && this.filesToUpload[field.name] && this.filesToUpload[field.name].length > 0) {
              this.loading = true;
              this._objService.deleteFile(this.obj[field.name]);
              if (this.filesToUpload[field.name] && this.filesToUpload[field.name].length > 0) {
                this.obj[field.name] = this.oldFiles[field.name];
                if (field.multiple && (!this.obj || !this.obj[field.name] || this.obj[field.name].length === 0)) {
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
              if (this.oldFiles) this.obj[field.name] = this.oldFiles[field.name];
            }
            break;
          case 'boolean':
            this.obj[field.name] = this.obj[field.name] == 'true' || this.obj[field.name] == true;
            break;
          case 'text':
            if (this.obj[field.name] === 'null') this.obj[field.name] = null;
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

  public deleteFile(typeFile: string, fieldName: string, filename: string) {
    this._objService.deleteFile(filename).subscribe(
      (result) => {
        if (result.status === 200) {
          try {
            eval('this.obj.' + fieldName + ' = this.obj.' + fieldName + '.filter(item => item !== filename)');
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

  public saveObj() {
    this.loading = true;
    this.subscription.add(
      this._objService.save(this.obj).subscribe(
        (result) => {
          this._toastService.showToast(result);
          if (result.status === 200) this._router.navigate(['/account-seats']);
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
          if (result.status === 200) this._router.navigate(['/account-seats']);
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
            this._router.navigate(['/account-seats']);
          }
        },
        (error) => this._toastService.showToast(error)
      )
    );
  }

  public getAllPeriods(match: {}): Promise<Account[]> {
    return new Promise<Account[]>((resolve, reject) => {
      this.subscription.add(
        this._periodService
          .getAll({
            project: {
              name: '$description',
              status: 1,
            },
            match,
            sort: { startDate: 1 },
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

  public getAllAccounts(match: {}): Promise<Account[]> {
    return new Promise<Account[]>((resolve, reject) => {
      this.subscription.add(
        this._accountService
          .getAll({
            match,
            sort: { description: 1 },
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

  public getAllAccounts2() {
    this.subscription.add(
      this._accountService
        .getAll({
          match: { operationType: { $ne: 'D' } },
          sort: { description: 1 },
        })
        .subscribe(
          (result) => {
            this.accounts = result.result;
          },
          (error) => {
            this._toastService.showToast({ message: error, type: 'danger' });
          }
        )
    );
  }

  public addItem(itemForm: NgForm): void {
    let valid = true;
    const item = this.objForm.controls.items as UntypedFormArray;

    if (valid) {
      this.totalDebit = this.totalDebit + parseFloat(itemForm.value.debit);
      this.totalHaber = this.totalHaber + parseFloat(itemForm.value.credit);

      item.push(
        this._fb.group({
          _id: null,
          account: itemForm.value.account,
          debit: itemForm.value.debit,
          credit: itemForm.value.credit,
        })
      );

      itemForm.setValue({
        debit: 0,
        credit: 0,
        account: null,
      });
    }
  }

  deleteItem(index) {
    let control = <UntypedFormArray>this.objForm.controls.items;
    control.removeAt(index);

    this.totalDebit = 0;
    this.totalHaber = 0;

    control.controls.forEach((element) => {
      this.totalDebit = this.totalDebit + +element.value.debit;
      this.totalHaber = this.totalHaber + +element.value.credit;
    });
  }
}
