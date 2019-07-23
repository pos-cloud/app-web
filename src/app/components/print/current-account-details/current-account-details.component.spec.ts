import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentAccountDetailsComponent } from './current-account-details.component';

describe('CurrentAccountDetailsComponent', () => {
  let component: CurrentAccountDetailsComponent;
  let fixture: ComponentFixture<CurrentAccountDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrentAccountDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentAccountDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
