import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

import { EmployeeService } from './../../services/employee.service';
import { Config } from 'app/app.config';
import { Branch } from 'app/models/branch';
import { AuthService } from 'app/services/auth.service';
import { BranchService } from 'app/services/branch.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-report-sales-by-employee',
  templateUrl: './report-sales-by-employee.component.html',
  styleUrls: ['./report-sales-by-employee.component.css'],
  providers: [NgbAlertConfig]
})

export class ReportSalesByEmployeeComponent implements OnInit {

  public items: any[] = new Array();
  public areEmployeesEmpty: boolean = true;
  public alertMessage: string = '';
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  @Input() startDate: string;
  @Input() startTime: string;
  @Input() endDate: string;
  @Input() endTime: string;
  @Input() limit: number = 0;
  public listType: string = 'statistics';
  public itemsPerPage: string = "5";
  public currentPage: number = 1;
  public totalItems = 0;
  public sort = { "count": -1 };
  public transactionMovement: string;
  public totalItem;
  public totalAmount;
  public branches: Branch[];
  @Input() branchSelectedId: String;
  public allowChangeBranch: boolean;
  private subscription: Subscription = new Subscription();

  constructor(
    public _employeeService: EmployeeService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig,
    private _branchService: BranchService,
    private _authService: AuthService
  ) {
    this.startDate = moment().format('YYYY-MM-DD');
    this.startTime = moment('00:00', 'HH:mm').format('HH:mm');
    this.endDate = moment().format('YYYY-MM-DD');
    this.endTime = moment('23:59', 'HH:mm').format('HH:mm');
    this.totalItem = 0;
    this.totalAmount = 0;
  }

  async ngOnInit() {

    if(!this.branchSelectedId) {
      await this.getBranches({ operationType: { $ne: 'D' } }).then(
        branches => {
          this.branches = branches;
          if(this.branches && this.branches.length > 1) {
            this.branchSelectedId = this.branches[0]._id;
          }
        }
      );
      this._authService.getIdentity.subscribe(
        async identity => {
          if(identity && identity.origin) {
            this.allowChangeBranch = false;
            this.branchSelectedId = identity.origin.branch._id;
          } else {
            this.allowChangeBranch = true;
            this.branchSelectedId = null;
          }
        }
      );
    }

    this.getSalesByEmployee();
  }

  public getBranches(match: {} = {}): Promise<Branch[]> {

    return new Promise<Branch[]>((resolve, reject) => {
  
      this._branchService.getBranches(
          {}, // PROJECT
          match, // MATCH
          { number: 1 }, // SORT
          {}, // GROUP
          0, // LIMIT
          0 // SKIP
      ).subscribe(
        result => {
          if (result && result.branches) {
            resolve(result.branches);
          } else {
            resolve(null);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public getSalesByEmployee(): void {

    this.loading = true;
    let pathLocation: string[] = this._router.url.split('/');
    this.transactionMovement = pathLocation[2].charAt(0).toUpperCase() + pathLocation[2].slice(1);
    this.listType = pathLocation[3];

    let movement;
    if (this.transactionMovement === "Venta") {
      movement = "Entrada";
    } else if (this.transactionMovement === "Compra") {
      movement = "Salida";
    }

    let timezone = "-03:00";
    if(Config.timezone && Config.timezone !== '') {
      timezone =  Config.timezone.split('UTC')[1];
    }

    let query = {
      type: this.transactionMovement,
      movement: movement,
      currentAccount: "Si",
      modifyStock: true,
      startDate: this.startDate + " " + this.startTime + timezone,
      endDate: this.endDate + " " + this.endTime + timezone,
      sort: this.sort,
      limit: this.limit,
      branch: this.branchSelectedId
    }

    this.subscription.add(this._employeeService.getSalesByEmployee(JSON.stringify(query)).subscribe(
      result => {
        if (!result || result.length <= 0) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
          this.items = new Array();
          this.areEmployeesEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.items = result;
          this.areEmployeesEmpty = false;
          this.calculateTotal();
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    ));
  }

  public calculateTotal() : void {

    this.totalItem = 0;
    this.totalAmount = 0;

    for (let index = 0; index < this.items.length; index++) {
      this.totalItem = this.totalItem + this.items[index]['count'];
      this.totalAmount = this.totalAmount + this.items[index]['total'];
    }
  }

  public orderBy(term: string): void {

    if (this.sort[term]) {
      this.sort[term] *= -1;
    } else {
      this.sort = JSON.parse('{"' + term + '": 1 }');
    }

    this.getSalesByEmployee();
  }

  public refresh(): void {
    this.getSalesByEmployee();
  }

  public ngOnDestroy(): void {
	  this.subscription.unsubscribe();
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
