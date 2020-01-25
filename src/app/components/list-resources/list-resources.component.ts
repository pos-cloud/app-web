import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { ResourceService } from '../../services/resource.service'
import { Resource } from '../../models/resource'
import { ResourceComponent } from '../resource/resource.component'
import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Config } from 'app/app.config';

@Component({
  selector: 'app-list-resources',
  templateUrl: './list-resources.component.html',
  styleUrls: ['./list-resources.component.css']
})
export class ListResourcesComponent implements OnInit {

    public alertMessage: string = '';
    public userType: string;
    public resources: Resource[] = new Array();
    public relationOfResourceEmpty: boolean = true;
    public orderTerm: string[] = ['-name'];
    public propertyTerm: string;
    public areFiltersVisible: boolean = false;
    public loading: boolean = false;
    public userCountry: string;
  
    public itemsPerPage = 10;
    public totalItems = 0;
  
    public currentPage: number = 0;
    public displayedColumns = [
      "name",
      "type",
      "file"
    ];
    public filters: any[];
    public filterValue: string;
  
    constructor(
      public alertConfig: NgbAlertConfig,
      public _resourceService: ResourceService,
      public activeModal: NgbActiveModal,
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
      this.userType = pathLocation[2];
      this.getResources()
    }
  
    public getResources() : void {
  
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
      let project = {
          name : 1,
          type :1,
          file :1,
          operationType : 1
      };
  
      // AGRUPAMOS EL RESULTADO
      let group = {
          _id: null,
          count: { $sum: 1 },
          resources: { $push: "$$ROOT" }
      };
  
      let page = 0;
      if(this.currentPage != 0) {
        page = this.currentPage - 1;
      }
      let skip = !isNaN(page * this.itemsPerPage) ?
              (page * this.itemsPerPage) :
                  0 // SKIP
  
      this._resourceService.getResources(
          project, // PROJECT
          match, // MATCH
          sortAux, // SORT
          group, // GROUP
          this.itemsPerPage, // LIMIT
          skip // SKIP
      ).subscribe(
        result => {
          if (result && result[0] && result[0].resources) {
            this.loading = false;
            this.resources = result[0].resources;
            this.totalItems = result[0].count;
            this.relationOfResourceEmpty = false;
          } else {
            this.resources = new Array();
            this.totalItems = 0;
            this.loading = false;
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
      this.getResources();
    }
  
    public orderBy(term: string): void {
  
        if (this.orderTerm[0] === term) {
          this.orderTerm[0] = "-" + term;
        } else {
          this.orderTerm[0] = term;
        }
        this.getResources();
    }
  
    public selectResource(resource : Resource) : void{
      if(resource != null){
        this.activeModal.close({ resource: resource._id });
      } else {
        this.activeModal.close({})
      }
    }
  
    public openModal (op: string, resource?: Resource) : void {
  
      let modalRef
      switch (op) {
        case 'add':
          modalRef = this._modalService.open(ResourceComponent, { size: 'lg', backdrop: 'static' });
          modalRef.componentInstance.operation = "add";
          modalRef.componentInstance.readonly = false;
          modalRef.result.then((result) => {
            this.getResources();
          }, (reason) => {
            this.getResources();
          });
          break;
        case 'edit':
          modalRef = this._modalService.open(ResourceComponent, { size: 'lg', backdrop: 'static' });
          modalRef.componentInstance.operation = "update";
          modalRef.componentInstance.resourceId = resource._id;
          modalRef.componentInstance.readonly = false;
          modalRef.result.then((result) => {
            this.getResources();
          }, (reason) => {
            this.getResources();
          });
          break;
        case 'delete':
          modalRef = this._modalService.open(ResourceComponent, { size: 'lg', backdrop: 'static' });
          modalRef.componentInstance.operation = "delete";
          modalRef.componentInstance.resourceId = resource._id;
          modalRef.componentInstance.readonly = true;
          modalRef.result.then((result) => {
            this.getResources();
          }, (reason) => {
            this.getResources();
          });
          break;
        case 'view':
          modalRef = this._modalService.open(ResourceComponent, { size: 'lg', backdrop: 'static' });
          modalRef.componentInstance.operation = "view";
          modalRef.componentInstance.resourceId = resource._id;
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
      this.getResources();
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
