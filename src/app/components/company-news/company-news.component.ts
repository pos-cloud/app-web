import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

import { CompanyNews } from './../../models/company-news';
import { Company } from './../../models/company';
import { CompanyNewsService } from './../../services/company-news.service';

@Component({
  selector: 'app-company-news',
  templateUrl: './company-news.component.html',
  styleUrls: ['./company-news.component.css'],
  providers: [NgbAlertConfig]
})

export class CompanyNewsComponent implements OnInit {

  public companiesNews: CompanyNews[] = new Array();
  public companyNews: CompanyNews;
  public areCompaniesNewsEmpty: boolean = true;
  @Input() company: Company;
  public alertMessage: string = "";
  public userType: string;
  public orderTerm: string[] = ['-date'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public itemsPerPage = 5;
  public totalItems = 0;
  public focusEvent = new EventEmitter<boolean>();

  constructor(
    public _companyNewsService: CompanyNewsService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { 
    this.companyNews =  new CompanyNews();
    this.companyNews.date = moment(this.companyNews.date).format('YYYY-MM-DD');
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getCompaniesNews();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getCompaniesNews(): void {

    this.loading = true;

    let query: string = 'where="company":"' + this.company._id + '"';

    this._companyNewsService.getCompaniesNews(query).subscribe(
      result => {
        if (!result.companiesNews) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
          this.loading = false;
          this.companiesNews = null;
          this.areCompaniesNewsEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.companiesNews = result.companiesNews;
          this.totalItems = this.companiesNews.length;
          this.areCompaniesNewsEmpty = false;
        }
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public orderBy(term: string, property?: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-" + term;
    } else {
      this.orderTerm[0] = term;
    }
    this.propertyTerm = property;
  }

  public refresh(): void {
    this.getCompaniesNews();
  }

  public addCompanyNews(): void {

    if( this.companyNews.date &&
        this.companyNews.news &&
        this.companyNews.news !== "") {
      this.companyNews.date = moment(this.companyNews.date, 'YYYY-MM-DD').format('YYYY-MM-DDTHH:mm:ssZ');
      this.companyNews.company = this.company;
      this.saveCompanyNews();
    } else {
      this.showMessage("Debe completar la novedad", "info", true);
    }
  }

  public saveCompanyNews(): void {
    
    this.loading = true;

    this._companyNewsService.saveCompanyNews(this.companyNews).subscribe(
      result => {
        if (!result.companyNews) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.companyNews = result.companyNews;
          this.companyNews = new CompanyNews();
          this.companyNews.date = moment(this.companyNews.date).format('YYYY-MM-DD');
          this.focusEvent.emit(true);
          this.getCompaniesNews();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public deleteCompanyNews(companyNews: CompanyNews): void {

    this.loading = true;

    this._companyNewsService.deleteCompanyNews(companyNews._id).subscribe(
      result => {
        if (!result.companyNews) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.getCompaniesNews();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
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
    this.alertMessage = "";
  }
}
