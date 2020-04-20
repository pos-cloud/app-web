import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListShipmentMethodComponent } from './list-shipment-method.component';

describe('ListShipmentMethodComponent', () => {
  let component: ListShipmentMethodComponent;
  let fixture: ComponentFixture<ListShipmentMethodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListShipmentMethodComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListShipmentMethodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
