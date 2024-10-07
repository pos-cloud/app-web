import {
  Component,
  EventEmitter,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { Config } from 'app/app.config';
import { GalleryService } from 'app/components/gallery/gallery.service';

import { Article } from 'app/components/article/article';
import { ArticleService } from 'app/components/article/article.service';
import { Gallery } from 'app/components/gallery/gallery';
import { PaymentMethod } from 'app/components/payment-method/payment-method';
import { PaymentMethodService } from 'app/components/payment-method/payment-method.service';
import { Resource } from 'app/components/resource/resource';
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import 'hammerjs';
import { ToastrService } from 'ngx-toastr';
import { ResourceService } from '../../resource/resource.service';

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
  public galleryId: string;
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
  public resource: Resource[];
  public paymentMethod: PaymentMethod[];
  public makeImage: string = '';
  public articleImage: string = '';

  constructor(
    public _router: Router,
    private _galleryService: GalleryService,
    private _articleService: ArticleService,
    private _resourceService: ResourceService,
    public alertConfig: NgbAlertConfig,
    private _toastr: ToastrService,
    public translatePipe: TranslateMePipe,
    public _paymentMethod: PaymentMethodService
  ) {
    this.getResource();
  }

  ngOnInit() {
    this.database = Config.database;
    this.focusEvent.emit(true);
    this.elem = document.documentElement;
    const URL = this._router.url.split('/');
    this.galleryId = URL[4].split('?')[0];
    if (this.galleryId) {
      this.getGallery(this.galleryId);
    }
  }

  public getGallery(galleryId: string) {
    this.loading = true;

    this._galleryService.getGallery(galleryId).subscribe(
      (result) => {
        if (!result.result) {
          this.showToast(result);
        } else {
          this.gallery = result.result;
          this.gallery.resources.forEach((element) => {
            let fileImg = this.resource.find((file) =>
              typeof element.resource === 'string'
                ? element.resource === file._id
                : element.resource._id === file._id
            );
            this.src = fileImg.file;
            this.images.push(this.src);
          });

          if (this.gallery.barcode) {
            this.focusEvent.emit(true);
          }
        }
        this.loading = false;
      },
      (error) => {
        this.showToast(error);
        this.loading = false;
      }
    );
  }

  public getArticle(): void {
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
            if (result.result.length > 0) {
              this.article = result.result[0];
              this.filterArticle = '';
              this.getPaymentMethods();
            } else {
              this.article = null;
              this.filterArticle = '';
            }

            if (
              this.article !== null &&
              (this.article.picture === 'default.jpg' || !this.article.picture)
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

  public getPaymentMethods() {
    this.loading = true;
    let project = {
      _id: 1,
      name: 1,
      operationType: 1,
    };
    let match = {
      operationType: { $ne: 'D' },
    };
    this._paymentMethod.getAll({ project, match }).subscribe(
      (result) => {
        if (!result.result) {
          this.showToast(result);
        } else {
          this.paymentMethod = result.result;
        }
        this.loading = false;
      },
      (error) => {
        this.showToast(error);
        this.loading = false;
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

  public getResource() {
    this.loading = true;
    let project = {
      _id: 1,
      name: 1,
      file: 1,
      operationType: 1,
    };
    let match = {
      operationType: { $ne: 'D' },
    };
    this._resourceService.getAll({ project, match }).subscribe(
      (result) => {
        if (!result.result) {
          this.showToast(result);
        } else {
          this.resource = result.result;
        }
        this.loading = false;
      },
      (error) => {
        this.showToast(error);
        this.loading = false;
      }
    );
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
