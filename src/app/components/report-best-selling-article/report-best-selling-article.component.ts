import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

import { ArticleService } from './../../services/article.service';
import { Config } from 'app/app.config';
import { Branch } from 'app/models/branch';
import { BranchService } from 'app/services/branch.service';
import { AuthService } from 'app/services/auth.service';
import { AddArticleComponent } from '../add-article/add-article.component';

@Component({
  selector: 'app-report-best-selling-article',
  templateUrl: './report-best-selling-article.component.html',
  styleUrls: ['./report-best-selling-article.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None
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
  public sort = {
    "count": -1
  };
  public transactionMovement: string;
  public totalAmount;
  public totalItem;
  public filters: any[];
  public displayedColumns = [
      'article.code',
      'article.description',
      'article.category.description',
      'article.make.description',
      'article.quantityPerMeasure',
      'article.unitOfMeasurement.name'
  ];
  public branches: Branch[];
  @Input() branchSelectedId: String;
  public allowChangeBranch: boolean;

  constructor(
    public _articleService: ArticleService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig,
    private _branchService: BranchService,
    private _authService: AuthService
  ) {
    this.startDate = moment().format('YYYY-MM-DD');
    this.startTime = moment('00:00', 'HH:mm').format('HH:mm');
    this.endDate = moment().format('YYYY-MM-DD');
    this.endTime = moment('23:59', 'HH:mm').format('HH:mm');
    this.totalAmount = 0;
    this.totalItem = 0;
    this.filters = new Array();
    for(let field of this.displayedColumns) {
      this.filters[field] = "";
    }
  }

  async ngOnInit() {

    if(!this.branchSelectedId) {
      await this.getBranches({ operationType: { $ne: 'D' } }).then(
        branches => {
          this.branches = branches;
          if(this.branches && this.branches.length > 1) {
            this.branchSelectedId = this.branches[0]._id;
          }
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
    }

    this.getBestSellingArticle();
  }

  async openModal(op: string, item: any[]) {
    let modalRef;
    switch (op) {
      case 'view':
        modalRef = this._modalService.open(AddArticleComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.articleId = item['article']._id;
        modalRef.componentInstance.readonly = true;
        modalRef.componentInstance.operation = "view";
        break;
      default: ;
    }
  };

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

  public getBestSellingArticle(): void {

    this.loading = true;
    let pathLocation: string[] = this._router.url.split('/');
    this.transactionMovement = pathLocation[2].charAt(0).toUpperCase() + pathLocation[2].slice(1);
    this.listType = pathLocation[3];

    let movement;
    if (this.transactionMovement === "Venta") {
      movement = "Entrada";
    } else if (this.transactionMovement === "Compra") {
      movement = "Salida";
    }

    let timezone = "-03:00";
    if(Config.timezone && Config.timezone !== '') {
      timezone =  Config.timezone.split('UTC')[1];
    }

    // FILTRAMOS LA CONSULTA
    let match = `{`;
    for(let i = 0; i < this.displayedColumns.length; i++) {
      let value = this.filters[this.displayedColumns[i]];
      if (value && value != "") {
        if(match.charAt(match.length - 1) === "}") {
          if (i < this.displayedColumns.length - 1) {
            match += ',';
          }
        }
        match += `"${this.displayedColumns[i]}": { "$regex": "${value}", "$options": "i"}`;
      }
    }
    match += '}';
    match = JSON.parse(match);

    let query = {
      type: this.transactionMovement,
      movement: movement,
      currentAccount: "Si",
      modifyStock: true,
      startDate: this.startDate + " " + this.startTime + timezone,
      endDate: this.endDate + " " + this.endTime + timezone,
      match: match,
      sort: this.sort,
      limit: this.limit,
      branch: this.branchSelectedId
    }

    this._articleService.getBestSellingArticle(JSON.stringify(query)).subscribe(
      result => {
        if (!result || result.length <= 0) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
          this.items = new Array();
          this.areArticlesEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.items = result;
          this.areArticlesEmpty = false;
          this.calculateTotal();
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

  public calculateTotal() : void {

    this.totalItem = 0;
    this.totalAmount = 0;

    for (let index = 0; index < this.items.length; index++) {
      this.totalItem = this.totalItem + this.items[index]['count'];
      this.totalAmount = this.totalAmount + this.items[index]['total'];

    }
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
