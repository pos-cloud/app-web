import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ApiResponse, Branch, Company, Deposit, User, View } from '@types';

import { Config } from 'app/app.config';
import { CashBox, CashBoxState } from 'app/components/cash-box/cash-box';
import { Origin } from 'app/components/origin/origin';
import {
  CurrentAccount,
  StockMovement,
  TransactionMovement,
  TransactionType,
} from '@types';
import { Transaction } from 'app/components/transaction/transaction';

import { BranchService } from 'app/core/services/branch.service';
import { CashBoxService } from 'app/core/services/cash-box.service';
import { DepositService } from 'app/core/services/deposit.service';
import { OriginService } from 'app/core/services/origin.service';
import { TransactionTypeService } from 'app/core/services/transaction-type.service';
import { TransactionService } from 'app/core/services/transaction.service';

import { CashBoxComponent } from 'app/components/cash-box/cash-box/cash-box.component';
import { SelectCompanyComponent } from 'app/modules/entities/company/select-company/select-company.component';
import { SelectOriginComponent } from 'app/modules/transaction/components/select-origin/select-origin.component';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { SelectBranchComponent } from 'app/shared/components/select-branch/select-branch.component';
import { SelectDepositComponent } from 'app/shared/components/select-deposit/select-deposit.component';
import { SelectEmployeeComponent } from 'app/shared/components/select-employee/select-employee.component';

/**
 * Datos del contexto donde se dispara el alta. El servicio no conoce al componente:
 * recibe todo lo que necesita para resolver el flujo y decidir la navegación.
 */
export interface PosContext {
  posType: string;
  transactionMovement: TransactionMovement;
  user: User;
  config: any;
  company?: Company;
  totalPrice?: number;
  returnURL?: string;
}

export type CreateTransactionResult =
  | { status: 'redirect'; transaction: Transaction; commands: any[]; queryParams?: Record<string, any> }
  | { status: 'needs-refresh'; transaction?: Transaction }
  | { status: 'cancelled' }
  | { status: 'error'; error?: any };

/**
 * Orquesta el alta de una transacción ("Nuevo" → tipo): resuelve lo que el tipo pide
 * (caja, sucursal, depósito, punto de venta, empleado, empresa) abriendo los modales
 * necesarios, persiste una sola vez al final y redirige según el tipo.
 *
 * Vive en modules/transaction (no en core/services) porque no habla con la API directo:
 * coordina y delega en los services de dominio.
 */
@Injectable({ providedIn: 'root' })
export class CreateTransactionService {
  constructor(
    private _transactionService: TransactionService,
    private _transactionTypeService: TransactionTypeService,
    private _branchService: BranchService,
    private _depositService: DepositService,
    private _originService: OriginService,
    private _cashBoxService: CashBoxService,
    private _modalService: NgbModal,
    private _router: Router,
    private _toastService: ToastService
  ) {}

  async create(type: TransactionType, ctx: PosContext): Promise<CreateTransactionResult> {
    try {
      let tx = this.applyTypeDefaults(new Transaction(), type, ctx);

      const cashBox = await this.resolveCashBox(tx, ctx);
      if (cashBox !== 'ok') {
        return { status: 'cancelled' };
      }

      if (!(await this.resolveBranch(tx, ctx))) {
        return { status: 'cancelled' };
      }
      if (!(await this.resolveEmployee(tx, ctx))) {
        return { status: 'cancelled' };
      }
      if (!(await this.resolveCompany(tx, ctx))) {
        return { status: 'cancelled' };
      }

      tx.currency = Config.currency;
      tx.quotation = 1;
      tx = await this.save(tx, ctx);

      return this.redirect(tx, ctx);
    } catch (error) {
      this._toastService.showToast(error);
      return { status: 'error', error };
    }
  }

  private applyTypeDefaults(tx: Transaction, type: TransactionType, ctx: PosContext): Transaction {
    tx.type = type;
    if (type.defectShipmentMethod) {
      tx.shipmentMethod = type.defectShipmentMethod as any;
    }
    if (type.fixedLetter && type.fixedLetter !== '') {
      tx.letter = type.fixedLetter.toUpperCase();
    }
    if (ctx.posType === 'cuentas-corrientes' && type.currentAccount === CurrentAccount.Charge) {
      let totalPrice = ctx.totalPrice ?? 0;
      if (ctx.transactionMovement === TransactionMovement.Sale) {
        totalPrice *= -1;
      }
      tx.totalPrice = totalPrice < 0 ? 0 : totalPrice;
    }
    return tx;
  }

  /** Devuelve 'ok' si se puede seguir, o un estado que corta el alta (apertura/cancelado). */
  private async resolveCashBox(tx: Transaction, ctx: PosContext): Promise<'ok' | 'opening' | 'cancelled'> {
    const type = tx.type;

    if (type.cashOpening || type.cashClosing) {
      await this.openCashBox(tx);
      return 'opening';
    }

    if (!type.cashBoxImpact) {
      return 'ok';
    }

    let query = `where="state":"${CashBoxState.Open}"`;
    if (ctx.config?.cashBox?.perUser) {
      query += `,"creationUser":"${ctx.user._id}"`;
    } else if (ctx.user?.cashBoxType) {
      query += `,"type":"${ctx.user.cashBoxType._id}"`;
    } else {
      query += `,"type":null`;
    }
    query += '&sort="number":-1&limit=1';

    const cashBoxes = await this.getCashBoxes(query);
    if (cashBoxes && cashBoxes.length > 0) {
      tx.cashBox = cashBoxes[0];
      return 'ok';
    }

    const openingTypes = await this.getTransactionTypes({ cashOpening: true }, ctx.user);
    if (openingTypes && openingTypes.length > 0) {
      tx.type = openingTypes[0];
      await this.openCashBox(tx);
    } else {
      this._toastService.showToast({
        message: 'Debe configurar un tipo de transacción para realizar la apertura de caja.',
      });
    }
    return 'opening';
  }

  private async resolveBranch(tx: Transaction, ctx: PosContext): Promise<boolean> {
    if (!tx.branchDestination || !tx.branchOrigin) {
      if (ctx.user?.origin) {
        if (tx.type.fixedOrigin && tx.type.fixedOrigin !== 0) {
          tx.origin = tx.type.fixedOrigin;
        } else if (tx.type.transactionMovement !== TransactionMovement.Purchase) {
          tx.origin = ctx.user.origin.number;
        }
        const originBranch = this.getOriginBranchForTransaction(ctx.user);
        if (originBranch) {
          tx.branchOrigin = originBranch;
          tx.branchDestination = originBranch;
        }
      } else {
        if (tx.type.fixedOrigin && tx.type.fixedOrigin !== 0) {
          tx.origin = tx.type.fixedOrigin;
        }
        const branches = await this.getBranches({ operationType: { $ne: 'D' } });
        if (!branches || branches.length === 0) {
          this._toastService.showToast({ message: 'Debe crear una sucursal para poder crear una transacción.' });
          return false;
        }
        if (branches.length > 1) {
          const branch = await this.selectBranch();
          if (!branch) {
            return false;
          }
          tx.branchOrigin = branch;
          tx.branchDestination = branch;
        } else {
          tx.branchOrigin = branches[0];
          tx.branchDestination = branches[0];
        }
      }
    }

    if (
      tx.type.transactionMovement === TransactionMovement.Stock &&
      tx.type.stockMovement === StockMovement.Transfer &&
      (!tx.depositDestination || !tx.depositOrigin)
    ) {
      if (!(await this.resolveTransfer(tx))) {
        return false;
      }
    }

    if (!(await this.resolveDeposit(tx))) {
      return false;
    }
    return this.resolveOrigin(tx);
  }

  private async resolveDeposit(tx: Transaction): Promise<boolean> {
    if (tx.depositDestination && tx.depositOrigin) {
      return true;
    }
    const deposits = await this.getDeposits({
      branch: { $oid: tx.branchOrigin._id },
      operationType: { $ne: 'D' },
    });
    if (!deposits || deposits.length === 0) {
      this._toastService.showToast({
        message: `Debe crear un depósito para la sucursal ${tx.branchDestination?.name}.`,
      });
      return false;
    }
    if (deposits.length === 1) {
      tx.depositOrigin = deposits[0];
      tx.depositDestination = deposits[0];
      return true;
    }
    const def = deposits.find((d) => d && d.default);
    if (def) {
      tx.depositOrigin = def;
      tx.depositDestination = def;
      return true;
    }
    this._toastService.showToast({
      message: `Debe asignar un depósito principal para la sucursal ${tx.branchDestination?.name}.`,
    });
    return false;
  }

  private async resolveOrigin(tx: Transaction): Promise<boolean> {
    if (tx.origin && tx.origin !== 0) {
      return true;
    }
    const origins = await this.getOrigins({
      branch: { $oid: tx.branchDestination._id },
      operationType: { $ne: 'D' },
    });
    if (!origins || origins.length === 0) {
      this._toastService.showToast({
        message: `Debe crear un punto de venta defecto para la sucursal ${tx.branchDestination?.name}.`,
      });
      return false;
    }
    if (origins.length > 1) {
      const origin = await this.selectOrigin(tx.branchDestination._id);
      if (!origin) {
        return false;
      }
      tx.origin = origin.number;
      return true;
    }
    tx.origin = origins[0].number;
    return true;
  }

  private async resolveTransfer(tx: Transaction): Promise<boolean> {
    const result = await this.openTransfer();
    if (!result || !result.origin || !result.destination) {
      return false;
    }
    const depositOrigin = await this.getDeposits({ _id: { $oid: result.origin }, operationType: { $ne: 'D' } });
    tx.depositOrigin = depositOrigin[0];
    const branchOrigin = await this.getBranches({ _id: { $oid: depositOrigin[0].branch }, operationType: { $ne: 'D' } });
    tx.branchOrigin = branchOrigin[0];
    const depositDestination = await this.getDeposits({
      _id: { $oid: result.destination },
      operationType: { $ne: 'D' },
    });
    const branchDestination = await this.getBranches({
      _id: { $oid: depositDestination[0].branch },
      operationType: { $ne: 'D' },
    });
    tx.branchDestination = branchDestination[0];
    tx.depositDestination = depositDestination[0];
    return true;
  }

  private async resolveEmployee(tx: Transaction, ctx: PosContext): Promise<boolean> {
    const type = tx.type;
    const needsEmployee =
      !tx.employeeClosing && type.requestEmployee && type.requestArticles && ctx.posType === 'mostrador';
    if (!needsEmployee) {
      return true;
    }
    const employee = ctx.user?.employee?._id ? ctx.user.employee : null;
    if (employee) {
      tx.employeeOpening = employee;
      tx.employeeClosing = employee;
      return true;
    }
    const selected = await this.selectEmployee(tx);
    if (!selected) {
      return false;
    }
    tx.employeeOpening = selected;
    tx.employeeClosing = selected;
    return true;
  }

  private async resolveCompany(tx: Transaction, ctx: PosContext): Promise<boolean> {
    const type = tx.type;

    if (type.company) {
      tx.company = type.company;
      return true;
    }
    if (ctx.company) {
      tx.company = ctx.company;
      return true;
    }

    const needsCompany =
      !tx.company && (type.requestCompany || (type.requestArticles && ctx.posType === 'cuentas-corrientes'));
    if (!needsCompany) {
      return true;
    }

    const company = await this.selectCompany(tx);
    if (!company) {
      return false;
    }
    tx.company = company;
    return true;
  }

  private async save(tx: Transaction, ctx: PosContext): Promise<Transaction> {
    tx.madein = ctx.posType === 'cuentas-corrientes' ? 'mostrador' : ctx.posType;
    const result: ApiResponse = await this._transactionService.save(tx).toPromise();
    if (result.status !== 200) {
      this._toastService.showToast(result);
      throw result;
    }
    return result.result;
  }

  /**
   * Decide el destino del alta y devuelve el `_id` + las `commands`/`queryParams`.
   * Salvo los comprobantes formales (que tienen su propia vista), todo se deriva al editor
   * `add-sale-order`: ahí vive la lógica de edición/cobro/finalización, que no tocamos.
   * El acto de navegar lo hace el listado que llamó al servicio.
   */
  private redirect(tx: Transaction, ctx: PosContext): CreateTransactionResult {
    const returnURL = ctx.returnURL ?? this._router.url;

    if (tx.type.view === View.Formal) {
      return { status: 'redirect', transaction: tx, commands: ['/transaction/view/formal', tx._id] };
    }

    const route =
      ctx.posType === 'cuentas-corrientes' ? '/pos/mostrador/editar-transaccion' : '/pos/' + ctx.posType + '/editar-transaccion';
    const queryParams: Record<string, any> = { transactionId: tx._id, returnURL };
    if (tx.type.automaticCreation && ctx.posType !== 'resto') {
      queryParams.automaticCreation = tx.type._id;
    }
    return { status: 'redirect', transaction: tx, commands: [route], queryParams };
  }

  // ---------------------------------------------------------------------------
  // Modales (NgbModal es inyectable: el servicio los abre directamente)
  // ---------------------------------------------------------------------------

  private selectBranch(): Promise<Branch | null> {
    const ref = this._modalService.open(SelectBranchComponent);
    return ref.result.then(
      (r) => r?.branch ?? null,
      () => null
    );
  }

  private selectOrigin(branchId: string): Promise<any | null> {
    const ref = this._modalService.open(SelectOriginComponent);
    ref.componentInstance.branchId = branchId;
    return ref.result.then(
      (r) => r?.origin ?? null,
      () => null
    );
  }

  private selectEmployee(tx: Transaction): Promise<any | null> {
    const ref = this._modalService.open(SelectEmployeeComponent);
    ref.componentInstance.requireLogin = false;
    ref.componentInstance.op = 'select-employee';
    ref.componentInstance.typeEmployee = tx.type.requestEmployee;
    return ref.result.then(
      (r) => r?.employee ?? null,
      () => null
    );
  }

  private selectCompany(tx: Transaction): Promise<Company | null> {
    const ref = this._modalService.open(SelectCompanyComponent, { size: 'lg', backdrop: 'static' });
    ref.componentInstance.type = tx.type.requestCompany;
    return ref.result.then(
      (r) => r?.company ?? null,
      () => null
    );
  }

  private openTransfer(): Promise<any | null> {
    const ref = this._modalService.open(SelectDepositComponent);
    ref.componentInstance.op = 'transfer';
    return ref.result.then(
      (r) => r ?? null,
      () => null
    );
  }

  private openCashBox(tx: Transaction): Promise<void> {
    const ref = this._modalService.open(CashBoxComponent, { size: 'lg', backdrop: 'static' });
    ref.componentInstance.transactionType = tx.type;
    return ref.result.then(
      () => {},
      () => {}
    );
  }

  // ---------------------------------------------------------------------------
  // Acceso a datos (delega en los services de dominio)
  // ---------------------------------------------------------------------------

  /** Tipos de transacción para el botón "Nuevo" de un listado, filtrados por movimiento. */
  public getTransactionTypesByMovement(movement: TransactionMovement, user?: User): Promise<TransactionType[]> {
    const match: any = { transactionMovement: movement, allowAPP: false };
    if (user?.level != null) {
      match['level'] = { $lt: user.level };
    }
    if (user?.branch?._id) {
      match['$or'] = [{ branch: { $exists: false } }, { branch: null }, { branch: { $oid: user.branch._id } }];
    }
    return this.getTransactionTypes(match, user);
  }

  public getTransactionTypes(match: any = {}, user?: User): Promise<TransactionType[]> {
    return new Promise((resolve) => {
      const project = {
        _id: 1,
        defectShipmentMethod: 1,
        fixedLetter: 1,
        currentAccount: 1,
        cashBoxImpact: 1,
        fixedOrigin: 1,
        transactionMovement: 1,
        stockMovement: 1,
        maxOrderNumber: 1,
        requestEmployee: 1,
        requestArticles: 1,
        requestCurrency: 1,
        requestCompany: 1,
        automaticNumbering: 1,
        company: 1,
        automaticCreation: 1,
        requestPaymentMethods: 1,
        readLayout: 1,
        defectPrinter: 1,
        name: 1,
        labelPrint: 1,
        electronics: 1,
        printable: 1,
        requestEmailTemplate: 1,
        allowAPP: 1,
        order: 1,
        cashOpening: 1,
        cashClosing: 1,
        level: 1,
        branch: 1,
        defectOrders: 1,
        operationType: 1,
        finishCharge: 1,
        view: 1,
      };

      match['operationType'] = { $ne: 'D' };

      if (user?.permission?.transactionTypes?.length && !match['_id']) {
        match['_id'] = { $in: user.permission.transactionTypes.map((e) => ({ $oid: e })) };
      }

      this._transactionTypeService.getAll({ project, match, sort: { order: 1 } }).subscribe(
        (result) => resolve(result.status === 200 ? result.result : null),
        (error) => {
          this._toastService.showToast(error);
          resolve(null);
        }
      );
    });
  }

  private getBranches(match: {} = {}): Promise<Branch[]> {
    return new Promise((resolve) => {
      this._branchService.getBranches({}, match, { number: 1 }, {}, 0, 0).subscribe(
        (result) => resolve(result?.branches ?? null),
        (error) => {
          this._toastService.showToast(error);
          resolve(null);
        }
      );
    });
  }

  private getDeposits(match: {} = {}): Promise<Deposit[]> {
    return new Promise((resolve) => {
      this._depositService.getDepositsV2({}, match, { name: 1 }, {}, 0, 0).subscribe(
        (result) => resolve(result?.deposits ?? null),
        (error) => {
          this._toastService.showToast(error);
          resolve(null);
        }
      );
    });
  }

  private getOrigins(match: {} = {}): Promise<Origin[]> {
    return new Promise((resolve) => {
      this._originService.getOrigins({}, match, { number: 1 }, {}, 0, 0).subscribe(
        (result) => resolve(result?.origins ?? null),
        (error) => {
          this._toastService.showToast(error);
          resolve(null);
        }
      );
    });
  }

  private getCashBoxes(query?: string): Promise<CashBox[]> {
    return new Promise((resolve) => {
      this._cashBoxService.getCashBoxes(query).subscribe(
        (result) => resolve(result?.cashBoxes ?? null),
        (error) => {
          this._toastService.showToast(error);
          resolve(null);
        }
      );
    });
  }

  // ---------------------------------------------------------------------------
  // Helpers de sucursal del punto de venta del usuario (login v2 puede traer ref string)
  // ---------------------------------------------------------------------------

  private getOriginBranchId(user: User): string | null {
    const branch = user?.origin?.branch as unknown;
    if (branch == null) {
      return null;
    }
    if (typeof branch === 'string') {
      return branch;
    }
    if (typeof branch === 'object') {
      const b = branch as { _id?: string | { $oid?: string; toString?: () => string }; $oid?: string };
      if (b._id != null) {
        if (typeof b._id === 'string') {
          return b._id;
        }
        if (typeof b._id === 'object' && b._id !== null && '$oid' in b._id) {
          return (b._id as { $oid: string }).$oid;
        }
        return typeof b._id.toString === 'function' ? b._id.toString() : String(b._id);
      }
      if (b.$oid) {
        return b.$oid;
      }
    }
    return null;
  }

  private getOriginBranchForTransaction(user: User): Branch | null {
    const branch = user?.origin?.branch as unknown;
    if (branch && typeof branch === 'object') {
      const b = branch as { _id?: unknown };
      if (b._id != null) {
        return branch as Branch;
      }
    }
    const id = this.getOriginBranchId(user);
    return id ? ({ _id: id } as Branch) : null;
  }
}
