import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

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
  public alertMessage: string = '';
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  @Input() startDate: string;
  @Input() startTime: string;
  @Input() endDate: string;
  @Input() endTime: string;
  @Input() limit: number = 0;
  public listType: string;
  public itemsPerPage: string = "5";
  public currentPage: number = 1;
  public totalItems = 0;
  public sort = {
    "count": -1
  };

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
    this.listType = pathLocation[2];
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
      sort: this.sort,
      limit: this.limit
    }

    this._articleService.getBestSellingArticle(JSON.stringify(query)).subscribe(
      result => {
        if (!result || result.length <= 0) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
          this.items = null;
          this.areArticlesEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.items = result;
          this.totalItems = this.items[0];
          this.areArticlesEmpty = false;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public orderBy(term: string): void {

    if(this.sort[term]) {
      this.sort[term] *= -1;
    } else {
      this.sort = JSON.parse('{"' + term + '": 1 }');
    }

    this.getBestSellingArticle();
  }

  public refresh(): void {
    this.getBestSellingArticle();
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
