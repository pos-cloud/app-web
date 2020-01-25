import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GalleryService } from 'app/services/gallery.service';
import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { Config } from 'app/app.config';

import { NguCarousel, NguCarouselConfig } from '@ngu/carousel';
import 'hammerjs';
import { Gallery } from 'app/models/gallery';


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

    constructor(
        private _route: ActivatedRoute,
        private _galleryService: GalleryService,
        public alertConfig: NgbAlertConfig,
    ) { }

    ngOnInit() {
        this._route.params.subscribe(params => {
            if (params['name']) {
                this.getGallery(params['name']);
            }
        });
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

    public showMessage(message: string, type: string, dismissible: boolean): void {
        this.alertMessage = message;
        this.alertConfig.type = type;
        this.alertConfig.dismissible = dismissible;
    }

}
