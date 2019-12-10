import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListChecksComponent } from './list-checks.component';

describe('ListChecksComponent', () => {
  let component: ListChecksComponent;
  let fixture: ComponentFixture<ListChecksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListChecksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListChecksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
