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

  /**
   * initialization Method called when manually selected Tab
   */
  ionSelected() {
    //switch mode based on parameter
    this.mode = this.navParams.get("mode") || "paths";
    //get the users position to show nearby paths
    this.pos.retPosition();
    //Array of Modes considered as multipath display
    var modepaths = ["paths", "addpath"];
    //Array of Modes considered as singlepath display
    var modepath = ["path", "editpath"];
    //in Multipath Mode?
    if (modepaths.indexOf(this.mode) > -1)
    //display all nearby paths
      this.pos.positionSubject.subscribe((data) => {
        this.getPaths(100, [this.pos.lat, this.pos.lng]);
      });
    //in singlepath Mode?
    if (modepath.indexOf(this.mode) > -1) {
      //get points of selected paths
      if (this.navParams.get("item")) {
        this.getPoints(this.navParams.get("item").key);
      } else {
        this.getPaths(100, [this.pos.lat, this.pos.lng]);
      }
    }
  }

  /**
   * Method of button press
   */
  public addPath() {
    //create the prompt for new path name
    const prompt = this.alertCtrl.create({
      title: 'Pfadname',
      message: "Gibt dem Neuen Pfad einen Namen",
      inputs: [{name: 'title', placeholder: 'Name'},],
      buttons: [
        {
          text: 'Abbrechen', handler: data => {
            //Do nothing on canceled
            //console.warn('Abgebrochen');
          }
        },
        {
          text: 'Speichern', handler: data => {
            //use entered name for Path Creation
            //console.info('Hinzufügen');
            const key = this.paths.addPath({
                name: data.title,
                points: []
              }
            );
            //params for navigation to map in add mode
            let params = {
              tabIndex: 0,
              mode: "addpoint",
              item: {key: key, name: data.title, note: ''}
            }
            //this.tabs.select(0);
            this.navCtrl.setRoot("tabs-page", params);
          }
        }
      ]
    });
    //display the prompt
    prompt.present();
  }

  /**
   * Method called when selecting a path in game mode
   */
  public startPath() {
    let params = {
      tabIndex: 0,
      mode: "path",
      item: this.navParams.get("item")
    }
    //this.tabs.select(0);
    this.app.getRootNav().push("tabs-page", params);
  }

  /**
   * Method called when selecting a path in edit mode TODO: make it editable
   */
  public editPath(key) {
    let params = {
      pageName: 'tabs-page',
      tabComponent: 'ListPage',
      mode: "editpath",
      index: 1,
      icon: 'shuffle'
    };

  }

  /**
   * Method of retrieving paths
   * @param radius to be searched
   * @param coords as circle center to be searched
   */
  public getPaths(radius, coords) {
    //Clear the item list
    this.items = [];
    //Query the DB
    this.paths.getPathsByGeofireSearch(radius, coords, (resObj) => {
      //Not empty result
      if (resObj !== null) {
        //Check if Object allready in list
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

  /**
   * The the Point List of a selected Path
   * @param key of the path
   */
  public getPoints(key) {
    //Empty the Item List
    this.items = [];
    //retrieve points of list
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

  /**
   * Method allowing the list to be reordered
   */
  public reorderallowed(): boolean {
    if (this.mode == "path") {
      return true;
    } else {
      return false;
    }
  }

  /**
   * checks if supplied key is already in item list
   * @param searchkey to be found in item list
   */
  public isListitem(searchkey: string): boolean {
    for(var i in this.items){
      if (this.items[i].key == searchkey)
        return true;
    }
    return false;
  }

  /**
   * action of tapped list item
   * @param event
   * @param item the item tapped
   */
  itemTapped(event, item) {
    let params = {};
    //Mode selects resulting action
    switch (this.mode) {
      case "paths":
        if (item) {
          params["tabIndex"] = 0;
          params["item"] = item;
          params["mode"] = "path";
        }
        //this.tabs.select(0);
        this.app.getRootNav().push("tabs-page", params);
        break;
      case "path":
        if (item) {
          params["tabIndex"] = 2;
          params["item"] = item;
          params["mode"] = "point";
        }
        //this.tabs.select(2);
        this.app.getRootNav().push("tabs-page", params);
        break;
      case "editpath":
        if (this.navParams.get("item") !== undefined) {
          this.points.getPoint(item.key, (data) => {
            params["tabIndex"] = 2;
            params["item"] = data;
            params["mode"] = "editpoint";
            //this.tabs.select(2);
            this.app.getRootNav().push("tabs-page", params);
          });
        } else {
          params["tabIndex"] = 1;
          params["item"] = item;
          params["mode"] = "editpath";
          this.app.getRootNav().push("tabs-page", params);
          //this.tabs.select(1);
        }
        break;
      case "addpath":
        if (item) {
          params["tabIndex"] = 2;
          params["item"] = item;
          params["mode"] = "path";
        }
        this.navCtrl.setRoot("tabs-page", params);
        //this.tabs.select(0);
        break;
    }
  }

  /**
   * Method called then list gets reordered
   * @param indexes new index list
   */
  reorderItems(indexes) {
    if (this.pathkey != undefined) {
      let element = this.items[indexes.from];
      this.items.splice(indexes.from, 1);
      this.items.splice(indexes.to, 0, element);
      this.paths.reorderPointsInPath(this.pathkey, indexes.from, indexes.to);
    }
  }
}
