import { Component, Input, EventEmitter } from '@angular/core';
import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MovementOfArticleService } from '../../movement-of-article/movement-of-article.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateMePipe } from 'app/main/pipes/translate-me';

@Component({
  selector: "app-confirmation-question",
  templateUrl: "./confirmation-question.component.html",
  styleUrls: ["./confirmation-question.component.css"],
  providers: [NgbAlertConfig, TranslateMePipe]
})
export class ConfirmationQuestionComponent {

  @Input() title: string;
  @Input() subtitle: string;
  public alertMessage: string = "";
  public focusEvent = new EventEmitter<boolean>();
  public loading: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    private _toastr: ToastrService,
    public translatePipe: TranslateMePipe
  ) {
    alertConfig.type = "danger";
    alertConfig.dismissible = true;
  }

  public ngAfterViewInit(): void {
    this.focusEvent.emit(true);
  }

  public showToast(result, type?: string, title?: string, message?: string): void {
    if (result) {
      if (result.status === 0) {
        type = 'info';
        title = 'el servicio se encuentra en mantenimiento, inténtelo nuevamente en unos minutos';
      } else if (result.status === 200) {
        type = 'success';
        title = result.message;
      } else if (result.status >= 500) {
        type = 'danger';
        title = (result.error && result.error.message) ? result.error.message : result.message;
      } else {
        type = 'info';
        title = (result.error && result.error.message) ? result.error.message : result.message;
      }
    }
    switch (type) {
      case 'success':
        this._toastr.success(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
      case 'danger':
        this._toastr.error(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
      default:
        this._toastr.info(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
    }
    this.loading = false;
  }
}
