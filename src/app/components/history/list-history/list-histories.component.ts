import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { History } from '../history.model';
import { HistoryService } from '../history.service';
import { DatatableComponent } from '../../datatable/datatable.component';
import { Subscription } from 'rxjs';
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-list-histories',
  templateUrl: './list-histories.component.html',
  styleUrls: ['./list-histories.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [TranslateMePipe]
})

export class ListHistoriesComponent {

  public title: string = 'histories';
  public sort = { "name": 1 };
  public columns = History.getAttributes();
  public loading: boolean = false;
  public rowButtons: {
    title: string,
    class: string,
    icon: string,
    click: string
  }[] = [{
    title: 'recover',
    class: 'btn btn-info btn-sm',
    icon: 'fa fa-undo',
    click: `this.emitEvent('recover', item)`
  }];
  public headerButtons: {
    title: string,
    class: string,
    icon: string,
    click: string
  }[] = [{
    title: 'add',
    class: 'btn btn-light',
    icon: 'fa fa-plus',
    click: `this.emitEvent('add', null)`
  }, {
    title: 'refresh',
    class: 'btn btn-light',
    icon: 'fa fa-refresh',
    click: `this.refresh()`
  }];

  // EXCEL
  @ViewChild(DatatableComponent, { static: false }) datatableComponent: DatatableComponent;
  private subscription: Subscription = new Subscription();

  constructor(
    public _service: HistoryService,
    public translatePipe: TranslateMePipe,
    private _toastr: ToastrService,
  ) { }

  public async emitEvent(event) {
    this.openModal(event.op, event.obj);
  };

  public async openModal(op: string, obj: any) {

    switch (op) {
      case 'recover':
        this.recover(obj);
        break;
      default: ;
    }
  };

  public recover(obj: History) {
    this.loading = true;
    this.subscription.add(
      this._service.recoverDoc(obj).subscribe(
        result => {
          this.showToast(result);
          if (result.status === 200)
            this.datatableComponent.refresh();
        },
        error => this.showToast(error)
      )
    );
  }

  public refresh() {
    this.datatableComponent.refresh();
  }

  public showToast(result, type?: string, title?: string, message?: string): void {
    if (result) {
      if (result.status === 200) {
        type = 'success';
        title = result.message;
      } else if (result.status >= 400) {
        type = 'danger';
        title = (result.error && result.error.message) ? result.error.message : result.message;
      } else {
        type = 'info';
        title = result.message;
      }
    }
    switch (type) {
      case 'success':
        this._toastr.success(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
      case 'danger':
        this._toastr.error(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
      default:
        this._toastr.info(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
    }
    this.loading = false;
  }
}
