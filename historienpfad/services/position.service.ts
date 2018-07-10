import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import {Plugins} from "@capacitor/core";
import {Subject} from "rxjs/Subject";
import 'rxjs/add/operator/filter';
import { Geolocation } from '@ionic-native/geolocation';
import {ReplaySubject} from "rxjs/ReplaySubject";


@Injectable()
export class PositionService {
  public lat: number;
  public lng: number;
  public state: any;
  private watchdog: any;
  public positionSubject: ReplaySubject<{status: string,lat: number,lng:number}> = new ReplaySubject<{status: string,lat: number,lng:number}>(1);
  constructor(private geolocation: Geolocation) {
    this.lat=50.8386721;
    this.lng=12.9276668;
    this.state="predefined";
    this.retPosition();
    this.watch();
  }
  public getPosition():{lat: number,lng: number}{
    return {lat: this.lat,lng: this.lng}
  }
  private watch(){
      this.positionSubject.next({status: "Startup", lat:0, lng:0});
      this.watchdog = this.geolocation.watchPosition().filter((p) => p.coords !== undefined).subscribe((position)=>{
        this.lat=position.coords.latitude
        this.lng=position.coords.longitude;
        console.log(position.coords.longitude + ' ' + position.coords.latitude);
        this.state=true;
        this.state="gps";
        this.positionSubject.next({status: "gps", lat:this.lat, lng:this.lng});
      });

  }
  public retPosition() {
    this.geolocation.getCurrentPosition().then((position) => {
      if (!isNaN(position.coords.latitude) && !isNaN(position.coords.longitude)) {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        this.positionSubject.next({status: "gps", lat:this.lat, lng:this.lng});
        this.state="gps";
      }
    }).catch((err) => {
      this.state=err;
      console.log('Error getting location: '+err)
    });
  }
}
