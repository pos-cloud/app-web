import { Component, OnInit, Output, EventEmitter, ViewEncapsulation, Input } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { MovementOfCash, StatusCheck } from './../../models/movement-of-cash';
import { MovementOfCashService } from './../../services/movement-of-cash.service';
import { ViewTransactionComponent } from '../view-transaction/view-transaction.component';

@Component({
  selector: 'app-list-movement-of-cash',
  templateUrl: './list-movements-of-cashes.component.html',
  styleUrls: ['./list-movements-of-cashes.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None
})

export class ListMovementOfCashesComponent implements OnInit {

  @Input() userType : string;
  @Input() transactionAmount : number;
  public movementsOfCashes: MovementOfCash[] = new Array();
  public areMovementOfCashesEmpty = true;
  public alertMessage = '';
  //public userType: string;
  public orderTerm: string[] = ['-expirationDate'];
  public propertyTerm: string;
  public areFiltersVisible = false;
  public loading = false;
  @Output() eventAddItem: EventEmitter<MovementOfCash> = new EventEmitter<MovementOfCash>();
  public itemsPerPage = 10;
  public totalItems = 0;
  public transactionMovement: string;
  public pathLocation: string[]

  public currentPage: number = 0;
  public displayedColumns = [
    "number",
    "bank.name",
    "transaction.type.name",
    "transaction.type.transactionMovement",
    "amountPaid",
    "expirationDate"
  ];
  public filters: any[];
  public filterValue: string;

  constructor(
    public _movementOfCashService: MovementOfCashService,
    public _router: Router,
    public _modalService: NgbModal,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
  ) { 
    this.filters = new Array();
    for(let field of this.displayedColumns) {
      this.filters[field] = "";
    }
  }

  ngOnInit(): void {

    this.pathLocation = this._router.url.split('/');
    if(!this.userType){
      this.userType = this.pathLocation[1];
    }
    this.transactionMovement = this.pathLocation[2].charAt(0).toUpperCase() + this.pathLocation[2].slice(1);
    if(this.userType === "admin"){
      this.getMovementOfCashes();
    } else {
      this.getMovementOfCashesV2();
    }
    
  }

  public getMovementOfCashesV2() : void {
    
    this.loading = true;

    // ORDENAMOS LA CONSULTA
    let sortAux = { order: 1 };
    
    // FILTRAMOS LA CONSULTA

    let match = `{`;
    for(let i = 0; i < this.displayedColumns.length; i++) {
      let value = this.filters[this.displayedColumns[i]];
      if (value && value != "") {
        match += `"${this.displayedColumns[i]}": { "$regex": "${value}", "$options": "i"},`;
      }
    }

    match += `"operationType": { "$ne": "D" }, "statusCheck" : "Disponible" }`;

    match = JSON.parse(match);
    
    // CAMPOS A TRAER
    let project = {
      "_id" : 1,
      "number": 1,
      "bank._id" : 1 ,
      "bank.name" : { $toString : '$bank.name'} ,
      "amountPaid" :{ $toString : '$amountPaid'} ,
      "operationType": 1,
      "expirationDate": { $dateToString: { date: "$expirationDate", format: "%d/%m/%Y", timezone: "-03:00" }},
      "transaction._id":1,
      "transaction.state" : 1,
      "transaction.type.name" : 1,
      "transaction.type.transactionMovement" : 1,
      "date": 1,
      "statusCheck": 1,
      "titular" : 1,
      "receiver" : 1,
      "quota" : 1 ,
      "type" : 1,
      "deliveredBy" : 1,
      "CUIT" : 1,
      "observation" : 1
    };

    // AGRUPAMOS EL RESULTADO
    let group = {};

    let limit = 0;

    let skip = 0;

    this._movementOfCashService.getMovementsOfCashesV2(
        project, // PROJECT
        match, // MATCH
        sortAux, // SORT
        group, // GROUP
        this.itemsPerPage, // LIMIT
        skip // SKIP
    ).subscribe(
      result => {
        if (result.movementOfCashes) {
          this.loading = false;
          this.movementsOfCashes = result.movementOfCashes;
          this.totalItems = result.count;
          this.areMovementOfCashesEmpty = false;
        } 
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
        this.totalItems = 0;
      }
    );
  }

  public pageChange(page): void {
    this.currentPage = page;
    this.getMovementOfCashesV2();
  }

  public getMovementOfCashes(): void {

    this.loading = true;

    this._movementOfCashService.getMovementsOfCashesByMovement(this.transactionMovement).subscribe(
      result => {
        if (!result.movementsOfCashes) {
          if (result.message && result.message !== '') {
            this.showMessage(result.message, 'info', true);
          }
          this.loading = false;
          this.movementsOfCashes = new Array();
          this.areMovementOfCashesEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.movementsOfCashes = result.movementsOfCashes;
          this.totalItems = this.movementsOfCashes.length;
          this.areMovementOfCashesEmpty = false;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public async selectmovementOfCash(movementOfCashSelected: MovementOfCash) {
    if(this.transactionAmount >= movementOfCashSelected.amountPaid){
      let movementOfCash = await this.getMovementOfCashById(movementOfCashSelected._id);
      this.activeModal.close(movementOfCash);
    } else {
      if(this.pathLocation[2] !== "fondos"){
        this.showMessage("El cheque es mayor al monto a pagar", 'info', false);
      }
    }
  }

  public getMovementOfCashById(id : string): Promise<MovementOfCash> {

    return new Promise<MovementOfCash>((resolve, reject) => {

      this._movementOfCashService.getMovementOfCash(id).subscribe(
        async result => {
          if (!result.movementOfCash) {
            this.showMessage(result.message, 'danger', false);
            resolve(null);
          } else {
            resolve(result.movementOfCash);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public orderBy (term: string, property?: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = '-' + term;
    } else {
      this.orderTerm[0] = term;
    }
    this.propertyTerm = property;
  }

  public refresh(): void {
    this.getMovementOfCashes();
    
  }

  public refreshV2() : void {
    this.getMovementOfCashesV2();
  }


  public openModal(op: string, movementOfCash: MovementOfCash): void {

    let modalRef;
    switch (op) {
      case 'view' :
        modalRef = this._modalService.open(ViewTransactionComponent, { size: 'lg' });
        modalRef.componentInstance.transactionId = movementOfCash.transaction._id;
        modalRef.componentInstance.readonly = true;
        break;
      default : ;
    }
  };

  public addItem(movementOfCashSelected) {
    this.eventAddItem.emit(movementOfCashSelected);
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }
}
