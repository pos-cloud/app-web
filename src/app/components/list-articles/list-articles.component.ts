import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Article } from './../../models/article';
import { ArticleService } from './../../services/article.service';

import { AddArticleComponent } from './../../components/add-article/add-article.component';
import { UpdateArticleComponent } from './../../components/update-article/update-article.component';

@Component({
  selector: 'app-list-articles',
  templateUrl: './list-articles.component.html',
  styleUrls: ['./list-articles.component.css']
})

export class ListArticlesComponent implements OnInit {

  private articles: Article[];
  private alertMessage: any;
  private userType: string;
  private orderTerm: string[] = ['code'];

  constructor(
    private _articleService: ArticleService,
    private _router: Router,
    private _modalService: NgbModal
  ) { }

  ngOnInit(): void {
    
    this._router.events.subscribe((data:any) => { 
      let pathLocation: string;
      pathLocation = data.url.split('/');
      this.userType = pathLocation[1];
    });
    this.getArticles();
  }

  private getArticles(): void {  

    this._articleService.getArticles().subscribe(
        result => {
					this.articles = result.articles;
					if(!this.articles) {
						this.alertMessage = "Error al traer artículos. Error en el servidor.";
					}
				},
				error => {
					this.alertMessage = error;
					if(!this.alertMessage) {
						this.alertMessage = "Error en la petición.";
					}
				}
      );
   }

  private orderBy (term: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-"+term;  
    } else {
      this.orderTerm[0] = term; 
    }
  }

  private deleteArticle(article: Article): void {
    console.log(article);
  }

  private openModal(op: string, article:Article): void {

      let modalRef;
      switch(op) {
        case 'add' :
          modalRef = this._modalService.open(AddArticleComponent, { size: 'lg' }).result.then((result) => {
            this.getArticles();
          }, (reason) => {
            this.getArticles();
          });
          break;
        case 'update' :
            modalRef = this._modalService.open(UpdateArticleComponent, { size: 'lg' })
            modalRef.componentInstance.article = article;
            this.getArticles();
          break;
        case 'delete' :
            modalRef = this._modalService.open(DeleteArticleComponent, { size: 'lg' })
            this.getArticles();
          break;
        default : ;

      }
    };
}


@Component({
  selector: 'app-delete-article',
  template: `
            <div class="modal-header">
              <h4 class="modal-title">Eliminar Artículo</h4>
              <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('close_click')">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
                <h6>¿Estás seguro de eliminar el Artículo?</h6>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="activeModal.close('cancel')">Cancelar</button>
              <button type="submit" class="btn btn-primary" (click)="deleteArticle(article)" >Aceptar</button>
            </div>
            `
})

export class DeleteArticleComponent {
  constructor(public activeModal: NgbActiveModal) {}
}