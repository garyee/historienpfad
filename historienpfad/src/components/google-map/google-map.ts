import {Component, Input, Renderer2, ElementRef, Inject} from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { Plugins } from '@capacitor/core';
import {} from '@types/googlemaps';
import {GeoService} from "../../../services/database/geo.service";
import {PointListService} from "../../../services/database/point-list.service";
//import { GoogleMap, GoogleMapsEvent, GoogleMapsLatLng } from './googlemaps';
const { Geolocation, Network } = Plugins;
import moment from "moment";
import {AuthService} from "../../../services/auth.service";

@Component({
  selector: 'google-map',
  templateUrl: 'google-map.html'
})
export class GoogleMapComponent {

  @Input('apiKey') apiKey: string;
  public lat: number;
  public lng: number;
  public map: any;
  public me: any;
  public markers: any[] = [];
  private mapsLoaded: boolean = false;
  private watchdog: any;
  private networkHandler = null;

  constructor(
    private renderer: Renderer2,
    private element: ElementRef,
    @Inject(DOCUMENT) private _document,
    private geo: GeoService,
    private point: PointListService,
    private auth: AuthService,
  ){

  }

  ngOnInit(){

    this.init().then((res) => {
      this.retrievePaths();
      console.log("Google Maps ready.")
    }, (err) => {
      console.log(err);
    });

  }

  private init(): Promise<any> {

    return new Promise((resolve, reject) => {

      this.loadSDK().then((res) => {

        this.initMap().then((res) => {
          resolve(true);
        }, (err) => {
          reject(err);
        });

      }, (err) => {

        reject(err);

      });

    });

  }

  private loadSDK(): Promise<any> {

    console.log("Loading Google Maps SDK");

    return new Promise((resolve, reject) => {

      if(!this.mapsLoaded){

        Network.getStatus().then((status) => {

          if(status.connected){

            this.injectSDK().then((res) => {
              resolve(true);
            }, (err) => {
              reject(err);
            });

          } else {

            if(this.networkHandler == null){

              this.networkHandler = Network.addListener('networkStatusChange', (status) => {

                if(status.connected){

                  this.networkHandler.remove();

                  this.init().then((res) => {
                    console.log("Google Maps ready.");
                    //this.retrievePaths();
                  }, (err) => {
                    console.log(err);
                  });

                }

              });

            }

            reject('Not online');
          }

        }, (err) => {

          // NOTE: navigator.onLine temporarily required until Network plugin has web implementation
          if(navigator.onLine){

            this.injectSDK().then((res) => {
              resolve(true);
            }, (err) => {
              reject(err);
            });

          } else {
            reject('Not online');
          }

        });

      } else {
        reject('SDK already loaded');
      }

    });


  }

  private injectSDK(): Promise<any> {

    return new Promise((resolve, reject) => {

      window['mapInit'] = () => {
        this.mapsLoaded = true;
        resolve(true);
      }

      let script = this.renderer.createElement('script');
      script.id = 'googleMaps';

      if(this.apiKey){
        script.src = 'https://maps.googleapis.com/maps/api/js?key=' + this.apiKey + '&callback=mapInit';
      } else {
        script.src = 'https://maps.googleapis.com/maps/api/js?callback=mapInit';
      }

      this.renderer.appendChild(this._document.body, script);

    });

  }

  private initMap(): Promise<any> {

    return new Promise((resolve, reject) => {

      Geolocation.getCurrentPosition().then((position) => {
        this.watchPosition();
        console.log(position);
        if(position!=null) {
          let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          let mapOptions = {
            center: latLng,
            zoom: 15
          };

          this.map = new google.maps.Map(this.element.nativeElement, mapOptions);
          resolve(true);

          this.setMe(position.coords.latitude, position.coords.longitude);
        }else{
          let latLng = new google.maps.LatLng(50.8389047,12.927764);
          let mapOptions = {
            center: latLng,
            zoom: 15
          };

          this.map = new google.maps.Map(this.element.nativeElement, mapOptions);
          resolve(true);

          this.setMe(position.coords.latitude, position.coords.longitude);
          console.log("Not your Position");
        }
      }, (err) => {
        reject('Could not initialise map');
      });
    });
  }
  /*
  Marker management
   */
  public delMarker(markerid: number): boolean{
    if(this.markers[markerid]!=undefined) {
      this.markers[markerid].remove();
      delete(this.markers[markerid]);
      return true;
    }
    return false;
  };
  public addMarker(markerid: number, lat: number, lng: number, title: string): void {
    let latLng = new google.maps.LatLng(lat, lng);
    if(this.markers[markerid]!=undefined){
      this.markers[markerid].setPosition(latLng);
      return;
    }
    let marker = new google.maps.Marker({
      map: this.map,
      icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
      animation: google.maps.Animation.DROP,
      position: latLng,
      //draggable: true,
      title: title,
    });
    this.markers[markerid]=marker;
  }

  public getMarkercount(){
    return this.markers.length;
  }

  public setMe(lat: number, lng: number): void {
    let latLng = new google.maps.LatLng(lat, lng);
    if(this.me!=undefined){
      this.me.setPosition(latLng);
      return;
    }
    let marker = new google.maps.Marker({
      map: this.map,
      icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      animation: 0,
      position: latLng,
    });
    this.me=marker;
  }
  public getPosition(): Promise<{lat:number,lng:number}>{
      return Geolocation.getCurrentPosition().then((position) => {
        if(position!=null) {
          this.lat=position.coords.latitude;
          this.lng=position.coords.longitude;
          return {lat:this.lat, lng:this.lng};
        }
      }, (err) => {
        this.lat=-1;
        this.lng=-1;
        return {lat:this.lat, lng:this.lng};
      });
  }
  /*
   Position Callback
   */
  private watchPosition() {
    this.watchdog = Geolocation.watchPosition({}, (position, err) => {
      if(this.map!=undefined) {
        if (position != undefined) {
          let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          this.map.setCenter(latLng);
          this.setMe(position.coords.latitude, position.coords.longitude);
        }else{
          console.log("Position Error")
        }
      }else{
        console.log("Map not initialized");
      }
    });
  }

  public retrievePaths(){
    let center = this.map.getCenter();
    this.geo.getLocations(100,[center.lat(),center.lng()],(key, location, distance)=>{
      this.point.getPoint(key,(res)=>{
        this.addMarker(this.getMarkercount(),location[0],location[1],(res.email+' '+ moment(res.ts).format('YYYY-MM-DD h:mm:ss')));
      });
    });
  }
  public setNewMarker(){
    let center = this.map.getCenter();
    this.addMarker(
      this.markers[this.getMarkercount()],
      center.lat(),
      center.lng(),"marker");

    const key=new Date().getTime()+'';
    this.geo.setLocation(key, [center.lat(),center.lng()]);
    this.point.addPoint(key,{
          name:"Test"+Math.round(Math.random()*10),
          email:this.auth.getEmail(),
          ts:new Date().getTime()});
  }
}
