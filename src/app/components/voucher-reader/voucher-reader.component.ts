import { Component, OnInit, EventEmitter, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbAlertConfig, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

declare const Instascan: any;

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
  public available: boolean = true;
  public scanner;
  public timeOfReading: string;
  public timeGenerate: string;
  public voucher;

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
        this.text = content;
        this.readVoucher();
      }
    });

    Instascan.Camera.getCameras().then((cameras) => {
      if (cameras.length > 0) {
        this.scanner.start(cameras[0]);
      } else {
        this.showMessage('No se encontraron cámaras.', 'info', true);
      }
    }).catch(function (e) {
      this.showMessage(e, 'danger', true);
    });
  }

  public readVoucher(double: boolean = false): void {
    this.available = false;
    if(this.text && this.text !== '') {
      try {
        this.voucher = JSON.parse(this.text);
        this.timeOfReading = moment().calendar();
        this.timeGenerate = moment(this.voucher.time).calendar();
        if (this.voucher.type === 'articles') {
          this.text = '';
          this.focusEvent.emit(true);
          if(double) {
            this.openModal('articles');
          }
          this.openModal('articles');
        }
      } catch(err) {
        this.focusEvent.emit(true);
        this.showMessage('Error al intentar leer el voucher.', 'info', true);
      }
    } else {
      this.focusEvent.emit(true);
      this.showMessage('Debe ingresar un código de voucher válido.', 'info', true);
    }
  }

  public stopScanner(): void {
    this.scanner.stop();
    this.showCamera = true;
  }

  async openModal(op: string) {

    let modalRef;

    switch (op) {
      case 'articles':
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
