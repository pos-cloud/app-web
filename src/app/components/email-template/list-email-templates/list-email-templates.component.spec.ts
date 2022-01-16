import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ListEmailTemplatesComponent } from './list-email-templates.component';

describe('ListEmailTemplatesComponent', () => {
  let component: ListEmailTemplatesComponent;
  let fixture: ComponentFixture<ListEmailTemplatesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ListEmailTemplatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListEmailTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
