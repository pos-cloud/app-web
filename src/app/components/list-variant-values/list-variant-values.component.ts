import { Component, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { VariantValue } from './../../models/variant-value';
import { VariantValueService } from './../../services/variant-value.service';

import { AddVariantValueComponent } from './../../components/add-variant-value/add-variant-value.component';
import { UpdateVariantValueComponent } from './../../components/update-variant-value/update-variant-value.component';
import { DeleteVariantValueComponent } from './../../components/delete-variant-value/delete-variant-value.component';

@Component({
  selector: 'app-list-variant-values',
  templateUrl: './list-variant-values.component.html',
  styleUrls: ['./list-variant-values.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None
})

export class ListVariantValuesComponent implements OnInit {

  public variantValues: VariantValue[] = new Array();
  public areVariantValuesEmpty: boolean = true;
  public alertMessage: string = '';
  public orderTerm: string[] = ['description'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  @Output() eventAddItem: EventEmitter<VariantValue> = new EventEmitter<VariantValue>();
  public itemsPerPage = 10;
  public totalItems = 0;
  public filterType;
  public filterDescription;
  public p;

  constructor(
    public _variantValueService: VariantValueService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {

    this.orderBy('type', 'name');
    this.getVariantValues();
  }

  public getVariantValues(): void {

    this.loading = true;

    this._variantValueService.getVariantValues().subscribe(
      result => {
        if (!result.variantValues) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
          this.variantValues = new Array();
          this.areVariantValuesEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.variantValues = result.variantValues;
          this.totalItems = this.variantValues.length;
          this.areVariantValuesEmpty = false;
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
    this.getVariantValues();
  }

  public openModal(op: string, variantValue: VariantValue): void {

    let modalRef;
    switch (op) {
      case 'view':
        modalRef = this._modalService.open(UpdateVariantValueComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.variantValue = variantValue;
        modalRef.componentInstance.readonly = true;
        break;
      case 'add':
        modalRef = this._modalService.open(AddVariantValueComponent, { size: 'lg', backdrop: 'static' }).result.then((result) => {
          this.getVariantValues();
        }, (reason) => {
          this.getVariantValues();
        });
        break;
      case 'update':
        modalRef = this._modalService.open(UpdateVariantValueComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.variantValue = variantValue;
        modalRef.componentInstance.readonly = false;
        modalRef.result.then((result) => {
          this.getVariantValues();
        }, (reason) => {
          this.getVariantValues();
        });
        break;
      case 'delete':
        modalRef = this._modalService.open(DeleteVariantValueComponent, { size: 'lg', backdrop: 'static' })
        modalRef.componentInstance.variantValue = variantValue;
        modalRef.result.then((result) => {
          if (result === 'delete_close') {
            this.getVariantValues();
          }
        }, (reason) => {

        });
        break;
      default: ;
    }
  };

  public addItem(variantValueSelected) {
    this.eventAddItem.emit(variantValueSelected);
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
