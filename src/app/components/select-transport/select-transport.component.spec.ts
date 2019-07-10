import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectTransportComponent } from './select-transport.component';

describe('SelectTransportComponent', () => {
  let component: SelectTransportComponent;
  let fixture: ComponentFixture<SelectTransportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectTransportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectTransportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
