import {Component, ViewChild} from '@angular/core';

import {AlertController, App, Nav, NavController, NavParams, Tabs} from 'ionic-angular';
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
  items: Array<{ key: string, title: string, note: string, icon: string }> = [];
  mode = "paths";
  pathkey: any;
  @ViewChild(Nav) nav: Nav;

  constructor(private app: App,
              public navCtrl: NavController,
              public navParams: NavParams,
              private geo: GeoService,
              private point: PointService,
              private auth: AuthService,
              private pos: PositionService,
              private paths: PathService,
              public alertCtrl: AlertController,
              private tabs: Tabs,
              private points: PointService) {
    this.ionSelected();
  }

  ionSelected() {
    this.pos.retPosition();
    this.mode = this.navParams.get("mode") || "paths";
    console.log(this.mode);
    var modepaths = ["paths", "addpath"];
    var modepath = ["path", "editpath"];
    if (modepaths.indexOf(this.mode) > -1)
      this.pos.positionSubject.subscribe((data) => {
        this.getPaths(100, [this.pos.lat, this.pos.lng]);
      });
    if (modepath.indexOf(this.mode) > -1) {
      if (this.navParams.get("item")) {
        this.getPoints(this.navParams.get("item").key);
      } else {
        this.getPaths(100, [this.pos.lat, this.pos.lng]);
      }
    }
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
              tabIndex: 0,
              mode: "addpoint",
              item: {key: key, name: data.title, note: ''}
            }
            //var t: Tabs = this.navCtrl.parent;
            //t.select(0);
            //this.tabs.select(0);
            this.navCtrl.setRoot("tabs-page", params);
          }
        }
      ]
    });
    prompt.present();
  }

  public startPath() {
    let params = {
      tabIndex: 0,
      mode: "path",
      item: this.navParams.get("item")
    }
    this.tabs.select(0);
    this.app.getRootNav().push("tabs-page", params);
  }

  public editPath(key) {
    let params = {
      pageName: 'tabs-page',
      tabComponent: 'ListPage',
      mode: "editpath",
      index: 1,
      icon: 'shuffle'
    };

  }

  public getPaths(radius, coords) {
    this.items = [];
    this.paths.getPathsByGeofireSearch(radius, coords, (resObj) => {
      if (resObj !== null) {
        if (!this.isListitem(resObj.key)) {
          this.items.push({
            key: resObj.key,
            title: resObj.path.name + ':',
            note: "Keine Notiz",
            icon: 'contract'
          });
        }
      }
    });
  }

  public getPoints(key) {
    this.items = [];
    this.paths.getPath(undefined, key, (resObj) => {
      resObj.points.forEach((values) => {
        this.items.push({
          key: values.key,
          title: values.name + ':',
          note: values.note,
          icon: 'pin'
        });
      });
    });
  }

  public reorderallowed(): boolean {
    if (this.mode == "path") {
      return true;
    } else {
      return false;
    }
  }

  public isListitem(searchkey: string): boolean {
      for(var i in this.items){
        if (this.items[i].key == searchkey)
          return true;
      }
      return false;
  }
  itemTapped(event, item) {
    let params = {};
    switch (this.mode) {
      case "paths":
        if (item) {
          params["tabIndex"] = 0;
          params["item"] = item;
          params["mode"] = "path";
        }
        this.tabs.select(0);
        this.app.getRootNav().push("tabs-page", params);
        break;
      case "path":
        if (item) {
          params["tabIndex"] = 2;
          params["item"] = item;
          params["mode"] = "point";
        }
        this.tabs.select(2);
        this.app.getRootNav().push("tabs-page", params);
        break;
      case "editpath":
        if (this.navParams.get("item") !== undefined) {
          this.points.getPoint(item.key, (data) => {
            params["tabIndex"] = 2;
            params["item"] = data;
            params["mode"] = "editpoint";
            this.tabs.select(2);
            this.app.getRootNav().push("tabs-page", params);
          });
        } else {
          params["tabIndex"] = 1;
          params["item"] = item;
          params["mode"] = "editpath";
          this.navCtrl.setRoot("tabs-page", params);
          this.tabs.select(1);
        }
        break;
      case "addpath":
        if (item) {
          params["tabIndex"] = 2;
          params["item"] = item;
          params["mode"] = "path";
        }
        this.navCtrl.setRoot("tabs-page", params);
        this.tabs.select(0);
        break;
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
