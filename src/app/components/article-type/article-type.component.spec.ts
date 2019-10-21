import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleTypeComponent } from './article-type.component';

describe('ArticleTypeComponent', () => {
  let component: ArticleTypeComponent;
  let fixture: ComponentFixture<ArticleTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArticleTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArticleTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
