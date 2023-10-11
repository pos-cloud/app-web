import {
  Component,
  OnInit,
  EventEmitter,
  Input,
  ViewEncapsulation,
  Output,
} from '@angular/core';
import {UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormArray, NgForm} from '@angular/forms';
import {Router} from '@angular/router';
import {NgbAlertConfig, NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ConfigService} from 'app/components/config/config.service';

import {PrintTransactionTypeComponent} from '../../print/print-transaction-type/print-transaction-type.component';
import {Printer, PrinterType, PrinterPrintIn, PositionPrint} from '../printer';
import {PrinterService} from '../printer.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-add-printer',
  templateUrl: './printer.component.html',
  styleUrls: ['./printer.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None,
})
export class PrinterComponent implements OnInit {
  @Input() printerId: string;
  @Input() readonly: boolean;
  @Input() operation: string;
  public printer: Printer;
  public types: PrinterType[] = [PrinterType.PDF];
  printIn2: string;
  public printsIn: PrinterPrintIn[] = [
    PrinterPrintIn.Counter,
    PrinterPrintIn.Kitchen,
    PrinterPrintIn.Bar,
    PrinterPrintIn.Label,
    PrinterPrintIn.Voucher,
  ];
  public positions: any[] = [
    PositionPrint.Header,
    PositionPrint.Body,
    PositionPrint.Footer,
  ];
  public printerForm: UntypedFormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public pageSizes: string[] = ['A4', 'Etiqueta', 'Roll Paper', 'Personalizado'];
  public pdfURL;
  public doc;
 
  fontList = {}; // La lista de fuentes
  selectedFontName = 'default'; // Fuente seleccionada
  selectedFontStyle = 'normal'; // Variante de fuente seleccionada
  fontListKeys: string[] = [];

  // valores del add
  public position;
  public type;
  public collection; 
  public value;
  public font = 'default';
  public fontType = 'normal';
  public fontSize = 5;
  public positionStartX;
  public positionStartY;
  public positionEndX;
  public positionEndY;
  public splitting;
  public label;

  public documents: string[];

  public formErrors = {
    name: '',
    connectionURL: '',
    type: '',
    printIn: '',
  };

  public validationMessages = {
    name: {
      required: 'Este campo es requerido.',
    },
    connectionURL: {},
    type: {
      required: 'Este campo es requerido.',
    },
    printIn: {},
  };

  constructor(
    public _printerService: PrinterService,
    public _configService: ConfigService,
    public _fb: UntypedFormBuilder,
    public _router: Router,
    public _modalService: NgbModal,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
  ) {
    this.documents = new Array();
  }

  ngOnInit(): void {
    let pathLocation: string[] = this._router.url.split('/');

    this.userType = pathLocation[1];
    this.printer = new Printer();
    this.buildForm();
    this.updatePageSize();

    if(this.fontList){
      this.getFontList();
    }

    if (this.printerId) {
      this.getPrinter();
    }
  }

  getFontList(): void {
    const pdf = new jsPDF();
    this.fontList = pdf.getFontList();
  
    this.fontList = Object.keys(this.fontList).reduce((filteredFonts, fontName) => {
  
      if (/^[A-Z]/.test(fontName)) { 
        filteredFonts[fontName] = this.fontList[fontName];
      }
      return filteredFonts;
    }, {});
    const removeFonts = ['ZapfDingbats', 'Symbol'];
 
    for (const removeFont of removeFonts) {
      delete this.fontList[removeFont];
    }

    for (const font in this.fontList) {
    this.fontList[font] = this.fontList[font].filter(fontStyle => fontStyle !== '');
    }

    this.fontListKeys = Object.keys(this.fontList);
  }

  public getDocuments(): void {
    let collection = this.collection
      .replace(/\.?([A-Z])/g, function (x, y) {
        return '-' + y.toLowerCase();
      })
      .replace(/^_/, '');

    this._configService.getModel(collection).subscribe(
      (result) => {
        this.documents = new Array();
        if (this.collection === 'config') {
          for (let i = 0; i < result.model.length; i++) {
            if (result.model[i].slice(0, 7) === 'company') {
              this.documents.push(result.model[i]);
            }
          }
        } else if (this.collection === 'movementOfCancellation') {
          for (let i = 0; i < result.model.length; i++) {
            if (result.model[i].slice(0, 17) === 'transactionOrigin') {
              this.documents.push(result.model[i]);
            }
          }
        } else {
          this.documents = result.model;
        }
      },
      (error) => {},
    );
  }

  public buildPDF(): void {
    let modalRef;

    modalRef = this._modalService.open(PrintTransactionTypeComponent);
    modalRef.componentInstance.origin = 'view';
    modalRef.componentInstance.printer = this.printerForm.value;
  }

  public getPrinter(): void {
    this._printerService.getPrinter(this.printerId).subscribe(
      (result) => {
        if (!result.printer) {
          if (result.message && result.message !== '')
            this.showMessage(result.message, 'info', true);
        } else {
          this.hideMessage();
          this.printer = result.printer;
          this.setValueForm();
        }
        this.loading = false;
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      },
    );
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {
    this.printerForm = this._fb.group({
      _id: [this.printer._id, []],
      name: [this.printer.name, [Validators.required]],
      type: [this.printer.type, [Validators.required]],
      pageWidth: [this.printer.pageWidth, []],
      pageHigh: [this.printer.pageHigh, []],
      labelHigh: [this.printer.labelHigh, []],
      labelWidth: [this.printer.labelWidth, []],
      printIn: [this.printer.printIn, []],
      pageSize: [this.pageSizes[0], []],
      quantity: [this.printer.quantity, []],
      url: [this.printer.url, []],
      orientation: [this.printer.orientation, []],
      row: [this.printer.row, []],
      addPag: [this.printer.addPag, []],
      fields: this._fb.array([]),
    });

    this.printerForm.valueChanges.subscribe((data) => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public addField(fieldForm: NgForm): void {
    let valid = true;
    const fields = this.printerForm.controls.fields as UntypedFormArray;

    if (valid) {
      let field = {
        _id: null,
        type: fieldForm.value.type,
        label: fieldForm.value.label,
        value: fieldForm.value.value,
        font: fieldForm.value.font,
        fontType: fieldForm.value.fontType,
        fontSize: fieldForm.value.fontSize,
        positionStartX: fieldForm.value.positionStartX,
        positionStartY: fieldForm.value.positionStartY,
        positionEndX: fieldForm.value.positionEndX,
        positionEndY: fieldForm.value.positionEndY,
        splitting: fieldForm.value.splitting,
        colour: fieldForm.value.colour,
        position: fieldForm.value.position,
      };

      fields.push(this._fb.group(field));

      this.addPrinter();
    }
  }

  public editField(data, i): void {
    //this.deleteField(i);

    (this.type = data.value.type),
      (this.label = data.value.label),
      (this.value = data.value.value),
      (this.font = data.value.font),
      (this.fontType = data.value.fontType),
      (this.fontSize = data.value.fontSize),
      (this.positionStartX = data.value.positionStartX),
      (this.positionStartY = data.value.positionStartY),
      (this.positionEndX = data.value.positionEndX),
      (this.positionEndY = data.value.positionEndY),
      (this.splitting = data.value.splitting),
      (this.position = data.value.position);
  }

  deleteField(index) {
    let control = <UntypedFormArray>this.printerForm.controls.fields;

    control.removeAt(index);
    this.addPrinter();
  }

  public onValueChanged(data?: any): void {
    if (!this.printerForm) {
      return;
    }
    const form = this.printerForm;

    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);

      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];

        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  public updatePageSize(): void {
    switch (this.printerForm.value.pageSize) {
      case 'A4':
        this.printer.pageWidth = 210;
        this.printer.pageHigh = 297;
        break;
      case 'Roll Paper':
        this.printer.pageWidth = 80;
        this.printer.pageHigh = 297;
        break;
      case 'Etiqueta':
        this.printer.pageWidth = 29;
        this.printer.pageHigh = 62;
        break;
      case 'Personalizado':
        this.printer.pageWidth = 0;
        this.printer.pageHigh = 0;
        break;
    }

    this.printer.name = this.printerForm.value.name;
    this.printer.type = this.printerForm.value.type;
    this.printer.printIn = this.printerForm.value.printIn;

    this.setValueForm();
  }

  public setValueForm(): void {
    if (!this.printer._id) this.printer._id = '';
    if (!this.printer.name) this.printer.name = '';
    if (!this.printer.type) this.printer.type = PrinterType.PDF;
    if (!this.printer.pageWidth) this.printer.pageWidth = 0;
    if (!this.printer.pageHigh) this.printer.pageHigh = 0;
    if (!this.printer.printIn) this.printer.printIn = PrinterPrintIn.Counter;
    if (!this.printer.orientation) this.printer.orientation = '';
    if (!this.printer.row) this.printer.row = 0;
    if (!this.printer.addPag) this.printer.addPag = 0;
    if (!this.printer.url) this.printer.url = '';
    if (!this.printer.quantity) this.printer.quantity = 1;
    if (!this.printer.labelHigh) this.printer.labelHigh = 0;
    if (!this.printer.labelWidth) this.printer.labelWidth = 0;

    const values = {
      _id: this.printer._id,
      name: this.printer.name,
      type: this.printer.type,
      pageWidth: this.printer.pageWidth,
      pageHigh: this.printer.pageHigh,
      labelWidth: this.printer.labelWidth,
      labelHigh: this.printer.labelHigh,
      printIn: this.printer.printIn,
      pageSize: this.printerForm.value.pageSize,
      orientation: this.printer.orientation,
      row: this.printer.row,
      addPag: this.printer.addPag,
      url: this.printer.url,
      quantity: this.printer.quantity,
    };

    if (this.printer.fields && this.printer.fields.length > 0) {
      let fields = <UntypedFormArray>this.printerForm.controls.fields;

      this.printer.fields.forEach((x) => {
        fields.push(
          this._fb.group({
            _id: null,
            type: x.type,
            label: x.label,
            value: x.value,
            font: x.font,
            fontType: x.fontType,
            fontSize: x.fontSize,
            positionStartX: x.positionStartX,
            positionStartY: x.positionStartY,
            positionEndX: x.positionEndX,
            positionEndY: x.positionEndY,
            splitting: x.splitting,
            colour: x.colour,
            position: x.position,
          }),
        );
      });
    }

    this.printerForm.patchValue(values);
  }

  public addPrinter(): void {
    this.printer = this.printerForm.value;
    switch (this.operation) {
      case 'add':
        this.savePrinter();
        break;
      case 'update':
        this.updatePrinter();
        break;
      case 'delete':
        this.deletePrinter();
      default:
        break;
    }
  }

  public savePrinter(): void {
    this.loading = true;

    this._printerService.savePrinter(this.printer).subscribe(
      (result) => {
        if (!result.printer) {
          if (result.message && result.message !== '')
            this.showMessage(result.message, 'info', true);
        } else {
          this.printer = result.printer;
          this.showMessage('La impresora se ha añadido con éxito.', 'success', true);
          this.printer = new Printer();
          this.buildForm();
        }
        this.loading = false;
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      },
    );
  }

  public updatePrinter(): void {
    this.loading = true;

    this._printerService.updatePrinter(this.printer).subscribe(
      (result) => {
        if (!result.printer) {
          if (result.message && result.message !== '')
            this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.showMessage('La impresora se ha actualizado con éxito.', 'success', true);
          this.loading = false;
        }
        this.loading = false;
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      },
    );
  }

  public deletePrinter(): void {
    this.loading = true;
    this._printerService.deletePrinter(this.printer._id).subscribe(
      (result) => {
        this.activeModal.close('close');
        this.loading = false;
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      },
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
