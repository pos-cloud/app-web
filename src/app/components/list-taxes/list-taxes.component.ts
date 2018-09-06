import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { Tax } from './../../models/tax';
import { TaxService } from './../../services/tax.service';

import { AddTaxComponent } from './../../components/add-tax/add-tax.component';
import { UpdateTaxComponent } from './../../components/update-tax/update-tax.component';
import { DeleteTaxComponent } from './../../components/delete-tax/delete-tax.component';
import { ImportComponent } from './../../components/import/import.component';

@Component({
  selector: 'app-list-taxes',
  templateUrl: './list-taxes.component.html',
  styleUrls: ['./list-taxes.component.css'],
  providers: [NgbAlertConfig]
})

export class ListTaxesComponent implements OnInit {

  public taxes: Tax[] = new Array();
  public areTaxesEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string;
  public orderTerm: string[] = ['description'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  @Output() eventAddItem: EventEmitter<Tax> = new EventEmitter<Tax>();
  public itemsPerPage = 10;
  public totalItems = 0;

  constructor(
    public _taxService: TaxService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getTaxes();
  }

  public getTaxes(): void {

    this.loading = true;

    this._taxService.getTaxes().subscribe(
      result => {
        if (!result.taxes) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
          this.taxes = null;
          this.areTaxesEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.taxes = result.taxes;
          this.totalItems = this.taxes.length;
          this.areTaxesEmpty = false;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public orderBy(term: string, property?: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-" + term;
    } else {
      this.orderTerm[0] = term;
    }
    this.propertyTerm = property;
  }

  public refresh(): void {
    this.getTaxes();
  }

  public openModal(op: string, tax: Tax): void {

    let modalRef;
    switch (op) {
      case 'view':
        modalRef = this._modalService.open(UpdateTaxComponent, { size: 'lg' });
        modalRef.componentInstance.tax = tax;
        modalRef.componentInstance.readonly = true;
        break;
      case 'add':
        modalRef = this._modalService.open(AddTaxComponent, { size: 'lg' }).result.then((result) => {
          this.getTaxes();
        }, (reason) => {
          this.getTaxes();
        });
        break;
      case 'update':
        modalRef = this._modalService.open(UpdateTaxComponent, { size: 'lg' });
        modalRef.componentInstance.tax = tax;
        modalRef.componentInstance.readonly = false;
        modalRef.result.then((result) => {
          if (result === 'save_close') {
            this.getTaxes();
          }
        }, (reason) => {

        });
        break;
      case 'delete':
        modalRef = this._modalService.open(DeleteTaxComponent, { size: 'lg' })
        modalRef.componentInstance.tax = tax;
        modalRef.result.then((result) => {
          if (result === 'delete_close') {
            this.getTaxes();
          }
        }, (reason) => {

        });
        break;
      case 'import':
        modalRef = this._modalService.open(ImportComponent, { size: 'lg' });
        let model: any = new Tax();
        model.model = "tax";
        model.primaryKey = "description";
        modalRef.componentInstance.model = model;
        modalRef.result.then((result) => {
          if (result === 'import_close') {
            this.getTaxes();
          }
        }, (reason) => {

        });
        break;
      default: ;
    }
  };

  public addItem(taxSelected) {
    this.eventAddItem.emit(taxSelected);
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
