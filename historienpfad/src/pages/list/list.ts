import {Component, ViewChild} from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';

import { ItemDetailsPage } from '../item-details/item-details';
import {PointListService} from "../../../services/database/point-list.service";
import {GeoService} from "../../../services/database/geo.service";
import {AuthService} from "../../../services/auth.service";
import {GoogleMapComponent} from "../../components/google-map/google-map";
import {templateSourceUrl} from "@angular/compiler";
import moment from "moment";
import {Geolocation} from "@capacitor/core";
import {PositionService} from "../../../services/position.service";

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  icons: string[];
  items: Array<{id: number, title: string, note: string, icon: string}>;

  @ViewChild(GoogleMapComponent) mapComponent: GoogleMapComponent;
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private geo: GeoService,
              private point: PointListService,
              private auth: AuthService,
              private pos: PositionService) {
    this.icons = ['flask', 'wifi', 'beer', 'football', 'basketball', 'paper-plane', 'american-football', 'boat', 'bluetooth', 'build'];

    this.items = [];
    pos.retPosition();
    for(let i=0; i<=1000; i=i+1){
      if(pos.state!==true){}
    }
    console.log(pos.state);
    this.geo.getLocations(100, [pos.lat, pos.lng], (key, location, distance) => {
      if(key!==undefined){
        this.point.getPoint(key, (res) => {
          this.items.push({
            id: key,
            title: res.name + ':' + Math.round(distance*100)/100 + "km",
            note: ('(' + moment(res.ts).format('YYYY-MM-DD h:mm:ss')+')'),
            icon: 'contract'
          });
        });
      }
    });
  }
  ionSelected(){
    //this.scrollArea.scrollToTop();
    //this.refresh();
    console.log("Selected");
    this.items = [];
    this.pos.retPosition();
    for(let i=0; i<=1000; i=i+1){
      if(this.pos.state!==true){}
    }
    console.log(this.pos.state);
    this.geo.getLocations(100, [this.pos.lat, this.pos.lng], (key, location, distance) => {
      if(key!==undefined){
        this.point.getPoint(key, (res) => {
          this.items.push({
            id: key,
            title: res.name + ':' + Math.round(distance*100)/100 + "km",
            note: ('(' + moment(res.ts).format('YYYY-MM-DD h:mm:ss')+')'),
            icon: 'contract'
          });
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
    //this.items = reorderArray(this.items, indexes);
  }
}
