import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentMethodComponent } from './shipment-method.component';

describe('ShipmentMethodComponent', () => {
  let component: ShipmentMethodComponent;
  let fixture: ComponentFixture<ShipmentMethodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShipmentMethodComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipmentMethodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
