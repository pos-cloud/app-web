import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { CashBox } from './../../models/cash-box';
import { Room } from './../../models/room';
import { SaleOrder } from './../../models/sale-order';

import { CashBoxService } from './../../services/cash-box.service';
import { RoomService } from './../../services/room.service';
import { SaleOrderService } from './../../services/sale-order.service';


import { AddCashBoxComponent } from './../add-cash-box/add-cash-box.component';

@Component({
  selector: 'app-point-of-sale',
  templateUrl: './point-of-sale.component.html',
  styleUrls: ['./point-of-sale.component.css'],
  providers: [NgbAlertConfig]
})

export class PointOfSaleComponent implements OnInit {

  public cashBox: CashBox;
  public rooms: Room[] = new Array();
  public roomSelected: Room;
  public saleOrders: SaleOrder[] = new Array();
  public areSaleOrdersEmpty: boolean = true;
  public userType: string;
  public propertyTerm: string;
  public orderTerm: string[] = ['number'];
  public posType: string;
  public existsCashBoxOpen: boolean = false;
  public alertMessage: string = "";
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;

  constructor(
    public _cashBoxService: CashBoxService,
    public _roomService: RoomService,
    public _saleOrderService: SaleOrderService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) {
    this.roomSelected = new Room();
  }

  ngOnInit() {
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.posType = pathLocation[2];
    if (this.posType === "resto") {
      this.roomSelected._id = pathLocation[4];
      this.getRooms();
    } else if (this.posType === "delivery") {

    } else if (this.posType === "mostrador") {
      this.getOpenSaleOrders();
    }
  }

  public getRooms(): void {  

    this.loading = true;
    
    this._roomService.getRooms().subscribe(
        result => {
          if(!result.rooms) {
            this.showMessage(result.message, "info", true); 
            this.loading = false;
          } else {
            this.hideMessage();
            this.loading = false;
            this.rooms = result.rooms;
            
            if(this.roomSelected._id === undefined){
              this.roomSelected = this.rooms[0];
            } else {
              for(let room of this.rooms) {
                if(this.roomSelected._id === room._id){
                  this.roomSelected = room;
                }
              }
            }
            this.existsCashBoxOpen = true;
          }
        },
        error => {
          this.showMessage(error._body, "danger", false);
          this.loading = false;
        }
      );
  }

  public getOpenSaleOrders(): void {

    this.loading = true;

    this._saleOrderService.getOpenSaleOrder().subscribe(
      result => {
        if (!result.saleOrders) {
          this.showMessage(result.message, "info", true);
          this.saleOrders = null;
          this.areSaleOrdersEmpty = true;
        } else {
          this.hideMessage();
          this.saleOrders = result.saleOrders;
          this.areSaleOrdersEmpty = false;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public refresh(): void {
    this.getOpenSaleOrders();
  }

  public addSaleOrder() {
    this._router.navigate(['/pos/mostrador/agregar-pedido']);
  }

  public changeRoom(room: Room): void {
    this.roomSelected = room;
  }

  public orderBy(term: string, property?: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-" + term;
    } else {
      this.orderTerm[0] = term;
    }
    this.propertyTerm = property;
  }
  
  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage():void {
    this.alertMessage = "";
  }
}