import { Component } from '@angular/core';
import {HomePage} from '../home/home'
import {HelloIonicPage} from "../hello-ionic/hello-ionic";
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
}
