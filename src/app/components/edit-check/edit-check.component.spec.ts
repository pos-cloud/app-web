import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCheckComponent } from './edit-check.component';

describe('EditCheckComponent', () => {
  let component: EditCheckComponent;
  let fixture: ComponentFixture<EditCheckComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditCheckComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
