import { Component, OnInit, EventEmitter, Input } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from "@angular/forms";
import { Router } from "@angular/router";

import { NgbAlertConfig, NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

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
  public alertMessage: string = "";
  public userType: string;
  public loading: boolean = false;
  public file:  Array<File>;

  public formErrors = {
    filePath: "",
  };

  public validationMessages = {
    filePath: {
      required: "Este campo es requerido.",
    },
  };
 
  constructor(
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _importExcelService: ImportExcelService,
  ) {
    this.importForm = new FormGroup({
      filePath: new FormControl(),
    })
  }
  ngOnInit(): void {
    this.showMessage('', '', false)

  }
  onFileChange(e){
    this.file = <Array<File>>e.target.files;
    if(this.file[0].name.substr(-4) != 'xlsx'){
      this.showMessage('ingresar excel .xlsx', 'danger', true)
    }else{
      this.showMessage('', '', false)
    }
  }

  downloadFile(){
    let link = document.createElement("a");
    link.download = "filename";
    link.href = "assets/img/default.jpg";
    link.click();
}

  import(){
    this.loading = true;
    this._importExcelService.import(this.file)
    .then(async (r)=>{
      this.showMessage(r.message, 'success', true)
      this.loading = false;
    })
    .catch(async (e)=>{
      e
    });
  }
  
  ngAfterViewInit() {
  }

  public handleFileInput(files: File) {}

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
