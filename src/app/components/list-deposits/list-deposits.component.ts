import { Component, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { Deposit } from './../../models/deposit';
import { DepositService } from './../../services/deposit.service';


import { AddDepositComponent } from './../../components/add-deposit/add-deposit.component';
import { UpdateDepositComponent } from './../../components/update-deposit/update-deposit.component';
import { DeleteDepositComponent } from './../../components/delete-deposit/delete-deposit.component';

@Component({
  selector: 'app-list-deposits',
  templateUrl: './list-deposits.component.html',
  styleUrls: ['./list-deposits.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None
})

export class ListDepositsComponent implements OnInit {

  public deposits: Deposit[] = new Array();
  public areDepositsEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string;
  public orderTerm: string[] = ['name'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  @Output() eventAddItem: EventEmitter<Deposit> = new EventEmitter<Deposit>();
  public itemsPerPage = 10;
  public totalItems = 0;

  constructor(
    public _depositService: DepositService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getDeposits();
  }

  public getDeposits(): void {

    this.loading = true;

    this._depositService.getDeposits().subscribe(
      result => {
        if (!result.deposits) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
          this.deposits = null;
          this.areDepositsEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.deposits = result.deposits;
          this.totalItems = this.deposits.length;
          this.areDepositsEmpty = false;
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
    this.getDeposits();
  }

  public openModal(op: string, deposit: Deposit): void {
    let modalRef;
    switch (op) {
      case 'view':
        modalRef = this._modalService.open(UpdateDepositComponent, { size: 'lg' });
        modalRef.componentInstance.deposit = deposit;
        modalRef.componentInstance.readonly = true;
        break;
      case 'add':
        modalRef = this._modalService.open(AddDepositComponent, { size: 'lg' }).result.then((result) => {
          this.getDeposits();
        }, (reason) => {
          this.getDeposits();
        });
        break;
      case 'update':
        modalRef = this._modalService.open(UpdateDepositComponent, { size: 'lg' });
        modalRef.componentInstance.deposit = deposit;
        modalRef.componentInstance.readonly = false;
        modalRef.result.then((result) => {
          this.getDeposits();
        }, (reason) => {

        });
        break;
      case 'delete':
        modalRef = this._modalService.open(DeleteDepositComponent, { size: 'lg' })
        modalRef.componentInstance.deposit = deposit;
        modalRef.result.then((result) => {
          if (result === 'delete_close') {
            this.getDeposits();
          }
        }, (reason) => {

        });
        break;
      default: ;
    }
  };

  public addItem(depositSelected) {
    this.eventAddItem.emit(depositSelected);
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
