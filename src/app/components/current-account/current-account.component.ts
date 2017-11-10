//Paquetes Angular
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

//Paquetes de terceros
import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

//Modelos
import { Transaction, TransactionState } from './../../models/transaction';
import { TransactionType, TransactionTypeState, CurrentAcount, TransactionTypeMovements } from './../../models/transaction-type';
import { Company } from './../../models/company';
import { MovementOfCash } from './../../models/movement-of-cash';

//Services
import { CompanyService } from './../../services/company.service';
import { TransactionService } from './../../services/transaction.service';
import { MovementOfCashService } from './../../services/movement-of-cash.service';

//Componentes
import { DeleteTransactionComponent } from './../../components/delete-transaction/delete-transaction.component';

@Component({
  selector: 'app-current-account',
  templateUrl: './current-account.component.html',
  styleUrls: ['./current-account.component.css'],
  providers: [NgbAlertConfig]
})

export class CurrentAccountComponent implements OnInit {

  public transactions: Transaction[];
  public companySelectedId: string;
  public companies: Company[];
  public movementsOfCashes: MovementOfCash[];
  public areTransactionsEmpty: boolean = true;
  public alertMessage: string = "";
  public userType: string;
  public orderTerm: string[] = ['-date'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public balance: number = 0;
  public itemsPerPage = 10;
  public totalItems = 0;

  constructor(
    public _transactionService: TransactionService,
    public _movementOfCashService: MovementOfCashService,
    public _companyService: CompanyService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { 
    this.companies = new Array();
    this.movementsOfCashes = new Array();
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getCompanies();
  }

  public getCompanies(): void {

    this.loading = true;

    this._companyService.getCompanies().subscribe(
      result => {
        if (!result.companies) {
          this.showMessage(result.message, "info", true);
        } else {
          this.hideMessage();
          this.companies = result.companies;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getTransactionsByCompany(): void {

    this.loading = true;
    
    if (this.companySelectedId !== "undefined") {

      this._transactionService.getTransactionsByCompany(this.companySelectedId).subscribe(
        result => {
          if (!result.transactions) {
            this.hideMessage();
            this.loading = false;
            this.transactions = null;
            this.areTransactionsEmpty = true;
            this.transactions = new Array();
            this.balance = 0;
          } else {
            this.transactions = result.transactions;
            this.hideMessage();
            this.loading = false
            this.getMovementOfCurrentAccountByCompany();
            this.areTransactionsEmpty = false;
          }
        },
        error => {
          this.showMessage(error._body, "danger", false);
          this.loading = false;
          this.transactions = new Array();
          this.balance = 0;
        }
      );
    } else {
      this.showMessage("Debe seleccionar una empresa.", "info", true);
      this.loading = false;
    }
  }

  public getMovementOfCurrentAccountByCompany(): void {

    this.loading = true;

    if (this.companySelectedId) {

      this._movementOfCashService.getMovementOfCurrentAccountByCompany(this.companySelectedId).subscribe(
        result => {
          if (!result.movementsOfCashes) {
            this.hideMessage();
          } else {
            this.hideMessage();
            this.movementsOfCashes = result.movementsOfCashes;
            this.filterTransactions();
          }
          this.loading = false;
        },
        error => {
          this.showMessage(error._body, "danger", false);
          this.loading = false;
        }
      );
    } else {
      this.showMessage("Debe seleccionar una empresa.", "info", true);
      this.loading = false;
    }
  }

  public filterTransactions(): void {
    
    let transactions: Transaction[] = this.transactions;
    this.transactions = new Array();
    this.balance = 0;

    for (let transaction of transactions) {
      
      if (transaction.state === TransactionState.Closed &&
        transaction.company._id === this.companySelectedId &&
        transaction.type.currentAccount !== CurrentAcount.No) {
        if (transaction.type.currentAccount === CurrentAcount.Yes &&
          this.getPaymentMethodName(transaction) === "Cuenta Corriente") {
          this.transactions.push(transaction);
          if (transaction.type.movement === TransactionTypeMovements.Outflows) {
            this.balance += transaction.totalPrice;
          } else {
            this.balance -= transaction.totalPrice;
          }
        } else if (transaction.type.currentAccount === CurrentAcount.Cobra) {
          this.transactions.push(transaction);
          if (transaction.type.movement === TransactionTypeMovements.Outflows) {
            this.balance -= transaction.totalPrice;
          } else {
            this.balance += transaction.totalPrice;
          }
        } else {
          //No se toma en cuenta el documento
        }
      } else {
        //No se toma en cuenta el documento
      }
    }
    this.totalItems = this.transactions.length;
  }

  public getPaymentMethodName(transaction): string {
    
    let name: string = "";

    for (let movementOfCash of this.movementsOfCashes) {
      if(movementOfCash.transaction) {
        if(movementOfCash.transaction._id === transaction._id){
          name = movementOfCash.type.name;
        }
      }
    }
    
    return name;
  }

  public orderBy(term: string, property?: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-" + term;
    } else {
      this.orderTerm[0] = term;
    }
    this.propertyTerm = property;
  }

  public refresh(): void {
    if(this.companies.length === 0) {
      this.getCompanies();
    } else {
      if(this.companySelectedId){
        this.getTransactionsByCompany();
      } else {
        this.showMessage("Debe seleccionar una empresa.", "info", true);
      }
    }
  }

  public openModal(op: string, transaction: Transaction): void {

    let modalRef;
    switch (op) {
      case 'delete':
        modalRef = this._modalService.open(DeleteTransactionComponent, { size: 'lg' })
        modalRef.componentInstance.transaction = transaction;
        modalRef.result.then((result) => {
          if (result === 'delete_close') {
            this.getTransactionsByCompany();
          }
        }, (reason) => {

        });
        break;
      default: ;
    }
  };

  public addTransaction(transactionCode: number) {
    this._router.navigate(['/pos/mesas/' + transactionCode + '/add-transaction']);
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = "";
  }
}