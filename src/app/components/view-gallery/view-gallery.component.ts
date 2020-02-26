import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GalleryService } from 'app/services/gallery.service';
import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { Config } from 'app/app.config';
import { Socket } from 'ngx-socket-io';
import { DOCUMENT } from '@angular/common';

import { NguCarousel, NguCarouselConfig } from '@ngu/carousel';
import 'hammerjs';
import { Gallery } from 'app/models/gallery';
import { User } from 'app/models/user';


@Component({
    selector: 'app-view-gallery',
    templateUrl: './view-gallery.component.html',
    styleUrls: ['./view-gallery.component.css']
})


export class ViewGalleryComponent implements OnInit {


    public alertMessage: string = '';
    public src: string;
    public gallery: Gallery;
    public loading = false;
    public images = [];
    public carouselBanner;
    public intervalSocket;
    public viewBotton = true;
    public elem;
    constructor(
        private _route: ActivatedRoute,
        private _galleryService: GalleryService,
        public alertConfig: NgbAlertConfig,
        private socket: Socket,
        @Inject(DOCUMENT) private document: any
    ) {
        this.initSocket();
    }

    ngOnInit() {
        this.elem = document.documentElement;

        this._route.params.subscribe(params => {
            if (params['name']) {
                this.getGallery(params['name']);
            }
        });

    }


    private initSocket(): void {

        /*  let identity: User = JSON.parse(sessionStorage.getItem('user'));
  
          if (identity && Config.database && Config.database !== '') {
              if (!this.socket.ioSocket.connected) {*/
  
                  // INICIAMOS SOCKET
                  this.socket.emit('start', {
                      database: Config.database,
                      clientType: 'pos'
                  });
                  // ESCUCHAMOS SOCKET
                  this.socket.on('gallery', (mnj) => {
                      switch (mnj) {
                          case 'start':
                              this.loading = true;
                              break;
                          case 'stop':
                              this.loading = false;
                              break;
                          default:
                              break;
                      }
                  });
  
               /*   if (this.intervalSocket) {
                      clearInterval(this.intervalSocket);
                  }
              }
  
              // INICIAR CONTADOR PARA VERIFICAR CONEXION DE SOCKET
              this.intervalSocket = setInterval(() => {
                  if (!this.socket.ioSocket.connected) {
                      this.initSocket();
                  }
              }, 5000);
          }*/
      }

    public getGallery(name: string): void {

        // FILTRAMOS LA CONSULTA
        let match = `{ "operationType": { "$ne": "D" }, "name" : "${name}" }`;

        match = JSON.parse(match);

        // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
        let project = {
            name: 1,
            resources: 1,
            colddown: 1,
            operationType: 1
        };

        // AGRUPAMOS EL RESULTADO
        let group = {
            _id: null,
            count: { $sum: 1 },
            galleries: { $push: "$$ROOT" }
        };


        this._galleryService.getGalleriesV2(
            project, // PROJECT
            match, // MATCH
            {}, // SORT
            group, // GROUP
            0, // LIMIT
            0 // SKIP
        ).subscribe(
            result => {
                if (result && result[0] && result[0].galleries && result[0].galleries.length === 1) {
                    this.gallery = result[0].galleries[0]
                    this.gallery.resources.forEach(element => {

                        this.src = `${Config.apiURL}get-resource?filename=${element['file']}&database=${Config.database}`
                        this.images.push(this.src)

                    });

                    this.carouselBanner = {
                        grid: { xs: 1, sm: 1, md: 1, lg: 1, all: 0 },
                        slide: 1,
                        speed: this.gallery.speed,
                        interval: {
                            timing: this.gallery.colddown,
                            initialDelay: this.gallery.colddown
                        },
                        point: {
                            visible: true
                        },
                        load: 2,
                        loop: true,
                        touch: true
                    };

                    this.loading = true;

                } else {
                    this.showMessage("No se encontro la galeria", 'danger', false);
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
            }
        );
    }

    public openFullscreen() {

        if (this.elem.requestFullscreen) {
            this.elem.requestFullscreen();
        } else if (this.elem.mozRequestFullScreen) {
            /* Firefox */
            this.elem.mozRequestFullScreen();
        } else if (this.elem.webkitRequestFullscreen) {
            /* Chrome, Safari and Opera */
            this.elem.webkitRequestFullscreen();
        } else if (this.elem.msRequestFullscreen) {
            /* IE/Edge */
            this.elem.msRequestFullscreen();
        }

        this.viewBotton = false;

    }

    public showMessage(message: string, type: string, dismissible: boolean): void {
        this.alertMessage = message;
        this.alertConfig.type = type;
        this.alertConfig.dismissible = dismissible;
    }

}
