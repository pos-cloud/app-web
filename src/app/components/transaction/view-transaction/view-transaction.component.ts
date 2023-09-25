import {Component, OnInit, Input} from '@angular/core';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {NgbAlertConfig, NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {TranslatePipe} from '@ngx-translate/core';
import {Config} from 'app/app.config';
import {AccountPeriod} from 'app/components/account-period/account-period';
import {AccountPeriodService} from 'app/components/account-period/account-period.service';
import {AccountSeat} from 'app/components/account-seat/account-seat';
import {AccountSeatService} from 'app/components/account-seat/account-seat.service';
import {Account} from 'app/components/account/account';
import {AccountService} from 'app/components/account/account.service';
import {PrintTransactionTypeComponent} from 'app/components/print/print-transaction-type/print-transaction-type.component';
import {Printer, PrinterPrintIn} from 'app/components/printer/printer';
import {PrinterService} from 'app/components/printer/printer.service';
import {User} from 'app/components/user/user';
import {UserService} from 'app/components/user/user.service';
import {TranslateMePipe} from 'app/main/pipes/translate-me';
import {FormField} from 'app/util/formField.interface';
import * as moment from 'moment';
import {ToastrService} from 'ngx-toastr';
import {Observable, Subject, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap, tap} from 'rxjs/operators';

import {RoundNumberPipe} from '../../../main/pipes/round-number.pipe';
import {AddArticleComponent} from '../../article/article/add-article.component';
import {AddCompanyComponent} from '../../company/company/add-company.component';
import {MovementOfArticle} from '../../movement-of-article/movement-of-article';
import {MovementOfArticleService} from '../../movement-of-article/movement-of-article.service';
import {MovementOfCash} from '../../movement-of-cash/movement-of-cash';
import {MovementOfCashService} from '../../movement-of-cash/movement-of-cash.service';
import {Transaction} from '../transaction';
import {TransactionService} from '../transaction.service';

import 'moment/locale/es';
import { Article } from 'app/components/article/article';
import * as printJS from 'print-js';

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

  searchPeriods = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.loading = true)),
      switchMap(async (term) => {
        let match: {} = term && term !== '' ? {name: {$regex: term, $options: 'i'}} : {};

        match['status'] = 'Abierto';

        return await this.getAllPeriods(match).then((result) => {
          return result;
        });
      }),
      tap(() => (this.loading = false)),
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

    private _objService: AccountSeatService,
    private _toastr: ToastrService,
    public _periodService: AccountPeriodService,
    public _fb: UntypedFormBuilder,
    public translatePipe: TranslateMePipe,
    public _accountService: AccountService,
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
              operationType: {$ne: 'D'},
              // _id: { $oid: '611e4526fe611166bdf6f44e' }
              transaction: {$oid: this.transactionId},
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
  public getAllAccounts2() {
    this.subscription.add(
      this._accountService
        .getAll({
          match: {operationType: {$ne: 'D'}},
          sort: {description: 1},
        })
        .subscribe(
          (result) => {
            this.accounts = result.result;
          },
          (error) => {
            this.showToast(error, 'danger');
          },
        ),
    );
  }
  public showToast(result, type?: string, title?: string, message?: string): void {
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
              values[field.name] =
                eval('this.obj.' + field.name) !== undefined
                  ? eval('this.obj.' + field.name)
                  : null;
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
          }),
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
      if (field.tag !== 'separator')
        fields[field.name] = [this.obj[field.name], field.validators];
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
            sort: {startDate: 1},
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
            this.transaction.totalPrice = this.roundNumber.transform(
              this.transaction.totalPrice,
            );
            this.getMovementsOfArticlesByTransaction();
            this.getMovementsOfCashesByTransaction();
          }
          this.loading = false;
        },
        (error) => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        },
      ),
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
        },
      ),
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
        },
      ),
    );
  }

  public printArticles( movement: MovementOfArticle) {
    this.loading = true;
    this._printerService.printArticles(movement.article._id, movement.amount).subscribe(
      (res: Blob) => {
        if (res) {     
          const blobUrl = URL.createObjectURL(res);
          printJS(blobUrl);
          this.loading = false;
        } else {
          this.loading = false;
          this.showMessage('Error al cargar el PDF', 'danger', false);
        }
      },
      (error) => {
        this.loading = false;
        this.showMessage(error.message, 'danger', false);
      }
    );
  }

  async openModal(op: string, movement?: MovementOfArticle) {
    let modalRef;

    switch (op) {
      case 'view-article':
        modalRef = this._modalService.open(AddArticleComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.articleId = movement.article._id;
        modalRef.componentInstance.readonly = true;
        modalRef.componentInstance.operation = 'view';
        break;
      case 'view-company':
        modalRef = this._modalService.open(AddCompanyComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.companyId = this.transaction.company._id;
        modalRef.componentInstance.readonly = true;
        modalRef.componentInstance.operation = 'view';
        break;
      case 'edit-company':
        modalRef = this._modalService.open(AddCompanyComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.companyId = this.transaction.company._id;
        modalRef.componentInstance.readonly = false;
        modalRef.componentInstance.operation = 'update';
        break;
      case 'print-label':
      this.printArticles(movement)
        break;
      default:
        break;
    }
  }

  public getPrinters(): Promise<Printer[]> {
    return new Promise<Printer[]>(async (resolve, reject) => {
      this.loading = true;

      this._printerService.getPrinters().subscribe(
        (result) => {
          this.loading = false;
          if (!result.printers) {
            if (result.message && result.message !== '')
              this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.printers);
          }
        },
        (error) => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        },
      );
    });
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
}
