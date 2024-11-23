import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { RelationTypeService } from '../../../core/services/relation-type.service';
import { RelationType } from '../relation-type';

import { RelationTypeComponent } from '../relation-type/relation-type.component';

@Component({
  selector: 'app-list-relation-types',
  templateUrl: './list-relation-types.component.html',
  styleUrls: ['./list-relation-types.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None,
})
export class ListRelationTypesComponent implements OnInit {
  public relationTypes: RelationType[] = new Array();
  public areRelationTypesEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string;
  public orderTerm: string[] = ['description'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  @Output() eventAddItem: EventEmitter<RelationType> =
    new EventEmitter<RelationType>();
  public itemsPerPage = 10;
  public totalItems = 0;

  constructor(
    public _relationTypeService: RelationTypeService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) {}

  ngOnInit(): void {
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getRelationTypes();
  }

  public getRelationTypes(): void {
    this.loading = true;

    let query = 'sort="description":1';

    this._relationTypeService.getRelationTypes(query).subscribe(
      (result) => {
        if (!result.relationTypes) {
          if (result.message && result.message !== '')
            this.showMessage(result.message, 'info', true);
          this.loading = false;
          this.relationTypes = new Array();
          this.areRelationTypesEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.relationTypes = result.relationTypes;
          this.totalItems = this.relationTypes.length;
          this.areRelationTypesEmpty = false;
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
    this.getRelationTypes();
  }

  public openModal(op: string, relationType: RelationType): void {
    let modalRef;
    switch (op) {
      case 'view':
        modalRef = this._modalService.open(RelationTypeComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.relationTypeId = relationType._id;
        modalRef.componentInstance.readonly = true;
        modalRef.componentInstance.operation = 'view';
        break;
      case 'add':
        modalRef = this._modalService.open(RelationTypeComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.operation = 'add';
        modalRef.componentInstance.readonly = false;
        modalRef.result.then(
          (result) => {
            this.getRelationTypes();
          },
          (reason) => {
            this.getRelationTypes();
          }
        );
        break;
      case 'update':
        modalRef = this._modalService.open(RelationTypeComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.relationTypeId = relationType._id;
        modalRef.componentInstance.operation = 'update';
        modalRef.componentInstance.readonly = false;
        modalRef.result.then(
          (result) => {
            this.getRelationTypes();
          },
          (reason) => {
            this.getRelationTypes();
          }
        );
        break;
      case 'delete':
        modalRef = this._modalService.open(RelationTypeComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.relationTypeId = relationType._id;
        modalRef.componentInstance.operation = 'delete';
        modalRef.componentInstance.readonly = true;
        modalRef.result.then(
          (result) => {
            if (result === 'delete_close') {
              this.getRelationTypes();
            }
          },
          (reason) => {}
        );
        break;
      default:
    }
  }

  public addItem(relationTypeSelected) {
    this.eventAddItem.emit(relationTypeSelected);
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
