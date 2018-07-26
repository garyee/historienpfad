import {Component, ViewChild} from '@angular/core';
import {GoogleMapComponent} from '../../components/google-map/google-map';
import {GeoService} from "../../../services/database/geo.service";
import {PointService} from "../../../services/database/point.service";
import {AuthService} from "../../../services/auth.service";
import {PathService} from "../../../services/database/path.service";
import {AlertController, NavController, NavParams, Tabs} from "ionic-angular";
import {UserDataService} from "../../../services/database/user-data.service";
import {BadgrService} from "../../../services/badgr.service";


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private mode = "paths";
  private selectedpath: any;
  private selectedpathcount: number = 0;
  private userLP=false;
  public mapclass: string = 'nopoint';
  @ViewChild(GoogleMapComponent) mapComponent: GoogleMapComponent;

  constructor(private geo: GeoService,
              private point: PointService,
              private auth: AuthService,
              private paths: PathService,
              private badge: BadgrService,
              private user: UserDataService,
              public navCtrl: NavController,
              public navParams: NavParams,
              public alertCtrl: AlertController,
              private tabs: Tabs) {
    this.handleMode(navParams.get('mode'));
    var that=this;
    this.user.getLPFromUser((lp)=>{
      if(lp!==undefined) {
        that.userLP = lp;
      }
    });
    // const key=paths.addPath({
    //   name:     'neuer Pfad',
    //   points:   []});

    // this.paths.getPaths((values)=>{console.log(values)});
    // this.paths.getPath('-LGzbRfJa203kpVGyVOs',undefined,(values)=>{console.log(values)});
    // this.paths.reorderPointsInPath('-LGzbRfJa203kpVGyVOs',0,1);
    // this.paths.getPathByPointKey(undefined,'-LH5TVw9RptNZ-rC_wb3',(values)=>{console.log(values)});
    // this.paths.removePath('-LGjtJxCPHQ6hGeqtATs');
    // his.paths.getPoints('-LGjtO4mFRowDD_IMIho',(values)=>{console.log(values)})
    // this.paths.addPointToPath('-LH7_-0W5ibIdyDSmQ8y',
    //   {name:'toller name2', coords: [50.825838, 12.945958],content: {html:'toller content_html2'}});
    // this.paths.getPointFromPath('-LGzbRfJa203kpVGyVOs',0,(values)=>{console.log(values)});
    // this.paths.getPointsListFromPath('-LGzbRfJa203kpVGyVOs',(values)=>{console.log(values)});
    // this.point.getPointObserv('-LH2GzRWwT4M16m5cE-T',(values)=>{console.log(values)});
    // this.paths.getPointsListFromPath('-LGzbRfJa203kpVGyVOs',(values)=>{console.log(values)});
    // this.geo.getLocations(100,[50.826160,12.945902],(values)=>{console.log(values)});
    // this.paths.getPathsByGeofireSearch(100,[50.826160,12.945902],(values)=>{console.log(values)});
    // this.paths.removePointFromPath("-LHF_nSsXjPFlzsWSJT2");
    // this.badge.getUserSelf();

  }

  public handleMode(hmode) {
    if (hmode == undefined) {
      this.mode = "paths";
      return;
    }
    this.mode = hmode;
    if (this.mode === "paths") {
      this.mapComponent.retrievePaths();
    } else if (this.mode === "path") {
      this.selectedpath = this.navParams.get('item');
    } else if (this.mode === "addpoint") {
      this.mapclass = "addpoint";
      this.selectedpath = this.navParams.get('item');

    }
  }
  public testMarker(){
    this.mapComponent.setNewMarker();
  }
  ionSelected() {
    //this.scrollArea.scrollToTop();
    //this.refresh();
    console.log(this.navParams.data);
    this.handleMode(this.navParams.get('mode'));
  }

  public clickCallback(data) {
    this.tabs.select(1);
    this.navCtrl.setRoot("tabs-page", data);
  }
  public addPoint() {
    if (this.mode == "addpoint") {
      const prompt = this.alertCtrl.create({
        title: 'Name des Punkts',
        message: "Gibt dem neuen Punkt einen Namen, und eine Kurzbeschreibung",
        inputs: [
          {name: 'title', placeholder: 'Name'},
          {name: 'note', placeholder: 'Beschreibung'},
        ],
        buttons: [
          {
            text: 'Abbrechen', handler: data => {
              console.warn('Abgebrochen');
            }
          },
          {
            text: 'Pfad beenden', handler: data => {
              console.warn('Pfad fertig');
              let params = {
                tabIndex: 1,
                mode: "editpath",
                item: {key: this.selectedpath.key}
              }
              this.navCtrl.setRoot("tabs-page", params);
            }
          },
          {
            text: 'Speichern', handler: data => {
              console.info('Hinzufügen');
              let center = this.mapComponent.map.getCenter();
              console.log(this.selectedpath);
              this.paths.addPointToPath(this.selectedpath.key,
                {name: data.title, coords: [center.lat(), center.lng()], content: {html: data.note}});
            }
          }
        ]
      });
      prompt.present();
      let center = this.mapComponent.map.getCenter();
      this.paths.getPointsListFromPath(this.selectedpath.key, (values) => {
        this.mapComponent.addMarker(values.key, center.lat(), center.lng(), values.title);
      });

    }
  }


}
