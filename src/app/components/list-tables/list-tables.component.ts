import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Table } from './../../models/table';
import { TableService } from './../../services/table.service';
import { Waiter } from './../../models/waiter';
import { WaiterService } from './../../services/waiter.service';

import { AddTableComponent } from './../../components/add-table/add-table.component';
import { UpdateTableComponent } from './../../components/update-table/update-table.component';
import { DeleteTableComponent } from './../../components/delete-table/delete-table.component';

@Component({
  selector: 'app-list-tables',
  templateUrl: './list-tables.component.html',
  styleUrls: ['./list-tables.component.css']
})

export class ListTablesComponent implements OnInit {

  private tables: Table[] = new Array();
  private areTablesEmpty: boolean = true;
  private alertMessage: any;
  private userType: string;
  private orderTerm: string[] = ['description'];
  private filters: boolean = false;
  private waiter: Waiter;
  private waiterId: string;
  @ViewChild('content') content:ElementRef;
  private selectWaiterForm: FormGroup;

  private formErrors = {
    'waiter': ''
  };

  private validationMessages = {
    'waiter': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
    private _fb: FormBuilder,
    private _tableService: TableService,
    private _waiterService: WaiterService,
    private _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    private _modalService: NgbModal
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

  ngOnInit(): void {
    
    this._router.events.subscribe((data:any) => {
      let locationPathURL: string = data.url.split('/');
      this.userType = locationPathURL[1];
    });
    this.waiter = new Waiter();
    this.buildForm();
    this.getTables();
  }

  private buildForm(): void {

    this.selectWaiterForm = this._fb.group({
      'waiter': [this.waiter.name, [
          //Validators.required
        ]
      ]
    });

    this.selectWaiterForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  private onValueChanged(data?: any): void {

    if (!this.selectWaiterForm) { return; }
    const form = this.selectWaiterForm;

    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);

      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  private getTables(): void {  

    this._tableService.getTables().subscribe(
      result => {
        if(!result.tables) {
          this.alertMessage = result.message;
          this.areTablesEmpty = true;
        } else {
          this.tables = result.tables;
          this.areTablesEmpty = false;
        }
      },
      error => {
        this.alertMessage = error;
        if(!this.alertMessage) {
          this.alertMessage = "Error en la petición.";
        }
      }
    );
   }

  private orderBy (term: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-"+term;  
    } else {
      this.orderTerm[0] = term; 
    }
  }
  
  private openModal(op: string, table:Table): void {

      let modalRef;
      switch(op) {
        case 'add' :
          modalRef = this._modalService.open(AddTableComponent, { size: 'lg' }).result.then((result) => {
            this.getTables();
          }, (reason) => {
            this.getTables();
          });
          break;
        case 'update' :
            modalRef = this._modalService.open(UpdateTableComponent, { size: 'lg' })
            modalRef.componentInstance.table = table;
            modalRef.result.then((result) => {
              if(result === 'save_close') {
                this.getTables();
              }
            }, (reason) => {
              
            });
          break;
        case 'delete' :
            modalRef = this._modalService.open(DeleteTableComponent, { size: 'lg' })
            modalRef.componentInstance.table = table;
            modalRef.result.then((result) => {
              if(result === 'delete_close') {
                this.getTables();
              }
            }, (reason) => {
              
            });
          break;
        case 'select_waiter' :
            modalRef = this._modalService.open(this.content).result.then((result) => {
              if(result  === "select_waiter"){
                  this.waiter = new Waiter();
                  this.waiter.name = "Mozo 1";
                  table.waiter = this.waiter;
                  this.addSaleOrder(table._id);
                }
              }, (reason) => {
                
              });
          break;
        default : ;
      }
    };

    private addSaleOrder(tableId: string) {
      this._router.navigate(['/pos/mesas/'+tableId+'/agregar-pedido']);
    }
}