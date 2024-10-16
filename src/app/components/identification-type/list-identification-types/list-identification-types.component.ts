import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IdentificationType } from '../identification-type';
import { IdentificationTypeService } from '../identification-type.service';

import { AddIdentificationTypeComponent } from '../identification-type/add-identification-type.component';

@Component({
  selector: 'app-list-identification-types',
  templateUrl: './list-identification-types.component.html',
  styleUrls: ['./list-identification-types.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None,
})
export class ListIdentificationTypesComponent implements OnInit {
  public identificationTypes: IdentificationType[] = new Array();
  public areIdentificationTypesEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string;
  public orderTerm: string[] = ['name'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  @Output() eventAddItem: EventEmitter<IdentificationType> =
    new EventEmitter<IdentificationType>();
  public itemsPerPage = 10;
  public totalItems = 0;

  constructor(
    public _identificationTypeService: IdentificationTypeService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) {}

  ngOnInit(): void {
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getIdentificationTypes();
  }

  public getIdentificationTypes(): void {
    this.loading = true;

    let query = 'sort="name":1';

    this._identificationTypeService.getIdentificationTypes(query).subscribe(
      (result) => {
        if (!result.identificationTypes) {
          if (result.message && result.message !== '')
            this.showMessage(result.message, 'info', true);
          this.loading = false;
          this.identificationTypes = new Array();
          this.areIdentificationTypesEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.identificationTypes = result.identificationTypes;
          this.totalItems = this.identificationTypes.length;
          this.areIdentificationTypesEmpty = false;
        }
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public orderBy(term: string, property?: string): void {
    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = '-' + term;
    } else {
      this.orderTerm[0] = term;
    }
    this.propertyTerm = property;
  }

  public refresh(): void {
    this.getIdentificationTypes();
  }

  public openModal(op: string, identificationType: IdentificationType): void {
    let modalRef;
    switch (op) {
      case 'view':
        modalRef = this._modalService.open(AddIdentificationTypeComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.identificationTypeId =
          identificationType._id;
        modalRef.componentInstance.readonly = true;
        modalRef.componentInstance.operation = 'view';
        break;
      case 'add':
        modalRef = this._modalService.open(AddIdentificationTypeComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.operation = 'add';
        modalRef.componentInstance.readonly = false;
        modalRef.result.then(
          (result) => {
            this.getIdentificationTypes();
          },
          (reason) => {
            this.getIdentificationTypes();
          }
        );
        break;
      case 'update':
        modalRef = this._modalService.open(AddIdentificationTypeComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.identificationTypeId =
          identificationType._id;
        modalRef.componentInstance.operation = 'update';
        modalRef.componentInstance.readonly = false;
        modalRef.result.then(
          (result) => {
            this.getIdentificationTypes();
          },
          (reason) => {
            this.getIdentificationTypes();
          }
        );
        break;
      case 'delete':
        modalRef = this._modalService.open(AddIdentificationTypeComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.identificationTypeId =
          identificationType._id;
        modalRef.componentInstance.readonly = true;
        modalRef.componentInstance.operation = 'delete';
        modalRef.result.then(
          (result) => {
            if (result === 'delete_close') {
              this.getIdentificationTypes();
            }
          },
          (reason) => {}
        );
        break;
      default:
    }
  }

  public addItem(identificationTypeSelected) {
    this.eventAddItem.emit(identificationTypeSelected);
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

  public hideMessage(): void {
    this.alertMessage = '';
  }
}
