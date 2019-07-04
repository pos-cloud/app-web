import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { CancellationTypeService } from '../../services/cancellation-type.service'
import { CancellationType } from '../../models/cancellation-type'
import { CancellationTypeComponent } from '../cancellation-type/cancellation-type.component'
import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-list-cancellation-types',
  templateUrl: './list-cancellation-types.component.html',
  styleUrls: ['./list-cancellation-types.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None
})
export class ListCancellationTypeComponent implements OnInit {

  public alertMessage: string = '';
  public userType: string;
  public cancellationTypes: CancellationType[] = new Array();
  public relationOfCancellationEmpty: boolean = true;
  public orderTerm: string[] = ['-origin'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;

  public itemsPerPage = 10;
  public totalItems = 0;

  public currentPage: number = 0;
  public displayedColumns = [
    "origin.name",
    "origin.transactionMovement",
    "origin.operationType",
    "destination.name",
    "destination.transactionMovement",
    "destination.operationType",
    "operationType"
  ];
  public filters: any[];
  public filterValue: string;

  constructor(
    public alertConfig: NgbAlertConfig,
    public relationService :CancellationTypeService,
    public _router: Router,
    public _modalService: NgbModal,
  ) {
    this.filters = new Array();
    for(let field of this.displayedColumns) {
      this.filters[field] = "";
    }
   }

  ngOnInit() {
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getCancellationTypes()
  }

  public getCancellationTypes() : void {

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

    match += `"operationType": { "$ne": "D" },
              "origin.operationType":{ "$ne": "D" },
              "destination.operatioype": { "$ne": "D" } }`;

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
        cancellationTypes: { $push: "$$ROOT" }
    };

    let page = 0;
    if(this.currentPage != 0) {
      page = this.currentPage - 1;
    }
    let skip = !isNaN(page * this.itemsPerPage) ?
            (page * this.itemsPerPage) :
                0 // SKIP

    this.relationService.getCancellationTypes(
        project, // PROJECT
        match, // MATCH
        sortAux, // SORT
        group, // GROUP
        this.itemsPerPage, // LIMIT
        skip // SKIP
    ).subscribe(
      result => {
        this.loading = false;
        if (result && result[0] && result[0].cancellationTypes) {
          this.cancellationTypes = result[0].cancellationTypes;
          this.totalItems = result[0].count;
          this.relationOfCancellationEmpty = false;
        } else {
          this.cancellationTypes = new Array();
          this.totalItems = 0;
          this.relationOfCancellationEmpty = true;
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
    this.getCancellationTypes();
  }

  public orderBy(term: string): void {

      if (this.orderTerm[0] === term) {
        this.orderTerm[0] = "-" + term;
      } else {
        this.orderTerm[0] = term;
      }
      this.getCancellationTypes();
  }

  public openModal (op: string, cancellationType?: CancellationType) : void {

    let modalRef
    switch (op) {
      case 'add':
        modalRef = this._modalService.open(CancellationTypeComponent, { size: 'lg' });
        modalRef.componentInstance.operation = "add";
        modalRef.result.then((result) => {
          this.getCancellationTypes();
        }, (reason) => {
          this.getCancellationTypes();
        });
        break;
      case 'edit':
        modalRef = this._modalService.open(CancellationTypeComponent, { size: 'lg' });
        modalRef.componentInstance.operation = "edit";
        modalRef.componentInstance.cancellationTypeId = cancellationType._id;
        modalRef.result.then((result) => {
          this.getCancellationTypes();
        }, (reason) => {
          this.getCancellationTypes();
        });
        break;
      case 'delete':
        modalRef = this._modalService.open(CancellationTypeComponent, { size: 'lg' });
        modalRef.componentInstance.operation = "delete";
        modalRef.componentInstance.cancellationTypeId = cancellationType._id;
        modalRef.componentInstance.readonly = true;
        modalRef.result.then((result) => {
          this.getCancellationTypes();
        }, (reason) => {
          this.getCancellationTypes();
        });
        break;
      case 'view':
        modalRef = this._modalService.open(CancellationTypeComponent, { size: 'lg' });
        modalRef.componentInstance.operation = "view";
        modalRef.componentInstance.cancellationTypeId = cancellationType._id;
        modalRef.componentInstance.readonly = true;
        modalRef.result.then((result) => {
          this.getCancellationTypes();
        }, (reason) => {
          this.getCancellationTypes();
        });
        break;
      default:
        break;
    }

  }

  public refresh(): void {
    this.getCancellationTypes();
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
