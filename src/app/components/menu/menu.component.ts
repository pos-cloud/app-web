import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { ActivatedRoute } from '@angular/router';
import { MenuService } from './menu.service';
import {ApplicationService} from '../application/application.service';
import {Application, ApplicationType} from '../application/application.model';

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
    styleMenu: Application

    constructor(
        private route: ActivatedRoute,
        private _menu: MenuService,
        private _objService: ApplicationService,
    ) {}

    async ngOnInit() {
        this.route.params.subscribe(params => {
            this.database = params['database'];
        });

        this.getMenu()
        this.getApplication()
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

    getApplication(){
        this._objService.getAll({
         project:{
            "type": 1,
            "menu.portain": 1,
            "menu.background": 1,
            "menu.article.font": 1,
            "menu.article.size": 1,
            "menu.article.color": 1,
            "menu.article.style": 1,
            "menu.article.weight": 1,
            "menu.category.font": 1,
            "menu.category.size": 1,
            "menu.category.color": 1,
            "menu.category.style": 1,
            "menu.category.weight": 1,
            "menu.price.font": 1,
            "menu.price.size": 1,
            "menu.price.color": 1,
            "menu.price.style": 1,
            "menu.price.weight": 1,
            "menu.observation.font": 1,
            "menu.observation.size": 1,
            "menu.observation.color": 1,
            "menu.observation.style": 1,
            "menu.observation.weight": 1
         },
         match:{
            type: ApplicationType.Menu
         }
        }).subscribe(
            (result) =>{
            console.log(result)
            // if (result.status === 200) { 
            // this.styleMenu = result.result[0]
            // }
            }
        )
    }
}