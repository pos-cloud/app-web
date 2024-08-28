import { Component, Input, OnInit} from '@angular/core';
import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { PrinterService } from 'app/components/printer/printer.service';
import * as printJS from "print-js";

@Component({
  selector: 'app-print-label',
  templateUrl: './print-label.component.html',
  styleUrls: ['./print-label.component.css']
})
export class PrintLabelComponent implements OnInit {
  @Input() articleId: string;
  public loading: boolean = false;
  public alertMessage: string = "";

  constructor(
    private _printerService: PrinterService,
    //  public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }
  async ngOnInit() {
    this.printArticle(this.articleId)
  }

  public printArticle(articleId: string) {
    this.loading = true;
    this._printerService.printArticle(articleId, 1,).subscribe(
      (res: Blob) => {
        if (res) {
          const blobUrl = URL.createObjectURL(res);
          printJS(blobUrl);
          this.loading = false;
        } else {
          this.loading = false;
          this.showMessage('Error al cargar el PDF', 'danger', false);
        }
      },
      (error) => {
        this.loading = false;
        this.showMessage(error.message, 'danger', false);
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

  public hideMessage(): void {
    this.alertMessage = "";
  }
}
