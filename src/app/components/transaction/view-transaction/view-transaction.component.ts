import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { NgbActiveModal, NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';
import { Account, AccountPeriod, ApiResponse, FormField, PrinterPrintIn, PrintType } from '@types';
import { Config } from 'app/app.config';
import { AccountSeat } from 'app/components/account-seat/account-seat';
import { AccountPeriodService } from 'app/core/services/account-period.service';
import { AccountSeatService } from 'app/core/services/account-seat.service';
import { AccountService } from 'app/core/services/account.service';
import { PrinterService } from 'app/core/services/printer.service';
import { UserService } from 'app/core/services/user.service';
import { TranslateMePipe } from 'app/shared/pipes/translate-me';
import * as moment from 'moment';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';

import { MovementOfArticleService } from '../../../core/services/movement-of-article.service';
import { MovementOfCashService } from '../../../core/services/movement-of-cash.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { RoundNumberPipe } from '../../../shared/pipes/round-number.pipe';
import { ArticleComponent } from '../../article/crud/article.component';
import { MovementOfArticle } from '../../movement-of-article/movement-of-article';
import { MovementOfCash } from '../../movement-of-cash/movement-of-cash';
import { Transaction } from '../transaction';

import { PrintService } from '@core/services/print.service';
import { SelectPrinterComponent } from '@shared/components/select-printer/select-printer.component';
import { CompanyComponent } from 'app/modules/entities/company/crud/company.component';
import { ToastService } from 'app/shared/components/toast/toast.service';
import 'moment/locale/es';
import * as printJS from 'print-js';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-view-transaction',
  templateUrl: './view-transaction.component.html',
  styleUrls: ['./view-transaction.component.css'],
  providers: [NgbAlertConfig, TranslateMePipe, TranslatePipe],
})
export class ViewTransactionComponent implements OnInit {
  @Input() transactionId: string;
  private subscription: Subscription = new Subscription();
  transaction: Transaction;
  alertMessage = '';
  loading = false;
  movementsOfArticles: MovementOfArticle[];
  areMovementsOfArticlesEmpty = true;
  movementsOfCashes: MovementOfCash[];
  areMovementsOfCashesEmpty = true;
  roundNumber = new RoundNumberPipe();
  orderTerm: string[] = ['expirationDate'];
  currencyValue: [];
  showDetails = false;
  propertyTerm: string;
  userCountry: string = 'AR';
  orientation: string = 'horizontal';
  obj: AccountSeat;
  objForm: UntypedFormGroup;
  formErrors: {} = {};
  objId: string;
  oldFiles: any[];
  focus$: Subject<string>[] = new Array();
  accounts: Account[];
  validationMessages = {
    required: 'Este campo es requerido.',
  };
  formFields: FormField[] = [];

  private destroy$ = new Subject<void>();

  searchPeriods = (text$: Observable<string>) =>
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
  formatterPeriods = (x: AccountPeriod) => {
    return x['name'];
  };

  constructor(
    public _transactionService: TransactionService,
    public _movementOfArticleService: MovementOfArticleService,
    public _movementOfCashService: MovementOfCashService,
    private _printerService: PrinterService,
    public alertConfig: NgbAlertConfig,
    public activeModal: NgbActiveModal,
    public _userService: UserService,
    private _modalService: NgbModal,
    public _printService: PrintService,
    private _objService: AccountSeatService,
    private _toast: ToastService,
    public _periodService: AccountPeriodService,
    public _fb: UntypedFormBuilder,
    public translatePipe: TranslateMePipe,
    public _accountService: AccountService
  ) {
    if (window.screen.width < 1000) this.orientation = 'vertical';
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

  ngOnInit() {
    this.userCountry = Config.country;
    this.movementsOfArticles = new Array();
    this.movementsOfCashes = new Array();
    this.transaction = new Transaction();
    this.getTransaction(this.transactionId);
    this.buildForm();
    this.objId = this.transactionId;
    if (this.objId && this.objId !== '') {
      let project = {
        _id: 1,
        transaction: 1,
        operationType: 1,
        date: 1,
        observation: 1,
        'period._id': 1,
        'period.name': '$period.description',
        items: 1,
      };

      this.subscription.add(
        this._objService
          .getAll({
            project: project,
            match: {
              operationType: { $ne: 'D' },
              // _id: { $oid: '611e4526fe611166bdf6f44e' }
              transaction: { $oid: this.transactionId },
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
            this._toast.showToast(error, 'danger');
          }
        )
    );
  }

  public setValuesForm(): void {
    let values: {} = {
      _id: this.transactionId,
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

    if (this.obj && this.obj.items && this.obj.items.length > 0) {
      let items = <UntypedFormArray>this.objForm.controls.items;

      this.obj.items.forEach((x) => {
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
  public getTransaction(transactionId): void {
    this.loading = true;

    this.subscription.add(
      this._transactionService.getTransaction(transactionId).subscribe(
        (result) => {
          if (!result.transaction) {
            this.showMessage(result.message, 'danger', false);
            this.loading = false;
          } else {
            this.hideMessage();
            this.transaction = result.transaction;
            this.transaction.totalPrice = this.roundNumber.transform(this.transaction.totalPrice);
            this.getMovementsOfArticlesByTransaction();
            this.getMovementsOfCashesByTransaction();
          }
          this.loading = false;
        },
        (error) => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      )
    );
  }

  public getMovementsOfArticlesByTransaction(): void {
    this.loading = true;

    let query = 'where="transaction":"' + this.transaction._id + '"';

    this.subscription.add(
      this._movementOfArticleService.getMovementsOfArticles(query).subscribe(
        (result) => {
          if (!result.movementsOfArticles) {
            this.areMovementsOfArticlesEmpty = true;
            this.movementsOfArticles = new Array();
          } else {
            this.areMovementsOfArticlesEmpty = false;
            this.movementsOfArticles = result.movementsOfArticles;
          }
          this.loading = false;
        },
        (error) => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      )
    );
  }

  public getMovementsOfCashesByTransaction(): void {
    this.loading = true;

    let query = 'where="transaction":"' + this.transaction._id + '"';

    this.subscription.add(
      this._movementOfCashService.getMovementsOfCashes(query).subscribe(
        (result) => {
          if (!result.movementsOfCashes) {
            this.areMovementsOfCashesEmpty = true;
            this.movementsOfCashes = new Array();
          } else {
            this.areMovementsOfCashesEmpty = false;
            this.movementsOfCashes = result.movementsOfCashes;
          }
          this.loading = false;
        },
        (error) => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      )
    );
  }

  async openModal(op: string, movement?: MovementOfArticle) {
    let modalRef;
    switch (op) {
      case 'view-article':
        modalRef = this._modalService.open(ArticleComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.property = {
          articleId: movement.article._id,
          operation: 'view',
        };
        break;
      case 'view-company':
        modalRef = this._modalService.open(CompanyComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.property = {
          companyId: this.transaction.company._id,
          operation: 'view',
          type: '',
        };

        break;
      case 'edit-company':
        // modalRef = this._modalService.open(AddCompanyComponent, {
        //   size: 'lg',
        //   backdrop: 'static',
        // });
        // modalRef.componentInstance.companyId = this.transaction.company._id;
        // modalRef.componentInstance.readonly = false;
        // modalRef.componentInstance.operation = 'update';
        break;
      case 'print-label':
        modalRef = this._modalService.open(SelectPrinterComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.typePrinter = PrinterPrintIn.Label;
        modalRef.result.then(
          (result) => {
            if (result.data) {
              const datalabel = {
                quantity: movement.amount,
                articleId: movement.article._id,
                printerId: result.data._id,
              };
              this.toPrint(PrintType.Article, datalabel);
            }
          },
          (reason) => {}
        );
        break;
      default:
        break;
    }
  }

  public orderBy(term: string, property?: string): void {
    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = '-' + term;
    } else {
      this.orderTerm[0] = term;
    }
    this.propertyTerm = property;
  }

  public pushCurrencyValue(e): void {
    this.currencyValue = e['currencyValues'];
    this.showDetails = !this.showDetails;
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }

  public toPrint(type: PrintType, data: {}): void {
    this.loading = true;

    this._printService
      .toPrint(type, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: Blob | ApiResponse) => {
          if (!result) {
            this._toast.showToast({ message: 'Error al generar el PDF' });
            return;
          }
          if (result instanceof Blob) {
            try {
              const blobUrl = URL.createObjectURL(result);
              printJS(blobUrl);
            } catch (e) {
              this._toast.showToast({ message: 'Error al generar el PDF' });
            }
          } else {
            this._toast.showToast(result);
          }
        },
        error: (error) => {
          this._toast.showToast({ message: 'Error al generar el PDF' });
        },
        complete: () => {
          this.loading = false;
        },
      });
  }
}
