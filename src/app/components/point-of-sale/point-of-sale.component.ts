import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { CashBox } from './../../models/cash-box';
import { Room } from './../../models/room';

import { CashBoxService } from './../../services/cash-box.service';
import { RoomService } from './../../services/room.service';


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
  public userType: string;
  public existsCashBoxOpen: boolean = false;
  public alertMessage: any;

  constructor(
    public _cashBoxService: CashBoxService,
    public _roomService: RoomService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = false;
    this.roomSelected = new Room();
  }

  ngOnInit() {
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.roomSelected._id = pathLocation[3];
    this.getRooms();
  }

  public getRooms(): void {  

    this._roomService.getRooms().subscribe(
        result => {
          if(!result.rooms) {
            this.alertMessage = result.message;
            this.alertConfig.type = 'danger';
          } else {
            this.alertMessage = null;
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
          this.alertMessage = error._body;
          if(!this.alertMessage) {
            this.alertMessage = "Error en la petición.";
          }
        }
      );
  }

  public changeRoom(room: Room): void {
    this.roomSelected = room;
  }
}