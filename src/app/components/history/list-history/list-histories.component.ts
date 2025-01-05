import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { IButton } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TranslateMePipe } from 'app/shared/pipes/translate-me';
import { Subscription } from 'rxjs';
import { HistoryService } from '../../../core/services/history.service';
import { DatatableComponent } from '../../datatable/datatable.component';
import { History } from '../history.model';

@Component({
  selector: 'app-list-histories',
  templateUrl: './list-histories.component.html',
  encapsulation: ViewEncapsulation.None,
  providers: [TranslateMePipe],
})
export class ListHistoriesComponent {
  public title: string = 'histories';
  public sort = { name: 1 };
  public columns = History.getAttributes();
  public loading: boolean = false;
  public rowButtons: IButton[] = [
    {
      title: 'recover',
      class: 'btn btn-info btn-sm',
      icon: 'fa fa-undo',
      click: `this.emitEvent('recover', item)`,
    },
  ];
  public headerButtons: IButton[] = [
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
  private subscription: Subscription = new Subscription();

  constructor(
    public _service: HistoryService,
    public translatePipe: TranslateMePipe,
    private _toastService: ToastService
  ) {}

  public async emitEvent(event) {
    this.openModal(event.op, event.obj);
  }

  public async openModal(op: string, obj: any) {
    switch (op) {
      case 'recover':
        this.recover(obj);
        break;
      default:
    }
  }

  public recover(obj: History) {
    this.loading = true;
    this.subscription.add(
      this._service.recoverDoc(obj).subscribe(
        (result) => {
          this._toastService.showToast(result);
          if (result.status === 200) this.datatableComponent.refresh();
        },
        (error) => this._toastService.showToast(error)
      )
    );
  }

  public refresh() {
    this.datatableComponent.refresh();
  }
}
