//Paquetes Angular
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

//Paquetes de terceros
import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

//Modelos
import { Transaction } from '../transaction/transaction';
import { Company } from '../company/company';
import { MovementOfCash } from '../movement-of-cash/movement-of-cash';

//Services
import { CompanyService } from '../company/company.service';
import { TransactionService } from '../transaction/transaction.service';
import { TransactionTypeService } from '../transaction-type/transaction-type.service';
import { MovementOfCashService } from '../movement-of-cash/movement-of-cash.service';

//Componentes
import { PrintComponent } from 'app/components/print/print/print.component';
import { Printer, PrinterPrintIn } from '../printer/printer';
import { PrinterService } from '../printer/printer.service';
import { ViewTransactionComponent } from '../transaction/view-transaction/view-transaction.component';
import { RoundNumberPipe } from 'app/main/pipes/round-number.pipe';
import { Config } from 'app/app.config';
import { ConfigService } from 'app/components/config/config.service';
import { TransactionMovement } from 'app/components/transaction-type/transaction-type';
import { CompanyType } from 'app/components/payment-method/payment-method';
import { AddTransactionComponent } from '../transaction/add-transaction/add-transaction.component';
import { PrintTransactionTypeComponent } from '../print/print-transaction-type/print-transaction-type.component';
import { SendEmailComponent } from '../send-email/send-email.component';
import { SelectCompanyComponent } from '../company/select-company/select-company.component';

@Component({
  selector: 'app-current-account',
  templateUrl: './current-account.component.html',
  styleUrls: ['./current-account.component.css'],
  providers: [NgbAlertConfig]
})

export class CurrentAccountComponent implements OnInit {

  public transactions: Transaction[];
  public companySelected: Company;
  public companyType: CompanyType;
  public movementsOfCashes: MovementOfCash[];
  public areTransactionsEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string;
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public itemsPerPage = 10;
  public totalItems = 0;
  public items: any[] = new Array();
  public balance: number = 0;
  public balanceDoc: number = 0;
  public currentPage: number = 1;
  public roundNumber: RoundNumberPipe;
  public startDate: string;
  public endDate: string;
  public userCountry: string;
  public detailsPaymentMethod: boolean = false;
  public showPaymentMethod: boolean = false;
  public config: Config;
  public invertedView: boolean = false;
  public transactionMovement: TransactionMovement;
  public showBalanceOfTransactions: boolean = false;

  constructor(
    public _transactionService: TransactionService,
    public _transactionTypeService: TransactionTypeService,
    public _movementOfCashService: MovementOfCashService,
    public _companyService: CompanyService,
    public _configService: ConfigService,
    public _router: Router,
    private _route: ActivatedRoute,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig,
    public _printerService: PrinterService
  ) {
    this.movementsOfCashes = new Array();
    this.roundNumber = new RoundNumberPipe();
    this.startDate = moment('1990-01-01').format('YYYY-MM-DD');
    this.endDate = moment().format('YYYY-MM-DD');
    this.processParams();
  }

  private processParams(): void {
    this._route.queryParams.subscribe(params => {
      this.companyType = params['companyType'];
      if (params['companyId']) {
        this.getCompany(params['companyId']);
      } else {
        this.openModal('company');
      }
    });
  }

  async ngOnInit() {

    this.userCountry = Config.country;
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];

    await this._configService.getConfig.subscribe(
      config => {
        this.config = config;
        this.detailsPaymentMethod = this.config.reports.summaryOfAccounts.detailsPaymentMethod;
        if (this.companyType === CompanyType.Client) {
          this.invertedView = this.config.reports.summaryOfAccounts.invertedViewClient;
        } else {
          this.invertedView = this.config.reports.summaryOfAccounts.invertedViewProvider
        }
      }
    );
  }

  public getSummary(): void {

    this.loading = true;

    let timezone = "-03:00";
    if (Config.timezone && Config.timezone !== '') {
      timezone = Config.timezone.split('UTC')[1];
    }

    if (typeof this.detailsPaymentMethod !== 'boolean') {
      this.detailsPaymentMethod = Boolean(JSON.parse(this.detailsPaymentMethod));
    }

    let query = {
      company: this.companySelected._id,
      startDate: this.startDate + " 00:00:00" + timezone,
      endDate: this.endDate + " 23:59:59" + timezone,
      detailsPaymentMethod: this.detailsPaymentMethod,
      transactionMovement: this.transactionMovement,
      invertedView: this.invertedView
    }

    this._companyService.getSummaryOfAccountsByCompany(JSON.stringify(query)).subscribe(
      result => {
        if (!result) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.items = new Array();
          this.totalItems = 0;
        } else {
          this.hideMessage();
          this.items = result;
          this.totalItems = this.items.length;
          this.currentPage = parseFloat(this.roundNumber.transform(this.totalItems / this.itemsPerPage + 0.5, 0).toFixed(0));
          this.getBalance();
          this.showPaymentMethod = this.detailsPaymentMethod;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getCompany(companyId: string): void {

    this.loading = true;

    this._companyService.getCompany(companyId).subscribe(
      result => {
        if (!result.company) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.companySelected = result.company;
          if (this.companySelected.type === CompanyType.Client) {
            this.transactionMovement = TransactionMovement.Sale;
          } else {
            this.transactionMovement = TransactionMovement.Purchase;
          }
          this.getSummary();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public refresh(): void {
    if (this.companySelected) {
      this.getSummary();
    } else {
      this.showMessage("Debe seleccionar una empresa.", 'info', true);
    }
  }

  public getBalance(): void {

    this.balance = 0;
    this.balanceDoc = 0;

    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].isCurrentAccount || this.items[i].typeCurrentAccount !== "No") {

        //SALDO
        this.balance += this.items[i].debe;
        this.balance -= this.items[i].haber;
        this.items[i].balance = (this.items[i].debe - this.items[i].haber);
        if (this.items[i - 1]) {
          this.items[i].balance += this.items[i - 1].balance;
        }

        //SALDO DOC
        if(this.items[i].haber > 0) this.items[i].transactionBalance *= -1;
        this.balanceDoc += this.items[i].transactionBalance;
      }
    }
  }

  async openModal(op: string, transactionId?: string) {

    let modalRef;
    switch (op) {
      case 'view-transaction':
        modalRef = this._modalService.open(ViewTransactionComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.transactionId = transactionId;
        break;
      case 'edit-transaction':
        modalRef = this._modalService.open(AddTransactionComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.transactionId = transactionId;
        modalRef.result.then((result) => {
          if (result.transaction) {
            // this.refresh();
          }
        }, (reason) => {

        });
        break;
      case 'company':
        modalRef = this._modalService.open(SelectCompanyComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.type = this.companyType;
        modalRef.result.then(
          (result) => {
            if (result.company) {
              this.companySelected = result.company;
              if (this.companyType === CompanyType.Client) {
                this._router.navigate(['admin/cuentas-corrientes'], { queryParams: { companyId: this.companySelected._id, companyType: this.companySelected.type } });
              } else {
                this._router.navigate(['admin/cuentas-corrientes'], { queryParams: { companyId: this.companySelected._id, companyType: this.companySelected.type } });
              }
            }
          }, (reason) => {
          }
        );
        break;
      case 'print':
        if (this.companySelected) {
          modalRef = this._modalService.open(PrintComponent);
          modalRef.componentInstance.items = this.items;
          modalRef.componentInstance.company = this.companySelected;
          modalRef.componentInstance.params = { detailsPaymentMethod: this.detailsPaymentMethod };
          modalRef.componentInstance.typePrint = 'current-account';
          modalRef.componentInstance.balance = this.balance;
        } else {
          this.showMessage("Debe seleccionar una empresa.", 'info', true);
        }
        break;
      case 'print-transaction':
        modalRef = this._modalService.open(PrintComponent);
        modalRef.componentInstance.transactionId = transactionId;
        modalRef.componentInstance.company = this.companySelected;
        modalRef.componentInstance.typePrint = 'invoice';
        await this.getTransaction(transactionId).then(
          async transaction => {
            if (transaction) {
              if (transaction.type.defectPrinter) {
                modalRef.componentInstance.printer = transaction.type.defectPrinter;
              } else {
                await this.getPrinters().then(
                  printers => {
                    if (printers) {
                      for (let printer of printers) {
                        if (printer.printIn === PrinterPrintIn.Counter) {
                          modalRef.componentInstance.printer = printer;
                        }
                      }
                    }
                  }
                );
              }
            }
          }
        );
        break;
      case 'send-email':
        let transaction: Transaction;
        await this.getTransaction(transactionId).then(
          async result => {
            transaction = result;
          }
        );
        if (transaction.type.readLayout) {
          modalRef = this._modalService.open(PrintTransactionTypeComponent)
          modalRef.componentInstance.transactionId = transactionId;
          modalRef.componentInstance.source = "mail";
        } else {
          modalRef = this._modalService.open(PrintComponent);
          modalRef.componentInstance.company = transaction.company;
          modalRef.componentInstance.transactionId = transactionId;
          modalRef.componentInstance.typePrint = 'invoice';
          modalRef.componentInstance.source = "mail";
        }
        if (transaction.type.defectPrinter) {
          modalRef.componentInstance.printer = transaction.type.defectPrinter;
        } else {
          await this.getPrinters().then(
            printers => {
              if (printers && printers.length > 0) {
                for (let printer of printers) {
                  if (printer.printIn === PrinterPrintIn.Counter) {
                    modalRef.componentInstance.printer = printer;
                  }
                }
              }
            }
          );

        }

        modalRef = this._modalService.open(SendEmailComponent, { size: 'lg', backdrop: 'static' });
        if (transaction.company && transaction.company.emails) {
          modalRef.componentInstance.emails = transaction.company.emails;
        }
        let labelPrint = transaction.type.name;
        if (transaction.type.labelPrint) {
          labelPrint = transaction.type.labelPrint;
        }
        modalRef.componentInstance.subject = `${labelPrint} ${this.padNumber(transaction.origin, 4)}-${transaction.letter}-${this.padNumber(transaction.number, 8)}`;
        if (transaction.type.electronics) {
          modalRef.componentInstance.body = `Estimado Cliente: Haciendo click en el siguiente link, podrá descargar el comprobante correspondiente` + `<a href="http://${Config.database}.poscloud.com.ar:300/api/print/invoice/${transaction._id}">Su comprobante</a>`
        } else {
          modalRef.componentInstance.body = `Estimado Cliente: Haciendo click en el siguiente link, podrá descargar el comprobante correspondiente ` + `<a href="http://${Config.database}.poscloud.com.ar:300/api/print/others/${transaction._id}">Su comprobante</a>`
        }

        if (Config.country === 'MX') {
          modalRef.componentInstance.body += ` y su XML correspondiente en http://${Config.database}.poscloud.com.ar:300/api/print/xml/CFDI-33_Factura_` + transaction.number;
        }

        if (transaction.type.defectEmailTemplate) {

          if (transaction.type.electronics) {
            modalRef.componentInstance.body = transaction.type.defectEmailTemplate.design + `<a href="http://${Config.database}.poscloud.com.ar:300/api/print/invoice/${transaction._id}">Su comprobante</a>`
          } else {
            modalRef.componentInstance.body = transaction.type.defectEmailTemplate.design + `<a href="http://${Config.database}.poscloud.com.ar:300/api/print/others/${transaction._id}">Su comprobante</a>`
          }

          if (Config.country === 'MX') {
            modalRef.componentInstance.body += ` y su XML correspondiente en http://${Config.database}.poscloud.com.ar:300/api/print/xml/CFDI-33_Factura_` + transaction.number;
          }
        }

        break;
      default: ;
    }
  }

  public padNumber(n, length): string {

    var n = n.toString();
    while (n.length < length)
      n = "0" + n;
    return n;
  }

  public getTransaction(transactionId: string): Promise<Transaction> {

    return new Promise<Transaction>((resolve, reject) => {

      this._transactionService.getTransaction(transactionId).subscribe(
        async result => {
          if (!result.transaction) {
            this.showMessage(result.message, 'danger', false);
            resolve(null);
          } else {
            resolve(result.transaction);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public getPrinters(): Promise<Printer[]> {

    return new Promise<Printer[]>(async (resolve, reject) => {

      this._printerService.getPrinters().subscribe(
        result => {
          if (!result.printers) {
            resolve(null);
          } else {
            resolve(result.printers);
          }
        },
        error => {
          resolve(null);
        }
      );
    });
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
