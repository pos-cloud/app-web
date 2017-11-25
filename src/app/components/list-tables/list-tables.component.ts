import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Table, TableState } from './../../models/table';
import { Room } from './../../models/room';
import { Employee } from './../../models/employee';
import { Turn } from './../../models/turn';

import { EmployeeService } from './../../services/employee.service';
import { TableService } from './../../services/table.service';
import { TransactionService } from './../../services/transaction.service';
import { TurnService } from './../../services/turn.service';
import { UserService } from './../../services/user.service';

import { AddTableComponent } from './../../components/add-table/add-table.component';
import { UpdateTableComponent } from './../../components/update-table/update-table.component';
import { DeleteTableComponent } from './../../components/delete-table/delete-table.component';
import { SelectEmployeeComponent } from './../../components/select-employee/select-employee.component';

@Component({
  selector: 'app-list-tables',
  templateUrl: './list-tables.component.html',
  styleUrls: ['./list-tables.component.css'],
  providers: [NgbAlertConfig]
})

export class ListTablesComponent implements OnInit {

  public tableSelected: Table;
  public tables: Table[];
  public areTablesEmpty: boolean = true;
  public alertMessage: string = "";
  public userType: string;
  public orderTerm: string[] = ['description'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public amountOfDinersNow: number = 0;
  public amountOfDiners: number = 0;
  public loading: boolean = false;
  @Input() filterRoom: string;
  public itemsPerPage = 10;
  public totalItems = 0;

  constructor(
    public _tableService: TableService,
    public _transactionService: TransactionService,
    public _turnService: TurnService,
    public _userService: UserService,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal
  ) {
    if (this.filterRoom === undefined) {
      this.filterRoom = "";
    }
  }

  ngOnInit(): void {

    this.tables = null;
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getTables();
  }

  public getTables(): void {

    this.loading = true;

    this._tableService.getTables().subscribe(
      result => {
        if (!result.tables) {
          this.showMessage(result.message, "info", true);
          this.loading = false;
          this.tables = null;
          this.areTablesEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.tables = result.tables;
          this.totalItems = this.tables.length;
          this.areTablesEmpty = false;
          this.calculateAmountOfDiners();
        }
      },
      error => {
        if (error.status === 0) {
          this.showMessage("Error al conectar con el servidor. Corroborar que este encendido.", "danger", false);
        } else {
          this.showMessage(error._body, "danger", false);
          this.loading = false;
        }
      }
    );
  }

  public calculateAmountOfDiners() {
    
    this.amountOfDiners = 0;
    this.amountOfDinersNow = 0;

    for(let table of this.tables) {
      this.amountOfDiners += table.chair;
      if( table.state === TableState.Busy || 
          table.state === TableState.Pending) {
            this.amountOfDinersNow += table.chair;
      }
    }
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
    this.getTables();
  }

  public openModal(op: string, table: Table): void {

    this.tableSelected = table;

    let modalRef;

    switch (op) {
      case 'view':
        modalRef = this._modalService.open(UpdateTableComponent, { size: 'lg' });
        modalRef.componentInstance.table = this.tableSelected;
        modalRef.componentInstance.readonly = true;
        break;
      case 'add':
        modalRef = this._modalService.open(AddTableComponent, { size: 'lg' }).result.then((result) => {
          this.getTables();
        }, (reason) => {
          this.getTables();
        });
        break;
      case 'update':
        modalRef = this._modalService.open(UpdateTableComponent, { size: 'lg' });
        modalRef.componentInstance.table = this.tableSelected;
        modalRef.componentInstance.readonly = false;
        modalRef.result.then((result) => {
          if (result === 'save_close') {
            this.getTables();
          }
        }, (reason) => {

        });
        break;
      case 'delete':
        modalRef = this._modalService.open(DeleteTableComponent, { size: 'lg' });
        modalRef.componentInstance.table = this.tableSelected;
        modalRef.result.then((result) => {
          if (result === 'delete_close') {
            this.getTables();
          }
        }, (reason) => {

        });
        break;
      case 'select-employee':
        if (this.tableSelected.state !== TableState.Disabled &&
            this.tableSelected.state !== TableState.Reserved) {
                if (!this.tableSelected.employee) {
                  modalRef = this._modalService.open(SelectEmployeeComponent);
                  modalRef.componentInstance.table = this.tableSelected;
                  modalRef.componentInstance.requireLogin = false;
                  modalRef.componentInstance.op = "charge";
                  modalRef.result.then((result) => {
                    if (typeof result == 'object') {
                      this.tableSelected.employee = result;
                      this.assignEmployee();
                    }
                  }, (reason) => {
                  });
                } else {
                  this.addTransaction();
                }
        } else {
          this.showMessage("La mesa seleccionada se encuentra " + this.tableSelected.state, "info", true);
        }
        break;
      default: ;
    }
  };

  public assignEmployee(): void {

    this.loading = true;

    this._tableService.updateTable(this.tableSelected).subscribe(
      result => {
        if (!result.table) {
          this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.hideMessage();
          this.loading = false;
          this.addTransaction();
        }
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public addTransaction() {
    this._router.navigate(['/pos/resto/salones/' + this.filterRoom + '/mesas/' + this.tableSelected._id + '/agregar-ticket']);
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = "";
  }
}