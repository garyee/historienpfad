import { Component, ViewChild } from '@angular/core';
import { GoogleMapComponent } from '../../components/google-map/google-map';
import {AuthService} from "../../../services/auth.service";


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild(GoogleMapComponent) mapComponent: GoogleMapComponent;

  constructor(private auth: AuthService) {
  }

  public testMarker(){
    this.mapComponent.setNewMarker();
  }
  ionSelected(){
    //this.scrollArea.scrollToTop();
    //this.refresh();
    console.log("Selected");
  }

}
