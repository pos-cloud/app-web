import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Gallery } from 'app/components/gallery/gallery';
import { Router } from '@angular/router';
import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { GalleryComponent } from '../gallery/gallery.component';
import { GalleryService } from 'app/components/gallery/gallery.service';
// import { Socket } from 'ngx-socket-io';
import { Config } from 'app/app.config';

@Component({
    selector: 'app-list-galleries',
    templateUrl: './list-galleries.component.html',
    styleUrls: ['./list-galleries.component.css']
})
export class ListGalleriesComponent implements OnInit {

    public galleries: Gallery[] = new Array();
    public areGalleriesEmpty: boolean = true;
    public alertMessage: string = '';
    public userType: string;
    public orderTerm: string[] = ['name'];
    public propertyTerm: string;
    public areFiltersVisible: boolean = false;
    public loading: boolean = false;
    @Output() eventAddItem: EventEmitter<Gallery> = new EventEmitter<Gallery>();
    public itemsPerPage = 10;
    public totalItems = 0;

    constructor(
        public _galleryService: GalleryService,
        public _router: Router,
        public _modalService: NgbModal,
        public alertConfig: NgbAlertConfig,
        // private socket: Socket

    ) { }

    ngOnInit(): void {

        let pathLocation: string[] = this._router.url.split('/');
        this.userType = pathLocation[1];
        this.getGalleries();
    }

    public getGalleries(): void {

        this.loading = true;

        this._galleryService.getGalleries().subscribe(
            result => {
                if (!result.galleries) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                    this.loading = false;
                    this.galleries = new Array();
                    this.areGalleriesEmpty = true;
                } else {
                    this.hideMessage();
                    this.loading = false;
                    this.galleries = result.galleries;
                    this.totalItems = this.galleries.length;
                    this.areGalleriesEmpty = false;
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
        this.getGalleries();
    }

    public openModal(op: string, gallery: Gallery): void {
        let modalRef;
        switch (op) {
            case 'view':
                modalRef = this._modalService.open(GalleryComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.galleryId = gallery._id;
                modalRef.componentInstance.operation = "view";
                modalRef.componentInstance.readonly = true;
                break;
            case 'add':
                modalRef = this._modalService.open(GalleryComponent, { size: 'lg', backdrop: 'static' })
                modalRef.componentInstance.operation = "add";
                modalRef.result.then((result) => {
                    this.getGalleries();
                }, (reason) => {
                    this.getGalleries();
                });
                break;
            case 'update':
                modalRef = this._modalService.open(GalleryComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.galleryId = gallery._id;
                modalRef.componentInstance.operation = "update";
                modalRef.componentInstance.readonly = false;
                modalRef.result.then((result) => {
                    this.getGalleries();
                }, (reason) => {
                    this.getGalleries();
                });
                break;
            case 'delete':
                modalRef = this._modalService.open(GalleryComponent, { size: 'lg', backdrop: 'static' })
                modalRef.componentInstance.galleryId = gallery._id;
                modalRef.componentInstance.operation = "delete";
                modalRef.componentInstance.readonly = true;
                modalRef.result.then((result) => {
                    this.getGalleries();
                }, (reason) => {
                    this.getGalleries();
                });
                break;
            case 'navigate':
                this._router.navigateByUrl("pos/ver-galeria/" + gallery.name)
                break;
            default: ;
        }
    };

    // public sendSocket(message): void {

    //     this.socket.emit('sync_gallery', message);
    // }


    public addItem(gallerySelected) {
        this.eventAddItem.emit(gallerySelected);
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
