import {Component, ViewEncapsulation, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {PrintComponent} from 'app/components/print/print/print.component';
import {PrinterPrintIn} from 'app/components/printer/printer';
import {PrinterService} from 'app/components/printer/printer.service';
import {IButton} from 'app/util/buttons.interface';
import Resulteable from 'app/util/Resulteable';

import {DatatableComponent} from '../../datatable/datatable.component';
import {BusinessRuleService} from '../business-rule.service';
import {BusinessRule} from '../business-rules';

@Component({
  selector: 'app-list-business-rules',
  templateUrl: './list-business-rules.component.html',
  styleUrls: ['./list-business-rules.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ListBusinessRulesComponent {
  title: string = 'business-rules';
  sort = {active: -1, endDate: -1};
  columns = BusinessRule.getAttributes();
  rowButtons: IButton[] = [
    {
      title: 'view',
      class: 'btn btn-success btn-sm',
      icon: 'fa fa-eye',
      click: `this.emitEvent('view', item)`,
    },
    {
      title: 'update',
      class: 'btn btn-primary btn-sm',
      icon: 'fa fa-pencil',
      click: `this.emitEvent('update', item)`,
    },
    {
      title: 'delete',
      class: 'btn btn-danger btn-sm',
      icon: 'fa fa-trash-o',
      click: `this.emitEvent('delete', item)`,
    },
    {
      title: 'print',
      class: 'btn btn-light btn-sm',
      icon: 'fa fa-print',
      click: `this.emitEvent('print', item)`,
    },
  ];
  headerButtons: IButton[] = [
    {
      title: 'add',
      class: 'btn btn-light',
      icon: 'fa fa-plus',
      click: `this.emitEvent('add', null)`,
    },
    {
      title: 'refresh',
      class: 'btn btn-light',
      icon: 'fa fa-refresh',
      click: `this.refresh()`,
    },
  ];

  // EXCEL
  @ViewChild(DatatableComponent) datatableComponent: DatatableComponent;

  constructor(
    private _modalService: NgbModal,
    private _router: Router,
    public _service: BusinessRuleService,
    private _printerService: PrinterService,
  ) {}

  async emitEvent(event) {
    this.openModal(event.op, event.obj);
  }

  async openModal(op: string, obj: any) {
    switch (op) {
      case 'view':
        this._router.navigateByUrl('business-rule/view/' + obj._id);
        break;
      case 'add':
        this._router.navigateByUrl('business-rule/add');
        break;
      case 'update':
        this._router.navigateByUrl('business-rule/update/' + obj._id);
        break;
      case 'delete':
        this._router.navigateByUrl('business-rule/delete/' + obj._id);
        break;
      case 'print':
        this.print(obj);
        break;
      default:
    }
  }

  refresh() {
    this.datatableComponent.refresh();
  }

  async print(businessRule: BusinessRule) {
    let modalRef;

    const printer = await this.getVoucherPrinter();

    if (printer) {
      modalRef = this._modalService.open(PrintComponent, {
        size: 'lg',
        backdrop: 'static',
      });
      modalRef.componentInstance.typePrint = 'business-rule-code';
      modalRef.componentInstance.businessRule = businessRule;
      modalRef.componentInstance.printer = printer;
    }
  }

  async getVoucherPrinter() {
    const printerResponse: Resulteable = await this._printerService
      .getAll({
        project: {
          _id: 1,
          name: 1,
          origin: 1,
          connectionURL: 1,
          type: 1,
          pageWidth: 1,
          pageHigh: 1,
          printIn: 1,
          url: 1,
          quantity: 1,
          orientation: 1,
          row: 1,
          addPag: 1,
          fields: 1,
        },
        match: {
          printIn: PrinterPrintIn.Voucher,
        },
      })
      .toPromise();

    if (printerResponse.status === 200 && printerResponse.result.length > 0) {
      return printerResponse.result;
    } else {
      this.datatableComponent.showToast(
        null,
        'danger',
        'Debe crear la configuración para la impresora voucher',
      );

      return;
    }
  }
}
