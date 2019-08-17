import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectDepositComponent } from './select-deposit.component';

describe('SelectDepositComponent', () => {
  let component: SelectDepositComponent;
  let fixture: ComponentFixture<SelectDepositComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectDepositComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectDepositComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
