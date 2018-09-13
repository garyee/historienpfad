import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';

import GeoFire from 'geofire';
import { from } from 'rxjs';
import {Observable} from "rxjs/Observable";

/**
 * this service is a wrapper for the geofire-library
 * a firebase lib to save geo-coordinates and to easily do a nearby search.
 */
@Injectable()
export class GeoService {

  dbRef: any;
  geoFire: any;

  constructor(private db: AngularFireDatabase) {
    /// Reference database location for GeoFire
    this.dbRef = this.db.list('/geofire');
    this.geoFire = new GeoFire(this.dbRef.query.ref);
  }

  /**
   * Retrieve a Point by its key
   * @param key - the key of the point (has to be specified when saving the point)
   * @param cb
   */
  getLocationByKey(key, cb) {
    this.geoFire.get(key).then(cb, function (error) {
      console.error("Error: " + error);
    });
  }

  getLocationObservByKey(key) {
    return from(this.geoFire.get(key));
  }

  /**
   *   Adds GeoFire data to database
   */
  setLocation(key:string, coords: Array<number>) {
    return this.geoFire.set(key, coords)
      .then(() => console.log('location updated'))
      .catch((err) => console.error(err))
  }

  /**
   * Delete Location from DB
   * @param key
   */
  removeLocation(key){
    this.geoFire.remove(key);
  }

  /**
   * Near-by search
   * will emit an array with the resulting Keys
   *
   * @param {number} radius
   * @param {Array<number>} coords
   * @param {any} cb - if != undefined will subscribe on changes of the points retrieved by the query
   * @returns {Observable<any>}
   */
  getLocations(radius: number, coords: Array<number>, cb=undefined): Observable<any> {
      var geoQuery= this.geoFire.query({
        center: coords,
        radius: radius
      });;

    const observable= Observable.create(observer => {
      geoQuery.on("key_entered", (key, location, distance) =>  {
        // keys.push([key,location,distance]);
        observer.next({key:key,coords:location,dist:distance,mode:'add'});
      });

      geoQuery.on("key_exited", (key, location, distance) => {
        observer.next({key:key,coords:location,dist:distance,mode:'remove'});
      });
    });
    if(cb!==undefined){
      observable.subscribe(cb)
    }
    return observable;
  }


}
