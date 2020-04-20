import { Component, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { Room } from '../room';
import { RoomService } from '../room.service';

import { RoomComponent } from '../room/room.component';

@Component({
    selector: 'app-list-rooms',
    templateUrl: './list-rooms.component.html',
    styleUrls: ['./list-rooms.component.scss'],
    providers: [NgbAlertConfig],
    encapsulation: ViewEncapsulation.None
})

export class ListRoomsComponent implements OnInit {

    public rooms: Room[] = new Array();
    public areRoomsEmpty: boolean = true;
    public alertMessage: string = '';
    public userType: string;
    public orderTerm: string[] = ['description'];
    public propertyTerm: string;
    public areFiltersVisible: boolean = false;
    public loading: boolean = false;
    @Output() eventAddItem: EventEmitter<Room> = new EventEmitter<Room>();
    public itemsPerPage = 10;
    public totalItems = 0;

    constructor(
        public _roomService: RoomService,
        public _router: Router,
        public _modalService: NgbModal,
        public alertConfig: NgbAlertConfig
    ) { }

    ngOnInit(): void {

        let pathLocation: string[] = this._router.url.split('/');
        this.userType = pathLocation[1];
        this.getRooms();
    }

    public getRooms(): void {

        this.loading = true;

        this._roomService.getRooms().subscribe(
            result => {
                if (!result.rooms) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                    this.loading = false;
                    this.rooms = new Array();
                    this.areRoomsEmpty = true;
                } else {
                    this.hideMessage();
                    this.loading = false;
                    this.rooms = result.rooms;
                    this.totalItems = this.rooms.length;
                    this.areRoomsEmpty = false;
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
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
        this.getRooms();
    }

    public openModal(op: string, room: Room): void {

        let modalRef;
        switch (op) {
            case 'view':
                modalRef = this._modalService.open(RoomComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.roomId = room._id;
                modalRef.componentInstance.operation = "view";
                modalRef.componentInstance.readonly = true;
                break;
            case 'add':
                modalRef = this._modalService.open(RoomComponent, { size: 'lg', backdrop: 'static' })
                modalRef.componentInstance.readonly = false;
                modalRef.componentInstance.operation = "add";
                modalRef.result.then((result) => {
                    this.getRooms();
                }, (reason) => {
                    this.getRooms();
                });
                break;
            case 'update':
                modalRef = this._modalService.open(RoomComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.roomId = room._id;
                modalRef.componentInstance.readonly = false;
                modalRef.componentInstance.operation = "update";
                modalRef.result.then((result) => {
                    if (result === 'save_close') {
                        this.getRooms();
                    }
                }, (reason) => {

                });
                break;
            case 'delete':
                modalRef = this._modalService.open(RoomComponent, { size: 'lg', backdrop: 'static' })
                modalRef.componentInstance.roomId = room._id;
                modalRef.componentInstance.operation = "delete";
                modalRef.componentInstance.readonly = true;
                modalRef.result.then((result) => {
                    if (result === 'delete_close') {
                        this.getRooms();
                    }
                }, (reason) => {

                });
                break;
            default: ;
        }
    };

    public addItem(roomSelected) {
        this.eventAddItem.emit(roomSelected);
    }

    public showMessage(message: string, type: string, dismissible: boolean): void {
        this.alertMessage = message;
        this.alertConfig.type = type;
        this.alertConfig.dismissible = dismissible;
    }

    public hideMessage(): void {
        this.alertMessage = '';
    }
}
