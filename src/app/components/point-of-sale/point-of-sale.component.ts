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
  private roomSelected: Room;
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
    this.getOpenCashBox();
  }

  private getOpenCashBox(): void {

    this._cashBoxService.getOpenCashBox().subscribe(
        result => {
					if(!result.cashBoxes) {
						this.openModal();
					} else {
            this.cashBox = result.cashBoxes[0];
            this.getRooms();
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

   private openModal(): void {
    
    let modalRef = this._modalService.open(AddCashBoxComponent, { size: 'lg' }).result.then((result) => {
      this.getOpenCashBox();
    }, (reason) => {
      this.getOpenCashBox();
    });
  }

  private getRooms(): void {  

    this._roomService.getRooms().subscribe(
        result => {
          if(!result.rooms) {
            this.alertMessage = result.message;
          } else {
            this.rooms = result.rooms;
            this.roomSelected = this.rooms[0];
            this._router.navigate(['/pos/salones/'+this.roomSelected._id+'/mesas']);
            this.existsCashBoxOpen = true;
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

  private changeRoom(room: Room): void {
    this.roomSelected = room;
    this._router.navigate(['/pos/salones/'+room._id+'/mesas']);
  }
}