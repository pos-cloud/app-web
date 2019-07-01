import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { Turn } from './../../models/turn';
import { TurnService } from './../../services/turn.service';

import { PrintComponent } from './../../components/print/print.component';

@Component({
  selector: 'app-list-turns',
  templateUrl: './list-turns.component.html',
  styleUrls: ['./list-turns.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None
})

export class ListTurnsComponent implements OnInit {

  public turns: Turn[] = new Array();
  public areTurnsEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string;
  public posType: string;
  public orderTerm: string[] = ['-startDate'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public itemsPerPage: number = 10;
  public totalItems = 0;

  constructor(
    public _turnService: TurnService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.posType = pathLocation[2];
    this.getTurns();
  }

  public getTurns(): void {

    this.loading = true;

    this._turnService.getTurns().subscribe(
      result => {
        if (!result.turns) {
          this.loading = false;
          this.turns = new Array();
          this.areTurnsEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.turns = result.turns;
          this.totalItems = this.turns.length;
          this.areTurnsEmpty = false;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public orderBy (term: string, property?: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-"+term;
    } else {
      this.orderTerm[0] = term;
    }
    this.propertyTerm = property;
  }

  public refresh(): void {
    this.getTurns();
  }

  public openModal(op: string, turn:Turn): void {

    let modalRef;
    switch(op) {
      case 'print':
          let modalRef = this._modalService.open(PrintComponent);
          modalRef.componentInstance.turn = turn;
          modalRef.componentInstance.typePrint = 'turn';
          modalRef.result.then((result) => {

          }, (reason) => {

          });
        break;
      default : ;
    }
  };

  public addTurn(turnCode: number) {
    this._router.navigate(['/pos/mesas/'+turnCode+'/add-turn']);
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
