import { Component, Input, OnInit} from '@angular/core';
import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { PrinterService } from 'app/components/printer/printer.service';
import * as printJS from "print-js";

@Component({
  selector: 'app-print-labels',
  templateUrl: './print-labels.component.html',
  styleUrls: ['./print-labels.component.css']
})
export class PrintLabelsComponent {
  @Input() articleIds: string[];
  public loading: boolean = false;
  public alertMessage: string = "";

  constructor(
    private _printerService: PrinterService,
    //  public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }
  async ngOnInit() {
    this.printLabels(this.articleIds)
  }


  public printLabels(articlesIds: string[]) {
    this.loading = true;
    this._printerService.printLabels(articlesIds).subscribe(
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
