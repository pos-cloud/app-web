import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

import { Article } from './../../models/article';
import { ArticleService } from './../../services/article.service';

@Component({
  selector: 'app-report-best-selling-article',
  templateUrl: './report-best-selling-article.component.html',
  styleUrls: ['./report-best-selling-article.component.css'],
  providers: [NgbAlertConfig]
})

export class ReportBestSellingArticleComponent implements OnInit {

  public items: any[] = new Array();
  public areArticlesEmpty: boolean = true;
  public alertMessage: string = "";
  public userType: string;
  public orderTerm: string[] = ['description'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  @Output() eventAddItem: EventEmitter<Article> = new EventEmitter<Article>();
  public itemsPerPage = 10;
  public totalItems = 0;
  @Input() startDate: string;
  @Input() startTime: string;
  @Input() endDate: string;
  @Input() endTime: string;

  constructor(
    public _articleService: ArticleService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) {
    this.startDate = moment().format('YYYY-MM-DD');
    this.startTime = moment('00:00', 'HH:mm').format('HH:mm');
    this.endDate = moment().format('YYYY-MM-DD');
    this.endTime = moment('23:59', 'HH:mm').format('HH:mm');
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getBestSellingArticle();
  }

  public getBestSellingArticle(): void {
    
    this.loading = true;

    let query = {
      type: "Venta",
      movement: "Entrada",
      currentAccount: "Si",
      modifyStock: true,
      startDate: this.startDate + " " + this.startTime,
      endDate: this.endDate + " " + this.endTime,
    }

    this._articleService.getBestSellingArticle(JSON.stringify(query)).subscribe(
      result => {
        if (!result || result.length <= 0) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
          this.loading = false;
          this.items = null;
          this.areArticlesEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.items = result;
          this.totalItems = this.items.length;
          this.areArticlesEmpty = false;
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
    this.getBestSellingArticle();
  }

  public addItem(articleSelected) {
    this.eventAddItem.emit(articleSelected);
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
