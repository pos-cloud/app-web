import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Article } from './../../models/article';
import { ArticleService } from './../../services/article.service';

import { AddArticleComponent } from './../../components/add-article/add-article.component';
import { UpdateArticleComponent } from './../../components/update-article/update-article.component';
import { DeleteArticleComponent } from './../../components/delete-article/delete-article.component';

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
            modalRef.result.then((result) => {
              if(result === 'save_close') {
                this.getArticles();
              }
            }, (reason) => {
              
            });
          break;
        case 'delete' :
            modalRef = this._modalService.open(DeleteArticleComponent, { size: 'lg' })
            modalRef.componentInstance.article = article;
            modalRef.result.then((result) => {
              if(result === 'delete_close') {
                this.getArticles();
              }
            }, (reason) => {
              
            });
          break;
        default : ;
      }
    };
}
