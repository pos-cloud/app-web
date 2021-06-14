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
import { ImportExcelService } from './importExcel.service';

@Component({
  selector: "add-import-excel",
  templateUrl: "./importExcel.component.html",
  styleUrls: ["./importExcel.component.scss"],
  providers: [NgbAlertConfig],
})
export class importExcel implements OnInit {
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
      filePath2: new FormControl()
    })
  }
  ngOnInit(): void {

  }
  onFileChange(e){
    this.file = <Array<File>>e.target.files;
    console.log('file', this.file);
  }

  import(){
    this._importExcelService.import(this.file);
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
