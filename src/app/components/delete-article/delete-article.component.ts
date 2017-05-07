import { Component, OnInit, Input, EventEmitter } from '@angular/core';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Article } from './../../models/article';

import { ArticleService } from './../../services/article.service';

@Component({
  selector: 'app-delete-article',
  templateUrl: './delete-article.component.html',
  styleUrls: ['./delete-article.component.css'],
  providers: [NgbAlertConfig]
})

export class DeleteArticleComponent implements OnInit {

  @Input() article: Article;
  private alertMessage: any;
  public focusEvent = new EventEmitter<boolean>();

  constructor(
    public _articleService: ArticleService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  private deleteArticle(): void {

    this._articleService.deleteArticle(this.article._id).subscribe(
      result => {
        this.activeModal.close('delete_close');
      },
      error => {
        this.alertMessage = error;
        if(!this.alertMessage) {
            this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
        }
      }
    );
  }
}
