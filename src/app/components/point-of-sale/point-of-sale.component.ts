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

  private cashBox: CashBox;
  private rooms: Room[] = new Array();
  private roomId: string;
  private existsCashBoxOpen: boolean = false;
  private alertMessage: any;

  constructor(
    private _cashBoxService: CashBoxService,
    private _roomService: RoomService,
    private _router: Router,
    private _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = false;
  }

  ngOnInit() {
    this._router.events.subscribe((data:any) => {
      let locationPathURL: string = data.url.split('/');
      if(locationPathURL[3] !== undefined) {
        this.roomId = locationPathURL[3];
      }
    });
    this.getRooms();
  }

  private getRooms(): void {  

    this._roomService.getRooms().subscribe(
        result => {
          if(!result.rooms) {
            this.alertMessage = result.message;
          } else {
            this.alertMessage = null;
            this.rooms = result.rooms;
            if(this.roomId === undefined){
              this.roomId = this.rooms[0]._id;
            }
            this.existsCashBoxOpen = true;
            this.showTables();
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

  private showTables(): void {
    this._router.navigate(['/pos/salones/'+this.roomId+'/mesas']);
  }

  private changeRoom(room: Room): void {
    this.roomId = room._id;
    this.showTables();
  }
}