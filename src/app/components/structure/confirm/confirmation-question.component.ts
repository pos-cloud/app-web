import { Component, EventEmitter, Input } from '@angular/core';
import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { TranslateMePipe } from 'app/shared/pipes/translate-me';

@Component({
  selector: 'app-confirmation-question',
  templateUrl: './confirmation-question.component.html',
  styleUrls: ['./confirmation-question.component.css'],
  providers: [NgbAlertConfig, TranslateMePipe],
})
export class ConfirmationQuestionComponent {
  @Input() title: string;
  @Input() subtitle: string;
  public alertMessage: string = '';
  public focusEvent = new EventEmitter<boolean>();
  public loading: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public translatePipe: TranslateMePipe
  ) {
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

  public ngAfterViewInit(): void {
    this.focusEvent.emit(true);
  }
}
