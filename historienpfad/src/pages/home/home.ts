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
    // this.setdummyPoints();
  }

  setdummyPoints(){
    let dummyPoints = [
      [37.9, -122.1],
      [38.7, -122.2],
      [38.1, -122.3],
      [38.3, -122.0],
      [38.7, -122.1]
    ]

    dummyPoints.forEach((val, idx) => {
      let name = `dummy-location-${idx}`
      this.geo.setLocation(name, val)
    })
  }

  testMarker(){

    let center = this.mapComponent.map.getCenter();
    this.mapComponent.addMarker(
      this.mapComponent.markers[this.mapComponent.getMarkercount()],
      center.lat(),
      center.lng(),"marker");

    const key=new Date().getTime()+'';
    this.geo.setLocation(key, [center.lat(),center.lng()]);
    this.point.addPoint(key,{email:this.auth.getEmail(),ts:new Date().getTime()});
  }

  getcoords(){
    let center = this.mapComponent.map.getCenter();
    this.geo.getLocations(100,[center.lat(),center.lng()],(key, location, distance)=>{
      this.point.getPoint(key,(res)=>{

        new google.maps.Marker({
          position: {lat: location[0], lng: location[1]},
          map: this.mapComponent.map,
          title: res.email+' '+ moment(res.ts).format('YYYY-MM-DD h:mm:ss')
        });
      });
    });
  }


}
