import { Component, OnInit, ViewChild } from '@angular/core';

import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

import { CompanyService } from './../../services/company.service';
import { TransactionService } from '../../services/transaction.service';
import { ReportBestSellingArticleComponent } from '../report-best-selling-article/report-best-selling-article.component';
import { ReportSalesByPaymentMethodComponent } from '../report-sales-by-payment-method/report-sales-by-payment-method.component';
import { ReportSalesByClientComponent } from '../report-sales-by-client/report-sales-by-client.component';
import { ReportSalesByMakeComponent } from '../report-sales-by-make/report-sales-by-make.component';
import { Router } from '@angular/router';
import { ReportBirthdayComponent } from '../report-birthday/report-birthday.component';
import { Config } from 'app/app.config';
import { AuthService } from 'app/services/auth.service';
import { Branch } from 'app/models/branch';
import { BranchService } from 'app/services/branch.service';

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
  @ViewChild(ReportBestSellingArticleComponent, {static: true}) reportBestSellingArticle: ReportBestSellingArticleComponent;
  @ViewChild(ReportSalesByPaymentMethodComponent, {static: true}) reportSalesByPaymentMethod: ReportSalesByPaymentMethodComponent;
  @ViewChild(ReportSalesByClientComponent, {static: true}) reportSalesByClient: ReportSalesByClientComponent;
  @ViewChild(ReportSalesByMakeComponent, {static: true}) reportSalesByMake: ReportSalesByMakeComponent;
  @ViewChild(ReportBirthdayComponent, {static: true}) reportBirthday: ReportBirthdayComponent;
  public transactionMovement: string;
  public branches: Branch[];
  public branchSelectedId: String;
  public allowChangeBranch: boolean;

  constructor(
    public _companyService: CompanyService,
    public alertConfig: NgbAlertConfig,
    public _transactionService: TransactionService,
    public _authService: AuthService,
    public _router: Router,
    private _branchService: BranchService
  ) {
    let pathLocation: string[] = this._router.url.split('/');
    this.transactionMovement = pathLocation[2].charAt(0).toUpperCase() + pathLocation[2].slice(1);
  }

  async ngOnInit() {

    this.startDate = moment().format('YYYY-MM-DD');
    this.startTime = moment('00:00', 'HH:mm').format('HH:mm');
    this.endDate = moment().format('YYYY-MM-DD');
    this.endTime = moment('23:59', 'HH:mm').format('HH:mm');
    this.showStatistics = true;
    await this.getBranches({ operationType: { $ne: 'D' } }).then(
      branches => {
        this.branches = branches;
      }
    );
    this._authService.getIdentity.subscribe(
      async identity => {
        if(identity && identity.origin) {
          this.allowChangeBranch = false;
          this.branchSelectedId = identity.origin.branch._id;
        } else {
          this.allowChangeBranch = true;
          this.branchSelectedId = null;
        }
      }
    );
    
    this.loadStatistics();
  }

  ngAfterViewInit() {
    this._authService.getIdentity.subscribe(
      identity => {
        if (identity) {
          this.showStatistics = true;
        }
      }
    );
  }

  public getBranches(match: {} = {}): Promise<Branch[]> {

    return new Promise<Branch[]>((resolve, reject) => {
  
      this._branchService.getBranches(
          {}, // PROJECT
          match, // MATCH
          { number: 1 }, // SORT
          {}, // GROUP
          0, // LIMIT
          0 // SKIP
      ).subscribe(
        result => {
          if (result && result.branches) {
            resolve(result.branches);
          } else {
            resolve(null);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public loadStatistics(): void {
    
    this.getTotalSales();
    this.getTotalCollections();
    this.getTotalReturns();
    this.reportBestSellingArticle.startDate = this.startDate;
    this.reportBestSellingArticle.startTime = this.startTime;
    this.reportBestSellingArticle.endDate = this.endDate;
    this.reportBestSellingArticle.endTime = this.endTime;
    this.reportBestSellingArticle.limit = 5;
    this.reportBestSellingArticle.branchSelectedId = this.branchSelectedId;
    this.reportBestSellingArticle.getBestSellingArticle();
    this.reportSalesByPaymentMethod.startDate = this.startDate;
    this.reportSalesByPaymentMethod.startTime = this.startTime;
    this.reportSalesByPaymentMethod.endDate = this.endDate;
    this.reportSalesByPaymentMethod.endTime = this.endTime;
    this.reportSalesByPaymentMethod.limit = 5;
    this.reportSalesByPaymentMethod.branchSelectedId = this.branchSelectedId;
    this.reportSalesByPaymentMethod.getSalesByPaymentMethod();
    this.reportSalesByClient.startDate = this.startDate;
    this.reportSalesByClient.startTime = this.startTime;
    this.reportSalesByClient.endDate = this.endDate;
    this.reportSalesByClient.endTime = this.endTime;
    this.reportSalesByClient.limit = 5;
    this.reportSalesByClient.branchSelectedId = this.branchSelectedId;
    this.reportSalesByClient.getSalesByCompany();
    this.reportSalesByMake.startDate = this.startDate;
    this.reportSalesByMake.startTime = this.startTime;
    this.reportSalesByMake.endDate = this.endDate;
    this.reportSalesByMake.endTime = this.endTime;
    this.reportSalesByMake.limit = 5;
    this.reportSalesByMake.branchSelectedId = this.branchSelectedId;
    this.reportSalesByMake.getSalesByMake();
  }

  public getTotalSales(): void {

    let movement;
    if (this.transactionMovement === "Venta") {
      movement = "Entrada";
    } else if (this.transactionMovement === "Compra") {
      movement = "Salida";
    }

    let timezone = "-03:00";
    if(Config.timezone && Config.timezone !== '') {
      timezone = Config.timezone.split('UTC')[1];
    }

    let query = {
      type: this.transactionMovement,
      movement: movement,
      currentAccount: "Si",
      modifyStock: true,
      startDate: this.startDate + " " + this.startTime + timezone,
      endDate: this.endDate + " " + this.endTime + timezone,
      branch: this.branchSelectedId
    }

    this.getTotalTransactionsBetweenDates("Sales", JSON.stringify(query));
  }

  public getTotalCollections(): void {

    let movement;
    if (this.transactionMovement === "Venta") {
      movement = "Entrada";
    } else if (this.transactionMovement === "Compra") {
      movement = "Salida";
    }

    let timezone = "-03:00";
    if(Config.timezone) {
      timezone = Config.timezone.split('UTC')[0];
    }

    let query = {
      type: this.transactionMovement,
      movement: movement,
      currentAccount: "Cobra",
      modifyStock: false,
      startDate: this.startDate + " " + this.startTime + timezone,
      endDate: this.endDate + " " + this.endTime + timezone,
      branch: this.branchSelectedId
    }

    this.getTotalTransactionsBetweenDates("Collections", JSON.stringify(query));
  }

  public getTotalReturns(): void {

    let movement;
    if (this.transactionMovement === "Venta") {
      movement = "Salida";
    } else if (this.transactionMovement === "Compra") {
      movement = "Entrada";
    }

    let timezone = "-03:00";
    if(Config.timezone) {
      timezone = Config.timezone.split('UTC')[0];
    }

    let query = {
      type: this.transactionMovement,
      movement: movement,
      currentAccount: "Si",
      modifyStock: true,
      startDate: this.startDate + " " + this.startTime + timezone,
      endDate: this.endDate + " " + this.endTime + timezone,
      branch: this.branchSelectedId
    }

    this.getTotalTransactionsBetweenDates("Returns", JSON.stringify(query));
  }

  public getTotalTransactionsBetweenDates(op: string, query: string): void {

    this.loading = true;

    this._transactionService.getTotalTransactionsBetweenDates(query).subscribe(
      result => {
        this.loading = false;
        if (result && result[0]) {
          switch (op) {
            case "Sales":
              this.totalSales = result[0].total;
              break;
            case "Collections":
              this.totalCollections = result[0].total;
              break;
            case "Returns":
              this.totalReturns = result[0].total;
              break;
          }
        } else {
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
