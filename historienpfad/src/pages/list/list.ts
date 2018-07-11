import {Component, ViewChild} from '@angular/core';

import {NavController, NavParams} from 'ionic-angular';

import {ItemDetailsPage} from '../item-details/item-details';
import {PointService} from "../../../services/database/point.service";
import {GeoService} from "../../../services/database/geo.service";
import {AuthService} from "../../../services/auth.service";
import {GoogleMapComponent} from "../../components/google-map/google-map";
import {templateSourceUrl} from "@angular/compiler";
import moment from "moment";
import {Geolocation} from "@capacitor/core";
import {PositionService} from "../../../services/position.service";
import {PathService} from "../../../services/database/path.service";

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  icons: string[];
  items: Array<{ id: number, title: string, note: string, icon: string }> = [];

  @ViewChild(GoogleMapComponent) mapComponent: GoogleMapComponent;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private geo: GeoService,
              private point: PointService,
              private auth: AuthService,
              private pos: PositionService,
              private paths: PathService) {
    this.icons = ['flask', 'wifi', 'beer', 'football', 'basketball', 'paper-plane', 'american-football', 'boat', 'bluetooth', 'build'];

    this.ionSelected();
  }

  ionSelected() {
    //this.scrollArea.scrollToTop();
    //this.refresh();
    this.pos.retPosition();
    for (let i = 0; i <= 1000; i = i + 1) {
      if (this.pos.state !== true) {
      }
    }
    this.getPaths(100, [this.pos.lat, this.pos.lng]);
  }

  getPaths(radius, coords) {
    this.paths.getPathsByGeofireSearch(radius, coords, (resObj) => {
      if (resObj !== null) {
            this.items.push({
              id: resObj.key,
              title: resObj.path.name + ':',
              note: ('(' + moment().format('YYYY-MM-DD h:mm:ss') + ')'),
              icon: 'contract'
            });
      }
    });
  }

  itemTapped(event, item) {
    this.navCtrl.push(ItemDetailsPage, {
      item: item
    });
  }

  reorderItems(indexes) {
    let element = this.items[indexes.from];
    this.items.splice(indexes.from, 1);
    this.items.splice(indexes.to, 0, element);
    //this.paths = reorderArray(this.paths, indexes);
  }
}
