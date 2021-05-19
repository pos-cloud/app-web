import { Component, ViewEncapsulation, ViewChild, OnInit } from '@angular/core';
import { ReportService } from '../report.service';
import { DatatableComponent } from '../../datatable/datatable.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { RoundNumberPipe } from 'app/main/pipes/round-number.pipe';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-view-report',
    templateUrl: './view-report.component.html',
    styleUrls: ['./view-report.component.scss'],
    providers: [TranslateMePipe, TranslatePipe],
    encapsulation: ViewEncapsulation.None
})

export class ViewReportComponent implements OnInit {

    public title: string = '';
    public columns: any[] = new Array();
    public items: any[] = new Array();
    public loading = true;
    private roundNumberPipe: RoundNumberPipe = new RoundNumberPipe();

    // EXCEL
    @ViewChild(DatatableComponent, { static: false }) datatableComponent: DatatableComponent;

    constructor(
        public _service: ReportService,
        private _route: ActivatedRoute,
        private _toastr: ToastrService,
        public translatePipe: TranslateMePipe
    ) { }


    public ngOnInit() {
        this.processParams();
    }

    private processParams(): void {
        this.loading = true
        this.items = [];
        this.columns = [];
        this._route.params.subscribe(params => {
            if (params['name']) {
                this.title = params['name'];
                this.getReport(params['name']);
            } else {
                this.loading = false;
                this.showToast("", "Danger", "Error de Ruta", "El reporte tiene nombre")
            }
        });
    }

    public getReport(name: string): void {
        this._service.getReportResult(name).subscribe(
            result => {
                if (result.status === 200) {
                    this.items = result.result

                    for (var key in this.items[0]) {

                        this.columns.push({
                            name: key,
                            visible: true,
                            disabled: false,
                            filter: true,
                            defaultFilter: null,
                            datatype: 'string',
                            project: null,
                            align: 'left',
                            required: false,
                        })
                    }

                    this.loading = false;
                } else {
                    this.showToast(result)
                }
            },
            error => {
                this.loading = false;
                this.showToast(error)
            }
        )
    }

    public getValue(item, column) {
        let val: string = 'item';
        let exists: boolean = true;
        let value: any = '';
        for (let a of column.name.split('.')) {
            val += '.' + a;
            if (exists && !eval(val)) {
                exists = false;
            }
        }
        if (exists) {
            value = eval(val);
        }
        return value;
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
