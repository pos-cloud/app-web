import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { ClassificationService } from '../classification.service'
import { Classification } from '../classification'
import { ClassificationComponent } from '../classification/classification.component'
import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { Config } from 'app/app.config';


@Component({
  selector: 'app-list-classifications',
  templateUrl: './list-classifications.component.html',
  styleUrls: ['./list-classifications.component.css']
})
export class ListClassificationsComponent implements OnInit {

  public alertMessage: string = '';
  public userType: string;
  public classifications: Classification[] = new Array();
  public relationOfClassificationEmpty: boolean = true;
  public orderTerm: string[] = ['-code'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public userCountry: string;

  public itemsPerPage = 10;
  public totalItems = 0;

  public currentPage: number = 0;
  public displayedColumns = [
    "name",
    "operationType"
  ];
  public filters: any[];
  public filterValue: string;

  constructor(
    public alertConfig: NgbAlertConfig,
    public _articleTypeService: ClassificationService,
    public _router: Router,
    public _modalService: NgbModal,
  ) {
    this.filters = new Array();
    for(let field of this.displayedColumns) {
      this.filters[field] = "";
    }
   }

  ngOnInit() {
    this.userCountry = Config.country;
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getClassifications()
  }

  public getClassifications() : void {

    this.loading = true;

    /// ORDENAMOS LA CONSULTA
    let sortAux;
    if (this.orderTerm[0].charAt(0) === '-') {
        sortAux = `{ "${this.orderTerm[0].split('-')[1]}" : -1 }`;
    } else {
        sortAux = `{ "${this.orderTerm[0]}" : 1 }`;
    }
    sortAux = JSON.parse(sortAux);

    // FILTRAMOS LA CONSULTA

    let match = `{`;
    for(let i = 0; i < this.displayedColumns.length; i++) {
      let value = this.filters[this.displayedColumns[i]];
      if (value && value != "") {
        match += `"${this.displayedColumns[i]}": { "$regex": "${value}", "$options": "i"}`;
        match += ',';
      }
    }

    match += `"operationType": { "$ne": "D" } }`;

    match = JSON.parse(match);

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project = '{}';
    if (this.displayedColumns && this.displayedColumns.length > 0) {
        project = '{';
        for (let i = 0; i < this.displayedColumns.length; i++) {
            let field = this.displayedColumns[i];
            project += `"${field}":{"$cond":[{"$eq":[{"$type":"$${field}"},"date"]},{"$dateToString":{"date":"$${field}","format":"%d/%m/%Y"}},{"$cond":[{"$ne":[{"$type":"$${field}"},"array"]},{"$toString":"$${field}"},"$${field}"]}]}`;
            if (i < this.displayedColumns.length - 1) {
                project += ',';
            }
        }
        project += '}';
    }
    project = JSON.parse(project);

    // AGRUPAMOS EL RESULTADO
    let group = {
        _id: null,
        count: { $sum: 1 },
        classifications: { $push: "$$ROOT" }
    };

    let page = 0;
    if(this.currentPage != 0) {
      page = this.currentPage - 1;
    }
    let skip = !isNaN(page * this.itemsPerPage) ?
            (page * this.itemsPerPage) :
                0 // SKIP

    this._articleTypeService.getClassifications(
        project, // PROJECT
        match, // MATCH
        sortAux, // SORT
        group, // GROUP
        this.itemsPerPage, // LIMIT
        skip // SKIP
    ).subscribe(
      result => {
        this.loading = false;
        if (result && result[0] && result[0].classifications) {
          this.classifications = result[0].classifications;
          this.totalItems = result[0].count;
          this.relationOfClassificationEmpty = false;
        } else {
          this.classifications = new Array();
          this.totalItems = 0;
          this.relationOfClassificationEmpty = true;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
        this.totalItems = 0;
      }
    );
  }

  public pageChange(page): void {
    this.currentPage = page;
    this.getClassifications();
  }

  public orderBy(term: string): void {

      if (this.orderTerm[0] === term) {
        this.orderTerm[0] = "-" + term;
      } else {
        this.orderTerm[0] = term;
      }
      this.getClassifications();
  }

  public openModal (op: string, classification?: Classification) : void {

    let modalRef
    switch (op) {
      case 'add':
        modalRef = this._modalService.open(ClassificationComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.operation = "add";
        modalRef.componentInstance.readonly = false;
        modalRef.result.then((result) => {
          this.getClassifications();
        }, (reason) => {
          this.getClassifications();
        });
        break;
      case 'edit':
        modalRef = this._modalService.open(ClassificationComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.operation = "edit";
        modalRef.componentInstance.classificationId = classification._id;
        modalRef.componentInstance.readonly = false;
        modalRef.result.then((result) => {
          this.getClassifications();
        }, (reason) => {
          this.getClassifications();
        });
        break;
      case 'delete':
        modalRef = this._modalService.open(ClassificationComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.operation = "delete";
        modalRef.componentInstance.classificationId = classification._id;
        modalRef.componentInstance.readonly = true;
        modalRef.result.then((result) => {
          this.getClassifications();
        }, (reason) => {
          this.getClassifications();
        });
        break;
      case 'view':
        modalRef = this._modalService.open(ClassificationComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.operation = "view";
        modalRef.componentInstance.classificationId = classification._id;
        modalRef.componentInstance.readonly = true;
        modalRef.result.then((result) => {
        }, (reason) => {
        });
        break;
      default:
        break;
    }

  }

  public refresh(): void {
    this.getClassifications();
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
