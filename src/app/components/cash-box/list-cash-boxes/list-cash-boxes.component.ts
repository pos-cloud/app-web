import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import {
  NgbActiveModal,
  NgbAlertConfig,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';

import { CashBoxService } from '../../../core/services/cash-box.service';
import { CashBox } from '../cash-box';

import { TranslatePipe } from '@ngx-translate/core';
import { Printer } from 'app/components/printer/printer';
import { User } from 'app/components/user/user';
import { TransactionTypeService } from 'app/core/services/transaction-type.service';
import { UserService } from 'app/core/services/user.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TranslateMePipe } from 'app/shared/pipes/translate-me';
import { PrintComponent } from '../../print/print/print.component';

@Component({
  selector: 'app-list-cash-boxes',
  templateUrl: './list-cash-boxes.component.html',
  styleUrls: ['./list-cash-boxes.component.scss'],
  providers: [NgbAlertConfig, TranslateMePipe, TranslatePipe],
  encapsulation: ViewEncapsulation.None,
})
export class ListCashBoxesComponent implements OnInit {
  public cashBoxes: CashBox[] = new Array();
  public areCashBoxesEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string;
  public orderTerm: string[] = ['-openingDate'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public itemsPerPage = 10;
  public totalItems = 0;
  public filterNumber;
  filterOpeningDate;
  filterClosingDate;
  filterState;
  filterEmployee;
  p;
  filterType;

  constructor(
    public _cashBoxService: CashBoxService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig,
    public translatePipe: TranslateMePipe,
    private _userService: UserService,
    private _toastService: ToastService,
    public activeModal: NgbActiveModal,
    public _transactionTypeService: TransactionTypeService
  ) {}

  ngOnInit(): void {
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getCashBoxes();
  }

  public getBadge(term: string): boolean {
    return true;
  }

  public selectCashBox(cashBoxSelected: CashBox): void {
    this.activeModal.close({ cashBoxId: cashBoxSelected._id });
  }

  async getCashBoxes() {
    this.loading = true;
    let user: User = await this.getUser();
    let query = '';
    if (
      user &&
      user.employee &&
      user.employee.type &&
      user.employee.type.description !== 'Administrador'
    ) {
      query = 'where="employee":"' + user.employee._id + '"';
    }

    this._cashBoxService.getCashBoxes(query).subscribe(
      async (result) => {
        if (!result.cashBoxes) {
          if (result.message && result.message !== '')
            this.showMessage(result.message, 'info', true);
          this.loading = false;
          this.cashBoxes = new Array();
          this.areCashBoxesEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.cashBoxes = result.cashBoxes;
          this.totalItems = this.cashBoxes.length;
          this.areCashBoxesEmpty = false;
        }
        this.loading = false;
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getUser(): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      let identity: User = JSON.parse(sessionStorage.getItem('user'));
      if (identity) {
        this._userService.getUser(identity._id).subscribe(
          (result) => {
            if (result && result.user) {
              resolve(result.user);
            } else {
              this.showMessage('Debe volver a iniciar sesión', 'danger', false);
            }
          },
          (error) => {
            this.showMessage(error._body, 'danger', false);
          }
        );
      }
    });
  }

  public orderBy(term: string, property?: string): void {
    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = '-' + term;
    } else {
      this.orderTerm[0] = term;
    }
    this.propertyTerm = property;
  }

  public refresh(): void {
    this.getCashBoxes();
  }

  public printBoxClosure(cashBox: CashBox): void {
    this.getTransactionTypes(cashBox);
  }

  public getTransactionTypes(cashBox: CashBox): void {
    this.loading = true;

    this._transactionTypeService
      .getAll({
        project: {
          name: 1,
          cashClosing: 1,
          cashBoxImpact: 1,
          'defectPrinter._id': 1,
          'defectPrinter.type': 1,
          'defectPrinter.pageWidth': 1,
          'defectPrinter.pageHigh': 1,
          'defectPrinter.printIn': 1,
          'defectPrinter.origin': 1,
          'defectPrinter.url': 1,
        },
        match: {
          cashClosing: true,
          cashBoxImpact: true,
          operationType: { $ne: 'D' },
        },
      })
      .subscribe(
        (result) => {
          if (result.status === 200) {
            this.loading = false;
            if (result.result[0].defectPrinter) {
              this.openModal('print', cashBox, result.result[0].defectPrinter);
            } else {
              this.openModal('print', cashBox);
            }
          } else {
            this._toastService.showToast(result);
          }
        },
        (error) => {
          this._toastService.showToast(error);
        }
      );
  }

  public openModal(
    op: string,
    cashBox: CashBox,
    printer: Printer = null
  ): void {
    let modalRef;
    switch (op) {
      case 'print':
        let modalRef = this._modalService.open(PrintComponent);
        modalRef.componentInstance.cashBox = cashBox;
        modalRef.componentInstance.printer = printer;
        modalRef.componentInstance.typePrint = 'cash-box';
        modalRef.result.then(
          (result) => {},
          (reason) => {}
        );
        break;
      default:
    }
  }

  openListCashBox(cashBox: CashBox) {
    this._router.navigateByUrl('report/list-box/' + cashBox._id);
  }

  public showMessage(
    message: string,
    type: string,
    dismissible: boolean
  ): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }
}
