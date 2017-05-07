import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Table } from './../../models/table';
import { TableService } from './../../services/table.service';

import { AddTableComponent } from './../../components/add-table/add-table.component';
import { UpdateTableComponent } from './../../components/update-table/update-table.component';
import { DeleteTableComponent } from './../../components/delete-table/delete-table.component';

@Component({
  selector: 'app-list-tables',
  templateUrl: './list-tables.component.html',
  styleUrls: ['./list-tables.component.css']
})

export class ListTablesComponent implements OnInit {

  private tables: Table[];
  private areTablesEmpty: boolean = true;
  private alertMessage: any;
  private userType: string;
  private orderTerm: string[] = ['code'];
  private filters: boolean = false;

  constructor(
    private _tableService: TableService,
    private _router: Router,
    private _modalService: NgbModal
  ) { }

  ngOnInit(): void {
    
    this._router.events.subscribe((data:any) => { 
      let pathLocation: string;
      pathLocation = data.url.split('/');
      this.userType = pathLocation[1];
    });
    this.getTables();
  }

  private getBadge(term: string): boolean {

    return true;
  }

  private getTables(): void {  

    this._tableService.getTables().subscribe(
      result => {
        this.tables = result.tables;
        if(!this.tables) {
          this.alertMessage = "Error al traer mesas. Error en el servidor.";
          this.areTablesEmpty = true;
        } else if(this.tables.length !== 0){
            this.areTablesEmpty = false;
        } else {
          this.areTablesEmpty = true;
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
        default : ;
      }
    };

    private addSaleOrder(tableId: number) {
      this._router.navigate(['/pos/mesas/'+tableId+'/agregar-pedido']);
    }
}