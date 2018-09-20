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
import {UserDataService} from "../../../services/database/user-data.service";
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
    private user: UserDataService,
  ){
  }

  ngOnInit() {
    this.init().then((res) => {
      if (this.pathparams != undefined) {
        this.loadPath(this.pathparams.key);
      } else {
        this.retrievePaths();
      }
      //console.info("Google Maps ready.")
    }, (err) => {
      console.error(err);
    });

  }

  /**
   * Adds a Marker to the Marker Array and
   * @param markerid as a Reference in DB
   * @param lat Markers Latitude
   * @param lng Marker Longtitude
   * @param title Markers Title/Description
   */
  public addMarker(markerid: string, lat: number, lng: number, title: string): void {
    //If Marker has Valid Positiona
    if (lat > 0 && lng > 0) {
      let latLng = new google.maps.LatLng(lat, lng);
      //Is Marker known yet =
      if (this.markers[markerid] != undefined) {
        //Adjust its Position
        this.markers[markerid].setPosition(latLng);
      }
      //Marker is new on Map
      else {
        let marker = new google.maps.Marker({
          map: this.map,
          icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
          animation: google.maps.Animation.DROP,
          position: latLng,
          //draggable: true,
          title: title,
        });
        //Add Marker to Global Marker Array
        this.markers[markerid] = marker;
        //Make the Marker clickable
        google.maps.event.addListener(this.markers[markerid], 'click', () => {
          //console.info("Click Marker" + markerid);
          //Create Param Objekt for Navigation
          let params = {};
          params["tabIndex"] = 1;
          params["item"] = {key: markerid};
          //Mode determindes what to do with Markerid (Fetch Path/Point Details)
          if (this.mode == "paths") {
            params["mode"] = "path"
          } else {
            params["mode"] = this.mode;
          }
          //Call External Callback for Navigation
          this.clickcb.next(params);
        });
      }
    }
  }

  /**
   * Retrieves All nearby paths for display
   */
  public retrievePaths() {
    //get center Coordinates for
    let center = this.map.getCenter();
    //Clear Waypoint List (Ends Path Mode)
    this.waypts = [];
    //Querys Geofire database
    this.paths.getPathsByGeofireSearch(100, [center.lat(), center.lng()], (values) => {
      //Add Marker for all Startpoints
      this.addMarker(values.key, values.coords[0], values.coords[1], (values.path.name));
    });
  }

  /**
   * Calculate and Display Route trough all Waypoints to target
   * @param startposition Coordinate Object of Start
   * @param targetposition Coordinate Object of Target
   */
  public startNavigating(startposition: { lat: number, lng: number }, targetposition: { lat: number, lng: number }) {
    this.directionsDisplay.setMap(this.map);
    //this.directionsDisplay.setPanel(this.directionsPanel.nativeElement.parentElement);
    //Create directions Object based on Route Details
    this.directionsService.route({
      origin: new google.maps.LatLng(startposition.lat, startposition.lng),
      destination: new google.maps.LatLng(targetposition.lat, targetposition.lng),
      //Because users should walk (and take other paths then cars)
      travelMode: google.maps.TravelMode['WALKING'],
      waypoints: this.waypts,
      //we dont want google to improve our route
      optimizeWaypoints: false,
    }, (res, status) => {
      //Route Planing Succesfull?
      if (status == google.maps.DirectionsStatus.OK) {
        //Show it on Map
        this.directionsDisplay.setDirections(res);
      } else {
        //Hande Error
        console.warn(status);
      }
    });
  }

  /**
   * manually remove Marker
   * @param markerid of marker to be deleted
   */
  public delMarker(markerid: number): boolean {
    if (this.markers[markerid] != undefined) {
      this.markers[markerid].remove();
      delete(this.markers[markerid]);
      return true;
    } else {
      return false;
    }
  };

  /**
   * Function to Count the Markers
   */
  public getMarkercount() {
    return this.markers.length;
  }

  /**
   * Function to add a New Marker to the Middle of the Map
   */
  public setNewMarker() {
    //get the middle of the Map
    let center = this.map.getCenter();
    //Add a Marker to the Position
    this.addMarker(
      this.markers[this.getMarkercount()],
      center.lat(),
      center.lng(), "marker");
    this.point.addPoint({
      name: "Test" + Math.round(Math.random() * 10),
      coords: [center.lat(), center.lng()]
    });
  }

  /**
   * This Function Adjusts the Position of the User-Marker on the Map
   * @param lat Latitude of Users Position
   * @param lng Longtitude of Users Position
   */
  public setMe(lat: number, lng: number): void {
    //Check for Empty Coordinates
    if (lat != 0 && lng != 0) {
      let latLng = new google.maps.LatLng(lat, lng);
      //If Usermarker exists, adjust Position
      if (this.me != undefined) {
        this.me.setPosition(latLng);
        return;
      }
      // Create new Usermarker
      else {
        let marker = new google.maps.Marker({
          map: this.map,
          icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          animation: 0,
          position: latLng,
        });
        this.me = marker;
      }
    }
  }

  /**
   * Google Maps Initialsation
   */
  private loadSDK(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.mapsLoaded) {
            this.injectSDK().then((res) => {
              resolve(true);
            }, (err) => {
              reject(err);
            });
      } else {
        reject('SDK already loaded');
      }
    });
  }

  /** Marker management */

  /**
   * Google Maps Script Importer
   */
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
      }
      this.renderer.appendChild(this._document.body, script);
    });
  }

  /**
   * Inits the Module by Loading Google Maps if needed
   */
  private init(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.mapsLoaded)
        this.loadSDK().then((res) => {
          this.initMap().then((res) => {
            this.mapsLoaded = true;
            resolve(true);
          }, (err) => {
            reject(err);
          });
        }, (err) => {
          reject(err);
        });
    });
  }

  /**
   * Callback for Google API
   */
  private initMap(): Promise<any> {
    return new Promise((resolve, reject) => {
      let myLocation = this.pos.getPosition();
      //subscribe to position feed
      this.pos.positionSubject.subscribe((data) => {
        //Is map loaded yet?
        if (this.map != undefined) {
          myLocation = this.pos.getPosition();
          if (!this.positionlock) {
            //lock the map to users position
            this.map.setCenter({lat: myLocation.lat, lng: myLocation.lng});
            this.positionlock = true;
          }
          //Set the marker of the user
          this.setMe(myLocation.lat, myLocation.lng);
          //is target a valid position ?
          if (this.lat !== 0 && this.lng !== 0) {
            this.startNavigating({lat: myLocation.lat, lng: myLocation.lng}, {lat: this.lat, lng: this.lng});
          }
          //in multipathmode - get all starts
          if (this.mode == "paths") {
            this.retrievePaths();
          }
        }
      });
      //initialize the app with user position as center
      let latLng = new google.maps.LatLng(myLocation.lat, myLocation.lng);
      let mapOptions = {
        center: latLng,
        zoom: 15
      };
      this.map = new google.maps.Map(this.element.nativeElement, mapOptions);
      resolve(true);
      //Initialize Google Directions Service and Renderer
      this.directionsService = new google.maps.DirectionsService;
      this.directionsDisplay = new google.maps.DirectionsRenderer;
      //Show the user on Map
      this.setMe(myLocation.lat, myLocation.lng);
    });
  }

  /**
   * Retrieves all Points of Path for Map Display
   * @param key Path ID-Refrenz
   */
  private loadPath(key) {
    //Query DB for Path
    this.paths.getPath(undefined, key, (values) => {
      //Empty Marker Array to clear map
      this.markers = [];
      //Add all Markers to Waypoints for Navigation and Map
      values.points.forEach((values) => {
        this.addMarker(values.key, values.coords[0], values.coords[1], (values.name));
        this.waypts.push({
          location: new google.maps.LatLng(values.coords[0], values.coords[1]),
          stopover: false
        })
      });
      //Start navigation to last Coordinate
      this.lat = values.points[values.points.length - 1].coords[0];
      this.lng = values.points[values.points.length - 1].coords[1];
      this.startNavigating(this.pos.getPosition(), {lat: this.lat, lng: this.lng})
    });
  }
}
