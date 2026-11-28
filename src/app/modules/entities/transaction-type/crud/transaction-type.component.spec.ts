import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApplicationService } from '@core/services/application.service';
import { AuthService } from '@core/services/auth.service';
import { BranchService } from '@core/services/branch.service';
import { CashBoxTypeService } from '@core/services/cash-box-type.service';
import { CompanyService } from '@core/services/company.service';
import { EmailTemplateService } from '@core/services/email-template.service';
import { EmployeeTypeService } from '@core/services/employee-type.service';
import { PaymentMethodService } from '@core/services/payment-method.service';
import { PrinterService } from '@core/services/printer.service';
import { ShipmentMethodService } from '@core/services/shipment-method.service';
import { TransactionTypeService } from '@core/services/transaction-type.service';
import { UseOfCFDIService } from '@core/services/use-of-CFDI.service';
import { TransactionMovement, TransactionType, User } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { BehaviorSubject, of } from 'rxjs';

import { TransactionTypeComponent } from './transaction-type.component';

const empty = {};

async function createComponent(userName: string | null): Promise<{
  component: TransactionTypeComponent;
  update: jest.Mock;
}> {
  const identity = new BehaviorSubject<User | null>(userName ? ({ name: userName } as User) : null);
  const update = jest.fn().mockReturnValue(of({ status: 200 }));

  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [TransactionTypeComponent],
    providers: [
      { provide: Router, useValue: { url: '/entities/transaction-types/add', navigate: jest.fn() } },
      { provide: AuthService, useValue: { getIdentity: identity } },
      { provide: ToastService, useValue: { showToast: jest.fn() } },
      {
        provide: TransactionTypeService,
        useValue: { getById: jest.fn(), save: jest.fn(), update, delete: jest.fn() },
      },
      { provide: PaymentMethodService, useValue: { find: () => of([]) } },
      { provide: BranchService, useValue: empty },
      { provide: CashBoxTypeService, useValue: empty },
      { provide: CompanyService, useValue: empty },
      { provide: EmployeeTypeService, useValue: empty },
      { provide: ApplicationService, useValue: empty },
      { provide: EmailTemplateService, useValue: empty },
      { provide: ShipmentMethodService, useValue: empty },
      { provide: PrinterService, useValue: empty },
      { provide: UseOfCFDIService, useValue: empty },
    ],
  })
    .overrideComponent(TransactionTypeComponent, {
      set: { imports: [ReactiveFormsModule], template: '' },
    })
    .compileComponents();

  const fixture = TestBed.createComponent(TransactionTypeComponent);
  fixture.detectChanges();
  return { component: fixture.componentInstance, update };
}

function fillRequired(component: TransactionTypeComponent, abbreviation: string): void {
  component.operation = 'update';
  component.transactionType = { _id: 'tt-1', abbreviation: 'FAC', name: 'Factura' } as TransactionType;
  component.transactionTypeForm.patchValue({
    _id: 'tt-1',
    name: 'Factura',
    transactionMovement: TransactionMovement.Sale,
    abbreviation,
  });
}

describe('TransactionTypeComponent abbreviation', () => {
  it('lets soporte edit the abbreviation and saves the new value', async () => {
    const { component, update } = await createComponent('Soporte');
    const control = component.transactionTypeForm.get('abbreviation');

    expect(component.canEditAbbreviation).toBe(true);
    expect(control?.disabled).toBe(false);

    fillRequired(component, 'NC');
    component.handleTransactionType();

    expect(update).toHaveBeenCalledWith(expect.objectContaining({ abbreviation: 'NC' }));
  });

  it('shows the abbreviation to other users and keeps the stored value on save', async () => {
    const { component, update } = await createComponent('Caja');
    const control = component.transactionTypeForm.get('abbreviation');

    expect(component.canEditAbbreviation).toBe(false);
    expect(control?.disabled).toBe(true);
    expect(control?.value).toBe('');

    control?.enable({ emitEvent: false });
    fillRequired(component, 'XXX');
    expect(control?.value).toBe('XXX');

    component.handleTransactionType();

    expect(update).toHaveBeenCalledWith(expect.objectContaining({ abbreviation: 'FAC' }));
  });

  it('blocks abbreviation changes when there is no logged user', async () => {
    const { component, update } = await createComponent(null);

    expect(component.canEditAbbreviation).toBe(false);
    expect(component.transactionTypeForm.get('abbreviation')?.disabled).toBe(true);

    component.transactionTypeForm.get('abbreviation')?.enable({ emitEvent: false });
    fillRequired(component, 'XXX');
    component.handleTransactionType();

    expect(update).toHaveBeenCalledWith(expect.objectContaining({ abbreviation: 'FAC' }));
  });
});
