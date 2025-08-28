import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbNavModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Article, CompanyType, TransactionMovement } from '@types';
import { MovementOfArticle } from 'app/components/movement-of-article/movement-of-article';
import { MovementOfCash } from 'app/components/movement-of-cash/movement-of-cash';
import { Transaction, TransactionState } from 'app/components/transaction/transaction';
import { ArticleService } from 'app/core/services/article.service';
import { MovementOfArticleService } from 'app/core/services/movement-of-article.service';
import { MovementOfCashService } from 'app/core/services/movement-of-cash.service';
import { TransactionService } from 'app/core/services/transaction.service';
import { SelectCompanyComponent } from 'app/modules/entities/company/select-company/select-company.component';
import { SelectEmployeeComponent } from 'app/shared/components/select-employee/select-employee.component';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TypeaheadDropdownComponent } from 'app/shared/components/typehead-dropdown/typeahead-dropdown.component';

@Component({
  selector: 'app-formal-transaction-view',
  standalone: true,
  imports: [CommonModule, NgbNavModule, NgbTooltipModule, ReactiveFormsModule, TypeaheadDropdownComponent],
  templateUrl: './formal-transaction-view.component.html',
  styleUrls: ['./formal-transaction-view.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FormalTransactionViewComponent implements OnInit {
  public transaction: Transaction = new Transaction();
  public transactionId: string;
  public movementsOfArticles: MovementOfArticle[] = [];
  public movementsOfCash: MovementOfCash[] = [];
  public loading: boolean = false;
  public activeTab: string = 'products';

  // Propiedades para agregar producto
  public showAddProductForm: boolean = false;
  public addProductForm: FormGroup;
  public articles: Article[] = [];
  public selectedArticle: Article | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService,
    private movementOfArticleService: MovementOfArticleService,
    private movementOfCashService: MovementOfCashService,
    private modal: NgbModal,
    private toastService: ToastService,
    private fb: FormBuilder,
    private articleService: ArticleService
  ) {
    this.initAddProductForm();
  }

  ngOnInit(): void {
    this.transactionId = this.route.snapshot.paramMap.get('id');
    if (this.transactionId) {
      this.loadTransaction();
    }
    this.loadArticles();
  }

  private initAddProductForm(): void {
    this.addProductForm = this.fb.group({
      article: [null, [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
    });

    // Escuchar cambios en el artículo seleccionado
    this.addProductForm.get('article')?.valueChanges.subscribe((articleId) => {
      if (articleId) {
        const article = this.articles.find((a) => a._id === articleId);
        if (article) {
          this.selectedArticle = article;
          this.addProductForm.patchValue({
            unitPrice: article.salePrice || 0,
          });
        }
      } else {
        this.selectedArticle = null;
      }
    });
  }

  private loadArticles(): void {
    this.articleService.find({ query: { operationType: { $ne: 'D' } } }).subscribe({
      next: (articles) => {
        this.articles = articles || [];
      },
      error: (error) => {
        this.toastService.showToast({
          message: 'Error al cargar artículos',
          type: 'error',
        });
      },
    });
  }

  private loadTransaction(): void {
    this.loading = true;

    this.transactionService.getById(this.transactionId).subscribe({
      next: (result) => {
        if (result && result.status === 200 && result.result) {
          this.transaction = result.result;
          this.toastService.showToast({
            message: 'Transacción cargada correctamente',
            type: 'success',
          });
          this.loadMovements();
        } else {
          this.toastService.showToast({
            message: 'No se encontró la transacción',
            type: 'error',
          });
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        this.toastService.showToast({
          message: 'Error al cargar la transacción',
          type: 'error',
        });
        this.router.navigate(['/']);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  private loadMovements(): void {
    if (this.transactionId) {
      // Cargar movimientos de artículos
      this.movementOfArticleService.getMovementsOfArticlesByTransaction(this.transactionId).subscribe({
        next: (result) => {
          if (result && result.status === 200) {
            this.movementsOfArticles = result.result || [];
          }
        },
        error: (error) => {
          this.toastService.showToast({
            message: 'Error al cargar movimientos de artículos',
            type: 'error',
          });
        },
      });

      // Cargar movimientos de caja (pagos)
      const cashQuery = {
        match: { transaction: this.transactionId, operationType: { $ne: 'D' } },
      };
      this.movementOfCashService.getMovementsOfCashesV3(cashQuery).subscribe({
        next: (result) => {
          if (result && result.status === 200) {
            this.movementsOfCash = result.result || [];
          }
        },
        error: (error) => {
          this.toastService.showToast({
            message: 'Error al cargar movimientos de caja',
            type: 'error',
          });
        },
      });
    }
  }

  public changeCompany(): void {
    const modalRef = this.modal.open(SelectCompanyComponent, {
      size: 'lg',
      backdrop: 'static',
    });

    // Determinar el tipo de company basado en el tipo de transacción
    if (this.transaction.type?.transactionMovement === TransactionMovement.Purchase) {
      modalRef.componentInstance.type = CompanyType.Provider;
    } else if (this.transaction.type?.transactionMovement === TransactionMovement.Sale) {
      modalRef.componentInstance.type = CompanyType.Client;
    } else {
      modalRef.componentInstance.type = CompanyType.Client; // Default
    }

    modalRef.result.then(
      (result) => {
        if (result.company) {
          this.transaction.company = result.company;
          this.toastService.showToast({
            message: 'Cliente actualizado correctamente',
            type: 'success',
          });
          // TODO: Actualizar transacción en el servidor
        }
      },
      (reason) => {
        // Modal cerrado sin selección
      }
    );
  }

  public changeEmployee(): void {
    const modalRef = this.modal.open(SelectEmployeeComponent, {
      size: 'lg',
      backdrop: 'static',
    });

    modalRef.componentInstance.op = 'change-employee';

    modalRef.result.then(
      (result) => {
        if (result.employee) {
          this.transaction.employeeClosing = result.employee;
          this.toastService.showToast({
            message: 'Vendedor actualizado correctamente',
            type: 'success',
          });
          // TODO: Actualizar transacción en el servidor
        }
      },
      (reason) => {
        // Modal cerrado sin selección
      }
    );
  }

  public changeDate(): void {
    this.toastService.showToast({
      message: 'Función de cambiar fecha en desarrollo',
      type: 'info',
    });
    // TODO: Implementar modal para cambiar fecha
  }

  public changeCurrency(): void {
    this.toastService.showToast({
      message: 'Función de cambiar moneda en desarrollo',
      type: 'info',
    });
    // TODO: Implementar modal para cambiar moneda
  }

  public setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  public get subtotal(): number {
    return this.transaction.totalPrice + this.transaction.discountAmount;
  }

  public get totalTaxesAmount(): number {
    return this.movementsOfArticles.reduce((total, movement) => {
      if (movement.taxes && movement.taxes.length > 0) {
        return total + movement.taxes.reduce((taxTotal, tax) => taxTotal + (tax.taxAmount || 0), 0);
      }
      return total;
    }, 0);
  }

  public get totalTaxesBase(): number {
    return this.movementsOfArticles.reduce((total, movement) => {
      if (movement.taxes && movement.taxes.length > 0) {
        return total + movement.taxes.reduce((taxTotal, tax) => taxTotal + (tax.taxBase || 0), 0);
      }
      return total;
    }, 0);
  }

  public get totalQuantity(): number {
    return this.movementsOfArticles.reduce((total, movement) => total + movement.amount, 0);
  }

  public get totalPaid(): number {
    return this.movementsOfCash.reduce((total, movement) => total + movement.amountPaid, 0);
  }

  public get balance(): number {
    return this.transaction.totalPrice - this.totalPaid;
  }

  public getStateText(): string {
    switch (this.transaction.state) {
      case TransactionState.Open:
        return 'ABIERTO';
      case TransactionState.Closed:
        return 'FINALIZADA';
      case TransactionState.Canceled:
        return 'CANCELADA';
      default:
        return typeof this.transaction.state === 'string' ? this.transaction.state : 'ABIERTO';
    }
  }

  public getStateClass(): string {
    switch (this.transaction.state) {
      case TransactionState.Open:
        return 'badge-warning';
      case TransactionState.Closed:
        return 'badge-success';
      case TransactionState.Canceled:
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }

  public addProduct(): void {
    this.showAddProductForm = true;
    this.addProductForm.reset();
    this.addProductForm.patchValue({
      quantity: 1,
      unitPrice: 0,
    });
  }

  public saveProduct(): void {
    if (this.addProductForm.valid && this.selectedArticle) {
      const movementData = {
        transactionId: this.transaction._id,
        articleId: this.selectedArticle._id,
        quantity: this.addProductForm.get('quantity')?.value,
        salePrice: this.addProductForm.get('unitPrice')?.value * this.addProductForm.get('quantity')?.value,
        recalculateParent: false,
      };

      this.movementOfArticleService.createMovementOfArticle(movementData).subscribe({
        next: (response) => {
          if (response.status === 200) {
            this.toastService.showToast({
              message: 'Producto agregado exitosamente',
              type: 'success',
            });
            this.showAddProductForm = false;
            this.loadMovements(); // Recargar movimientos
          } else {
            this.toastService.showToast({
              message: response.message || 'Error al agregar producto',
              type: 'error',
            });
          }
        },
        error: (error) => {
          this.toastService.showToast({
            message: 'Error al agregar producto',
            type: 'error',
          });
        },
      });
    } else {
      this.addProductForm.markAllAsTouched();
    }
  }

  public cancelAddProduct(): void {
    this.showAddProductForm = false;
    this.addProductForm.reset();
    this.selectedArticle = null;
  }

  public addPayment(): void {
    // TODO: Implementar modal para agregar métodos de pago
    this.toastService.showToast('Función de agregar pago en desarrollo');
  }

  public cancelTransaction(): void {
    // TODO: Implementar cancelación de transacción
    this.toastService.showToast('Función de cancelar transacción en desarrollo');
  }

  public editProduct(movement: MovementOfArticle): void {
    // TODO: Implementar edición de producto
    this.toastService.showToast('Función de editar producto en desarrollo');
  }

  public editPayment(movement: MovementOfCash): void {
    // TODO: Implementar edición de pago
    this.toastService.showToast('Función de editar pago en desarrollo');
  }

  public printTransaction(): void {
    // TODO: Implementar impresión
    this.toastService.showToast('Función de imprimir en desarrollo');
  }

  public saveTransaction(): void {
    // TODO: Implementar guardado
    this.toastService.showToast('Función de guardar en desarrollo');
  }

  public goBack(): void {
    this.router.navigate(['/']);
  }

  // TrackBy functions for performance
  public trackByMovementId(index: number, item: MovementOfArticle): string {
    return item._id;
  }

  public trackByPaymentId(index: number, item: MovementOfCash): string {
    return item._id;
  }
}
