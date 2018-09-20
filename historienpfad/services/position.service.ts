import {Injectable} from '@angular/core';
import 'rxjs/add/operator/filter';
import {Geolocation} from '@ionic-native/geolocation';
import {ReplaySubject} from "rxjs/ReplaySubject";


@Injectable()
export class PositionService {
  public lat: number = 50.8386721;
  public lng: number = 12.9276668;
  public state: any = false;
  private watchdog: any;
  public positionSubject: ReplaySubject<{status: string,lat: number,lng:number}> = new ReplaySubject<{status: string,lat: number,lng:number}>(1);
  constructor(private geolocation: Geolocation) {
    //Start the geo location API
    this.retPosition();
    //Watch users position
    this.watch();
  }

  /**
   * Functions calls geolocation API of device
   */
  public retPosition() {
    this.geolocation.getCurrentPosition().then((position) => {
      //valid coordinates
      if (!isNaN(position.coords.latitude) && !isNaN(position.coords.longitude)) {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        this.positionSubject.next({status: "gps", lat: this.lat, lng: this.lng});
        this.state = "gps";
      }
    }).catch((err) => {
      this.state = err;
      //console.log('Error getting location: '+err)
    });
  }

  /**
   * Get a Position object with users coordinates when known
   */
  public getPosition():{lat: number,lng: number}{
    return {lat: this.lat,lng: this.lng}
  }

  /**
   * function that starts listening to geolocation API
   */
  private watch(){
    //initialization message send
    this.positionSubject.next({status: "Startup", lat:0, lng:0});
    //Watchdogs gets initialized with callback function
    this.watchdog = this.geolocation.watchPosition().filter((p) => p.coords !== undefined).subscribe((position)=>{
      this.lat=position.coords.latitude
      this.lng=position.coords.longitude;
      this.state=true;
      this.positionSubject.next({status: "gps", lat:this.lat, lng:this.lng});
    });

  }
}
