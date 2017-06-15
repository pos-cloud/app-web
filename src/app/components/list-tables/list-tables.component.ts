import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Table, TableState } from './../../models/table';
import { Room } from './../../models/room';
import { Waiter } from './../../models/waiter';

import { WaiterService } from './../../services/waiter.service';
import { TableService } from './../../services/table.service';
import { SaleOrderService } from './../../services/sale-order.service';
import { TurnService } from './../../services/turn.service';

import { AddTableComponent } from './../../components/add-table/add-table.component';
import { UpdateTableComponent } from './../../components/update-table/update-table.component';
import { DeleteTableComponent } from './../../components/delete-table/delete-table.component';
import { LoginComponent } from './../../components/login/login.component';

@Component({
  selector: 'app-list-tables',
  templateUrl: './list-tables.component.html',
  styleUrls: ['./list-tables.component.css'],
  providers: [NgbAlertConfig]
})

export class ListTablesComponent implements OnInit {

  private tableSelected: Table;
  private tables: Table[];
  private areTablesEmpty: boolean = true;
  private alertMessage: any;
  private userType: string;
  private orderTerm: string[] = ['description'];
  private propertyTerm: string;
  private areFiltersVisible: boolean = false;
  private waiter: Waiter;
  private waiters: Waiter[] = new Array();
  @ViewChild('content') content:ElementRef;
  private selectWaiterForm: FormGroup;
  private roomId: string;
  private loading: boolean = false;

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
    private _saleOrderService: SaleOrderService,
    private _turnService: TurnService,
    private _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    private _modalService: NgbModal
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

  ngOnInit(): void {

    this.tables = null;
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.roomId = pathLocation[3];
    this.waiter = new Waiter();
    if(this.userType === 'admin') {
      this.getTables(); 
    } else if(this.roomId !== undefined) {
      this.getTablesByRoom();
    }
  }

  private buildForm(): void {

    this.selectWaiterForm = this._fb.group({
      'waiter': [this.waiter.name, [
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
          this.tables = null;
          this.areTablesEmpty = true;
        } else {
          this.alertMessage = null;
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

   private getTablesByRoom(): void {  
     
    this._tableService.getTablesByRoom(this.roomId).subscribe(
      result => {
        if(!result.tables) {
          this.alertMessage = result.message;
          this.tables = null;
          this.areTablesEmpty = true;
        } else {
          this.alertMessage = null;
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

  private orderBy (term: string, property?: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-"+term;  
    } else {
      this.orderTerm[0] = term; 
    }
    this.propertyTerm = property;
  }
  
  private openModal(op: string, table: Table, waiter?: Waiter): void {

      this.tableSelected = table;
      if(waiter !== undefined) this.tableSelected.waiter = waiter;
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
            modalRef.componentInstance.table = this.tableSelected;
            modalRef.result.then((result) => {
              if(result === 'save_close') {
                this.getTables();
              }
            }, (reason) => {
              
            });
          break;
        case 'delete' :

            modalRef = this._modalService.open(DeleteTableComponent, { size: 'lg' });
            modalRef.componentInstance.table = this.tableSelected;
            modalRef.result.then((result) => {
              if(result === 'delete_close') {
                this.getTables();
              }
            }, (reason) => {
              
            });
          break;
        case 'select_waiter' :

            if(this.tableSelected.waiter !== undefined &&
              this.tableSelected.waiter !== null) {

              this.getOpenSaleOrder();
            } else {
              
              this.tableSelected.waiter = new Waiter();
              this.buildForm();
              this.getWaiters();

              modalRef = this._modalService.open(this.content).result.then((result) => {
                  if(result  === "select_waiter") {
                    this.loading = true;
                    this.selectWaiter();
                  } else {
                    this.tableSelected.waiter = null;
                    this.loading = false;
                  }
                }, (reason) => {
                  this.tableSelected.waiter = null;
                    this.loading = false;
                }
              );
            }
          break;
          case 'login' :
            modalRef = this._modalService.open(LoginComponent, { size: 'lg' });
            modalRef.componentInstance.waiterSelected = this.tableSelected.waiter;
            modalRef.result.then((result) => {
              if(result === "turn_open") {
                this.assignWaiter();
              } else {
                this.tableSelected.waiter = null;
              }
            }, (reason) => {
              this.tableSelected.waiter = null;
            });
          break;
        default : ;
      }
    };

    private selectWaiter(): void {
      this.waiter = this.selectWaiterForm.value.waiter;
      this.tableSelected.waiter = this.waiter;
      this.getOpenTurn();
    }

    private getOpenTurn(): void {
    
      this._turnService.getOpenTurn(this.tableSelected.waiter._id).subscribe(
        result => {
					if(!result.turns) {
            this.loading = false;
						this.openModal('login', this.tableSelected);
					} else {
            this.loading = false;
            this.assignWaiter();
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

    private getWaiters(): void {  

      this._waiterService.getWaiters().subscribe(
        result => {
					if(!result.waiters) {
						this.alertMessage = result.message;
					} else {
            this.alertMessage = null;
					  this.waiters = result.waiters;
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

   private assignWaiter(): void {
     
     this._tableService.updateTable(this.tableSelected).subscribe(
       result => {
					if(!result.table) {
            this.loading = false;
						this.alertMessage = result.message;
					} else {
            this.alertMessage = null;
            this.loading = false;
            this.getOpenSaleOrder();
          }
				},
				error => {
					this.alertMessage = error;
					if(!this.alertMessage) {
            this.loading = false;
						this.alertMessage = "Error en la petición.";
					}
				}
     );
   }

    private getOpenSaleOrder(): void {

      this._saleOrderService.getOpenSaleOrder(this.tableSelected._id).subscribe(
        result => {
          if(!result.saleOrders) {
            this.alertMessage = null;
            this.addSaleOrder();
          } else {
            this.alertMessage = null;
            this.updateSaleOrder(result.saleOrders[0]._id);
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

    private updateSaleOrder(saleOrderId: string) {
      this._router.navigate(['/pos/salones/'+this.roomId+'/mesas/'+this.tableSelected._id+'/editar-pedido/'+saleOrderId]);
    }

    private addSaleOrder() {
      this._router.navigate(['/pos/salones/'+this.roomId+'/mesas/'+this.tableSelected._id+'/agregar-pedido']);
    }
}