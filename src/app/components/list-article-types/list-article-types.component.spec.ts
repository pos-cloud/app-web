import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListArticleTypesComponent } from './list-article-types.component';

describe('ListArticleTypesComponent', () => {
  let component: ListArticleTypesComponent;
  let fixture: ComponentFixture<ListArticleTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListArticleTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListArticleTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
