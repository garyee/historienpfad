import { Component } from '@angular/core';
import {HomePage} from '../home/home'
import {ListPage} from "../list/list";
import {ItemDetailsPage} from "../item-details/item-details";

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {
  HomePage= HomePage;
  ItemDetailsPage= ItemDetailsPage;
  ListPage= ListPage;
  public myFunction(){
  };
}
