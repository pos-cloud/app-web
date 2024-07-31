import { Component, OnInit, ViewChild} from '@angular/core';
import { Article, Type, attributes } from "../../article";
import { moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';
import { Subscription } from "rxjs";
import {
  NgbModal,
  NgbAlertConfig,
  NgbActiveModal,
} from "@ng-bootstrap/ng-bootstrap";
import { ArticleService } from '../../article.service';
import { Router } from '@angular/router';
import { RoundNumberPipe } from "../../../../main/pipes/round-number.pipe";
import { CurrencyPipe } from "@angular/common";
import { ExportExcelComponent } from 'app/components/export/export-excel/export-excel.component';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
  providers: [RoundNumberPipe],
})

export class HistoryComponent implements OnInit {
  public title: string = 'Historial del producto'
  public columns = attributes;
  public sort = { endDate: -1 };
  public filters: any[];
  public loading: boolean = false
  public userType: string = "";
  public articleType: Type;
  public currentPage: number = 0;
  public items: any[] = new Array();
  public itemsPerPage = 10
  private subscription: Subscription = new Subscription();
  public totalItems: number = 0;
  public alertMessage: string = "";
  public articleHistoryId: string;
  public timezone = "-03:00";
  public pathLocation: string[];
  private roundNumberPipe: RoundNumberPipe = new RoundNumberPipe();
  private currencyPipe: CurrencyPipe = new CurrencyPipe("es-Ar");
  @ViewChild(ExportExcelComponent)
  exportExcelComponent: ExportExcelComponent;

  constructor(
    public _router: Router,
    public alertConfig: NgbAlertConfig,
    private _articleService: ArticleService,
  ) {
    this.filters = new Array();
    for (let field of this.columns) {
      if (field.defaultFilter) {
        this.filters[field.name] = field.defaultFilter;
      } else {
        this.filters[field.name] = '';
      }
    }
  }

  async ngOnInit() {
    this.pathLocation = this._router.url.split("/");
    if (this.pathLocation[3] === "history") {
      this.articleHistoryId = this.pathLocation[4]
    }
    this.getItems()
  }

  public getItems() {
    this.loading = true;

    // FILTRAMOS LA CONSULTA
    let match: any = `{`;
    for (let i = 0; i < this.columns.length; i++) {
      if (this.columns[i].visible || this.columns[i].required) {
        let value = this.filters[this.columns[i].name];
        if (value && value != "") {
          if (this.columns[i].defaultFilter) {
            match += `"${this.columns[i].name}": ${this.columns[i].defaultFilter}`;
          } else {
            match += `"${this.columns[i].name}": { "$regex": "${value}", "$options": "i"}`;
          }
          if (i < this.columns.length - 1) {
            match += ",";
          }
        }
      }
    }

    if (match.charAt(match.length - 1) === ",")
      match = match.substring(0, match.length - 1);
    match += `}`;
    match = JSON.parse(match);

    if (this.userType === "admin") {
      match["type"] = this.articleType;
    }

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project: any = `{`;
    let j = 0;
    for (let i = 0; i < this.columns.length; i++) {
      if (this.columns[i].visible || this.columns[i].required) {
        if (j > 0) {
          project += `,`;
        }
        j++;
        if (!this.columns[i].project) {
          if (this.columns[i].datatype !== "string") {
            if (this.columns[i].datatype === "date") {
              project += `"${this.columns[i].name}": { "$dateToString": { "date": "$${this.columns[i].name}", "format": "%d/%m/%Y", "timezone": "${this.timezone}" }}`;
            } else {
              project += `"${this.columns[i].name}": { "$toString" : "$${this.columns[i].name}" }`;
            }
          } else {
            project += `"${this.columns[i].name}": 1`;
          }
        } else {
          project += `"${this.columns[i].name}": ${this.columns[i].project}`;
        }
      }
    }
    project += `}`;

    project = JSON.parse(project);

    // AGRUPAMOS EL RESULTADO
    let group = {
      _id: null,
      count: { $sum: 1 },
      items: { $push: "$$ROOT" },
    };

    let page = 0;
    if (this.currentPage != 0) {
      page = this.currentPage - 1;
    }
    let skip = !isNaN(page * this.itemsPerPage) ? page * this.itemsPerPage : 0; // SKIP
    let limit = this.itemsPerPage;

    this.subscription.add(
      this._articleService
        .getHArticles(
          {
            ...project,
            harticle: 1
          }, // PROJECT
          {
            ...match,
            harticle: { $oid: this.articleHistoryId }
          }, // MATCH
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
            this.showMessage(error._body, "danger", false);
            this.loading = false;
            this.totalItems = 0;
          }
        )
    );
  }
  
  public return(){
    if (this.pathLocation[2] === "articles") {
      this._router.navigate(['/admin/articles']);
    } else {
      this._router.navigate(['/admin/variants']);
    }
  }

  public drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }

  public getValue(item, column): any {
    let val: string = "item";
    let exists: boolean = true;
    let value: any = "";
    for (let a of column.name.split(".")) {
      val += "." + a;
      if (exists && !eval(val)) {
        exists = false;
      }
    }
    if (exists) {
      switch (column.datatype) {
        case "number":
          value = this.roundNumberPipe.transform(eval(val));
          break;
        case "currency":
          value = this.currencyPipe.transform(
            this.roundNumberPipe.transform(eval(val)),
            "USD",
            "symbol-narrow",
            "1.2-2"
          );
          break;
        case "percent":
          value = this.roundNumberPipe.transform(eval(val)) + "%";
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

  public orderBy(term: string): void {
    if (this.sort[term]) {
      this.sort[term] *= -1;
    } else {
      this.sort = JSON.parse('{"' + term + '": 1 }');
    }

    this.getItems();
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

  public pageChange(page): void {
    this.currentPage = page;
    this.getItems();
  }
}