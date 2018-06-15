import { Component, ViewChild } from '@angular/core';
import { GoogleMapComponent } from '../../components/google-map/google-map';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild(GoogleMapComponent) mapComponent: GoogleMapComponent;

  constructor() {

  }

  testMarker(){

    let center = this.mapComponent.map.getCenter();
    this.mapComponent.addMarker(
      this.mapComponent.markers[this.mapComponent.getMarkercount()],
      center.lat(),
      center.lng(),"marker");

  }

}
