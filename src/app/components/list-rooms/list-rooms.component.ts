import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { Room } from './../../models/room';
import { RoomService } from './../../services/room.service';

import { AddRoomComponent } from './../../components/add-room/add-room.component';
import { UpdateRoomComponent } from './../../components/update-room/update-room.component';
import { DeleteRoomComponent } from './../../components/delete-room/delete-room.component';

@Component({
  selector: 'app-list-rooms',
  templateUrl: './list-rooms.component.html',
  styleUrls: ['./list-rooms.component.css'],
  providers: [NgbAlertConfig]
})

export class ListRoomsComponent implements OnInit {

  public rooms: Room[] = new Array();
  public areRoomsEmpty: boolean = true;
  public alertMessage: any;
  public userType: string;
  public orderTerm: string[] = ['description'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  @Output() eventAddItem: EventEmitter<Room> = new EventEmitter<Room>();

  constructor(
    public _roomService: RoomService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

  ngOnInit(): void {
    
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getRooms();
  }

  public getBadge(term: string): boolean {

    return true;
  }

  public getRooms(): void {  

    this._roomService.getRooms().subscribe(
        result => {
          if(!result.rooms) {
            this.alertMessage = result.message;
            this.alertConfig.type = 'danger';
            this.rooms = null;
            this.areRoomsEmpty = true;
          } else {
            this.alertMessage = null;
            this.rooms = result.rooms;
            this.areRoomsEmpty = false;
          }
        },
        error => {
          this.alertMessage = error._body;
          if(!this.alertMessage) {
            this.alertMessage = "Ha ocurrido un error en el servidor";
          }
        }
      );
   }

  public orderBy (term: string, property?: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-"+term;  
    } else {
      this.orderTerm[0] = term; 
    }
    this.propertyTerm = property;
  }

  public refresh(): void {
    this.getRooms();
  }
  
  public openModal(op: string, room:Room): void {

      let modalRef;
      switch(op) {
        case 'add' :
          modalRef = this._modalService.open(AddRoomComponent, { size: 'lg' }).result.then((result) => {
            this.getRooms();
          }, (reason) => {
            this.getRooms();
          });
          break;
        case 'update' :
            modalRef = this._modalService.open(UpdateRoomComponent, { size: 'lg' })
            modalRef.componentInstance.room = room;
            modalRef.result.then((result) => {
              if(result === 'save_close') {
                this.getRooms();
              }
            }, (reason) => {
              
            });
          break;
        case 'delete' :
            modalRef = this._modalService.open(DeleteRoomComponent, { size: 'lg' })
            modalRef.componentInstance.room = room;
            modalRef.result.then((result) => {
              if(result === 'delete_close') {
                this.getRooms();
              }
            }, (reason) => {
              
            });
          break;
        default : ;
      }
    };

    public addItem(roomSelected) {
      this.eventAddItem.emit(roomSelected);
    }
}
