import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { NgbModal, NgbActiveModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { Article } from './../../models/article';
import { ArticleService } from './../../services/article.service';
import { AddArticleComponent } from './../../components/add-article/add-article.component'
import { Pipe, PipeTransform } from '@angular/core';
import { FilterPipe } from './../../pipes/filter.pipe';
import { OrderByPipe } from './../../pipes/order-by.pipe';


@Component({
  selector: 'app-list-articles',
  templateUrl: './list-articles.component.html',
  styleUrls: ['./list-articles.component.css']
})
export class ListArticlesComponent implements OnInit {

  private articles: Article[];
  private errorMessage;closeResult;
  private location: string;
  private userType: string;
  private orderTerm: string[] = ['code'];
  private articleSelectedId: string;

  constructor(
    private _articleService: ArticleService,
    private _router: Router,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    
    this._router.events.subscribe((data:any) => { 
      this.location = data.url.split('/');
      this.userType = this.location[1];
    });
    this.getArticles();
  }


  private getArticles() {  
    this._articleService.getArticles().subscribe(
        result => {

					this.articles = result.articles;
          
					if(!this.articles) {
						alert("Error al traer artículos. Error en el servidor.");
					}
				},
				error => {
					this.errorMessage = <any> error;

					if(!this.errorMessage) {
						alert("Error en la petición.");
					}
				}
      );
   }

  orderBy (term: string) {
    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-"+term;  
    } else {
      this.orderTerm[0] = term; 
    }
  }

  openModal() {
      console.log("openMOdal");
      const modalRef = this.modalService.open(AddArticleComponent, { size: 'lg' }).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
        this.getArticles();
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        this.getArticles();
      });
    };

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }
}
