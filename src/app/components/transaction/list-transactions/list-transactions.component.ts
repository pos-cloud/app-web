import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal, NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PrintComponent } from 'app/components/print/print/print.component';
import { User } from 'app/components/user/user';
import { AuthService } from 'app/core/services/auth.service';
import { BranchService } from 'app/core/services/branch.service';
import { TransactionTypeService } from 'app/core/services/transaction-type.service';
import { UserService } from 'app/core/services/user.service';
import { DateFormatPipe } from 'app/shared/pipes/date-format.pipe';
import * as moment from 'moment';
import { Observable, Subscription, of as observableOf } from 'rxjs';

import { Config } from '../../../app.config';
import { ConfigService } from '../../../core/services/config.service';
import { PrinterService } from '../../../core/services/printer.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { RoundNumberPipe } from '../../../shared/pipes/round-number.pipe';
import { ExportCitiComponent } from '../../export/export-citi/export-citi.component';
import { ExportExcelComponent } from '../../export/export-excel/export-excel.component';
import { ExportIvaComponent } from '../../export/export-iva/export-iva.component';
import { PrintTransactionTypeComponent } from '../../print/print-transaction-type/print-transaction-type.component';
import { Printer, PrinterPrintIn } from '../../printer/printer';
import { SendEmailComponent } from '../../send-email/send-email.component';
import { TransactionMovement, TransactionType } from '../../transaction-type/transaction-type';
import { AddTransactionComponent } from '../add-transaction/add-transaction.component';
import { Transaction, attributes } from '../transaction';
import { ViewTransactionComponent } from '../view-transaction/view-transaction.component';

import { PrintService } from '@core/services/print.service';
import { Branch, PrintType } from '@types';
import { DeleteTransactionComponent } from 'app/shared/components/delete-transaction/delete-transaction.component';
import 'moment/locale/es';

@Component({
  selector: 'app-list-transactions',
  templateUrl: './list-transactions.component.html',
  styleUrls: ['./list-transactions.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.Emulated,
})
export class ListTransactionsComponent implements OnInit {
  private subscription: Subscription = new Subscription();
  private roundNumberPipe: RoundNumberPipe = new RoundNumberPipe();
  private currencyPipe: CurrencyPipe = new CurrencyPipe('es-Ar');
  @ViewChild(ExportExcelComponent) exportExcelComponent: ExportExcelComponent;
  userCountry: string;
  transactionMovement: TransactionMovement;
  listType: string = 'statistics';
  modules: Observable<{}>;
  printers: Printer[];
  totalItems: number = 0;
  title: string = 'Listado de Transacciones';
  items: any[] = new Array();
  alertMessage: string = '';
  loading: boolean = false;
  itemsPerPage = 10;
  currentPage: number = 1;
  sort = { endDate: -1 };
  filters: any[];
  scrollY: number = 0;
  timezone: string = '-03:00';
  columns = attributes;
  pathLocation: string[];
  dateFormat = new DateFormatPipe();
  employeeClosingId: string;
  origin: string;
  startDate: string;
  endDate: string;
  dateSelect: string;
  stateSelect: string = '';
  transactionTypes: TransactionType[];
  transactionTypesSelect;
  dropdownSettings = {
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
  branchSelectedId: String;
  allowChangeBranch: boolean;
  branches: Branch[];
  config: Config;
  database: string;
  pdfSrc: string;

  deleteTransaction = true;
  editTransaction = true;

  constructor(
    public _transactionService: TransactionService,
    public _transactionTypeService: TransactionTypeService,
    public _configService: ConfigService,
    public _userService: UserService,
    public _router: Router,
    public _modalService: NgbModal,
    private _route: ActivatedRoute,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _printerService: PrinterService,
    public _branchService: BranchService,
    private _authService: AuthService,
    public _printService: PrintService
  ) {
    this.transactionTypesSelect = new Array();
    this.filters = new Array();
    for (let field of this.columns) {
      if (field.defaultFilter) {
        this.filters[field.name] = field.defaultFilter;
      } else {
        this.filters[field.name] = '';
      }
    }
    this.startDate = moment().format('YYYY-MM-DD');
    this.endDate = moment().format('YYYY-MM-DD');
    this.dateSelect = 'creationDate';
    this.processParams();
  }

  async ngOnInit() {
    this.database = localStorage.getItem('company');
    this.userCountry = Config.country;
    this.getPrinters();

    await this.getBranches({ operationType: { $ne: 'D' } }).then((branches) => {
      this.branches = branches;
    });

    let pathLocation: string[] = this._router.url.split('/');

    this.listType = pathLocation[2].charAt(0).toUpperCase() + pathLocation[2].slice(1);
    this.modules = observableOf(Config.modules);

    if (this.listType === 'Compras') {
      this.transactionMovement = TransactionMovement.Purchase;
    } else if (this.listType === 'Ventas') {
      this.transactionMovement = TransactionMovement.Sale;
    } else if (this.listType === 'Stock') {
      this.transactionMovement = TransactionMovement.Stock;
    } else if (this.listType === 'Fondos') {
      this.transactionMovement = TransactionMovement.Money;
    } else if (this.listType === 'Production') {
      this.transactionMovement = TransactionMovement.Production;
    }

    this._authService.getIdentity.subscribe(async (identity) => {
      // get permision

      if (identity?.permission?.collections.some((collection) => collection.name === 'transacciones')) {
        // Encontrar el objeto con name igual a "transacciones"
        const transactionObject = identity.permission.collections.find(
          (collection) => collection.name === 'transacciones'
        );

        // Guardar los valores de 'actions' en las variables correspondientes
        this.deleteTransaction = transactionObject.actions.delete;
        this.editTransaction = transactionObject.actions.edit;
      }

      if (identity && identity.origin) {
        this.branchSelectedId = identity.origin.branch._id;
        this.allowChangeBranch = false;

        for (let index = 0; index < this.columns.length; index++) {
          if (this.columns[index].name === 'branchDestination') {
            this.columns[index].defaultFilter = `{ "${identity.origin.branch._id}" }`;
          }
        }
      } else {
        this.allowChangeBranch = true;
        this.branchSelectedId = null;
      }
    });

    await this.getTransactionTypes().then((result) => {
      if (result) {
        this.transactionTypes = result;
      }
    });

    this.getItems();
    this.initDragHorizontalScroll();
  }
  public getBranches(match: {} = {}): Promise<Branch[]> {
    return new Promise<Branch[]>((resolve) => {
      this._branchService
        .getBranches(
          {}, // PROJECT
          match, // MATCH
          { number: 1 }, // SORT
          {}, // GROUP
          0, // LIMIT
          0 // SKIP
        )
        .subscribe(
          (result) => {
            if (result && result.branches) {
              resolve(result.branches);
            } else {
              resolve(null);
            }
          },
          (error) => {
            this.showMessage(error._body, 'danger', false);
            resolve(null);
          }
        );
    });
  }

  public getTransactionTypes(): Promise<TransactionType[]> {
    return new Promise<TransactionType[]>((resolve, reject) => {
      let match = {};

      match = {
        transactionMovement: this.transactionMovement,
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
            this.showMessage(error._body, 'danger', false);
            resolve(null);
          }
        );
    });
  }

  private processParams(): void {
    this._route.queryParams.subscribe((params) => {
      if (params['employeeClosingId'] || params['origin']) {
        this.employeeClosingId = params['employeeClosingId'];
        this.origin = params['origin'];
        let pathLocation: string[] = this._router.url.split('/');
        let listType = pathLocation[2].charAt(0).toUpperCase() + pathLocation[2].slice(1);

        this.modules = observableOf(Config.modules);

        this.listType = listType.split('?')[0];

        if (this.listType === 'Compras') {
          this.transactionMovement = TransactionMovement.Purchase;
        } else if (this.listType === 'Ventas') {
          this.transactionMovement = TransactionMovement.Sale;
        } else if (this.listType === 'Stock') {
          this.transactionMovement = TransactionMovement.Stock;
        } else if (this.listType === 'Fondos') {
          this.transactionMovement = TransactionMovement.Money;
        } else if (this.listType === 'Production') {
          this.transactionMovement = TransactionMovement.Production;
        }
      }
    });
  }

  public drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }

  public initDragHorizontalScroll(): void {
    const slider = document.querySelector('.table-responsive');
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
      isDown = true;
      slider.classList.add('active');
      startX = e['pageX'] - slider['offsetLeft'];
      scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener('mouseleave', () => {
      isDown = false;
      slider.classList.remove('active');
    });
    slider.addEventListener('mouseup', () => {
      isDown = false;
      slider.classList.remove('active');
    });
    slider.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e['pageX'] - slider['offsetLeft'];
      const walk = (x - startX) * 0.7; //scroll-fast

      slider.scrollLeft = scrollLeft - walk;
    });
  }

  public getPrinters(): void {
    this.loading = true;

    this._printerService.getPrinters().subscribe(
      (result) => {
        if (!result.printers) {
          this.printers = new Array();
        } else {
          this.hideMessage();
          this.printers = result.printers;
        }
        this.loading = false;
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getItems(): void {
    this.loading = true;

    // FILTRAMOS LA CONSULTA
    let match = `{`;

    for (let i = 0; i < this.columns.length; i++) {
      if (this.columns[i].visible || this.columns[i].required) {
        let value = this.filters[this.columns[i].name];

        if (value && value != '') {
          if (this.columns[i].defaultFilter) {
            match += `"${this.columns[i].name}": ${this.columns[i].defaultFilter}`;
          } else {
            if (this.columns[i].name.includes('_id')) {
              match += `"${this.columns[i].name}": { "$oid": "${value}" }`;
            } else {
              if (value.includes('$')) {
                match += `"${this.columns[i].name}": { ${value} }`;
              } else {
                match += `"${this.columns[i].name}": { "$regex": "${value}", "$options": "i"}`;
              }
            }
          }
          if (i < this.columns.length - 1) {
            match += ',';
          }
        }
      }
    }

    if (this.employeeClosingId) {
      match += `,"employeeClosing._id": { "$oid" : "${this.employeeClosingId}"},`;
    }

    if (this.origin) {
      match += `,"origin": "${this.origin}"`;
    }
    if (this.branchSelectedId) {
      match += `,"branchOrigin": {"$oid": "${this.branchSelectedId}"},`;
    }

    if (match.charAt(match.length - 1) === '}') match += ',';
    match += `"type.transactionMovement": "${this.transactionMovement}",`;
    if (this.stateSelect && this.stateSelect !== '') match += `"state": "${this.stateSelect}",`;
    match += `"${this.dateSelect}" : {
                    "$gte" : { "$date" : "${this.startDate}T00:00:00${this.timezone}" },
                    "$lte" : { "$date" : "${this.endDate}T23:59:59${this.timezone}" }
                }`;

    if (match.charAt(match.length - 1) === ',') match = match.substring(0, match.length - 1);

    match += `}`;

    match = JSON.parse(match);

    let transactionTypes = [];

    if (this.transactionTypesSelect && this.transactionTypesSelect.length > 0) {
      this.transactionTypesSelect.forEach((element) => {
        transactionTypes.push({ $oid: element._id });
      });
      match['type._id'] = { $in: transactionTypes };
    }

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project = `{`;
    let j = 0;

    for (let i = 0; i < this.columns.length; i++) {
      if (this.columns[i].visible || this.columns[i].required) {
        if (j > 0) {
          project += `,`;
        }
        j++;

        if (this.columns[i].project === null) {
          project += `"${this.columns[i].name}": 1`;
        } else {
          project += `"${this.columns[i].name}": ${this.columns[i].project}`;
        }
      }
    }
    project += `,"branchOrigin":1`;
    project += `}`;

    project = JSON.parse(project);

    // AGRUPAMOS EL RESULTADO
    let group = {
      _id: null,
      count: { $sum: 1 },
      items: { $push: '$$ROOT' },
    };

    let page = 0;

    if (this.currentPage != 0) {
      page = this.currentPage - 1;
    }
    let skip = !isNaN(page * this.itemsPerPage) ? page * this.itemsPerPage : 0; // SKIP
    let limit = this.itemsPerPage;

    this.subscription.add(
      this._transactionService
        .getTransactionsV2(
          project, // PROJECT
          match, // MATCH
          this.sort, // SORT
          group, // GROUP
          limit, // LIMIT
          skip // SKIP
        )
        .subscribe(
          (result) => {
            this.loading = false;
            if (result && result[0] && result[0].items) {
              if (this.itemsPerPage === 0) {
                this.exportExcelComponent.items = result[0].items;
                this.exportExcelComponent.export();
                this.itemsPerPage = 10;
                this.getItems();
              } else {
                this.items = result[0].items;
                this.totalItems = result[0].count;
              }
            } else {
              this.items = new Array();
              this.totalItems = 0;
            }
          },
          (error) => {
            this.showMessage(error._body, 'danger', false);
            this.loading = false;
            this.totalItems = 0;
          }
        )
    );
  }

  public getValue(item, column): any {
    let val: string = 'item';
    let exists: boolean = true;
    let value: any = '';

    for (let a of column.name.split('.')) {
      val += '.' + a;
      if (exists && !eval(val)) {
        exists = false;
      }
    }
    if (exists) {
      switch (column.datatype) {
        case 'number':
          value = this.roundNumberPipe.transform(eval(val));
          break;
        case 'currency':
          value = this.currencyPipe.transform(
            this.roundNumberPipe.transform(eval(val)),
            'USD',
            'symbol-narrow',
            '1.2-2'
          );
          break;
        case 'percent':
          value = this.roundNumberPipe.transform(eval(val)) + '%';
          break;
        case 'date':
          value = this.dateFormat.transform(eval(val), 'DD/MM/YYYY');
          break;
        default:
          value = eval(val);
          break;
      }
    }

    return value;
  }

  public getColumnsVisibles(): number {
    let count: number = 0;

    for (let column of this.columns) {
      if (column.visible) {
        count++;
      }
    }

    return count;
  }

  public pageChange(page): void {
    this.currentPage = page;
    this.getItems();
  }

  public orderBy(term: string): void {
    if (this.sort[term]) {
      this.sort[term] *= -1;
    } else {
      this.sort = JSON.parse('{"' + term + '": 1 }');
    }

    this.getItems();
  }

  public refresh(): void {
    this.getItems();
  }

  async openModal(op: string, transaction: Transaction) {
    let modalRef;

    switch (op) {
      case 'view':
        modalRef = this._modalService.open(ViewTransactionComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.transactionId = transaction._id;
        break;
      case 'edit':
        modalRef = this._modalService.open(AddTransactionComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.transactionId = transaction._id;
        modalRef.result.then(
          (result) => {
            if (result.transaction) {
              this.getItems();
            }
          },
          (reason) => {}
        );
        break;
      case 'print':
        if (transaction.type.transactionMovement === TransactionMovement.Production) {
          const data = {
            transactionId: transaction._id,
          };
          this._printService.toPrint(PrintType.Transaction, data);
        } else {
          if (transaction.type.expirationDate && moment(transaction.type.expirationDate).diff(moment(), 'days') <= 0) {
            this.showMessage('El documento esta vencido', 'danger', true);
          } else {
            if (transaction.type.readLayout) {
              modalRef = this._modalService.open(PrintTransactionTypeComponent);
              modalRef.componentInstance.transactionId = transaction._id;
            } else {
              let printer: Printer;

              await this.getUser().then(async (user) => {
                if (user && user.printers && user.printers.length > 0) {
                  for (const element of user.printers) {
                    if (element && element.printer && element.printer.printIn === PrinterPrintIn.Counter) {
                      printer = element.printer;
                    }
                  }
                } else {
                  if (transaction.type.defectPrinter) {
                    printer = transaction.type.defectPrinter;
                  } else {
                    if (this.printers && this.printers.length > 0) {
                      for (let printer of this.printers) {
                        if (printer.printIn === PrinterPrintIn.Counter) {
                          printer = printer;
                        }
                      }
                    }
                  }
                }
              });

              modalRef = this._modalService.open(PrintComponent);
              modalRef.componentInstance.company = transaction.company;
              modalRef.componentInstance.transactionId = transaction._id;
              modalRef.componentInstance.typePrint = 'invoice';
              modalRef.componentInstance.printer = printer;

              modalRef.result.then(
                (result) => {
                  if (transaction.taxes && transaction.taxes.length > 0) {
                    for (const tax of transaction.taxes) {
                      if (tax.tax.printer) {
                        modalRef = this._modalService.open(PrintTransactionTypeComponent);
                        modalRef.componentInstance.transactionId = transaction._id;
                        modalRef.componentInstance.printerID = tax.tax.printer;
                      }
                    }
                  }
                },
                (reason) => {
                  if (transaction.taxes && transaction.taxes.length > 0) {
                    for (const tax of transaction.taxes) {
                      if (tax.tax.printer) {
                        modalRef = this._modalService.open(PrintTransactionTypeComponent);
                        modalRef.componentInstance.transactionId = transaction._id;
                        modalRef.componentInstance.printerID = tax.tax.printer;
                      }
                    }
                  }
                }
              );
            }
          }
        }
        break;
      case 'delete':
        modalRef = this._modalService.open(DeleteTransactionComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.op = op;
        modalRef.componentInstance.transactionId = transaction._id;
        modalRef.result.then(
          (result) => {
            if (result === 'delete_close') {
              this.getItems();
            }
          },
          (reason) => {}
        );
        break;
      case 'send-email':
        let attachments = [];

        if (transaction.type.readLayout) {
          modalRef = this._modalService.open(PrintTransactionTypeComponent);
          modalRef.componentInstance.transactionId = transaction._id;
          modalRef.componentInstance.source = 'mail';
        } else {
          modalRef = this._modalService.open(PrintComponent);
          modalRef.componentInstance.company = transaction.company;
          modalRef.componentInstance.transactionId = transaction._id;
          modalRef.componentInstance.typePrint = 'invoice';
          modalRef.componentInstance.source = 'mail';
        }
        if (transaction.type.defectPrinter) {
          modalRef.componentInstance.printer = transaction.type.defectPrinter;
        } else {
          if (this.printers && this.printers.length > 0) {
            for (let printer of this.printers) {
              if (printer.printIn === PrinterPrintIn.Counter) {
                modalRef.componentInstance.printer = printer;
              }
            }
          }
        }

        modalRef = this._modalService.open(SendEmailComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        if (transaction.company && transaction.company.emails) {
          modalRef.componentInstance.emails = transaction.company.emails;
        }
        let labelPrint = transaction.type.name;

        if (transaction.type.labelPrint) {
          labelPrint = transaction.type.labelPrint;
        }
        modalRef.componentInstance.subject = `${labelPrint} ${this.padNumber(transaction.origin, 4)}-${
          transaction.letter
        }-${this.padNumber(transaction.number, 8)}`;

        if (transaction.type.electronics) {
          // modalRef.componentInstance.body = `Estimado Cliente: Haciendo click en el siguiente link, podrá descargar el comprobante correspondiente ` + `<a href="http://vps-1883265-x.dattaweb.com:300/api/print/invoice/${this.database}/${transaction._id}">Su comprobante</a>`
          modalRef.componentInstance.body = ' ';

          attachments.push({
            filename: `${transaction.origin}-${transaction.letter}-${transaction.number}.pdf`,
            path: `/home/clients/${this.database}/invoice/${transaction._id}.pdf`,
          });
        } else {
          // modalRef.componentInstance.body = `Estimado Cliente: Haciendo click en el siguiente link, podrá descargar el comprobante correspondiente ` + `<a href="http://vps-1883265-x.dattaweb.com:300/api/print/others/${this.database}/${transaction._id}">Su comprobante</a>`
          modalRef.componentInstance.body = ' ';
          attachments.push({
            filename: `${transaction.origin}-${transaction.letter}-${transaction.number}.pdf`,
            path: `/home/clients/${this.database}/others/${transaction._id}.pdf`,
          });
        }

        if (Config.country === 'MX') {
          // modalRef.componentInstance.body += ` y su XML correspondiente en <a href="http://vps-1883265-x.dattaweb.com:300/api/print/xml/CFDI-33_Factura_` + transaction.number + `">Su comprobante</a>`;
          modalRef.componentInstance.body += ' ';

          attachments.push({
            filename: `${transaction.origin}-${transaction.letter}-${transaction.number}.xml`,
            path: `/var/www/html/libs/fe/mx/archs_cfdi/CFDI-33_Factura_` + transaction.number + `.xml`,
          });
        }

        if (transaction.type.defectEmailTemplate) {
          if (transaction.type.electronics) {
            // modalRef.componentInstance.body = transaction.type.defectEmailTemplate.design + `<a href="http://vps-1883265-x.dattaweb.com:300/api/print/invoice/${this.database}/${transaction._id}">Su comprobante</a>`
            modalRef.componentInstance.body = transaction.type.defectEmailTemplate.design;
            attachments = [];
            attachments.push({
              filename: `${transaction.origin}-${transaction.letter}-${transaction.number}.pdf`,
              path: `/home/clients/${this.database}/invoice/${transaction._id}.pdf`,
            });
          } else {
            // modalRef.componentInstance.body = transaction.type.defectEmailTemplate.design + `<a href="http://vps-1883265-x.dattaweb.com:300/api/print/others/${this.database}/${transaction._id}">Su comprobante</a>`
            modalRef.componentInstance.body = transaction.type.defectEmailTemplate.design;
            attachments = [];
            attachments.push({
              filename: `${transaction.origin}-${transaction.letter}-${transaction.number}.pdf`,
              path: `/home/clients/${this.database}/others/${transaction._id}.pdf`,
            });
          }

          if (Config.country === 'MX') {
            // modalRef.componentInstance.body += ` y su XML correspondiente en <a href="http://vps-1883265-x.dattaweb.com:300/api/print/xml/CFDI-33_Factura_` + transaction.number + `">Su comprobante</a>`;
            modalRef.componentInstance.body += ' ';
            attachments = [];
            attachments.push({
              filename: `${transaction.origin}-${transaction.letter}-${transaction.number}.xml`,
              path: `/var/www/html/libs/fe/mx/archs_cfdi/CFDI-33_Factura_` + transaction.number + `.xml`,
            });
          }
        }
        modalRef.componentInstance.attachments = attachments;

        break;
      case 'download':
        if (transaction.type.readLayout) {
          modalRef = this._modalService.open(PrintTransactionTypeComponent);
          modalRef.componentInstance.transactionId = transaction._id;
          modalRef.componentInstance.source = 'mail';
        } else {
          modalRef = this._modalService.open(PrintComponent);
          modalRef.componentInstance.company = transaction.company;
          modalRef.componentInstance.transactionId = transaction._id;
          modalRef.componentInstance.typePrint = 'invoice';
          modalRef.componentInstance.source = 'mail';
        }
        let url = `http://${Config.apiHost}.poscloud.com.ar:300/api/print/others/${transaction._id}`;

        window.open(url);
        break;
      default:
    }
  }

  public getUser(): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      let identity: User = JSON.parse(sessionStorage.getItem('user'));
      let user;

      if (identity) {
        this._userService.getUser(identity._id).subscribe(
          (result) => {
            if (result && result.user) {
              resolve(result.user);
            } else {
              this.showMessage('Debe volver a iniciar sesión', 'danger', false);
            }
          },
          (error) => {
            this.showMessage(error._body, 'danger', false);
          }
        );
      }
    });
  }

  public padNumber(n, length): string {
    n = n.toString();
    while (n.length < length) n = '0' + n;

    return n;
  }

  public exportCiti(): void {
    let modalRef = this._modalService.open(ExportCitiComponent, {
      size: 'lg',
      backdrop: 'static',
    });

    modalRef.componentInstance.transactionMovement = this.transactionMovement;
    modalRef.result.then(
      (result) => {},
      (reason) => {}
    );
  }

  public exportIVA(): void {
    let modalRef = this._modalService.open(ExportIvaComponent, {
      size: 'md',
      backdrop: 'static',
    });

    modalRef.componentInstance.type = this.listType;
    modalRef.result.then(
      (result) => {
        if (result === 'export') {
        }
      },
      (reason) => {}
    );
  }

  public exportItems(): void {
    this.itemsPerPage = 0;
    this.getItems();
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
