import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteCompanyGroupComponent } from './delete-company-group.component';

describe('DeleteCompanyGroupComponent', () => {
  let component: DeleteCompanyGroupComponent;
  let fixture: ComponentFixture<DeleteCompanyGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteCompanyGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteCompanyGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
