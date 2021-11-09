import { Component, OnInit, EventEmitter, Input } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormControl } from "@angular/forms";
import { Router } from "@angular/router";

import { NgbAlertConfig, NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

import { CompanyService } from "../company/company.service";
// import { ImportService } from './import.service';
import { ImportExcelService } from './import-excel.service';

@Component({
  selector: "add-import-excel",
  templateUrl: "./import-excel.component.html",
  styleUrls: ["./import-excel.component.scss"],
  providers: [NgbAlertConfig],
})
export class importExcelComponent implements OnInit {
  public filePath: string = ""; //Ruta de archivo a importar
  public importForm: FormGroup;
  public providers: Array<object>;
  public alertMessage: string = "";
  public userType: string;
  public loading: boolean = false;
  public file: Array<File>;
  public result: Array<any>;
  public status200: Array<any> = [];
  public status500: Array<any> = [];
  public statusCode: Array<any> = [];
  public formErrors = {
    filePath: "",
  };
  public type: string = '';
  public validationMessages = {
    filePath: {
      required: "Este campo es requerido.",
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
      selectProvider: new FormControl()
    })
  }
  ngOnInit(): void {
    this.showMessage('', '', false)
    if (this._router.url === '/admin/clientes') {
      this.type = 'clientes'
    }
    this.getProviders()
  }
  onFileChange(e) {
    this.file = <Array<File>>e.target.files;
    if (this.file[0].name.substr(-4) != 'xlsx') {
      this.showMessage('ingresar excel .xlsx', 'danger', true)
    } else {
      this.showMessage('', '', false)
    }
  }

  downloadFile() {
    let link = document.createElement("a");
    link.download = "filename";
    link.href = "assets/img/default.jpg";
    link.click();
  }
  public getProviders(): void {

    this._importExcelService.getCompaniesV2(
      { _id: 1, name: 1, type: 1 },
      { type: 'Proveedor', operationType: { $ne: 'D' } },
      { name: 1 },
      {}
    ).subscribe(r => {
      this.providers = r.companies
    })

  }
  import() {
    // this.loading = true;
    // console.log()
    this._importExcelService.import(this.file, this.type, this.importForm.value.selectProvider)
      .then(async (r) => {
        for (let x = 0; x < r.length; x++) {
          if (r[x].status == 200) {
            this.status200.push(r[x])
            this.countArticles = r[x].countArticle 
          } else if (r[x].message == 'No se encontro el articulo con el codigo' && r[x].status == 500) {
            this.status500.push(r[x])
          } else if (r[x].message == 'No se ingreso ningun codigo' && r[x].status == 500) {
            this.statusCode.push(r[x])
          }
          // CLientes
          else if (r[x].message == 'err' && r[x].status == 500) {
            this.status500.push(r[x])
          }
          // create article
          else if (r[x].message == 'articulo existente' && r[x].status == 500) {
            this.statusCode.push(r[x])
          }
        }
        this.loading = false;
      })
      .catch(async (e) => {
        e
      });

  }

  ngAfterViewInit() {
  }

  public handleFileInput(files: File) { }

  public showMessage(
    message: string,
    type: string,
    dismissible: boolean
  ): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = "";
  }
}
