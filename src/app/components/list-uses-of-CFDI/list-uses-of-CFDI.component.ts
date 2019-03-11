import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { UseOfCFDI } from './../../models/use-of-CFDI';
import { UseOfCFDIService } from './../../services/use-of-CFDI.service';

import { DeleteUseOfCFDIComponent } from './../../components/delete-use-of-CFDI/delete-use-of-CFDI.component';
import { ImportComponent } from './../../components/import/import.component';
import { AddUseOfCFDIComponent } from '../add-use-of-CFDI.component.ts/add-use-of-CFDI.component';

@Component({
  selector: 'app-list-uses-of-CFDI',
  templateUrl: './list-uses-of-CFDI.component.html',
  styleUrls: ['./list-uses-of-CFDI.component.css'],
  providers: [NgbAlertConfig]
})

export class ListUsesOfCFDIComponent implements OnInit {

  public usesOfCFDI: UseOfCFDI[] = new Array();
  public areUsesOfCFDIEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string;
  public orderTerm: string[] = ['name'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  @Output() eventAddItem: EventEmitter<UseOfCFDI> = new EventEmitter<UseOfCFDI>();
  public itemsPerPage = 10;
  public totalItems = 0;

  constructor(
    public _useOfCFDIService: UseOfCFDIService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getUsesOfCFDI();
  }

  public getUsesOfCFDI(): void {

    this.loading = true;

    this._useOfCFDIService.getUsesOfCFDI().subscribe(
        result => {
          if (!result.usesOfCFDI) {
            // if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            this.loading = false;
            this.usesOfCFDI = null;
            this.areUsesOfCFDIEmpty = true;
          } else {
            this.hideMessage();
            this.loading = false;
            this.usesOfCFDI = result.usesOfCFDI;
            this.totalItems = this.usesOfCFDI.length;
            this.areUsesOfCFDIEmpty = false;
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
  }

  public orderBy (term: string, property?: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-"+term;
    } else {
      this.orderTerm[0] = term;
    }
    this.propertyTerm = property;
  }

  public refresh(): void {
    this.getUsesOfCFDI();
  }

  public openModal(op: string, useOfCFDI: UseOfCFDI): void {

    let modalRef;
    switch(op) {
      case 'view':
        modalRef = this._modalService.open(AddUseOfCFDIComponent, { size: 'lg' });
        modalRef.componentInstance.useOfCFDIId = useOfCFDI._id;
        modalRef.componentInstance.readonly = true;
        modalRef.componentInstance.operation = "view";
        break;
      case 'add' :
        modalRef = this._modalService.open(AddUseOfCFDIComponent, { size: 'lg' });
        modalRef.componentInstance.operation = "add";
        modalRef.componentInstance.readonly = false;
        modalRef.result.then((result) => {
          this.getUsesOfCFDI();
        }, (reason) => {
          this.getUsesOfCFDI();
        });
        break;
      case 'update' :
          modalRef = this._modalService.open(AddUseOfCFDIComponent, { size: 'lg' });
          modalRef.componentInstance.useOfCFDIId = useOfCFDI._id;
          modalRef.componentInstance.operation = "update";
          modalRef.componentInstance.readonly = false;
          modalRef.result.then((result) => {
            this.getUsesOfCFDI();
          }, (reason) => {
              this.getUsesOfCFDI();
          });
        break;
      case 'delete' :
          modalRef = this._modalService.open(DeleteUseOfCFDIComponent, { size: 'lg' })
          modalRef.componentInstance.useOfCFDI = useOfCFDI;
          modalRef.result.then((result) => {
            if (result === 'delete_close') {
              this.getUsesOfCFDI();
            }
          }, (reason) => {

          });
          break;
      case 'import':
        modalRef = this._modalService.open(ImportComponent, { size: 'lg' });
        let model: any = new UseOfCFDI();
        model.model = "useOfCFDI";
        model.primaryKey = "name";
        modalRef.componentInstance.model = model;
        modalRef.result.then((result) => {
          if (result === 'import_close') {
            this.getUsesOfCFDI();
          }
        }, (reason) => {

        });
        break;
      default : ;
    }
  };

  public addItem(useOfCFDISelected) {
    this.eventAddItem.emit(useOfCFDISelected);
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage():void {
    this.alertMessage = '';
  }
}
