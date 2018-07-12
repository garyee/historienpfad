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
  }

  public testMarker(){
    this.mapComponent.setNewMarker();
  }
  ionSelected() {
    //this.scrollArea.scrollToTop();
    //this.refresh();
    this.mapComponent.retrievePaths();
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
