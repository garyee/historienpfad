import { Component, ViewChild } from '@angular/core';
import { GoogleMapComponent } from '../../components/google-map/google-map';
import {GeoService} from "../../../services/database/geo.service";
import {PointService} from "../../../services/database/point.service";
import {AuthService} from "../../../services/auth.service";
import {PathService} from "../../../services/database/path.service";


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild(GoogleMapComponent) mapComponent: GoogleMapComponent;

  constructor(private geo: GeoService,
              private point: PointService,
              private auth: AuthService,
              private paths: PathService) {
    // const key=paths.addPath({
    //   name:     'neuer Pfad',
    //   points:   []});

    this.paths.getPaths((values)=>{console.log(values)});
    // this.paths.getPath('-LGzbRfJa203kpVGyVOs',(values)=>{console.log(values)});
    // this.paths.removePath('-LGjtJxCPHQ6hGeqtATs');
    // his.paths.getPoints('-LGjtO4mFRowDD_IMIho',(values)=>{console.log(values)})
    // this.paths.addPointToPath('-LGzbRfJa203kpVGyVOs',
    //   {name:'toller name', coords: [76,-45],content: {html:'toller content_html'}});
    // this.paths.getPointFromPath('-LGzbRfJa203kpVGyVOs',0,(values)=>{console.log(values)});
    // this.paths.getPointsListFromPath('-LGzbRfJa203kpVGyVOs',(values)=>{console.log(values)});
    // this.point.getPointObserv('-LH2GzRWwT4M16m5cE-T',(values)=>{console.log(values)});
    // this.paths.getPointsListFromPath('-LGzbRfJa203kpVGyVOs',(values)=>{console.log(values)});
  }

  public testMarker(){
    this.mapComponent.setNewMarker();
  }
  ionSelected() {
    //this.scrollArea.scrollToTop();
    //this.refresh();
    console.log("Selected");
  }

  public getcoords(){
    let center = this.mapComponent.map.getCenter();
    // this.geo.getLocations(100,[center.lat(),center.lng()],(key, location, distance)=>{
    //   this.point.getPoint(key,(res)=>{
    //     this.mapComponent.addMarker(this.mapComponent.getMarkercount(),location[0],location[1],(res.email+' '+ moment(res.ts).format('YYYY-MM-DD h:mm:ss')));
    //   });
    // });
  }


}
