import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { Config } from 'app/app.config';
import { GalleryService } from 'app/components/gallery/gallery.service';

import { Article } from 'app/components/article/article';
import { ArticleService } from 'app/components/article/article.service';
import { Gallery } from 'app/components/gallery/gallery';
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import 'hammerjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-view-gallery',
  templateUrl: './view-gallery.component.html',
  styleUrls: ['./view-gallery.component.scss'],
  providers: [NgbAlertConfig, TranslateMePipe],
  encapsulation: ViewEncapsulation.None,
})
export class ViewGalleryComponent implements OnInit {
  public alertMessage: string = '';
  public src: string;
  public gallery: Gallery;
  public loading = false;
  public images = [];
  // images = [944, 1011, 984].map((n) => `https://picsum.photos/id/${n}/900/500`);
  public carouselBanner;
  public intervalSocket;
  public viewBotton = true;
  public elem;
  public filterArticle: string;
  public article: Article = null;
  focusEvent = new EventEmitter<boolean>();
  public apiURL = Config.apiURL;
  public database: string;

  public makeImage: string = '';
  public articleImage: string = '';

  constructor(
    private _route: ActivatedRoute,
    private _galleryService: GalleryService,
    private _articleService: ArticleService,
    public alertConfig: NgbAlertConfig,
    private _toastr: ToastrService,
    private elementRef: ElementRef,
    public translatePipe: TranslateMePipe
  ) {}

  ngOnInit() {
    this.database = Config.database;
    this.focusEvent.emit(true);
    this.elem = document.documentElement;
    this._route.params.subscribe((params) => {
      if (params['id']) {
        this.getGallery(params['id']);
      }
    });
  }

  public getGallery(id: string): void {
    // FILTRAMOS LA CONSULTA

    let match = `{ "operationType": { "$ne": "D" }, "_id": { "$oid": "${id}" } }`;

    match = JSON.parse(match);

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project = {
      name: 1,
      resources: 1,
      colddown: 1,
      barcode: 1,
      operationType: 1,
    };

    // AGRUPAMOS EL RESULTADO
    let group = {
      _id: null,
      count: { $sum: 1 },
      galleries: { $push: '$$ROOT' },
    };

    this._galleryService
      .getGalleriesV2(
        project, // PROJECT
        match, // MATCH
        {}, // SORT
        group, // GROUP
        0, // LIMIT
        0 // SKIP
      )
      .subscribe(
        (result) => {
          if (
            result &&
            result[0] &&
            result[0].galleries &&
            result[0].galleries.length === 1
          ) {
            this.gallery = result[0].galleries[0];
            this.gallery.resources.forEach((element) => {
              this.src = `${element['file']}`;
              this.images.push(this.src);
            });

            if (this.gallery.barcode) {
              this.focusEvent.emit(true);
            }

            this.carouselBanner = {
              grid: { xs: 1, sm: 1, md: 1, lg: 1, all: 0 },
              slide: 1,
              speed: this.gallery.speed,
              interval: {
                timing: this.gallery.colddown,
                initialDelay: this.gallery.colddown,
              },
              point: {
                visible: true,
              },
              load: 2,
              loop: true,
              touch: true,
            };

            this.loading = true;
          } else {
            this.showMessage('No se encontro la galeria', 'danger', false);
          }
        },
        (error) => {
          this.showMessage(error._body, 'danger', false);
        }
      );
  }

  public getArticle(): void {
    console.log(this.filterArticle);
    if (this.filterArticle) {
      this._articleService
        .getAll({
          project: {
            code: 1,
            barcode: 1,
            description: 1,
            'make.description': 1,
            'make.picture': 1,
            'category.description': 1,
            posDescription: 1,
            observation: 1,
            salePrice: 1,
            operationType: 1,
            picture: 1,
          },
          match: {
            barcode: this.filterArticle,
            operationType: { $ne: 'D' },
          },
        })
        .subscribe(
          (result) => {
            if (
              result &&
              result.status === 200 &&
              result.result &&
              result.result.length > 0
            ) {
              console.log(result.result[0]);
              this.article = result.result[0];
              this.filterArticle = '';
            } else {
              this.article = null;
              this.filterArticle = '';
            }

            if (
              this.article.picture === 'default.jpg' ||
              !this.article.picture
            ) {
              if (this.article.make && this.article.make.picture) {
                this.makeImage = this.article.make.picture;
              } else {
                this.articleImage = 'default.jpg';
              }
            } else {
              this.articleImage = this.article.picture;
            }
          },
          (error) => {
            this.article = null;
            this.filterArticle = '';
          }
        );
    } else {
      this.article = null;
      this.filterArticle = '';
    }
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

  public showMessage(
    message: string,
    type: string,
    dismissible: boolean
  ): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public showToast(
    result,
    type?: string,
    title?: string,
    message?: string
  ): void {
    if (result) {
      if (result.status === 200) {
        type = 'success';
        title = result.message;
      } else if (result.status >= 400) {
        type = 'danger';
        title =
          result.error && result.error.message
            ? result.error.message
            : result.message;
      } else {
        type = 'info';
        title = result.message;
      }
    }
    switch (type) {
      case 'success':
        this._toastr.success(
          this.translatePipe.translateMe(message),
          this.translatePipe.translateMe(title)
        );
        break;
      case 'danger':
        this._toastr.error(
          this.translatePipe.translateMe(message),
          this.translatePipe.translateMe(title)
        );
        break;
      default:
        this._toastr.info(
          this.translatePipe.translateMe(message),
          this.translatePipe.translateMe(title)
        );
        break;
    }
    this.loading = false;
  }
}
