import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { TranslateMePipe } from 'app/shared/pipes/translate-me';
import { ApplicationService } from '../../core/services/application.service';
import { MenuService } from '../../core/services/menu.service';

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

  constructor(private route: ActivatedRoute, private _menu: MenuService, private _objService: ApplicationService) {}

  async ngOnInit() {
    this.route.params.subscribe((params) => {
      this.database = params['database'];
    });

    this.getMenu();
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
}
