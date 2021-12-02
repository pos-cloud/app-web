import { Component, OnInit, EventEmitter, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbAlertConfig, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';
import { Transaction } from 'app/components/transaction/transaction';
import { TransactionService } from 'app/components/transaction/transaction.service';
import { MovementOfArticle } from 'app/components/movement-of-article/movement-of-article';
import { MovementOfArticleService } from 'app/components/movement-of-article/movement-of-article.service';
import { ArticlePrintIn } from 'app/components/article/article';
import { VoucherService } from 'app/components/voucher-reader/voucher.service';
import { Voucher } from 'app/components/voucher-reader/voucher';
import { Config } from 'app/app.config';
import { ConfigService } from 'app/components/config/config.service';

declare const Instascan: any;

@Component({
    selector: 'app-voucher-reader',
    templateUrl: './voucher-reader.component.html',
    styleUrls: ['./voucher-reader.component.scss'],
    providers: [NgbAlertConfig],
    encapsulation: ViewEncapsulation.None
})

export class VoucherReaderComponent implements OnInit {

    public text: string;
    public alertMessage: string = '';
    public focusEvent = new EventEmitter<boolean>();
    public loading: boolean = false;
    public showCamera: boolean = true;
    @ViewChild('voucherDetails', { static: true }) voucherDetails: ElementRef;
    public available: boolean = true;
    public scanner;
    public timeOfReading: string;
    public timeGenerate: string;
    public voucher: Voucher;
    public movementsOfArticles: MovementOfArticle[];
    public config: Config;

    constructor(
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig,
        public _router: Router,
        public _modalService: NgbModal,
        private _voucherService: VoucherService,
        private _transactionService: TransactionService,
        private _movementOfArticleService: MovementOfArticleService,
        public _configService: ConfigService,
    ) { }

    public async ngOnInit() {
        await this._configService.getConfig.subscribe(
            config => {
                this.config = config;
            }
        );
    }

    ngAfterViewInit() {
        this.focusEvent.emit(true);
    }

    public initScanner(): void {
        this.showCamera = true;
        this.scanner = new Instascan.Scanner({ video: document.getElementById('preview') });
        this.scanner.addListener('scan', (content) => {
            if (this.available) {
                this.text = content;
                this.readVoucher();
            }
        });

        Instascan.Camera.getCameras().then((cameras) => {
            if (cameras.length > 0) {
                this.scanner.start(cameras[0]);
            } else {
                this.showMessage('No se encontraron cámaras.', 'info', true);
            }
        }).catch(function (e) {
            this.showMessage(e, 'danger', true);
        });
    }

    public async readVoucher() {
        this.available = false;
        if (this.text && this.text !== '') {
            await this.getVouchers({ token: this.text }).then(
                async vouchers => {
                    if (vouchers && vouchers.length > 0) {
                        this.voucher = vouchers[0];
                        if (this.config.voucher.readingLimit === 0 || vouchers[0].readings < this.config.voucher.readingLimit) {
                            await this.getTransactions({
                                _id: { $oid: this.voucher.token },
                                $or : [{ state: 'Cerrado' }, { state: 'Armando' }, { state: 'Entregado' },{ state: 'Preparando' }],
                                operationType: { $ne: 'D' }
                            }).then(
                                async transactions => {
                                    if (transactions && transactions.length > 0) {
                                        await this.getMovementsOfArticles({
                                            operationType: { $ne: 'D' },
                                            transaction: { $oid: this.voucher.token },
                                            'article.printIn': ArticlePrintIn.Voucher
                                        }).then(
                                            async movementsOfArticles => {
                                                if (movementsOfArticles && movementsOfArticles.length > 0) {
                                                    this.movementsOfArticles = movementsOfArticles;
                                                    let voucher = vouchers[0];
                                                    voucher.readings += 1;
                                                    await this.updateVoucher(voucher);
                                                    this.timeOfReading = moment().calendar();
                                                    this.timeGenerate = moment(this.voucher.date).calendar();
                                                    this.openModal('articles');
                                                }
                                            }
                                        );
                                    } else {
                                        this.showMessage('La transacción ya no se encuentra disponible', 'info', true);
                                    }
                                }
                            );
                        } else {
                            this.available = true;
                            this.focusEvent.emit(true);
                            this.showMessage('El voucher superó la cantidad de lecturas disponibles.', 'info', true);
                        }
                    } else {
                        this.available = true;
                        this.focusEvent.emit(true);
                        this.showMessage('El voucher no se encuentra generado en el sistema.', 'info', true);
                    }
                }
            );
        } else {
            this.available = true;
            this.focusEvent.emit(true);
            this.showMessage('Debe ingresar un código de voucher válido.', 'info', true);
        }
    }

    public getVouchers(match: {} = {}): Promise<Voucher[]> {

        return new Promise<Voucher[]>((resolve, reject) => {

            this._voucherService.getVouchersV2(
                {}, // PROJECT
                match, // MATCH
                { readings: 1 }, // SORT
                {}, // GROUP
                0, // LIMIT
                0 // SKIP
            ).subscribe(
                result => {
                    if (result && result.vouchers) {
                        resolve(result.vouchers);
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

    public getTransactions(match: {}): Promise<Transaction[]> {

        return new Promise<Transaction[]>((resolve, reject) => {

            this.loading = true;

            let project = {
                operationType: 1,
                state: 1,
            }
            
            this._transactionService.getTransactionsV2(
                project, // PROJECT
                match, // MATCH
                {}, // SORT
                {}, // GROUP
                0, // LIMIT
                0 // SKIP
            ).subscribe(
                result => {
                    this.loading = false;
                    this.hideMessage();
                    resolve(result.transactions);
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    this.loading = false;
                    resolve(new Array());
                }
            );
        });
    }

    public getMovementsOfArticles(match: {}): Promise<MovementOfArticle[]> {

        return new Promise<MovementOfArticle[]>((resolve, reject) => {

            this.loading = true;

            let project = {
                _id: 1,
                description: 1,
                amount: 1,
                notes: 1,
                transaction: 1,
                operationType: 1,
                'article.printIn': 1
            };

            this._movementOfArticleService.getMovementsOfArticlesV2(
                project, // PROJECT
                match, // MATCH
                {}, // SORT
                {}, // GROUP
                0, // LIMIT
                0 // SKIP
            ).subscribe(
                result => {
                    this.loading = false;
                    if (!result.movementsOfArticles) {
                        if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
                        resolve([]);
                    } else {
                        resolve(result.movementsOfArticles);
                    }
                },
                error => {
                    this.loading = false;
                    this.showMessage(error._body, 'danger', false);
                    resolve([]);
                }
            );
        });
    }

    public updateVoucher(voucher: Voucher): Promise<Voucher> {

        return new Promise<Voucher>((resolve, reject) => {

            this.loading = true;

            this._voucherService.updateVoucher(voucher).subscribe(
                result => {
                    this.loading = false;
                    if (!result.voucher) {
                        if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                        resolve(null);
                    } else {
                        resolve(result.voucher);
                    }
                },
                error => {
                    this.loading = false;
                    this.showMessage(error._body, 'danger', false);
                    resolve(null);
                }
            );
        });
    }

    public clearText(): void {
        this.text = '';
        this.focusEvent.emit(true);
    }

    public stopScanner(): void {
        this.scanner.stop();
        this.showCamera = true;
    }

    async openModal(op: string) {

        let modalRef;

        switch (op) {
            case 'articles':
                modalRef = this._modalService.open(this.voucherDetails, { size: 'lg', backdrop: 'static' });
                modalRef.result.then(async (result) => {
                    this.clearText();
                    this.available = true;
                }, (reason) => {
                    this.clearText();
                    this.available = true;
                });
                break;
            default:
                break;
        }
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
