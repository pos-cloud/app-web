import { Component, OnInit, Input, EventEmitter } from '@angular/core';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { ArticleField } from '../article-field';

import { ArticleFieldService } from '../article-field.service';

@Component({
  selector: 'app-delete-article-field',
  templateUrl: './delete-article-field.component.html',
  styleUrls: ['./delete-article-field.component.css'],
  providers: [NgbAlertConfig]
})

export class DeleteArticleFieldComponent implements OnInit {

  @Input() articleField: ArticleField;
  public alertMessage: string = '';
  public focusEvent = new EventEmitter<boolean>();
  public loading: boolean = false;

  constructor(
    public _articleFieldService: ArticleFieldService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void { }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public deleteArticleField(): void {

    this.loading = true;

    this._articleFieldService.deleteArticleField(this.articleField._id).subscribe(
      result => {
        this.activeModal.close('delete_close');
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
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