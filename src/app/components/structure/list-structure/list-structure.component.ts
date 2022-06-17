import { Component, OnInit } from '@angular/core';
import { Structure } from 'app/components/structure/structure';
import { NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StructureService } from 'app/components/structure/structure.service';
import { Router } from '@angular/router';
import { Config } from 'app/app.config';
import { StructureComponent } from '../structure/structure.component';
import { ConfirmationQuestionComponent } from '../confirm/confirmation-question.component';
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-list-structure',
  templateUrl: './list-structure.component.html',
  styleUrls: ['./list-structure.component.css'],
  providers: [NgbAlertConfig, TranslateMePipe],
})
export class ListStructureComponent implements OnInit {

  public alertMessage: string = '';
  public userType: string;
  public structures: Structure[] = new Array();
  public relationOfStructureEmpty: boolean = true;
  public orderTerm: string[] = ['-parent'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public userCountry: string;

  public itemsPerPage = 10;
  public totalItems = 0;

  public currentPage: number = 0;
  public displayedColumns = [
    "parent.code",
    "parent.description",
    "child.code",
    "child.description",
    "quantity",
    "optional",
    "utilization",
    "increasePrice",
    "operationType"
  ];
  public filters: any[];
  public filterValue: string;

  constructor(
    public alertConfig: NgbAlertConfig,
    public _structureService: StructureService,
    public _router: Router,
    public _modalService: NgbModal,
    public translatePipe: TranslateMePipe,
    private _toastr: ToastrService,

  ) {
    this.filters = new Array();
    for (let field of this.displayedColumns) {
      this.filters[field] = "";
    }
  }

  ngOnInit() {
    this.userCountry = Config.country;
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getStructures()
  }

  public getStructures(): void {

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
    for (let i = 0; i < this.displayedColumns.length; i++) {
      let value = this.filters[this.displayedColumns[i]];
      if (value && value != "") {
        match += `"${this.displayedColumns[i]}": { "$regex": "${value}", "$options": "i"}`;
        match += ',';
      }
    }

    match += `"operationType": { "$ne": "D" } }`;

    match = JSON.parse(match);


    let timezone = "-03:00";
    if (Config.timezone && Config.timezone !== '') {
      timezone = Config.timezone.split('UTC')[1];
    }

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project = {
      "_id": 1,
      "parent.code": 1,
      "parent.description": 1,
      "child.code": 1,
      "child.description": 1,
      "optional": 1,
      "quantity": 1,
      "utilization": 1,
      "increasePrice": 1,
      operationType: 1
    }

    // AGRUPAMOS EL RESULTADO
    let group = {
      _id: null,
      count: { $sum: 1 },
      structures: { $push: "$$ROOT" }
    };

    let page = 0;
    if (this.currentPage != 0) {
      page = this.currentPage - 1;
    }
    let skip = !isNaN(page * this.itemsPerPage) ?
      (page * this.itemsPerPage) :
      0 // SKIP

    this._structureService.getStructures(
      project, // PROJECT
      match, // MATCH
      sortAux, // SORT
      group, // GROUP
      this.itemsPerPage, // LIMIT
      skip // SKIP
    ).subscribe(
      result => {
        this.loading = false;
        if (result && result[0] && result[0].structures) {
          this.structures = result[0].structures;
          this.totalItems = result[0].count;
          this.relationOfStructureEmpty = false;
        } else {
          this.structures = new Array();
          this.totalItems = 0;
          this.relationOfStructureEmpty = true;
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
    this.getStructures();
  }

  public orderBy(term: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-" + term;
    } else {
      this.orderTerm[0] = term;
    }
    this.getStructures();
  }

  public openModal(op: string, structure?: Structure): void {

    let modalRef
    switch (op) {
      case 'add':
        modalRef = this._modalService.open(StructureComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.operation = "add";
        modalRef.componentInstance.readonly = false;
        modalRef.result.then((result) => {
          this.getStructures();
        }, (reason) => {
          this.getStructures();
        });
        break;
      case 'edit':
        modalRef = this._modalService.open(StructureComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.operation = "edit";
        modalRef.componentInstance.structureId = structure._id;
        modalRef.componentInstance.readonly = false;
        modalRef.result.then((result) => {
          this.getStructures();
        }, (reason) => {
          this.getStructures();
        });
        break;
      case 'delete':
        modalRef = this._modalService.open(StructureComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.operation = "delete";
        modalRef.componentInstance.structureId = structure._id;
        modalRef.componentInstance.readonly = true;
        modalRef.result.then((result) => {
          this.getStructures();
        }, (reason) => {
          this.getStructures();
        });
        break;
      case 'view':
        modalRef = this._modalService.open(StructureComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.operation = "view";
        modalRef.componentInstance.structureId = structure._id;
        modalRef.componentInstance.readonly = true;
        modalRef.result.then((result) => {
        }, (reason) => {
        });
        break;
      case 'update-base-price':
        modalRef = this._modalService.open(ConfirmationQuestionComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.title = "Actualizar Precios bases";
        modalRef.componentInstance.subtitle = "Actualiza los precios de bases de aquellos productos que tienen estructura. Consiste en sumar los precios bases de sus hijos y actualizar el precio base del padre. ¿ Esta seguro de ejectura esta rutina ?";
        modalRef.result.then((result) => {
          if(result){
            this.loading = true;
            this._structureService.updateBasePriceByStruct().subscribe(
              result => { this.showToast(result) },
              error => { this.showToast(error) });
          }
        });
        break;
      default:
        break;
    }

  }

  public refresh(): void {
    this.getStructures();
  }


  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }

  public showToast(result, type?: string, title?: string, message?: string): void {
    if (result) {
        if (result.status === 200) {
            type = 'success';
            title = result.message;
        } else if (result.status >= 400) {
            type = 'danger';
            title = (result.error && result.error.message) ? result.error.message : result.message;
        } else {
            type = 'info';
            title = result.message;
        }
    }
    switch (type) {
        case 'success':
            this._toastr.success(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
            break;
        case 'danger':
            this._toastr.error(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
            break;
        default:
            this._toastr.info(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
            break;
    }
    this.loading = false;
}

}
