import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListStructureComponent } from './list-structure.component';

describe('ListStructureComponent', () => {
  let component: ListStructureComponent;
  let fixture: ComponentFixture<ListStructureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListStructureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListStructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
