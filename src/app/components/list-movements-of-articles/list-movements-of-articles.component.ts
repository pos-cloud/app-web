import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { RoundNumberPipe } from 'app/pipes/round-number.pipe';
import { CurrencyPipe } from '@angular/common';
import { ExportExcelComponent } from '../export/export-excel/export-excel.component';
import { Branch } from 'app/models/branch';
import { Router } from '@angular/router';
import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { BranchService } from 'app/services/branch.service';
import { AuthService } from 'app/services/auth.service';

import * as moment from 'moment';
import 'moment/locale/es';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AddArticleComponent } from '../add-article/add-article.component';
import { Config } from 'app/app.config';
import { MovementOfArticleService } from 'app/services/movement-of-article.service';
import { attributes } from 'app/models/movement-of-article'

@Component({
  selector: 'app-list-movements-of-articles',
  templateUrl: './list-movements-of-articles.component.html',
  styleUrls: ['./list-movements-of-articles.component.css']
})
export class ListMovementsOfArticlesComponent implements OnInit {


    // TABLA
  public listTitle: string;
  public orderTerm: string[] = ["description"];
  public totalItems: number = 0;

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

  public itemsPerPage = 10;
  public currentPage: number = 1;
  public sort = {
    "count": -1
  };
  public transactionMovement: string;
  public totalAmount;
  public totalItem;
  public filters: any[];
  public branches: Branch[];
  @Input() branchSelectedId: String;
  public allowChangeBranch: boolean;
  public scrollY: number = 0;
  public title: string;
  public timezone: string = "-03:00";
  private roundNumberPipe: RoundNumberPipe = new RoundNumberPipe();
  private currencyPipe: CurrencyPipe = new CurrencyPipe('es-Ar');
  @ViewChild(ExportExcelComponent, {static: false}) exportExcelComponent: ExportExcelComponent;
  public columns = attributes;

  constructor(
    public _movementOfArticleService: MovementOfArticleService,
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
    for(let field of this.columns) {
      if(field.defaultFilter) {
        this.filters[field.name] = field.defaultFilter;
      } else {
        this.filters[field.name] = "";
      }
    }
  }

  async ngOnInit() {

    if(Config.timezone && Config.timezone !== '') {
      this.timezone =  Config.timezone.split('UTC')[1];
    }

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

    this.getItems();
  }
  
  public drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }

  async openModal(op: string, item: any[]) {

    this.scrollY = window.scrollY;
    
    let modalRef;
    switch (op) {
      case 'view':
        modalRef = this._modalService.open(AddArticleComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.articleId = item['article']._id;
        modalRef.componentInstance.readonly = true;
        modalRef.componentInstance.operation = "view";
        modalRef.result.then((result) => {
          window.scroll(0, this.scrollY);
        }, (reason) => {
          window.scroll(0, this.scrollY);
        });
        break;
      default: ;
    }
  };

  public pageChange(page): void {
    this.currentPage = page;
    this.getItems();
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

  public exportItems(): void {
    this.exportExcelComponent.items = this.items;
    this.exportExcelComponent.export();
  }

  public getItems(): void {

    this.loading = true;

    /// ORDENAMOS LA CONSULTA
    let sort = {};
    let sortAux;
      if (this.orderTerm[0].charAt(0) === '-') {
          sortAux = `{ "${this.orderTerm[0].split('-')[1]}" : -1 }`;
      } else {
          sortAux = `{ "${this.orderTerm[0]}" : 1 }`;
      }
    sort = JSON.parse(sortAux);

    // FILTRAMOS LA CONSULTA
    let match = `{`;
      for(let i = 0; i < this.columns.length; i++) {
        if(this.columns[i].visible || this.columns[i].required) {
          let value = this.filters[this.columns[i].name];
          if (value && value != "" && value !== {}) {
            if(this.columns[i].defaultFilter) {
              match += `"${this.columns[i].name}": ${this.columns[i].defaultFilter}`;
            } else {
              match += `"${this.columns[i].name}": { "$regex": "${value}", "$options": "i"}`;
            }
            if (i < this.columns.length - 1 ) {
              match += ',';
            }
          }
        }
      }

    if (match.charAt(match.length - 1) === ',') match = match.substring(0, match.length - 1);

    match += `}`;

    match = JSON.parse(match);

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project = `{`;
    let j = 0;
    for(let i = 0; i < this.columns.length; i++) {
      if(this.columns[i].visible || this.columns[i].required) {
        if(j > 0) {
          project += `,`;
        }
        j++;
        if(this.columns[i].datatype !== "string"){
          if(this.columns[i].datatype === "date"){
            project += `"${this.columns[i].name}": { "$dateToString": { "date": "$${this.columns[i].name}", "format": "%d/%m/%Y", "timezone": "${this.timezone}" }}`
          } else {
            project += `"${this.columns[i].name}": { "$toString" : "$${this.columns[i].name}" }`
          }
        } else {
          project += `"${this.columns[i].name}": 1`;
        }
      }
    }
    project += `}`;

    project = JSON.parse(project);

    // AGRUPAMOS EL RESULTADO
    let group = {
        _id: null,
        count: { $sum: 1 },
        items: { $push: "$$ROOT" }
    };

    let page = 0;
    if(this.currentPage != 0) {
      page = this.currentPage - 1;
    }
    let skip = !isNaN(page * this.itemsPerPage) ?
            (page * this.itemsPerPage) :
            0 // SKIP
    let limit = this.itemsPerPage;

    this._movementOfArticleService.getMovementsOfArticlesV2(
      project, // PROJECT
      match, // MATCH
      sort, // SORT
      group, // GROUP
      limit, // LIMIT
      skip // SKIP
    ).subscribe(
      result => {
        this.loading = false;
        if (result && result[0] && result[0].items) {
          if(this.itemsPerPage === 0) {
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
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
        this.totalItems = 0;
      }
    );
  }

  public getValue(item, column): any {
    let val: string = 'item';
    let exists: boolean = true;
    let value: any = '';
    for(let a of column.name.split('.')) {
      val += '.'+a;
      if(exists && !eval(val)) {
        exists = false;
      }
    }
    if(exists) {
      switch(column.datatype) {
        case 'number':
          value = this.roundNumberPipe.transform(eval(val));
          break;
        case 'currency':
            value = this.currencyPipe.transform(this.roundNumberPipe.transform(eval(val)), 'USD', 'symbol-narrow', '1.2-2');
          break;
        case 'percent':
            value = this.roundNumberPipe.transform(eval(val)) + '%';
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
      if(column.visible) {
        count++;
      }
    }
    return count;
  }

  public orderBy(term: string): void {

    if(this.sort[term]) {
      this.sort[term] *= -1;
    } else {
      this.sort = JSON.parse('{"' + term + '": 1 }');
    }

    this.getItems();
  }

  public refresh(): void {
    this.getItems();
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
