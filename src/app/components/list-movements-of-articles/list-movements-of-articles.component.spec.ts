import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMovementsOfArticlesComponent } from './list-movements-of-articles.component';

describe('ListMovementsOfArticlesComponent', () => {
  let component: ListMovementsOfArticlesComponent;
  let fixture: ComponentFixture<ListMovementsOfArticlesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListMovementsOfArticlesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListMovementsOfArticlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
