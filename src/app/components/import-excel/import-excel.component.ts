import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, FormControl} from '@angular/forms';
import {Router} from '@angular/router';
import {NgbAlertConfig, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

import {CompanyService} from '../company/company.service';

// import { ImportService } from './import.service';
import {ImportExcelService} from './import-excel.service';

@Component({
  selector: 'add-import-excel',
  templateUrl: './import-excel.component.html',
  styleUrls: ['./import-excel.component.scss'],
  providers: [NgbAlertConfig],
})
export class importExcelComponent implements OnInit {
  filePath: string = ''; //Ruta de archivo a importar
  importForm: FormGroup;
  providers: Array<object>;
  alertMessage: string = '';
  userType: string;
  loading: boolean = false;
  file: Array<File>;
  result: Array<any>;
  status200: Array<any> = [];
  status500: Array<any> = [];
  statusCode: Array<any> = [];
  formErrors = {
    filePath: '',
  };
  type: string = '';
  validationMessages = {
    filePath: {
      required: 'Este campo es requerido.',
    },
  };
  countArticles: any;

  constructor(
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _importExcelService: ImportExcelService,
    public _companyService: CompanyService,
  ) {
    this.importForm = new FormGroup({
      filePath: new FormControl(),
      selectProvider: new FormControl(),
    });
  }
  ngOnInit(): void {
    this.showMessage('', '', false);
    if (this._router.url === '/admin/clientes') {
      this.type = 'clientes';
    }
    this.getProviders();
  }
  onFileChange(e) {
    this.file = <Array<File>>e.target.files;
    if (this.file[0].name.substr(-4) != 'xlsx') {
      this.showMessage('ingresar excel .xlsx', 'danger', true);
    } else {
      //verificamos el tamaño del archivo que no sea mayor a 1mb
      //1mb = 1.000.000 bytes
      if (this.file[0].size > 1000000) return this.showMessage('Este Archivo es muy grande para ser procesado, Porfavor vuelva a ingresar el archivo que no supere 1Mb!', 'danger', true);
    }
  }

  downloadFile() {
    let link = document.createElement('a');

    link.download = 'filename';
    link.href = 'assets/img/default.jpg';
    link.click();
  }

  getProviders(): void {
    this._importExcelService
      .getCompaniesV2(
        {_id: 1, name: 1, type: 1},
        {type: 'Proveedor', operationType: {$ne: 'D'}},
        {name: 1},
        {},
      )
      .subscribe((r) => {
        this.providers = r.companies;
      });
  }
  import() {
    this.loading = true;
    this._importExcelService
      .import(this.file, this.type, this.importForm.value.selectProvider)
      .then(async (r) => {
        for (let x = 0; x < r.length; x++) {
          if (r[x].status == 200) {
            this.status200.push(r[x]);
            this.countArticles = r[x].countArticle;
          } else if (
            r[x].message == 'No se encontro el articulo con el codigo' &&
            r[x].status == 500
          ) {
            this.status500.push(r[x]);
          } else if (
            r[x].message == 'No se ingreso ningun codigo' &&
            r[x].status == 500
          ) {
            this.statusCode.push(r[x]);
          }
          // CLientes
          else if (r[x].message == 'err' && r[x].status == 500) {
            this.status500.push(r[x]);
          }
          // create article
          else if (r[x].message == 'articulo existente' && r[x].status == 500) {
            this.statusCode.push(r[x]);
          }
        }
        this.loading = false;
      })
      .catch(async (e) => {
        this.showMessage(e.message, 'danger', true);
      });
  }

  ngAfterViewInit() {}

  handleFileInput(files: File) {}

  showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
    this.loading = false;
  }

  hideMessage(): void {
    this.alertMessage = '';
  }
}
