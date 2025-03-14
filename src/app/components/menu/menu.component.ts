import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { TranslateMePipe } from 'app/shared/pipes/translate-me';
import { ApplicationService } from '../../core/services/application.service';
import { MenuService } from '../../core/services/menu.service';
import { Application, ApplicationType } from '../application/application.model';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  providers: [TranslateMePipe],
  encapsulation: ViewEncapsulation.None,
})
export class MenuComponent implements OnInit {
  @ViewChild('menuSection') menuSection!: ElementRef;

  database: string;
  menu: [];
  styleMenu: Application;

  constructor(
    private route: ActivatedRoute,
    private _menu: MenuService,
    private _objService: ApplicationService
  ) {}

  async ngOnInit() {
    this.route.params.subscribe((params) => {
      this.database = params['database'];
    });

    this.getMenu();
    //this.getApplication();
  }

  getMenu() {
    this._menu.getMenu(this.database).subscribe((result) => {
      if (result?.result) {
        // Mapeamos y organizamos la data en un array en vez de objeto
        this.menu = result.result.reduce((acc, product) => {
          const category = product.category.description;
          const categoryPicture = product.category.picture;
          const description = product.description;
          const price = product.salePrice || 0;
          const observation = product.observation || '';

          let categoryData = acc.find((cat) => cat.name === category);

          if (!categoryData) {
            categoryData = {
              name: category,
              picture: categoryPicture,
              products: [],
            };
            acc.push(categoryData);
          }

          categoryData.products.push({
            description,
            price,
            observation,
          });

          return acc;
        }, []);
      }
    });
  }

  scrollToMenu() {
    this.menuSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  getApplication() {
    this._objService
      .getAll({
        project: {
          type: 1,
          'menu.portain': 1,
          'menu.background': 1,
          'menu.article.font': 1,
          'menu.article.size': 1,
          'menu.article.color': 1,
          'menu.article.style': 1,
          'menu.article.weight': 1,
          'menu.category.font': 1,
          'menu.category.size': 1,
          'menu.category.color': 1,
          'menu.category.style': 1,
          'menu.category.weight': 1,
          'menu.price.font': 1,
          'menu.price.size': 1,
          'menu.price.color': 1,
          'menu.price.style': 1,
          'menu.price.weight': 1,
          'menu.observation.font': 1,
          'menu.observation.size': 1,
          'menu.observation.color': 1,
          'menu.observation.style': 1,
          'menu.observation.weight': 1,
        },
        match: {
          type: ApplicationType.Menu,
        },
      })
      .subscribe((result) => {
        // if (result.status === 200) {
        // this.styleMenu = result.result[0]
        // }
      });
  }
}
