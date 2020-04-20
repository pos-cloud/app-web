import { Component, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { VATCondition } from '../vat-condition';
import { VATConditionService } from '../vat-condition.service';

import { ImportComponent } from '../../import/import.component';
import { VATConditionComponent } from '../vat-condition/vat-condition.component';
import { Config } from 'app/app.config';

@Component({
  selector: 'app-list-vat-conditions',
  templateUrl: './list-vat-conditions.component.html',
  styleUrls: ['./list-vat-conditions.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None
})

export class ListVATConditionsComponent implements OnInit {

  public vatConditions: VATCondition[] = new Array();
  public areVATConditionsEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string;
  public orderTerm: string[] = ['code'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  @Output() eventAddItem: EventEmitter<VATCondition> = new EventEmitter<VATCondition>();
  public itemsPerPage = 10;
  public totalItems = 0;
  public userCountry: string;

  constructor(
    public _vatConditionService: VATConditionService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {

    this.userCountry = Config.country;
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getVATConditions();
  }

  public getVATConditions(): void {

    this.loading = true;

    this._vatConditionService.getVATConditions().subscribe(
        result => {
          if (!result.vatConditions) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            this.loading = false;
            this.vatConditions = new Array();
            this.areVATConditionsEmpty = true;
          } else {
            this.hideMessage();
            this.loading = false;
            this.vatConditions = result.vatConditions;
            this.totalItems = this.vatConditions.length;
            this.areVATConditionsEmpty = false;
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
    this.getVATConditions();
  }

  public openModal(op: string, vatCondition:VATCondition): void {

    let modalRef;
    switch(op) {
      case 'view':
        modalRef = this._modalService.open(VATConditionComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.vatConditionId = vatCondition._id;
        modalRef.componentInstance.readonly = true;
          modalRef.componentInstance.op = 'view';
        break;
      case 'add' :
        modalRef = this._modalService.open(VATConditionComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.readonly = false;
        modalRef.componentInstance.op = 'add';
        modalRef.result.then((result) => {
          this.getVATConditions();
        }, (reason) => {
          this.getVATConditions();
        });
        break;
      case 'update' :
          modalRef = this._modalService.open(VATConditionComponent, { size: 'lg', backdrop: 'static' });
          modalRef.componentInstance.vatConditionId = vatCondition._id;
          modalRef.componentInstance.readonly = false;
          modalRef.componentInstance.op = 'update';
          modalRef.result.then((result) => {
            this.getVATConditions();
          }, (reason) => {
              this.getVATConditions();
          });
        break;
      case 'delete' :
          modalRef = this._modalService.open(VATConditionComponent, { size: 'lg', backdrop: 'static' })
          modalRef.componentInstance.vatConditionId = vatCondition._id;
          modalRef.componentInstance.readonly = true;
          modalRef.componentInstance.op = 'delete';
          modalRef.result.then((result) => {
            if (result === 'delete_close') {
              this.getVATConditions();
            }
          }, (reason) => {

          });
          break;
      case 'import':
        modalRef = this._modalService.open(ImportComponent, { size: 'lg', backdrop: 'static' });
        let model: any = new VATCondition();
        model.model = "vatCondition";
        model.primaryKey = "description";
        modalRef.componentInstance.model = model;
        modalRef.result.then((result) => {
          if (result === 'import_close') {
            this.getVATConditions();
          }
        }, (reason) => {

        });
        break;
      default : ;
    }
  };

  public addItem(vatConditionSelected) {
    this.eventAddItem.emit(vatConditionSelected);
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
