import { Component, ViewEncapsulation, ViewChild, OnInit } from '@angular/core';
import { ReportService } from '../report.service';
import { DatatableComponent } from '../../datatable/datatable.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { RoundNumberPipe } from 'app/main/pipes/round-number.pipe';
import { TranslatePipe } from '@ngx-translate/core';
import { ExportExcelComponent } from 'app/components/export/export-excel/export-excel.component';
import { Report } from '../report.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ParamsReportComponent } from '../params-report/params-report.component';

@Component({
    selector: 'app-view-report',
    templateUrl: './view-report.component.html',
    styleUrls: ['./view-report.component.scss'],
    providers: [TranslateMePipe, TranslatePipe],
    encapsulation: ViewEncapsulation.None
})

export class ViewReportComponent implements OnInit {

    public title: string = '';
    public columns: any[];
    public items: any[] = new Array();
    public report: Report;
    public loading = true;
    private roundNumberPipe: RoundNumberPipe = new RoundNumberPipe();

    // EXCEL
    @ViewChild(DatatableComponent) datatableComponent: DatatableComponent;
    @ViewChild(ExportExcelComponent) exportExcelComponent: ExportExcelComponent;

    constructor(
        public _service: ReportService,
        private _route: ActivatedRoute,
        private _router: Router,
        private _toastr: ToastrService,
        private _modalService: NgbModal,
        public translatePipe: TranslateMePipe
    ) { }


    public ngOnInit() {
        this.processParams();
    }

    public processParams(): void {
        this.loading = true
        this.items = [];
        this.columns = [];
        this._route.params.subscribe(params => {
            if (params['name']) {
                this.title = params['name'];
                this.getReportByName(params['name']);
            } else {
                this.loading = false;
                this.showToast("", "Danger", "Error de Ruta", "El reporte no se encontro")
            }
        });
    }

    public getReportByName(name: string): void {
        this._service.getAll({
            project: {
                name: 1,
                type: 1,
                params: 1
            },
            match: {
                name: name
            }
        }).subscribe(
            result => {
                if (result.status === 200) {
                    this.report = result.result[0];
                    if (this.report.params && this.report.params.length > 0) {
                        this.getParamsValue();
                    } else {
                        this.execReport(this.report.name);
                    }
                } else {
                    this.loading = false;
                    this.showToast(result)
                }
            },
            error => {
                this.loading = false;
                this.showToast(error)
            }
        );
    }

    public getParamsValue(): void {
        let modalRef;
        modalRef = this._modalService.open(ParamsReportComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.report = this.report;
        modalRef.result.then((result) => {
            if(result === 'cancel'){
                this._router.navigateByUrl('/#/');
            } else {
                this.execReport(this.report.name, result);
            }

        }, (reason) => {
            this._router.navigateByUrl('/#/');
        });
    }

    public execReport(name: string, params? : any): void {
        this._service.getReportResult(name,params).subscribe(
            result => {
                if (result.status === 200) {
                    this.items = result.result
                    for (var key in this.items[0]) {
                        if (key != '_id') {
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
                    }

                    this.columns.sort(function (a, b) {
                        var x = a.name < b.name ? -1 : 1;
                        return x;
                    });
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

    public exportItems(): void {
        this.exportExcelComponent.items = this.items;
        this.exportExcelComponent.export();
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
