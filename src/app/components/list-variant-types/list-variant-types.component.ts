import { Component, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { VariantType } from './../../models/variant-type';
import { VariantTypeService } from './../../services/variant-type.service';

import { AddVariantTypeComponent } from './../../components/add-variant-type/add-variant-type.component';
import { UpdateVariantTypeComponent } from './../../components/update-variant-type/update-variant-type.component';
import { DeleteVariantTypeComponent } from './../../components/delete-variant-type/delete-variant-type.component';

@Component({
  selector: 'app-list-variant-types',
  templateUrl: './list-variant-types.component.html',
  styleUrls: ['./list-variant-types.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None
})

export class ListVariantTypesComponent implements OnInit {

  public variantTypes: VariantType[] = new Array();
  public areVariantTypesEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string;
  public orderTerm: string[] = ['name'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  @Output() eventAddItem: EventEmitter<VariantType> = new EventEmitter<VariantType>();
  public itemsPerPage = 10;
  public totalItems = 0;

  constructor(
    public _variantTypeService: VariantTypeService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getVariantTypes();
  }

  public getVariantTypes(): void {

    this.loading = true;

    this._variantTypeService.getVariantTypes().subscribe(
      result => {
        if (!result.variantTypes) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
          this.variantTypes = new Array();
          this.areVariantTypesEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.variantTypes = result.variantTypes;
          this.totalItems = this.variantTypes.length;
          this.areVariantTypesEmpty = false;
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
    this.getVariantTypes();
  }

  public openModal(op: string, variantType: VariantType): void {

    let modalRef;
    switch (op) {
      case 'view':
        modalRef = this._modalService.open(UpdateVariantTypeComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.variantType = variantType;
        modalRef.componentInstance.readonly = true;
        break;
      case 'add':
        modalRef = this._modalService.open(AddVariantTypeComponent, { size: 'lg', backdrop: 'static' }).result.then((result) => {
          this.getVariantTypes();
        }, (reason) => {
          this.getVariantTypes();
        });
        break;
      case 'update':
        modalRef = this._modalService.open(UpdateVariantTypeComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.variantType = variantType;
        modalRef.componentInstance.readonly = false;
        modalRef.result.then((result) => {
          if (result === 'save_close') {
            this.getVariantTypes();
          }
        }, (reason) => {

        });
        break;
      case 'delete':
        modalRef = this._modalService.open(DeleteVariantTypeComponent, { size: 'lg', backdrop: 'static' })
        modalRef.componentInstance.variantType = variantType;
        modalRef.result.then((result) => {
          if (result === 'delete_close') {
            this.getVariantTypes();
          }
        }, (reason) => {

        });
        break;
      default: ;
    }
  };

  public addItem(variantTypeSelected) {
    this.eventAddItem.emit(variantTypeSelected);
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
