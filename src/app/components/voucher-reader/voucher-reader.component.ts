import { Component, OnInit, EventEmitter, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbAlertConfig, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MovementOfArticle } from 'app/models/movement-of-article';

(function hello() {
  alert('Hello!!!');
})()

@Component({
  selector: 'app-voucher-reader',
  templateUrl: './voucher-reader.component.html',
  styleUrls: ['./voucher-reader.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None
})

export class VoucherReaderComponent implements OnInit {

  public text: string;
  public alertMessage: string = '';
  public focusEvent = new EventEmitter<boolean>();
  public loading: boolean = false;
  public showCamera: boolean = true;
  @ViewChild('voucherDetails', {static: true}) voucherDetails: ElementRef;
  public movementsOfArticles: MovementOfArticle[];
  public available: boolean = true;
  public scanner;

  constructor(
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _router: Router,
    public _modalService: NgbModal,
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public initScanner(): void {
    this.showCamera = true;
    this.scanner = new Instascan.Scanner({ video: document.getElementById('preview') });
    this.scanner.addListener('scan', (content) => {
      if(this.available) {
        this.available = false;
        this.focusEvent.emit(true);
        try {
          let voucher = JSON.parse(content);
          if (voucher.type === 'articles') {
            this.movementsOfArticles = voucher.movementsOfArticles;
            this.openModal('articles');
          }
        } catch(err) {
          this.showMessage('Error al leer el voucher.', 'info', true);
        }
      }
    });

    Instascan.Camera.getCameras().then((cameras) => {
      if (cameras.length > 0) {
        this.scanner.start(cameras[0]);
      } else {
        console.error('No cameras found.');
      }
    }).catch(function (e) {
      console.error(e);
    });
  }

  public stopScanner(): void {
    this.scanner.stop();
    this.showCamera = true;
  }

  async openModal(op: string) {

    let modalRef;

    switch (op) {
      case 'articles':
        console.log(this.movementsOfArticles);
        modalRef = this._modalService.open(this.voucherDetails, { size: 'lg', backdrop: 'static' });
        modalRef.result.then(async (result) => {
          this.available = true;
        }, (reason) => {
          this.available = true;
        });
        break;
      default:
        break;
      }
    }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage():void {
    this.alertMessage = '';
  }
}
