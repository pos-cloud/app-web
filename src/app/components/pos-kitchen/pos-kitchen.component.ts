import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { MovementOfArticleService } from 'app/services/movement-of-article.service';
import { MovementOfArticle, MovementOfArticleStatus } from 'app/models/movement-of-article';
import { Config } from 'app/app.config';

@Component({
  selector: 'app-pos-kitchen',
  templateUrl: './pos-kitchen.component.html',
  styleUrls: ['./pos-kitchen.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None
})

export class PosKitchenComponent {

  public alertMessage: string = '';
  public loading: boolean = false;
  public movementsOfArticles: MovementOfArticle[];
  public movementOfArticle: MovementOfArticle;
  public database: string = Config.database;
  public apiURL = Config.apiURL;
  public productionStarted: boolean = false;

  constructor(
    public _router: Router,
    public alertConfig: NgbAlertConfig,
    private _movementOfArticleService: MovementOfArticleService,
  ) { }

  public async ngOnInit() {
    this.getMovementOfArticleReady();
    this.initInterval();
  }

  public initInterval(): void {
    setInterval(() => {
      if(this.productionStarted && !this.movementOfArticle && !this.loading) {
        this.startProduction();
      }
    }, 5000);
  }

  public getMovementOfArticleReady(): void {
    try {
      this.movementsOfArticles = JSON.parse(sessionStorage.getItem('kitchen_movementsOfArticles'));
      this.movementOfArticle = JSON.parse(localStorage.getItem('kitchen_movementOfArticle'));
      if(this.movementOfArticle) this.productionStarted = true;
    } catch(err) {}
  }

  public async startProduction() {

    this.productionStarted = true;

    await this.updateMovementOfArticleByWhere({
      status: MovementOfArticleStatus.Pending,
      operationType: { $ne: 'D' }
    }, {
      status: MovementOfArticleStatus.Preparing
    },
    {
      creationDate: 1
    }).then(
      movementOfArticle => {
        if(movementOfArticle) {
          this.movementOfArticle = movementOfArticle;
          this.getMovementOfArticleToPreparing();
        }
      }
    );
  }

  public async stopProduction() {
    if(this.movementOfArticle) {
      await this.changeStatusToPending().then(
        movementOfArticle => {
          if(movementOfArticle) {
            this.movementOfArticle = null;
            localStorage.removeItem('kitchen_movementOfArticle');
          }
        }
      );
    } else {
      this.loading = false;
    }
    this.productionStarted = false;
  }

  public getMovementOfArticleToPreparing() : void {

    this.loading = true;

    let project = {
      description: 1,
      notes: 1,
      status: 1,
      amount: 1,
      printed: 1,
      'article._id': 1,
      'article.picture': 1
    };

    let match = { _id: this.movementOfArticle._id };
                
    this._movementOfArticleService.getMovementsOfArticlesV2(
        project, // PROJECT
        match, // MATCH
        {}, // SORT
        {}, // GROUP
        1, // LIMIT
        0 // SKIP
    ).subscribe(
      result => {
        this.loading = false;
        if(!result.movementsOfArticles) {
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
          if(result.movementsOfArticles && result.movementsOfArticles.length > 0) {
            this.movementOfArticle = result.movementsOfArticles[0];
            localStorage.setItem('kitchen_movementOfArticle', JSON.stringify(this.movementOfArticle));
          }
        }
      },
      error => {
        this.loading = false;
        this.showMessage(error._body, 'danger', false);
      }
    );
  }

  public updateMovementOfArticleByWhere(where: {}, set: {}, sort: {}): Promise<MovementOfArticle> {

    return new Promise<MovementOfArticle>((resolve, reject) => {
      
      this.loading = true;

      this._movementOfArticleService.updateMovementOfArticleByWhere(where, set, sort).subscribe(
        result => {
          this.loading = false;
          if (!result.movementOfArticle) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.movementOfArticle);
          }
        },
        error => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public async viewArticle(movementOfArticle: MovementOfArticle) {
    if(this.movementOfArticle) {
      await this.changeStatusToPending().then(
        movementOfArticle => {
          if(movementOfArticle) {
            this.movementOfArticle = null;
            localStorage.removeItem('kitchen_movementOfArticle');
          }
        }
      );
    }
    this.movementOfArticle = movementOfArticle;
  }

  public async changeStatusToPending() {
    return new Promise(async (resolve, reject) => {
      this.movementOfArticle.status = MovementOfArticleStatus.Pending;
      await this.updateMovementOfArticle().then(
        movementOfArticle => {
          resolve(movementOfArticle);
        }
      );
    });
  }

  public async changeStatusToReady() {
    
    return new Promise(async (resolve, reject) => {

      if(!this.loading) {
        if(this.movementOfArticle.status !== MovementOfArticleStatus.Ready) {
          // AUMENTAR LA CANTIDAD PRODUCIDA
          this.movementOfArticle.printed ++;
          // SI LA CANTIDAD PRODUCIDA ES IGUAL A LA CANTIDAD DE ARTICULOS PASA A ESTAR LISTO
          if(this.movementOfArticle.printed >= this.movementOfArticle.amount) {
            this.movementOfArticle.status = MovementOfArticleStatus.Ready;
          }
          await this.updateMovementOfArticle().then(
            movementOfArticle => {
              if(movementOfArticle) {
                if(!this.movementsOfArticles) this.movementsOfArticles = new Array();
                // AGREGAMOS AL PRINCIPIO DEL LISTADO DE PRODUCIDOS Y SOLO GUARDAMOS LOS 3 PRIMEROS
                this.movementsOfArticles.unshift(this.movementOfArticle);
                this.movementsOfArticles = this.movementsOfArticles.slice(0, 3);
                sessionStorage.setItem('kitchen_movementsOfArticles', JSON.stringify(this.movementsOfArticles));
                this.movementOfArticle = null;
                localStorage.removeItem('kitchen_movementOfArticle');
                this.startProduction();
                resolve(this.movementOfArticle);
              }
            }
          );
        } else {
          this.movementOfArticle = null;
          localStorage.removeItem('kitchen_movementOfArticle');
          this.startProduction();
          resolve(this.movementOfArticle);
        }
      } else {
        resolve(null);
      }
    });
  }

  public updateMovementOfArticle(): Promise<MovementOfArticle> {

    return new Promise<MovementOfArticle>((resolve, reject) => {
      
      this.loading = true;

      this._movementOfArticleService.updateMovementOfArticle(this.movementOfArticle).subscribe(
        result => {
          this.loading = false;
          if (!result.movementOfArticle) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.movementOfArticle);
          }
        },
        error => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
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
