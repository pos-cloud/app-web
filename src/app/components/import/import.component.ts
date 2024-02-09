import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ImportService } from './import.service';
import {Branch} from 'app/components/branch/branch';
import {Deposit} from 'app/components/deposit/deposit';

@Component({
  selector: 'add-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.css']
})

export class ImportComponent implements OnInit {

  @Input() branches: Branch[];
  @Input() allDeposits: any[];
  branchesSelected: Branch[] = new Array();
  depositsSelected: Deposit[] = new Array();
  depositsData: Deposit[] = new Array();
  countNotUpdate: number;
  countUpdate: number;
  notUpdateArticle: string[];
  updateArticle: string[];
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
    public activeModal: NgbActiveModal
  ) { }

  ngOnInit(): void {
    this.buildForm();
    console.log(this.branches, this.allDeposits)
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
  this.depositsData = this.allDeposits.filter(deposit => deposit.branch === branchId)

  }

  public onValueChanged(): void {
    // Aquí puedes implementar validaciones adicionales si las necesitas
  }

  public import(): void {
    if (this.importForm.valid) {
      const inputElement: HTMLInputElement = document.getElementById('fileInput') as HTMLInputElement;
      const file: File = inputElement.files[0]; // Obtener el primer archivo seleccionado
  
      this.loading = true; 
  
      this._excelUpdateService.import(file, this.depositsSelected[0]._id, this.branchesSelected[0]._id ).subscribe(
        response => {

          this.countNotUpdate = response.result.countNotUpdate;
          this.countUpdate = response.result.countUpdate;
          this.notUpdateArticle = response.result.notUpdateArticle;
          this.updateArticle = response.result.updateArticle;
          this.loading = false;
        },
        error => {
          // Maneja el error en caso de que ocurra
          console.error('Error al enviar el archivo:', error);
          this.loading = false; // Asegúrate de ocultar el estado de carga en caso de error
        }
      );
    }
  }
}
