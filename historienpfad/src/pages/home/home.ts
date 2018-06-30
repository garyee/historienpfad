import { Component, ViewChild } from '@angular/core';
import { GoogleMapComponent } from '../../components/google-map/google-map';
import {GeoService} from "../../../services/database/geo.service";
import {PointListService} from "../../../services/database/point-list.service";
import {AuthService} from "../../../services/auth.service";
import moment from "moment";


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild(GoogleMapComponent) mapComponent: GoogleMapComponent;

  constructor(private geo: GeoService,
              private point: PointListService,
              private auth: AuthService) {
  }

  public testMarker(){

    let center = this.mapComponent.map.getCenter();
    this.mapComponent.addMarker(
      this.mapComponent.markers[this.mapComponent.getMarkercount()],
      center.lat(),
      center.lng(),"marker");

    const key=new Date().getTime()+'';
    this.geo.setLocation(key, [center.lat(),center.lng()]);
    this.point.addPoint(key,{
          name:"Test"+Math.round(Math.random()*10),
          email:this.auth.getEmail(),
          ts:new Date().getTime()});
  }
  ionSelected() {
    //this.scrollArea.scrollToTop();
    //this.refresh();
    console.log("Selected");
    this.getcoords();
  }

  public getcoords(){
    let center = this.mapComponent.map.getCenter();
    this.geo.getLocations(100,[center.lat(),center.lng()],(key, location, distance)=>{
      this.point.getPoint(key,(res)=>{
        this.mapComponent.addMarker(this.mapComponent.getMarkercount(),location[0],location[1],(res.email+' '+ moment(res.ts).format('YYYY-MM-DD h:mm:ss')));
      });
    });
  }


}
