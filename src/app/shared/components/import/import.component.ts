import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BranchService } from '@core/services/branch.service';
import { DepositService } from '@core/services/deposit.service';
import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Branch, Deposit, PriceList } from '@types';
import { TransactionMovement, TransactionType } from 'app/components/transaction-type/transaction-type';
import { TransactionTypeService } from 'app/core/services/transaction-type.service';
import { PriceListService } from 'app/core/services/price-list.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { TranslateMePipe } from 'app/shared/pipes/translate-me';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ToastService } from '../toast/toast.service';
import { ImportService } from './import.service';

@Component({
  selector: 'add-import',
  templateUrl: './import.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule, PipesModule, NgMultiSelectDropDownModule],
  providers: [NgbAlertConfig, TranslateMePipe, ImportService],
})
export class ImportComponent implements OnInit {
  @Input() model: string;
  @Input() title: string;
  @Input() transactionId: string;
  @Input() priceListId: string;
  branches: Branch[];
  deposits: Deposit[];
  branchesSelected: Branch[] = new Array();
  depositsSelected: Deposit[] = new Array();
  selectedValuePrice: boolean = false;
  depositsData: Deposit[] = new Array();
  alertMessage: string = '';
  countNotUpdate: number;
  countUpdate: number;
  messageImport: string;
  notUpdate: string[];
  update: string[];
  errorMessage: string;
  transactionTypes: TransactionType[];
  transactionTypesSelect;
  priceLists: PriceList[] = [];
  selectedPriceListId: string | null = null;
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
    public _transactionTypeService: TransactionTypeService,
    public _fb: UntypedFormBuilder,
    public alertConfig: NgbAlertConfig,
    public activeModal: NgbActiveModal,
    public translatePipe: TranslateMePipe,
    private _toastService: ToastService,
    private _branchService: BranchService,
    private _depositService: DepositService,
    private _priceListService: PriceListService
  ) {}

  ngOnInit(): void {
    this.buildForm();

    if (this.model === 'articles-stock') {
      this.getTransactionTypes();
      this.getBranches();
      this.getDeposits();
    }

    if (this.model === 'price-list-articles') {
      this.getPriceLists();
    }
  }

  private getPriceLists(): void {
    this._priceListService
      .find({ query: { operationType: { $ne: 'D' } } })
      .subscribe((lists: PriceList[]) => {
        // Import de precios manuales: solo listas pricingMode === 'manual'
        this.priceLists = (lists || []).filter((pl) => (pl as any).pricingMode === 'manual');
        if (!this.selectedPriceListId && this.priceListId) {
          this.selectedPriceListId = this.priceListId;
        }
        if (!this.selectedPriceListId && this.priceLists.length) {
          this.selectedPriceListId = this.priceLists[0]._id;
        }
      });
  }

  public buildForm(): void {
    this.importForm = this._fb.group({
      file: [null, [Validators.required]],
    });

    this.importForm.valueChanges.subscribe(() => this.onValueChanged());
    this.onValueChanged();
  }

  onBranchSelect(branch: Branch) {
    const branchId = branch._id;
    const filteredDeposits = this.deposits.filter((deposit) => deposit.branch.toString() === branchId);

    const uniqueDepositIds = new Set<string>();

    const uniqueDeposits = filteredDeposits.filter((deposit) => {
      if (!uniqueDepositIds.has(deposit._id)) {
        uniqueDepositIds.add(deposit._id);
        return true;
      }
      return false;
    });

    this.depositsData = uniqueDeposits;
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
        this._excelUpdateService
          .importStock(
            file,
            this.depositsSelected[0]._id,
            this.branchesSelected[0]._id,
            this.transactionTypesSelect[0]._id
          )
          .subscribe((response) => {
            if (response.status == 200) {
              this.countNotUpdate = response.result.countNotUpdate;
              this.countUpdate = response.result.countUpdate;
              this.notUpdate = response.result.notUpdateArticle;
              this.messageImport = response.result.message;
              this.update = response.result.updateArticle;
              this.loading = false;
              this._toastService.showToast(response);
            } else {
              this._toastService.showToast({ message: response.error.message });
              this.loading = false;
            }
          });
      } else if (this.model === 'articles') {
        this._excelUpdateService.importArticle(file).subscribe((response) => {
          if (response.status == 200) {
            this.countNotUpdate = response.result.countNotUpdate;
            this.countUpdate = response.result.countUpdate;
            this.notUpdate = response.result.notUpdateArticle;
            this.update = response.result.updateArticle;
            this.loading = false;
          } else {
            this._toastService.showToast(response.error);
            this.loading = false;
          }
        });
      } else if (this.model === 'company') {
        this._excelUpdateService.importCompany(file).subscribe((response) => {
          if (response.status == 200) {
            this.countNotUpdate = response.result.countNotUpdate;
            this.countUpdate = response.result.countUpdate;
            this.notUpdate = response.result.notUpdateCompany;
            this.update = response.result.updateCompany;
            this.loading = false;
          } else {
            this._toastService.showToast(response.error);
            this.loading = false;
          }
        });
      } else if (this.model === 'movements-of-articles') {
        this._excelUpdateService.importMovementsOfArticles(file, this.transactionId).subscribe((response) => {
          if (response.status == 200) {
            this.countNotUpdate = response.result.countNotUpdate;
            this.countUpdate = response.result.countUpdate;
            this.notUpdate = response.result.notUpdateArticle;
            this.update = response.result.updateArticle;
            this.loading = false;
          } else {
            this._toastService.showToast(response.error);
            this.loading = false;
          }
        });
      } else if (this.model === 'price-list-articles') {
        const priceListId = this.selectedPriceListId || this.priceListId;
        if (!priceListId) {
          this._toastService.showToast({ message: 'Debe seleccionar una lista de precios.' });
          this.loading = false;
          return;
        }
        this._excelUpdateService.importPriceListArticles(file, priceListId).subscribe((response) => {
          if (response.status == 200) {
            this.countUpdate = response.result.countUpdate;
            this.countNotUpdate = response.result.countNotFound + response.result.countInvalidPrice;
            this.update = response.result.update;
            this.notUpdate = [...(response.result.notFound || []), ...(response.result.invalidPrice || [])];
            this.loading = false;
            this._toastService.showToast(response);
          } else {
            this._toastService.showToast(response.error?.message || response.message || response.error);
            this.loading = false;
          }
        });
      }
    }
  }

  public downloadModel() {
    const urls = {
      'articles-stock':
        'https://docs.google.com/spreadsheets/d/1BRDIZE3jLOJCxS--OfLbbIB9MLqM1kg0/edit?gid=2096715443#gid=2096715443',
      articles:
        'https://docs.google.com/spreadsheets/d/1lbHhg1uPGDEybCbppTVaPAj5q_3yyeIV4fh-GOlmmkg/edit?gid=2144488028#gid=2144488028',
      company:
        'https://docs.google.com/spreadsheets/d/17ASWtOItH6FfFaQpgWS0MeAu1Pm6QPw8/edit?gid=1719187905#gid=1719187905',
      'movements-of-articles':
        'https://docs.google.com/spreadsheets/d/1vd4M5hfYuyar9OaZ4kcqdWryaVJH8voc1n-GENLcztQ/edit?gid=0#gid=0',
      'price-list-articles':
        'https://docs.google.com/spreadsheets/d/1hZPD54yW3_HaW9EBexGgqiEP0k-ujtO-AHxVqOzNu2w/edit?gid=0#gid=0',
    };

    const url = urls[this.model];

    if (url) {
      window.open(url, '_blank');
    } else {
      console.warn('No URL found for the specified model');
    }
  }

  public getTransactionTypes() {
    let match = {};

    match = {
      transactionMovement: TransactionMovement.Stock,
      operationType: { $ne: 'D' },
    };

    this._transactionTypeService
      .getAll({
        project: {
          _id: 1,
          transactionMovement: 1,
          requestArticles: 1,
          operationType: 1,
          name: 1,
          branch: 1,
        },
        match: match,
      })
      .subscribe(
        (result) => {
          if (result) {
            this.transactionTypes = result.result;
          } else {
          }
        },
        (error) => {}
      );
  }

  getBranches(): void {
    this._branchService.getAll({ match: { operationType: { $ne: 'D' } } }).subscribe({
      next: (result) => {
        this.branches = result.result;
      },
      error: (error) => {
        this._toastService.showToast(error);
      },
    });
  }

  getDeposits(): void {
    this._depositService.getAll({ match: { operationType: { $ne: 'D' } } }).subscribe({
      next: (result) => {
        this.deposits = result.result;
      },
      error: (error) => {
        this._toastService.showToast(error);
      },
    });
  }
}
