import {Component} from '@angular/core';
import {HomePage} from '../home/home'
import {ListPage} from "../list/list";
import {ItemDetailsPage} from "../item-details/item-details";
import {PointEditPage} from "../point-edit/point-edit";
import {IonicPage, NavParams} from "ionic-angular";

@IonicPage({name: 'tabs-page'})
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {
  HomePage = HomePage;
  ItemDetailsPage = ItemDetailsPage;
  ListPage = ListPage;
  PointEditPage = PointEditPage;
  myIndex: number;
  params: any;

  constructor(navParams: NavParams) {
    // Set the active tab based on the passed index from menu.ts
    console.log(navParams.data)
    this.myIndex = navParams.get("tabIndex") || 0;
    this.params = navParams.data;
  }
}

