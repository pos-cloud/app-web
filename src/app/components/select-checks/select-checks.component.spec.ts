import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectChecksComponent } from './select-checks.component';

describe('SelectChecksComponent', () => {
  let component: SelectChecksComponent;
  let fixture: ComponentFixture<SelectChecksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectChecksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectChecksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
