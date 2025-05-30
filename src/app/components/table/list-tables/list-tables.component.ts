import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Table, TableState } from '@types';

import { TableService } from '../../../core/services/table.service';
import { TransactionTypeService } from '../../../core/services/transaction-type.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { UserService } from '../../../core/services/user.service';

import { ToastService } from 'app/shared/components/toast/toast.service';
import { TranslateMePipe } from '../../../shared/pipes/translate-me';
import { PrintQRComponent } from './../../../components/print/print-qr/print-qr.component';
import { TransactionType } from './../../../components/transaction-type/transaction-type';

@Component({
  selector: 'app-list-tables',
  templateUrl: './list-tables.component.html',
  styleUrls: ['./list-tables.component.scss'],
  providers: [NgbAlertConfig, TranslateMePipe],
  encapsulation: ViewEncapsulation.None,
})
export class ListTablesComponent implements OnInit {
  public tableSelected: Table;
  public tables: Table[];
  public states: string[];
  public areTablesEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string;
  public orderTerm: string[] = ['description'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public amountOfDinersNow: number = 0;
  public amountOfDiners: number = 0;
  @Input() loading: boolean = false;
  @Input() filterRoom: string;
  @Output() eventTableSelected: EventEmitter<Table> = new EventEmitter<Table>();
  public itemsPerPage = 10;
  public totalItems = 0;
  public transactionTypeDefectOrder: TransactionType;
  public interval;
  public table: Table;

  @ViewChild('contentChangeState', { static: true })
  contentChangeState: ElementRef;

  constructor(
    public _tableService: TableService,
    public _transactionService: TransactionService,
    public _transactionTypeService: TransactionTypeService,
    public _userService: UserService,
    public _router: Router,
    private _route: ActivatedRoute,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal,
    public translatePipe: TranslateMePipe,
    private _toastService: ToastService
  ) {
    if (this.filterRoom === undefined) {
      this.filterRoom = '';
    }
    this.processParams();
  }

  ngOnInit(): void {
    this.tables = new Array();
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getTables();

    if (this.userType === 'pos') {
      this.interval = setInterval(() => {
        if (!this.loading) {
          this.getTables();
        }
      }, 3000);
    }
  }

  public ngOnDestroy(): void {
    if (this.interval) clearInterval(this.interval);
  }

  private processParams(): void {
    this._route.queryParams.subscribe((params) => {
      if (params['states']) {
        this.states = params['states'].split(',');
      }
    });
  }

  public getTables(): void {
    let project = {
      description: 1,
      'room._id': 1,
      'room.description': 1,
      chair: 1,
      diners: 1,
      state: 1,
      'employee._id': 1,
      'employee.name': 1,
      'employee.type._id': 1,
      'employee.type.description': 1,
      'lastTransaction._id': 1,
      'lastTransaction.startDate': 1,
      'lastTransaction.state': 1,
      operationType: 1,
    };

    let match = { operationType: { $ne: 'D' } };

    if (this.states) match['state'] = { $in: this.states };

    this._tableService.getTablesV2(project, match, { description: 1 }, {}).subscribe(
      (result) => {
        if (!result.tables) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.tables = new Array();
          this.areTablesEmpty = true;
        } else {
          this.hideMessage();
          this.tables = result.tables;
          this.totalItems = this.tables.length;
          this.areTablesEmpty = false;
          this.calculateAmountOfDiners();
        }
      },
      (error) => {
        if (error.status === 0) {
          this.showMessage('Error al conectar con el servidor. Corroborar que este encendido.', 'danger', false);
        } else {
          this.showMessage(error._body, 'danger', false);
        }
      }
    );
  }

  public async selectTable(table: Table) {
    this.loading = true;
    try {
      table = await this.getTable(table._id);
      if (table.state === TableState.Pending) this.openModal('change-state', table);
      else this.eventTableSelected.emit(table);
    } catch (error) {
      this._toastService.showToast(error);
    }
  }

  public getTable(tableId: string): Promise<Table> {
    return new Promise<Table>((resolve, reject) => {
      this._tableService.getTable(tableId).subscribe(
        (result) => {
          if (result.table) resolve(result.table);
          else reject(result);
        },
        (error) => reject(error)
      );
    });
  }

  public calculateAmountOfDiners() {
    this.amountOfDiners = 0;
    this.amountOfDinersNow = 0;

    for (let table of this.tables) {
      this.amountOfDiners += table.chair;
      if (table.state === TableState.Busy || table.state === TableState.Pending) {
        this.amountOfDinersNow += table.diners;
      }
    }
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
    this.getTables();
  }

  public openModal(op: string, table: Table): void {
    let modalRef;

    switch (op) {
      case 'change-state':
        modalRef = this._modalService.open(this.contentChangeState, {
          backdrop: 'static',
        });
        this.table = table;
        modalRef.result.then(
          async (result) => {
            if (result !== 'cancel' && result !== '') {
              this.table.state = TableState.Available;
              this.table.lastTransaction = null;
              this.updateTable();
            } else {
              this.loading = false;
            }
          },
          (reason) => {
            this.loading = false;
          }
        );
        break;
      case 'print-qr':
        modalRef = this._modalService.open(PrintQRComponent);
        modalRef.componentInstance.tables = this.tables;
        break;
      default:
    }
  }

  public updateTable() {
    this.loading = true;

    this._tableService.updateTable(this.table).subscribe(
      (result) => {
        if (!result.table) {
          this.loading = false;
          if (result.message && result.message !== '') {
            this.showMessage(result.message, 'info', true);
          }
        } else {
          this.loading = false;
        }
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
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
