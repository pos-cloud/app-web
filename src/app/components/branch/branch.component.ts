import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';


import { BranchService } from '../../services/branch.service';

import { Branch } from '../../models/branch';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Config } from 'app/app.config';
import { ConfigService } from 'app/services/config.service';

@Component({
  selector: 'app-branch',
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.css'],
  providers: [NgbAlertConfig]
})

export class BranchComponent implements OnInit {

  @Input() operation: string;
  @Input() readonly: boolean;
  @Input() branchId : string;
  public alertMessage: string = '';
  public userType: string;
  public branch: Branch;
  public areBranchEmpty: boolean = true;
  public orderTerm: string[] = ['name'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public userCountry: string;
  public orientation: string = 'horizontal';
  public branches: Branch[];
  public filesToUpload;
  public imageURL;
  public config : Config;

  public formErrors = {
    'number': '',
    'name': ''
  };

  public validationMessages = {
    'number': {
      'required': 'Este campo es requerido.'
    },
    'name': {
      'required': 'Este campo es requerido.'
    }
  };

  public branchForm: FormGroup;

  constructor(
    public alertConfig: NgbAlertConfig,
    public _branchService: BranchService,
    public _router: Router,
    public _fb: FormBuilder,
    public activeModal: NgbActiveModal,
    public _configService : ConfigService
  ) {
    this.getBranches();
    if(window.screen.width < 1000) this.orientation = 'vertical';
    this.branch = new Branch();
  }

  async ngOnInit() {
    this.userCountry = Config.country;

    await this._configService.getConfig.subscribe(
      config => {
        this.config = config;
      }
    );

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];;
    this.buildForm();
    
    if (this.branchId) {
      this.getBranch();
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getBranch() {

    this.loading = true;

    this._branchService.getBranch(this.branchId).subscribe(
      result => {
        if (!result.branch) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.hideMessage();
          this.branch = result.branch;
          if (this.branch.image && this.branch.image !== 'default.jpg') {
            this.imageURL = Config.apiURL + 'get-image-branch/'+ this.branch.image +"/"+ Config.database;
          } else {
            this.imageURL = './../../../assets/img/default.jpg';
          }
          this.setValueForm();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public setValueForm(): void {
   
    if (!this.branch._id) { this.branch._id = ''; }
    if (!this.branch.number) { this.branch.number = 0; }
    if (!this.branch.name) { this.branch.name = ''; }
    if (!this.branch.default) { this.branch.default = false };
    if (!this.branch.image) { this.branch.image = ''; }

    const values = {
      '_id': this.branch._id,
      'number': this.branch.number,
      'name': this.branch.name,
      'default' : this.branch.default,
      'image' : this.branch.image
    };
    this.branchForm.setValue(values);
  }

  public buildForm(): void {

    this.branchForm = this._fb.group({
      '_id' : [this.branch._id, []],
      'number': [this.branch.number, [
        Validators.required
        ]
      ],
      'name': [this.branch.name, [
        Validators.required
        ]
      ],
      'default': [this.branch.default, [
        Validators.required
        ]
      ],
      'image': [this.branch.image, [
        ]
      ]
    });

    this.branchForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {

    if (!this.branchForm) { return; }
    const form = this.branchForm;

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

  public addBranch() {

    switch (this.operation) {
      case 'add':
        this.saveBranch();
        break;
      case 'edit':
        this.updateBranch();
        break;
      case 'delete' :
        this.deleteBranch();
      default:
        break;
    }
  }

  public updateBranch() {

    this.loading = true;

    this.branch = this.branchForm.value;

    if(this.isValid()){
      this._branchService.updateBranch(this.branch).subscribe(
        result => {
          if (!result.branch) {
            this.loading = false;
            if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
          } else {
            if (this.filesToUpload) {
              this._branchService.makeFileRequest(result.branch, this.filesToUpload)
                .then(
                  (result) => {
                    this.branch.image = result["filename"];
                    this.showMessage('La sucursal se ha añadido con éxito.', 'success', false);
                    this.loading = false;
                    this.branch = new Branch();
                    this.buildForm();
                  },
                  (error) => {
                    this.showMessage(error, 'danger', false);
                    this.loading = false;
                  }
                );
            } else {
              this.showMessage('La sucursal se ha añadido con éxito.', 'success', false);
              this.loading = false;
              this.branch = new Branch();
              this.buildForm();
            }
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
    } else {
      this.loading = false;
    }
  }

  public saveBranch() {

    this.loading = true;

    this.branch = this.branchForm.value;

    if(true){
      this._branchService.saveBranch(this.branch).subscribe(
        result => {
          if (!result.branch) {
            this.loading = false;
            if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
          } else {
            
              if (this.filesToUpload) {
                this._branchService.makeFileRequest(result.branch, this.filesToUpload)
                  .then(
                    (result) => {
                      this.branch.image = result["filename"];
                      this.showMessage('La sucursal se ha añadido con éxito.', 'success', false);
                      this.loading = false;
                      this.branch = new Branch();
                      this.buildForm();
                    },
                    (error) => {
                      this.showMessage(error, 'danger', false);
                      this.loading = false;
                    }
                  );
              } else {
                this.showMessage('La sucursal se ha añadido con éxito.', 'success', false);
                this.loading = false;
                this.branch = new Branch();
                this.buildForm();
              }
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
    } else {
      this.loading = false;
    }
  }

  public deleteBranch() {

    this.loading = true;

    this._branchService.deleteBranch(this.branch._id).subscribe(
      result => {
        this.loading = false;
        if (!result.branch) {
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
            this.activeModal.close();
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public isValid() : boolean {
    
    let valid = true;

    if(this.branches && this.branches.length > 0 && this.branch.default !== null) {
      for (const element of this.branches) {
        if(this.branch.default === true && element.default === this.branch.default) {
          this.showMessage("Solo puede existir una sucursal principal.", 'danger', true);
          valid = false;
        }
      }
    }
    
    return valid
  }

  public getBranches() : void {

    this.loading = true;

    let match = `{ "operationType": { "$ne": "D" } }`;

    match = JSON.parse(match);

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project = {
      default : 1,
      operationType: 1
    }

    // AGRUPAMOS EL RESULTADO
    let group = {
        _id: null,
        branches: { $push: "$$ROOT" }
    };

    this._branchService.getBranches(
        project, // PROJECT
        match, // MATCH
        {}, // SORT
        group, // GROUP
        0, // LIMIT
        0 // SKIP
    ).subscribe(
      result => {
        this.loading = false;
        if (result && result[0] && result[0].branches) {
          this.branches = result[0].branches;
        } else {
          this.branches = new Array();
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public deletePicture(): void {

    this.loading = true;

    this._branchService.deletePicture(this.branch._id).subscribe(
      result => {
        if (!result.branch) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          this.branch = result.branch[0];
          this.showMessage("Los cambios fueron guardados con éxito.", "success", false);
          this.getBranch();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    )
  }

  public fileChangeEvent(fileInput: any) {
    this.filesToUpload = <Array<File>> fileInput.target.files;
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


