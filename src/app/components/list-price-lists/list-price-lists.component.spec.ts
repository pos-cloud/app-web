import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPriceListsComponent } from './list-price-lists.component';

describe('ListPriceListsComponent', () => {
  let component: ListPriceListsComponent;
  let fixture: ComponentFixture<ListPriceListsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListPriceListsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListPriceListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
