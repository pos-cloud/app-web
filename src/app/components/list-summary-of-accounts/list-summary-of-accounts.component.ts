import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

import { CompanyService } from '../../core/services/company.service';
import { CompanyType } from '../company/company';

import { Config } from 'app/app.config';
import { TransactionMovement } from 'app/components/transaction-type/transaction-type';
import { ConfigService } from 'app/core/services/config.service';
import { Subscription } from 'rxjs';
import { RoundNumberPipe } from '../../shared/pipes/round-number.pipe';
import { CurrentAccountDetailsComponent } from '../print/current-account-details/current-account-details.component';

@Component({
  selector: 'app-list-summary-of-accounts',
  templateUrl: './list-summary-of-accounts.component.html',
  styleUrls: ['./list-summary-of-accounts.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ListSummaryOfAccountsComponent implements OnInit {
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public items: any[] = new Array();
  public areItemsEmpty: boolean = false;
  public areFiltersVisible: boolean = false;
  public orderTerm: string[] = ['-balance'];
  public propertyTerm: string;
  public itemsPerPage = 10;
  public totalItems = 0;
  public companyType: CompanyType;
  public startDate: string;
  public endDate: string;
  public dataSelect: string = 'transaction';
  public roundNumber = new RoundNumberPipe();
  public invertedView: boolean = false;
  public transactionMovement: TransactionMovement;
  public config: Config;
  public filterCompanyEmployee: string;
  public filterCompanyEmails: string;
  public filterCompanyName: string;
  public filterIdentificationValue: string;
  public filterCompanyAddress: string;
  private subscription: Subscription = new Subscription();

  constructor(
    public alertConfig: NgbAlertConfig,
    private _router: Router,
    private _route: ActivatedRoute,
    private _companyService: CompanyService,
    private _configService: ConfigService,
    private _modalService: NgbModal
  ) {
    this.items = new Array();
    this.startDate = moment('1990-01-01').format('YYYY-MM-DD');
    this.endDate = moment().format('YYYY-MM-DD');
    this.processParams();
  }

  private processParams(): void {
    this._route.queryParams.subscribe((params) => {
      this.companyType = params['companyType'];
      if (this.companyType) {
        this.initVariables();
      }
    });
  }

  async ngOnInit() {
    this.initDragHorizontalScroll();
  }

  private async initVariables() {
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    await this._configService.getConfig.subscribe((config) => {
      this.config = config;
      if (this.companyType === CompanyType.Client) {
        this.invertedView =
          this.config.reports.summaryOfAccounts.invertedViewClient;
        this.transactionMovement = TransactionMovement.Sale;
      } else {
        this.invertedView =
          this.config.reports.summaryOfAccounts.invertedViewProvider;
        this.transactionMovement = TransactionMovement.Purchase;
      }
      if (this.invertedView) {
        this.orderTerm = ['balance'];
      }
    });
    this.showAlert();
    //this.getSummary();
  }

  private showAlert(): void {
    alert('Esta función se encuentra deshabilitada por el momento.');
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

  public getSummary(): void {
    this.loading = true;

    let timezone = '-03:00';
    if (Config.timezone && Config.timezone !== '') {
      timezone = Config.timezone.split('UTC')[1];
    }

    let query = {
      startDate: this.startDate + ' 00:00:00' + timezone,
      endDate: this.endDate + ' 23:59:59' + timezone,
      companyType: this.companyType,
      transactionMovement: this.transactionMovement,
      invertedView: this.invertedView,
      dataSelect: this.dataSelect,
    };

    this.subscription.add(
      this._companyService
        .getSummaryOfAccounts(JSON.stringify(query))
        .subscribe(
          (result) => {
            if (!result) {
              if (result.message && result.message !== '')
                this.showMessage(result.message, 'info', true);
              this.items = new Array();
              this.totalItems = 0;
            } else {
              this.hideMessage();
              this.items = result;
              this.totalItems = this.items.length;
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

  public viewDetailCureentAccount(companyId: string): void {
    this._router.navigate(['/admin/cuentas-corrientes'], {
      queryParams: { companyType: this.companyType, companyId: companyId },
    });
  }

  public refresh(): void {
    //this.getSummary();
    this.showAlert();
  }

  public orderBy(term: string, property?: string): void {
    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = '-' + term;
    } else {
      this.orderTerm[0] = term;
    }
    this.propertyTerm = property;
  }

  public calculateTotal(items, col) {
    let total = 0;
    if (items) {
      for (let item of items) {
        total = total + item[col];
      }
    }
    return this.roundNumber.transform(total);
  }

  public openModal(op: string) {
    let modalRef;
    switch (op) {
      case 'print':
        modalRef = this._modalService.open(CurrentAccountDetailsComponent);
        modalRef.componentInstance.companyType = this.companyType;
        modalRef.componentInstance.employee = this.filterCompanyEmployee;
        modalRef.componentInstance.address = this.filterCompanyAddress;
        modalRef.componentInstance.emails = this.filterCompanyEmails;
        modalRef.componentInstance.name = this.filterCompanyName;
        modalRef.componentInstance.identification =
          this.filterIdentificationValue;
        modalRef.componentInstance.filterCompanyType = this.companyType;
        modalRef.componentInstance.startDate = this.startDate;
        modalRef.componentInstance.endDate = this.endDate;
        modalRef.componentInstance.balance = true;

        break;
      case 'print2':
        modalRef = this._modalService.open(CurrentAccountDetailsComponent);
        modalRef.componentInstance.companyType = this.companyType;
        modalRef.componentInstance.employee = this.filterCompanyEmployee;
        modalRef.componentInstance.address = this.filterCompanyAddress;
        modalRef.componentInstance.emails = this.filterCompanyEmails;
        modalRef.componentInstance.name = this.filterCompanyName;
        modalRef.componentInstance.identification =
          this.filterIdentificationValue;
        modalRef.componentInstance.filterCompanyType = this.companyType;
        modalRef.componentInstance.startDate = this.startDate;
        modalRef.componentInstance.endDate = this.endDate;
        modalRef.componentInstance.balance = false;

        break;
    }
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public showMessage(
    message: string,
    type: string,
    dismissible: boolean
  ): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }
}
