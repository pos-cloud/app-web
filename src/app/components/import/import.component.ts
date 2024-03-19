import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { ImportService } from './import.service';
import { Branch } from 'app/components/branch/branch';
import { Deposit } from 'app/components/deposit/deposit'
import { ToastrService } from 'ngx-toastr';
import { TranslateMePipe } from '../../main/pipes/translate-me';

@Component({
  selector: 'add-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.css'],
  providers: [NgbAlertConfig, TranslateMePipe],
})

export class ImportComponent implements OnInit {

  @Input() branches: Branch[];
  @Input() allDeposits: any[];
  @Input() model: string;
  branchesSelected: Branch[] = new Array();
  depositsSelected: Deposit[] = new Array();
  depositsData: Deposit[] = new Array();
  alertMessage: string = '';
  countNotUpdate: number;
  countUpdate: number;
  notUpdate: string[];
  update: string[];
  errorMessage: string;
  public importForm: UntypedFormGroup;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  dropdownSettings = {
    singleSelection: true,
    defaultOpen: false,
    idField: '_id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    enableCheckAll: true,
    itemsShowLimit: 3,
    allowSearchFilter: true,
  };

  constructor(
    public _excelUpdateService: ImportService,
    public _fb: UntypedFormBuilder,
    public alertConfig: NgbAlertConfig,
    public activeModal: NgbActiveModal,
    public translatePipe: TranslateMePipe,
    private _toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.buildForm();
  }

  public buildForm(): void {
    this.importForm = this._fb.group({
      'file': [null, [
        Validators.required
      ]]
    });

    this.importForm.valueChanges.subscribe(() => this.onValueChanged());
    this.onValueChanged();
  }

  onBranchSelect(branch: Branch) {
    const branchId = branch._id
    const filteredDeposits = this.allDeposits.filter(deposit => deposit.branch === branchId)

    const uniqueDepositIds = new Set<string>();

    const uniqueDeposits = filteredDeposits.filter(deposit => {
      if (!uniqueDepositIds.has(deposit._id)) {
        uniqueDepositIds.add(deposit._id);
        return true;
      }
      return false;
    });

    this.depositsData = uniqueDeposits

  }

  public onValueChanged(): void {
    // Aquí puedes implementar validaciones adicionales si las necesitas
  }

  public import(): void {
    if (this.importForm.valid) {
      const inputElement: HTMLInputElement = document.getElementById('fileInput') as HTMLInputElement;
      const file: File = inputElement.files[0]; // Obtener el primer archivo seleccionado

      this.loading = true;

      if (this.model === 'articles-stock') {
        this._excelUpdateService.importStock(file, this.depositsSelected[0]._id, this.branchesSelected[0]._id).subscribe(
          response => {
            if (response.status == 200) {
              this.countNotUpdate = response.result.countNotUpdate;
              this.countUpdate = response.result.countUpdate;
              this.notUpdate= response.result.notUpdateArticle;
              this.update = response.result.updateArticle;
              this.loading = false;
            } else {
              this.showToast(response.error, 'danger')
              this.loading = false;
            }
          },
        );
      } else if (this.model === 'articles') {
        this._excelUpdateService.importArticle(file).subscribe(
          response => {
            if (response.status == 200) {
              this.countNotUpdate = response.result.countNotUpdate;
              this.countUpdate = response.result.countUpdate;
              this.notUpdate = response.result.notUpdateArticle;
              this.update = response.result.updateArticle;
              this.loading = false;
            } else {
              this.showToast(response.error, 'danger')
              this.loading = false;
            }
          },
        );
      } else if (this.model === 'company') {
        this._excelUpdateService.importCompany(file).subscribe(
          response => {
            if (response.status == 200) {
              this.countNotUpdate = response.result.countNotUpdate;
              this.countUpdate = response.result.countUpdate;
              this.notUpdate = response.result.notUpdateCompany;
              this.update = response.result.updateCompany;
              this.loading = false;
            } else {
              this.showToast(response.error, 'danger')
              this.loading = false;
            }
          }
        )
      }
    }
  }

  public showToast(result, type?: string, title?: string, message?: string): void {
    if (result) {
      if (result.status === 0) {
        type = 'info';
        title = 'el servicio se encuentra en mantenimiento, inténtelo nuevamente en unos minutos';
      } else if (result.status === 200) {
        type = 'success';
        title = result.message;
      } else if (result.status >= 500) {
        type = 'danger';
        title = (result.error && result.error.message) ? result.error.message : result.message;
      } else {
        type = 'info';
        title = (result.error && result.error.message) ? result.error.message : result.message;
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

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }
}
