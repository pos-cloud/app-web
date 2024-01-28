import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { ActivatedRoute } from '@angular/router';
import { MenuService } from './menu.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  providers: [ TranslateMePipe],
  encapsulation: ViewEncapsulation.None
})

export class MenuComponent implements OnInit {

    database: string
    menu: {}

    constructor(
        private route: ActivatedRoute,
        private _menu: MenuService
    ) {}

    async ngOnInit() {
        this.route.params.subscribe(params => {
            this.database = params['database'];
        });

        this.getMenu()
    }

    getMenu() {
        const organizedData = {};

        this._menu.getMenu(this.database).subscribe(
            result => {
                if(result?.result?.data) {
                    result.result.data.forEach(product => {
                        const category = product.category.description;
                        const description = product.description;
                        const price = product.salePrice || 0; 
                        const observation = product.observation || "";
                      
                        if (!organizedData[category]) {
                          organizedData[category] = {};
                        }
                      
                        organizedData[category][description] = {
                          price: price,
                          observation: observation
                        };
                    });

                    this.menu = organizedData
                }
            }
        )
    }

    getMenuCategories() {
        if (this.menu && Object.keys(this.menu).length > 0) {
            return Object.keys(this.menu);
        }
        return [];
    }
    
    getProduct(category: string) {
        if (this.menu && this.menu[category] && Object.keys(this.menu[category]).length > 0) {
            return Object.keys(this.menu[category]);
        }
        return [];
    }
}