import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';


import jsPDF from 'jspdf';
import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { DateFormatPipe } from '../../../main/pipes/date-format.pipe';
import { RoundNumberPipe } from '../../../main/pipes/round-number.pipe';


//service
import { ConfigService } from 'app/components/config/config.service';
import { Config } from 'app/app.config';
import { TransactionService } from 'app/components/transaction/transaction.service';
import { Transaction } from 'app/components/transaction/transaction';
import { Taxes } from 'app/components/tax/taxes';
import { TransactionMovement, Movements } from 'app/components/transaction-type/transaction-type';
import { VATConditionService } from 'app/components/vat-condition/vat-condition.service';
import { VATCondition } from 'app/components/vat-condition/vat-condition';
import { ClassificationService } from 'app/components/classification/classification.service';
import { Classification } from 'app/components/classification/classification';
import { MovementOfArticle } from 'app/components/movement-of-article/movement-of-article';
import { MovementOfArticleService } from 'app/components/movement-of-article/movement-of-article.service';
import { TaxClassification } from 'app/components/tax/tax';
import { padString } from '../../../util/functions/pad/padString';

@Component({
    selector: 'app-print-vat-book',
    templateUrl: './print-vat-book.component.html',
    styleUrls: ['./print-vat-book.component.css']
})
export class PrintVatBookComponent implements OnInit {

    @Input() params;

    public dataIVA: any = [];
    public transactions: Transaction[];
    public classifications: Classification[];
    public dataClassification: any = [];
    public printPriceListForm: FormGroup;
    public alertMessage: string = '';
    public vatConditions: VATCondition[];
    public userType: string;
    public loading: boolean = false;
    public focusEvent = new EventEmitter<boolean>();
    public dateFormat = new DateFormatPipe();
    public doc;
    public pdfURL;
    public config;
    public roundNumber = new RoundNumberPipe();
    public pageWidth;
    public pageHigh;
    public companyName: string = Config.companyName;

    public withImage = false;

    public fontSizes = JSON.parse(`{"xsmall" : 5,
                                  "small" : 7,
                                  "normal" : 10,
                                  "large" : 15,
                                  "extraLarge" : 20}`);

    constructor(
        public _transactionService: TransactionService,
        public _vatConditionService: VATConditionService,
        public _classificationService: ClassificationService,
        public _movementOfArticleService: MovementOfArticleService,
        public _fb: FormBuilder,
        public _router: Router,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig,
        public _configService: ConfigService,
        private domSanitizer: DomSanitizer
    ) {
        this.pageWidth = 210
        this.pageHigh = 297
        this.getVATConditions();
    }

    async ngOnInit() {

        await this._configService.getConfig.subscribe(
            config => {
                this.config = config;
            }
        );

        this.doc = new jsPDF('l', 'mm', [this.pageWidth, this.pageHigh]);
        this.getVATBook();
        this.getClassifications();
    }

    public getVATConditions(): void {

        this.loading = true;

        this._vatConditionService.getVATConditions().subscribe(
            result => {
                if (!result.vatConditions) {
                } else {
                    this.vatConditions = result.vatConditions;
                    for (let index = 0; index < this.vatConditions.length; index++) {
                        this.dataIVA[index] = {};
                        this.dataIVA[index]['_id'] = this.vatConditions[index]._id
                        this.dataIVA[index]['description'] = this.vatConditions[index].description
                        this.dataIVA[index]['total'] = 0;
                    }

                }
                this.loading = false;
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public getVATBook() {

        this._transactionService.getVATBook(this.params).subscribe(
            result => {
                if (result && result.transactions) {
                    this.transactions = result.transactions;
                    this.toPrintVAT();
                } else {
                    this.showMessage("No se encontraron Comprobantes para el período", 'info', true);
                }
                this.loading = false;
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public getClassifications(): void {

        let match = `{"operationType": { "$ne": "D" } }`;

        match = JSON.parse(match);

        // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
        let project = {
            "name": 1,
            "operationType": 1
        };

        // AGRUPAMOS EL RESULTADO
        let group = {
            _id: null,
            count: { $sum: 1 },
            classifications: { $push: "$$ROOT" }
        };

        this._classificationService.getClassifications(
            project, // PROJECT
            match, // MATCH
            {}, // SORT
            group, // GROUP
            0, // LIMIT
            0 // SKIP
        ).subscribe(
            result => {
                this.loading = false;
                if (result && result[0] && result[0].classifications) {
                    this.classifications = result[0].classifications;
                    for (let index = 0; index < this.classifications.length; index++) {
                        this.dataClassification[index] = {};
                        this.dataClassification[index]['_id'] = this.classifications[index]._id
                        this.dataClassification[index]['name'] = this.classifications[index].name
                        this.dataClassification[index]['total'] = 0;

                    }
                } else {
                    this.dataClassification = new Array();
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    async toPrintVAT() {

        // ENCABEZADO
        let folio = 1;

        if (this.params.split("&")[2] && !isNaN(this.params.split("&")[2])) {
            folio = parseInt(this.params.split("&")[2]);
        }


        let row = 10;
        this.doc.setFont("",'bold');

        this.doc.setFontSize(12);
        if (this.companyName) {
            this.doc.text(this.companyName, 5, row);
        }

        this.doc.setFont("",'normal');
        row += 5;

        if (this.config && this.config[0] && this.config[0].identificationType) {
            this.doc.text(this.config[0].identificationType.name + ":", 5, row);
            this.doc.text(this.config[0].identificationValue, 25, row);
        }

        this.doc.setFont("",'bold');
        this.doc.text("N° DE FOLIO:" + folio.toString(), 240, row);
        this.centerText(5, 5, 300, 0, row, "LIBRO DE IVA " + this.params.split("&")[0].toString().toUpperCase() + "S - PERÍODO " + this.params.split("&")[1].toString().toUpperCase());

        row += 3;
        this.doc.line(0, row, 400, row);
        row += 5;

        // TITULOS TABLA
        this.doc.setFontSize(9);
        this.doc.text("FECHA", 5, row);
        this.doc.text("RAZÓN SOCIAL", 25, row);
        this.doc.text("IDENTIFICADOR", 65, row);
        this.doc.text("TIPO COMP.", 95, row);
        this.doc.text("NRO. COMP.", 120, row);
        this.doc.text("GRAVADO", 150, row);
        this.doc.text("EXENTO", 175, row);
        this.doc.text("IVA", 195, row);
        this.doc.text("IMP INT", 215, row);
        this.doc.text("PERCEP.", 230, row);
        this.doc.text("TOTAL", 260, row);
        this.doc.setFontSize(8);
        this.doc.setFont("",'normal');

        row += 3;
        this.doc.line(0, row, 400, row);
        row += 5;

        // CUERPO TABLA
        let totalTaxBase = 0;
        let totalExempt = 0;
        let totalTaxAmountIVA = 0;
        let totalTaxAmountPercep = 0;
        let totalAmount = 0;
        let totalImpInt = 0;
        let totalTaxes: Taxes[] = new Array();

        for (let transaction of this.transactions) {

            //DATOS PRINCIPALES
            this.doc.text(this.dateFormat.transform(transaction.endDate, 'DD/MM/YYYY'), 5, row);
            if (transaction.company) {
                this.doc.text(transaction.company.name.toUpperCase().slice(0, 22), 25, row);
                this.doc.text((transaction.company.identificationValue) ? transaction.company.identificationValue.replace(/-/g, ""): "", 65, row);
            } else {
                this.doc.text('CONSUMIDOR FINAL', 25, row);
                this.doc.text('00000000000', 65, row);
            }
            if (transaction.type.labelPrint && transaction.type.labelPrint !== "") {
                this.doc.text(transaction.type.labelPrint, 95, row);
            } else {
                this.doc.text(transaction.type.name, 95, row);
            }
            this.doc.text(
                padString(transaction.origin, 4) + "-" +
                transaction.letter + "-" +
                padString(transaction.number, 8)
                , 120, row);

            if (transaction.type.transactionMovement === TransactionMovement.Sale && transaction.type.movement === Movements.Outflows ||
                transaction.type.transactionMovement === TransactionMovement.Purchase && transaction.type.movement === Movements.Inflows) {
                transaction.exempt *= -1;
                transaction.totalPrice *= -1;
            }
            totalExempt += transaction.exempt;
            totalAmount += transaction.totalPrice;





            let partialTaxBase: number = 0;
            let partialTaxAmountIVA: number = 0;
            let partialTaxAmountPercep: number = 0;
            let partialImpInt: number = 0;

            if (transaction.taxes && transaction.taxes.length > 0 && transaction.taxes[0].tax) {
                for (let transactionTax of transaction.taxes) {


                    // DATOS NUMÉRICOS
                    if (transaction.type.transactionMovement === TransactionMovement.Sale && transaction.type.movement === Movements.Outflows ||
                        transaction.type.transactionMovement === TransactionMovement.Purchase && transaction.type.movement === Movements.Inflows) {
                        transactionTax.taxAmount *= -1;
                        transactionTax.taxBase *= -1;
                    }

                    let exists: boolean = false;
                    for (let transactionTaxAux of totalTaxes) {
                        if (transactionTaxAux.tax._id.toString() === transactionTax.tax._id.toString()) {
                            transactionTaxAux.taxAmount += transactionTax.taxAmount;
                            transactionTaxAux.taxBase += transactionTax.taxBase;
                            exists = true;
                        }
                    }
                    if (!exists) {
                        totalTaxes.push(transactionTax);
                    }


                    if (transactionTax.tax.classification === TaxClassification.Tax) {

                        totalTaxBase += transactionTax.taxBase;
                        partialTaxBase += transactionTax.taxBase;

                        if (transactionTax.tax.code === '04') {
                            totalImpInt += transactionTax.taxAmount;
                            partialImpInt += transactionTax.taxAmount;
                        }
                        if (transactionTax.tax.code === '3' || transactionTax.tax.code === '4' || transactionTax.tax.code === '5' || transactionTax.tax.code === '6') {
                            partialTaxAmountIVA += transactionTax.taxAmount;
                            totalTaxAmountIVA += transactionTax.taxAmount;
                        }

                    } else {
                        partialTaxAmountPercep += transactionTax.taxAmount;
                        totalTaxAmountPercep += transactionTax.taxAmount;
                    }
                }
            }

            for (let index = 0; index < this.dataIVA.length; index++) {
                if (transaction.company && transaction.company.vatCondition && this.dataIVA[index]['_id'] === transaction.company.vatCondition) {
                    this.dataIVA[index]['total'] = this.dataIVA[index]['total'] + partialTaxBase;
                }
            }

            for (let index = 0; index < this.dataClassification.length; index++) {
                let movementOfArticles: MovementOfArticle[] = await this.getMovementOfArticle(transaction._id)
                if (movementOfArticles && movementOfArticles.length !== 0) {
                    for (const element of movementOfArticles) {
                        if (element.article && element.article.classification && this.dataClassification[index]['_id'] === element.article.classification._id) {
                            this.dataClassification[index]['total'] = this.dataClassification[index]['total'] + partialTaxBase;
                        }
                    }
                }
            }

            let printGravado = "0,00";
            if ((this.roundNumber.transform(partialTaxBase)).toString().split(".")[1]) {
                if (this.roundNumber.transform(partialTaxBase).toString().split(".")[1].length === 1) {
                    printGravado = partialTaxBase.toLocaleString('de-DE') + "0";
                } else {
                    printGravado = partialTaxBase.toLocaleString('de-DE');
                }
            } else if (this.roundNumber.transform(partialTaxBase)) {
                printGravado = partialTaxBase.toLocaleString('de-DE') + ",00";
            }

            let printExempt = "0,00";
            if ((this.roundNumber.transform(transaction.exempt)).toString().split(".")[1]) {
                if (this.roundNumber.transform(transaction.exempt).toString().split(".")[1].length === 1) {
                    printExempt = transaction.exempt.toLocaleString('de-DE') + "0";
                } else {
                    printExempt = transaction.exempt.toLocaleString('de-DE');
                }
            } else if (this.roundNumber.transform(transaction.exempt)) {
                printExempt = transaction.exempt.toLocaleString('de-DE') + ",00";
            }

            let printTaxAmountÌVA = "0,00";
            if ((this.roundNumber.transform(partialTaxAmountIVA)).toString().split(".")[1]) {
                if (this.roundNumber.transform(partialTaxAmountIVA).toString().split(".")[1].length === 1) {
                    printTaxAmountÌVA = partialTaxAmountIVA.toLocaleString('de-DE') + "0";
                } else {
                    printTaxAmountÌVA = partialTaxAmountIVA.toLocaleString('de-DE');
                }
            } else if (this.roundNumber.transform(partialTaxAmountIVA)) {
                printTaxAmountÌVA = partialTaxAmountIVA.toLocaleString('de-DE') + ",00";
            }

            let printImpInt = "0,00";
            if ((this.roundNumber.transform(partialImpInt)).toString().split(".")[1]) {
                if (this.roundNumber.transform(partialImpInt).toString().split(".")[1].length === 1) {
                    printImpInt = partialImpInt.toLocaleString('de-DE') + "0";
                } else {
                    printImpInt = partialImpInt.toLocaleString('de-DE');
                }
            } else if (this.roundNumber.transform(partialImpInt)) {
                printImpInt = partialImpInt.toLocaleString('de-DE') + ",00";
            }

            let printTaxAmountPercep = "0,00";
            if ((this.roundNumber.transform(partialTaxAmountPercep)).toString().split(".")[1]) {
                if (this.roundNumber.transform(partialTaxAmountPercep).toString().split(".")[1].length === 1) {
                    printTaxAmountPercep = partialTaxAmountPercep.toLocaleString('de-DE') + "0";
                } else {
                    printTaxAmountPercep = partialTaxAmountPercep.toLocaleString('de-DE');
                }
            } else if (this.roundNumber.transform(partialTaxAmountPercep)) {
                printTaxAmountPercep = partialTaxAmountPercep.toLocaleString('de-DE') + ",00";
            }

            let printTotal = "0,00";
            if ((this.roundNumber.transform((partialTaxBase + partialTaxAmountIVA + partialTaxAmountPercep + transaction.exempt + partialImpInt))).toString().split(".")[1]) {
                if (this.roundNumber.transform((partialTaxBase + partialTaxAmountIVA + partialTaxAmountPercep + transaction.exempt + partialImpInt)).toString().split(".")[1].length === 1) {
                    printTotal = (partialTaxBase + partialTaxAmountIVA + partialTaxAmountPercep + transaction.exempt + partialImpInt).toLocaleString('de-DE') + "0";
                } else {
                    printTotal = (partialTaxBase + partialTaxAmountIVA + partialTaxAmountPercep + transaction.exempt + partialImpInt).toLocaleString('de-DE');
                }
            } else if (this.roundNumber.transform((partialTaxBase + partialTaxAmountIVA + partialTaxAmountPercep + transaction.exempt + partialImpInt))) {
                printTotal = (partialTaxBase + partialTaxAmountIVA + partialTaxAmountPercep + transaction.exempt + partialImpInt).toLocaleString('de-DE') + ",00";
            }



            this.doc.text(printGravado, 150, row);
            this.doc.text(printExempt, 175, row);
            this.doc.text(printTaxAmountÌVA, 195, row);
            this.doc.text(printImpInt, 215, row)
            this.doc.text(printTaxAmountPercep, 230, row);
            this.doc.text((printTotal), 260, row);

            row += 5;

            if (row >= 190) {

                row += 3;
                this.doc.line(0, row, 400, row);
                row += 5;

                this.doc.addPage();

                row = 10;
                this.doc.setFont("",'bold');

                this.doc.setFontSize(12);
                if (this.companyName) {
                    this.doc.text(this.companyName, 5, row);
                }

                this.doc.setFont("",'normal');
                row += 5;
                if (this.config && this.config[0] && this.config[0].companyIdentificationType) {
                    this.doc.text(this.config[0].companyIdentificationType.name + ":", 5, row);
                    this.doc.text(this.config[0].companyIdentificationValue, 25, row);
                }

                this.doc.setFont("",'bold');
                folio = folio + 1;
                this.doc.text("N° DE FOLIO:" + folio.toString(), 240, row);
                this.centerText(5, 5, 300, 0, row, "LIBRO DE IVA " + this.params.split("&")[0].toString().toUpperCase() + "S - PERÍODO " + this.params.split("&")[1].toString().toUpperCase());

                row += 3;
                this.doc.line(0, row, 400, row);
                row += 5;

                this.doc.setFontSize(9);
                this.doc.text("FECHA", 5, row);
                this.doc.text("RAZÓN SOCIAL", 25, row);
                this.doc.text("IDENTIFICADOR", 65, row);
                this.doc.text("TIPO COMP.", 95, row);
                this.doc.text("NRO. COMP.", 120, row);
                this.doc.text("GRAVADO", 150, row);
                this.doc.text("EXENTO", 175, row);
                this.doc.text("IVA", 195, row);
                this.doc.text("IMP INT", 215, row);
                this.doc.text("PERCEP.", 230, row);
                this.doc.text("TOTAL", 260, row);
                this.doc.setFontSize(8);
                this.doc.setFont("",'normal');

                row += 3;
                this.doc.line(0, row, 400, row);
                row += 5;
            }
        }

        this.doc.line(0, row, 400, row);
        row += 5;
        this.doc.setFont("",'bold');

        let printTaxBase = "0,00";
        if ((this.roundNumber.transform(totalTaxBase)).toString().split(".")[1]) {
            if (this.roundNumber.transform(totalTaxBase).toString().split(".")[1].length === 1) {
                printTaxBase = totalTaxBase.toLocaleString('de-DE') + "0";
            } else {
                printTaxBase = totalTaxBase.toLocaleString('de-DE');
            }
        } else if (this.roundNumber.transform(totalTaxBase)) {
            printTaxBase = totalTaxBase.toLocaleString('de-DE') + ",00";
        }

        let printExempt = "0,00";
        if ((this.roundNumber.transform(totalExempt)).toString().split(".")[1]) {
            if (this.roundNumber.transform(totalExempt).toString().split(".")[1].length === 1) {
                printExempt = totalExempt.toLocaleString('de-DE') + "0";
            } else {
                printExempt = totalExempt.toLocaleString('de-DE');
            }
        } else if (this.roundNumber.transform(totalExempt)) {
            printExempt = totalExempt.toLocaleString('de-DE') + ",00";
        }

        let printTaxAmountIVA = "0,00";
        if ((this.roundNumber.transform(totalTaxAmountIVA)).toString().split(".")[1]) {
            if (this.roundNumber.transform(totalTaxAmountIVA).toString().split(".")[1].length === 1) {
                printTaxAmountIVA = totalTaxAmountIVA.toLocaleString('de-DE') + "0";
            } else {
                printTaxAmountIVA = totalTaxAmountIVA.toLocaleString('de-DE');
            }
        } else if (this.roundNumber.transform(totalTaxAmountIVA)) {
            printTaxAmountIVA = totalTaxAmountIVA.toLocaleString('de-DE') + ",00";
        }

        let printImpInt = "0,00";
        if ((this.roundNumber.transform(totalImpInt)).toString().split(".")[1]) {
            if (this.roundNumber.transform(totalImpInt).toString().split(".")[1].length === 1) {
                printImpInt = totalImpInt.toLocaleString('de-DE') + "0";
            } else {
                printImpInt = totalImpInt.toLocaleString('de-DE');
            }
        } else if (this.roundNumber.transform(totalImpInt)) {
            printImpInt = totalImpInt.toLocaleString('de-DE') + ",00";
        }

        let printTaxAmountPercep = "0,00";
        if ((this.roundNumber.transform(totalTaxAmountPercep)).toString().split(".")[1]) {
            if (this.roundNumber.transform(totalTaxAmountPercep).toString().split(".")[1].length === 1) {
                printTaxAmountPercep = totalTaxAmountPercep.toLocaleString('de-DE') + "0";
            } else {
                printTaxAmountPercep = totalTaxAmountPercep.toLocaleString('de-DE');
            }
        } else if (this.roundNumber.transform(totalTaxAmountPercep)) {
            printTaxAmountPercep = totalTaxAmountPercep.toLocaleString('de-DE') + ",00";
        }

        let printAmount = "0,00";
        if ((this.roundNumber.transform(totalAmount)).toString().split(".")[1]) {
            if (this.roundNumber.transform(totalAmount).toString().split(".")[1].length === 1) {
                printAmount = totalAmount.toLocaleString('de-DE') + "0";
            } else {
                printAmount = totalAmount.toLocaleString('de-DE');
            }
        } else if (this.roundNumber.transform(totalAmount)) {
            printAmount = totalAmount.toLocaleString('de-DE') + ",00";
        }

        this.doc.text(printTaxBase, 150, row);
        this.doc.text(printExempt, 175, row);
        this.doc.text(printTaxAmountIVA, 195, row);
        this.doc.text(printImpInt, 215, row);
        this.doc.text(printTaxAmountPercep, 230, row);
        this.doc.text(printAmount, 260, row);

        this.doc.setFont("",'normal');
        row += 3;
        this.doc.line(0, row, 400, row);

        // IMPRIMIR CUADRO DE IMPUESTOS
        if (row + 56 > 190) {

            this.doc.addPage();

            row = 10;
            this.doc.setFont("",'bold');

            this.doc.setFontSize(12);
            if (this.companyName) {
                this.doc.text(this.companyName, 5, row);
            }

            this.doc.setFont("",'normal');
            row += 5;
            if (this.config && this.config[0] && this.config[0].companyIdentificationType) {
                this.doc.text(this.config[0].companyIdentificationType.name + ":", 5, row);
                this.doc.text(this.config[0].companyIdentificationValue, 25, row);
            }

            this.doc.setFont("",'bold');
            folio = folio + 1;
            this.doc.text("N° DE FOLIO:" + folio.toString(), 240, row);
            this.centerText(5, 5, 300, 0, row, "LIBRO DE IVA " + this.params.split("&")[0].toString().toUpperCase() + "S - PERÍODO " + this.params.split("&")[1].toString().toUpperCase());
            this.doc.setFont("",'normal');

            row += 3;
            this.doc.line(0, row, 400, row);
            row += 5;
        }
        row += 10;
        let rowInitial = row;
        let rowFinal;
        // LINEA HORIZONTAL ARRIBA ENCABEZADO
        this.doc.line(10, row, 105, row);
        row += 5;

        this.doc.setFont("",'bold');
        this.doc.setFontSize(9);
        this.doc.text("TOTALES POR IMPUESTO", 35, row);
        this.doc.setFontSize(8);
        this.doc.setFont("",'normal');

        row += 3;
        // LINEA HORIZONTAL DEBAJO ENCABEZADO
        this.doc.line(10, row, 105, row);
        row += 5;

        this.doc.setFont("",'bold');
        this.doc.setFontSize(9);
        this.doc.text("IMPUESTO", 15, row);
        this.doc.text("GRAVADO", 55, row);
        this.doc.text("MONTO", 85, row);
        this.doc.setFontSize(8);
        this.doc.setFont("",'normal');

        row += 3;
        // LINEA HORIZONTAL DEBAJO ENCABEZADO

        this.doc.line(10, row, 105, row);
        row += 5;

        for (let tax of totalTaxes) {

            let printTaxBase = "0,00";
            if ((this.roundNumber.transform(tax.taxBase)).toString().split(".")[1]) {
                if (this.roundNumber.transform(tax.taxBase).toString().split(".")[1].length === 1) {
                    printTaxBase = tax.taxBase.toLocaleString('de-DE') + "0";
                } else {
                    printTaxBase = tax.taxBase.toLocaleString('de-DE');
                }
            } else if (this.roundNumber.transform(tax.taxBase)) {
                printTaxBase = tax.taxBase.toLocaleString('de-DE') + ",00";
            }

            let printTaxAmount = "0,00";
            if ((this.roundNumber.transform(tax.taxAmount)).toString().split(".")[1]) {
                if (this.roundNumber.transform(tax.taxAmount).toString().split(".")[1].length === 1) {
                    printTaxAmount = tax.taxAmount.toLocaleString('de-DE') + "0";
                } else {
                    printTaxAmount = tax.taxAmount.toLocaleString('de-DE');
                }
            } else if (this.roundNumber.transform(tax.taxAmount)) {
                printTaxAmount = tax.taxAmount.toLocaleString('de-DE') + ",00";
            }

            this.doc.text(tax.tax.name, 15, row);
            this.doc.text(printTaxBase, 55, row);
            this.doc.text(printTaxAmount, 85, row);
            row += 5;
        }

        // LINEA HORIZONTAL FINAL
        this.doc.line(10, row, 105, row);
        // LINEA VERTICAL IZQUIERDA
        rowFinal = row;
        this.doc.line(10, rowInitial, 10, rowFinal);
        // LINEA VERTICAL DERECHA
        this.doc.line(105, rowInitial, 105, rowFinal);

        row += 5;

        //TOTALES POR CLASSIFICACION
        this.doc.line(10, row, 105, row);
        row += 5;

        this.doc.setFont("",'bold');
        this.doc.setFontSize(9);
        this.doc.text("TOTALES POR CLASIFICACIÓN", 35, row);
        this.doc.setFontSize(8);
        this.doc.setFont("",'normal');

        row += 3;
        // LINEA HORIZONTAL DEBAJO ENCABEZADO
        this.doc.line(10, row, 105, row);
        row += 5;

        this.doc.setFont("",'bold');
        this.doc.setFontSize(9);
        this.doc.text("CLASIFICACION", 15, row);
        this.doc.text("MONTO", 85, row);
        this.doc.setFontSize(8);
        this.doc.setFont("",'normal');

        row += 3;
        // LINEA HORIZONTAL DEBAJO ENCABEZADO

        this.doc.line(10, row, 105, row);
        row += 5;

        this.dataClassification.forEach(element => {

            this.doc.text(element['name'], 15, row);
            this.doc.text(element['total'].toLocaleString('de-DE'), 85, row);
            row += 5;

        });

        // LINEA HORIZONTAL FINAL
        this.doc.line(10, row, 105, row);
        // LINEA VERTICAL IZQUIERDA
        rowFinal = row;
        this.doc.line(10, rowInitial, 10, rowFinal);
        // LINEA VERTICAL DERECHA
        this.doc.line(105, rowInitial, 105, rowFinal);


        //TOTALES POR REGIMEN
        row = rowInitial;
        // LINEA HORIZONTAL ARRIBA ENCABEZADO
        this.doc.line(140, row, 245, row);
        row += 5;

        this.doc.setFont("",'bold');
        this.doc.setFontSize(9);
        this.doc.text("TOTALES POR REGIMEN", 175, row);
        this.doc.setFontSize(8);
        this.doc.setFont("",'normal');

        row += 3;
        // LINEA HORIZONTAL DEBAJO ENCABEZADO
        this.doc.line(140, row, 245, row);
        row += 5;

        this.doc.setFont("",'bold');
        this.doc.setFontSize(9);
        this.doc.text("REGIMEN", 145, row);
        this.doc.text("MONTO", 225, row);
        this.doc.setFontSize(8);
        this.doc.setFont("",'normal');

        row += 3;
        // LINEA HORIZONTAL DEBAJO ENCABEZADO

        this.doc.line(140, row, 245, row);
        row += 5;

        this.dataIVA.forEach(element => {

            this.doc.text(element['description'], 145, row);
            this.doc.text(element['total'].toLocaleString('de-DE'), 225, row);
            row += 5;

        });

        // LINEA HORIZONTAL FINAL
        this.doc.line(140, row, 245, row);
        // LINEA VERTICAL IZQUIERDA
        rowFinal = row;
        this.doc.line(140, rowInitial, 140, rowFinal);
        // LINEA VERTICAL DERECHA
        this.doc.line(245, rowInitial, 245, rowFinal);


        this.finishImpression();
    }

    async getMovementOfArticle(id: string): Promise<MovementOfArticle[]> {
        return new Promise<MovementOfArticle[]>((resolve, reject) => {

            this.loading = true;

            let query = 'where="transaction":"' + id + '"';

            this._movementOfArticleService.getMovementsOfArticles(query).subscribe(
                result => {
                    if (!result.movementsOfArticles) {
                        resolve(null)
                    } else {
                        resolve(result.movementsOfArticles);
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    resolve(null)
                }
            );
        })
    }

    public finishImpression(): void {

        this.doc.autoPrint();
        this.pdfURL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.doc.output('bloburl'));

    }

    public centerText(lMargin, rMargin, pdfInMM, startPdf, height, text): void {

        if (text) {
            let pageCenter = pdfInMM / 2;

            let lines = this.doc.splitTextToSize(text, (pdfInMM - lMargin - rMargin));
            let dim = this.doc.getTextDimensions(text);
            let lineHeight = dim.h;
            if (lines && lines.length > 0) {
                for (let i = 0; i < lines.length; i++) {
                    let lineTop = (lineHeight / 2) * i;
                    this.doc.text(text, pageCenter + startPdf, height, lineTop, 'center')
                }
            }
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
