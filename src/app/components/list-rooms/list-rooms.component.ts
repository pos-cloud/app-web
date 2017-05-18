import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Room } from './../../models/room';
import { RoomService } from './../../services/room.service';

import { AddRoomComponent } from './../../components/add-room/add-room.component';
import { UpdateRoomComponent } from './../../components/update-room/update-room.component';
import { DeleteRoomComponent } from './../../components/delete-room/delete-room.component';

@Component({
  selector: 'app-list-rooms',
  templateUrl: './list-rooms.component.html',
  styleUrls: ['./list-rooms.component.css']
})

export class ListRoomsComponent implements OnInit {

  private rooms: Room[] = new Array();
  private areRoomsEmpty: boolean = true;
  private alertMessage: any;
  private userType: string;
  private orderTerm: string[] = ['description'];
  private propertyTerm: string;
  private areFiltersVisible: boolean = false;
  @Output() eventAddItem: EventEmitter<Room> = new EventEmitter<Room>();

  constructor(
    private _roomService: RoomService,
    private _router: Router,
    private _modalService: NgbModal
  ) { }

  ngOnInit(): void {
    
    this._router.events.subscribe((data:any) => { 
      let pathLocation: string;
      pathLocation = data.url.split('/');
      this.userType = pathLocation[1];
    });
    this.getRooms();
  }

  private getBadge(term: string): boolean {

    return true;
  }

  private getRooms(): void {  

    this._roomService.getRooms().subscribe(
        result => {
          if(!result.rooms) {
            this.alertMessage = result.message;
            this.rooms = null;
            this.areRoomsEmpty = true;
          } else {
            this.alertMessage = null;
            this.rooms = result.rooms;
            this.areRoomsEmpty = false;
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
  
  private openModal(op: string, room:Room): void {

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

    private addItem(roomSelected) {
      this.eventAddItem.emit(roomSelected);
    }
}
