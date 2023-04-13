import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { NgbModal, NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { TableService } from 'app/components/table/table.service';
import { RoomService } from 'app/components/room/room.service';
import { Room } from 'app/components/room/room';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Table } from 'app/components/table/table';

@Component({
    selector: 'app-select-table',
    templateUrl: './select-table.component.html',
    styleUrls: ['./select-table.component.css']
})
export class SelectTableComponent implements OnInit {

    @Input() roomId: string;
    public tableForm: UntypedFormGroup;
    public rooms: Room[];
    public tables: Table[];
    public table: Table;
    public alertMessage: string = '';
    public loading: boolean = false;
    public focusEvent = new EventEmitter<boolean>();

    constructor(
        public _fb: UntypedFormBuilder,
        public _modalService: NgbModal,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig,
        public _tableService: TableService,
        public _roomService: RoomService
    ) { }

    ngOnInit() {

        this.buildForm()
        this.getRooms()
    }

    public buildForm(): void {
        this.tableForm = this._fb.group({
            'room': [, []],
            'table': [, []]
        })
    }

    public getRooms(): void {

        this.loading = true;

        this._roomService.getRooms().subscribe(
            result => {
                if (!result.rooms) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                    this.loading = false;
                    this.rooms = new Array();
                } else {
                    this.hideMessage();
                    this.loading = false;
                    this.rooms = result.rooms;

                    if (this.roomId) {
                        this.tableForm.patchValue({
                            'room': this.roomId
                        });

                        this.getTables(this.roomId)
                    }
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public getTables(roomId: string): void {

        let query = `where="room":"${roomId}","state" : "Disponible"`

        this._tableService.getTables(query).subscribe(
            result => {
                if (result && result.tables) {
                    this.tables = result.tables
                } else {
                    this.showMessage("No se encontratos mesas disponibles", 'danger', false);
                    this.tables = new Array();
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        )
    }

    public selectTable(): void {
        this.activeModal.close({ table: this.tableForm.value.table });
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
