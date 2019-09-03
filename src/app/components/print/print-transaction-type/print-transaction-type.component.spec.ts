import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintTransactionTypeComponent } from './print-transaction-type.component';

describe('PrintTransactionTypeComponent', () => {
  let component: PrintTransactionTypeComponent;
  let fixture: ComponentFixture<PrintTransactionTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintTransactionTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintTransactionTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
