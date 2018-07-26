import {Component, ViewChild} from '@angular/core';

import {AlertController, Nav, NavController, NavParams, Tabs} from 'ionic-angular';
import {PointService} from "../../../services/database/point.service";
import {GeoService} from "../../../services/database/geo.service";
import {AuthService} from "../../../services/auth.service";
import moment from "moment";
import {PositionService} from "../../../services/position.service";
import {PathService} from "../../../services/database/path.service";

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  icons: string[];
  items: Array<{ id: string, title: string, note: string, icon: string }> = [];
  mode = "paths";
  pathkey: any;
  @ViewChild(Nav) nav: Nav;
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private geo: GeoService,
              private point: PointService,
              private auth: AuthService,
              private pos: PositionService,
              private paths: PathService,
              public alertCtrl: AlertController,
              private tabs: Tabs) {
    this.icons = ['flask', 'wifi', 'beer', 'football', 'basketball', 'paper-plane', 'american-football', 'boat', 'bluetooth', 'build'];
    this.mode = this.navParams.get("mode") || "paths";
    if (this.mode === "path") {
      //Load Single Path
    } else {
      //Load all Paths
    }
    this.ionSelected();
  }

  ionSelected() {
    //this.scrollArea.scrollToTop();
    //this.refresh();
    this.pos.retPosition();
    this.pos.positionSubject.subscribe((data) => {
      if (this.pos.state !== true) {
        var modes = ["paths", "editpath", "addpath"];
        if (modes.indexOf(this.mode) > -1)
          this.getPaths(100, [this.pos.lat, this.pos.lng]);
      }
    });
  }

  public addPath() {
    const prompt = this.alertCtrl.create({
      title: 'Pfadname',
      message: "Gibt dem Neuen Pfad einen Namen",
      inputs: [{name: 'title', placeholder: 'Name'},],
      buttons: [
        {
          text: 'Abbrechen', handler: data => {
            console.warn('Abgebrochen');
          }
        },
        {
          text: 'Speichern', handler: data => {
            console.info('Hinzufügen');
            const key = this.paths.addPath({
              name: data.title,
                points: []
              }
            );
            console.log(key);
            let params = {
              tabIndex: 2,
              mode: "addpoint",
              item: {key: key, name: data.title, note: ''}
            }
            //var t: Tabs = this.navCtrl.parent;
            //t.select(0);
            this.tabs.select(0);
            this.nav.setRoot("tabs-page", params);
          }
        }
      ]
    });
    prompt.present();
  }

  public reorderallowed(): boolean {
    if (this.mode == "path") {
      return true;
    } else {
      return false;
    }
  }
  getPaths(radius, coords) {
    this.paths.getPathsByGeofireSearch(radius, coords, (resObj) => {
      if (resObj !== null) {
        if (!this.isListitem(resObj.key)) {
          this.items.push({
            id: resObj.key,
            title: resObj.path.name + ':',
            note: ('(' + moment().format('YYYY-MM-DD h:mm:ss') + ')'),
            icon: 'contract'
          });
        }
      }
    });
  }

  isListitem(searchkey: string): boolean{
      for(var i in this.items){
        if(this.items[i].id==searchkey)
          return true;
      }
      return false;
  }
  itemTapped(event, item) {
    if (this.mode == "paths") {
      let params = {};
      if (item) {
        params["tabIndex"] = 0;
        params["item"] = item;
      }
      this.tabs.select(0);
      this.navCtrl.setRoot("tabs-page", params);
    }
  }

  reorderItems(indexes) {
    let element = this.items[indexes.from];
    this.items.splice(indexes.from, 1);
    this.items.splice(indexes.to, 0, element);
    if (this.pathkey != undefined)
      this.paths.reorderPointsInPath(this.pathkey, indexes.from, indexes.to);
    //this.paths = reorderArray(this.paths, indexes);
  }
}
