import {Component, ElementRef, EventEmitter, Inject, Input, Output, Renderer2, ViewChild} from '@angular/core';
import {DOCUMENT} from '@angular/platform-browser';
import {Plugins} from '@capacitor/core';
import {GeoService} from "../../../services/database/geo.service";
import {PointService} from "../../../services/database/point.service";
import {AuthService} from "../../../services/auth.service";
import {PositionService} from "../../../services/position.service";
import {PathService} from "../../../services/database/path.service";
import {} from './googlemaps';
import {NavController} from "ionic-angular";
const {Geolocation, Network} = Plugins;
declare var google;

@Component({
  selector: 'google-map',
  templateUrl: 'google-map.html'
})
export class GoogleMapComponent {
  @Input('apiKey') apiKey: string;
  @Input('pathparams') pathparams: any;
  @Input('mode') mode: any;
  @Output('clickcb') clickcb = new EventEmitter();

  public lat = 0;
  public lng = 0;
  public map: any;
  public me: any;
  public middle: any;
  public markers: any[] = [];
  private mapsLoaded: boolean = false;
  private networkHandler = null;
  private positionlock = false;
  @ViewChild('map') mapElement: ElementRef;
  directionsService: any;
  directionsDisplay: any;
  waypts: any[] = [];


  constructor(
    private renderer: Renderer2,
    private element: ElementRef,
    private directionsPanel: ElementRef,
    @Inject(DOCUMENT) private _document,
    private geo: GeoService,
    private point: PointService,
    private auth: AuthService,
    private pos: PositionService,
    private paths: PathService,
    private navCtrl: NavController,
  ){
  }

  ngOnInit() {
    this.init().then((res) => {
      if (this.pathparams != undefined) {
        console.log(this.mode);
        console.log(this.pathparams.key);
        this.loadPath(this.pathparams.key);
      } else {
        this.retrievePaths();
      }
      console.info("Google Maps ready.")
    }, (err) => {
      console.error(err);
    });

  }

  public addMarker(markerid: string, lat: number, lng: number, title: string): void {
    let latLng = new google.maps.LatLng(lat, lng);
    if (this.markers[markerid] != undefined) {
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
    this.markers[markerid] = marker;
    google.maps.event.addListener(this.markers[markerid], 'click', () => {
      console.info("Click Marker" + markerid);
      let params = {};
      params["tabIndex"] = 1;
      params["item"] = {key: markerid};
      if (this.mode == "paths") {
        params["mode"] = "path"
      } else {
        params["mode"] = this.mode;
      }
      this.clickcb.next(params);
    });
  }
  private loadSDK(): Promise<any> {
    console.info("Loading Google Maps SDK");
    return new Promise((resolve, reject) => {
      if (!this.mapsLoaded) {
        Network.getStatus().then((status) => {
          if (status.connected) {
            this.injectSDK().then((res) => {
              resolve(true);
            }, (err) => {
              reject(err);
            });
          } else {
            if (this.networkHandler == null) {
              this.networkHandler = Network.addListener('networkStatusChange', (status) => {
                if (status.connected) {
                  this.networkHandler.remove();
                  this.init().then((res) => {
                    console.info("Google Maps ready.");
                  }, (err) => {
                    console.error(err);
                  });
                }
              });
            }
            reject('Not online');
          }
        }, (err) => {
          // NOTE: navigator.onLine temporarily required until Network plugin has web implementation
          if (navigator.onLine) {
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
      if (this.apiKey) {
        script.src = 'https://maps.googleapis.com/maps/api/js?key=' + this.apiKey + '&callback=mapInit';
      } else {
        script.src = 'https://maps.googleapis.com/maps/api/js?callback=mapInit';
      }
      this.renderer.appendChild(this._document.body, script);
    });
  }
  public retrievePaths() {
    let center = this.map.getCenter();
    this.waypts = [];
    this.paths.getPathsByGeofireSearch(100, [center.lat(), center.lng()], (values) => {
      this.addMarker(values.key, values.coords[0], values.coords[1], (values.path.name));
    });
    //this.geo.getLocations(100, [center.lat(), center.lng()], (key, location, distance) => {
    //this.addMarker(this.getMarkercount(), location[0], location[1], ("Entfernung: " + distance));
    //this.point.getPoint(key, (res) => {
    //  this.addMarker(this.getMarkercount(), location[0], location[1], (res.email + ' ' + moment(res.ts).format('YYYY-MM-DD h:mm:ss')));
    //});
    //});
  }

  private init(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.mapsLoaded)
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

  private loadPath(data) {
    this.paths.getPath(undefined, this.pathparams.key, (values) => {
      this.markers = [];
      values.points.forEach((values) => {
        this.addMarker(values.key, values.coords[0], values.coords[1], (values.name));
        this.waypts.push({
          location: new google.maps.LatLng(values.coords[0], values.coords[1]),
          stopover: false
        })
      });
      //this.pathkey=values.key;
      this.lat = values.points[values.points.length - 1].coords[0];
      this.lng = values.points[values.points.length - 1].coords[1];
      this.startNavigating(this.pos.getPosition(), {lat: this.lat, lng: this.lng})
    });
  }

  startNavigating(startposition: {lat:number,lng:number},targetposition: {lat:number,lng:number}){
    this.directionsDisplay.setMap(this.map);
    //this.directionsDisplay.setPanel(this.directionsPanel.nativeElement.parentElement);

    this.directionsService.route({
      origin: new google.maps.LatLng(startposition.lat, startposition.lng),
      destination: new google.maps.LatLng(targetposition.lat, targetposition.lng),
      travelMode: google.maps.TravelMode['WALKING'],
      waypoints : this.waypts,
      optimizeWaypoints: false,
    }, (res, status) => {

      if(status == google.maps.DirectionsStatus.OK){
        this.directionsDisplay.setDirections(res);
      } else {
        console.warn(status);
      }

    });

  }
  /*
  Marker management
   */
  public delMarker(markerid: number): boolean {
    if (this.markers[markerid] != undefined) {
      this.markers[markerid].remove();
      delete(this.markers[markerid]);
      return true;
    }
    return false;
  };

  private initMap(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.pos.positionSubject.subscribe((data) => {
        if (this.map != undefined) {
          mylocation = this.pos.getPosition();
          if (!this.positionlock) {
            this.map.setCenter({lat: mylocation.lat, lng: mylocation.lng});
            this.positionlock = true;
          }
          this.setMe(mylocation.lat, mylocation.lng);
          if (this.lat !== 0 && this.lng !== 0) {
            this.startNavigating({lat: mylocation.lat, lng: mylocation.lng}, {lat: this.lat, lng: this.lng});
          }
          if (this.mode == "paths") {
            this.retrievePaths();
          }
        }
      });
      let mylocation = this.pos.getPosition();
      let latLng = new google.maps.LatLng(mylocation.lat, mylocation.lng);
      let mapOptions = {
        center: latLng,
        zoom: 15
      };
      this.map = new google.maps.Map(this.element.nativeElement, mapOptions);
      resolve(true);
      this.directionsService = new google.maps.DirectionsService;
      this.directionsDisplay = new google.maps.DirectionsRenderer;
      this.setMe(mylocation.lat, mylocation.lng);
    });
  }

  public getMarkercount() {
    return this.markers.length;
  }

  public setMe(lat: number, lng: number): void {
    let latLng = new google.maps.LatLng(lat, lng);
    if (this.me != undefined) {
      this.me.setPosition(latLng);
      return;
    }
    let marker = new google.maps.Marker({
      map: this.map,
      icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      animation: 0,
      position: latLng,
    });
    this.me = marker;
  }
  public setNewMarker() {
    let center = this.map.getCenter();
    this.addMarker(
      this.markers[this.getMarkercount()],
      center.lat(),
      center.lng(), "marker");
    this.point.addPoint({
      name: "Test" + Math.round(Math.random() * 10),
      coords: [center.lat(), center.lng()]
    });
  }
}
