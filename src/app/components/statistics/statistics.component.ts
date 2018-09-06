import { Component, OnInit, ViewChild } from '@angular/core';

import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

import { CompanyService } from './../../services/company.service';
import { TransactionService } from '../../services/transaction.service';
import { UserService } from '../../services/user.service';
import { ReportBestSellingArticleComponent } from '../report-best-selling-article/report-best-selling-article.component';
import { ReportSalesByPaymentMethodComponent } from '../report-sales-by-payment-method/report-sales-by-payment-method.component';
import { ReportSalesByClientComponent } from '../report-sales-by-client/report-sales-by-client.component';
import { ReportSalesByMakeComponent } from '../report-sales-by-make/report-sales-by-make.component';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})

export class StatisticsComponent implements OnInit {

  public loading: boolean = false;
  public alertMessage: string = '';
  public startDate: string;
  public startTime: string;
  public endDate: string;
  public endTime: string;
  public totalSales: number = 0;
  public totalCollections: number = 0;
  public totalReturns: number = 0;
  public showStatistics: boolean = false;
  @ViewChild(ReportBestSellingArticleComponent) reportBestSellingArticle: ReportBestSellingArticleComponent;
  @ViewChild(ReportSalesByPaymentMethodComponent) reportSalesByPaymentMethod: ReportSalesByPaymentMethodComponent;
  @ViewChild(ReportSalesByClientComponent) reportSalesByClient: ReportSalesByClientComponent;
  @ViewChild(ReportSalesByMakeComponent) reportSalesByMake: ReportSalesByMakeComponent;

  constructor(
    public _companyService: CompanyService,
    public alertConfig: NgbAlertConfig,
    public _transactionService: TransactionService,
    public _userService: UserService
  ) {
  }

  ngOnInit(): void {

    this.startDate = moment().format('YYYY-MM-DD');
    this.startTime = moment('00:00', 'HH:mm').format('HH:mm');
    this.endDate = moment().format('YYYY-MM-DD');
    this.endTime = moment('23:59', 'HH:mm').format('HH:mm');
    this.showStatistics = true;
    this.loadStatistics();
  }

  ngAfterViewInit() {
    let indentity = this._userService.getIdentity;
    if (indentity) {
      this.showStatistics = true;
    }
  }

  public loadStatistics(): void {

    this.getTotalSales();
    this.getTotalCollections();
    this.getTotalReturns();
    this.reportBestSellingArticle.startDate = this.startDate;
    this.reportBestSellingArticle.startTime = this.startTime;
    this.reportBestSellingArticle.endDate = this.endDate;
    this.reportBestSellingArticle.endTime = this.endTime;
    this.reportBestSellingArticle.getBestSellingArticle();
    this.reportSalesByPaymentMethod.startDate = this.startDate;
    this.reportSalesByPaymentMethod.startTime = this.startTime;
    this.reportSalesByPaymentMethod.endDate = this.endDate;
    this.reportSalesByPaymentMethod.endTime = this.endTime;
    this.reportSalesByPaymentMethod.getSalesByPaymentMethod();
    this.reportSalesByClient.startDate = this.startDate;
    this.reportSalesByClient.startTime = this.startTime;
    this.reportSalesByClient.endDate = this.endDate;
    this.reportSalesByClient.endTime = this.endTime;
    this.reportSalesByClient.getSalesByClient();
    this.reportSalesByMake.startDate = this.startDate;
    this.reportSalesByMake.startTime = this.startTime;
    this.reportSalesByMake.endDate = this.endDate;
    this.reportSalesByMake.endTime = this.endTime;
    this.reportSalesByMake.getSalesByMake();
  }
  
  public getTotalSales(): void {

    let query = {
      type: "Venta",
      movement: "Entrada",
      currentAccount: "Si",
      modifyStock: true,
      startDate: this.startDate + " " + this.startTime,
      endDate: this.endDate + " " + this.endTime,
    }

    this.getTotalTransactionsBetweenDates("Sales", JSON.stringify(query));
  }

  public getTotalCollections(): void {

    let query = {
      type: "Venta",
      movement: "Entrada",
      currentAccount: "Cobra",
      modifyStock: false,
      startDate: this.startDate + " " + this.startTime,
      endDate: this.endDate + " " + this.endTime,
    }

    this.getTotalTransactionsBetweenDates("Collections", JSON.stringify(query));
  }

  public getTotalReturns(): void {

    let query = {
      type: "Venta",
      movement: "Salida",
      currentAccount: "Si",
      modifyStock: true,
      startDate: this.startDate + " " + this.startTime,
      endDate: this.endDate + " " + this.endTime,
    }

    this.getTotalTransactionsBetweenDates("Returns", JSON.stringify(query));
  }

  public getTotalTransactionsBetweenDates(op: string, query: string): void {

    this.loading = true;

    this._transactionService.getTotalTransactionsBetweenDates(query).subscribe(
      result => {
        if (!result || result.length <= 0) {
          this.loading = false;
          switch (op) {
            case "Sales":
              this.totalSales = 0;
              break;
            case "Collections":
              this.totalCollections = 0;
              break;
            case "Returns":
              this.totalReturns = 0;
              break;
          }
        } else {
          this.hideMessage();
          this.loading = false;
          switch (op) {
            case "Sales":
              this.totalSales = result.total;
              break;
            case "Collections":
              this.totalCollections = result.total;
              break;
            case "Returns":
              this.totalReturns = result.total;
              break;
          }
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
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