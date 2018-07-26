import {Component} from '@angular/core';
import {HomePage} from '../home/home'
import {ListPage} from "../list/list";
import {ItemDetailsPage} from "../item-details/item-details";
import {IonicPage, NavController, NavParams} from "ionic-angular";

@IonicPage({name: 'tabs-page'})
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {
  HomePage = HomePage;
  ItemDetailsPage = ItemDetailsPage;
  ListPage = ListPage;
  myIndex: number;
  params: any;

  constructor(public navParams: NavParams,
              public navCtrl: NavController) {
    // Set the active tab based on the passed index from menu.ts
    this.myIndex = navParams.get("tabIndex") || 0;
    this.params = navParams.data;

  }

  public updateParams(id) {
    this.myIndex = id;
    this.params = this.navParams.data;
  }

  public getSelectedIndex() {
    return this.myIndex;
  }
}
