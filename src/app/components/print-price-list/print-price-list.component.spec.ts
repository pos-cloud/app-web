import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintPriceListComponent } from './print-price-list.component';

describe('PrintPriceListComponent', () => {
  let component: PrintPriceListComponent;
  let fixture: ComponentFixture<PrintPriceListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintPriceListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintPriceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
