import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListEmailTemplatesComponent } from './list-email-templates.component';

describe('ListEmailTemplatesComponent', () => {
  let component: ListEmailTemplatesComponent;
  let fixture: ComponentFixture<ListEmailTemplatesComponent>;

  beforeEach(async(() => {
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
