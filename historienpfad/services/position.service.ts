import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import {Plugins} from "@capacitor/core";
const { Geolocation } = Plugins;

@Injectable()
export class PositionService {
  public lat: number;
  public lng: number;
  public state: any;
  private watchdog: any;

  constructor() {
    this.watch();
    this.lat=50.838672100000004;
    this.lng=12.927666799999999;
    this.state="predefined";
  }
  public getPosition():{lat: number,lng: number}{
    return {lat: this.lat,lng: this.lng}
  }
  private watch(){
    this.watchdog = Geolocation.watchPosition({}, (position, err) => {
      if (position != undefined) {
          this.lat=position.coords.latitude
          this.lng=position.coords.longitude;
          this.state=true;
        }else{
          this.state="uncertain";
          console.log("Position Error")
        }
    });
  }
  public retPosition() {
    Geolocation.getCurrentPosition().then((position) => {
      if (!isNaN(position.coords.latitude) && !isNaN(position.coords.longitude)) {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        this.state=true;
      }
    }, (err) => {
      this.state=err;
    });
  }
}
