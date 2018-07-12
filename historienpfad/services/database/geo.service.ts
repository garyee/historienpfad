import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';

import GeoFire from 'geofire';
import { from } from 'rxjs';
import {Observable} from "rxjs/Observable";
import { throttleTime } from 'rxjs/operators';
import { distinctUntilChanged } from 'rxjs/operators';

@Injectable()
export class GeoService {

  dbRef: any;
  geoFire: any;

  // hits = new BehaviorSubject([])

  constructor(private db: AngularFireDatabase) {
    /// Reference database location for GeoFire
    this.dbRef = this.db.list('/geofire');
    this.geoFire = new GeoFire(this.dbRef.query.ref);
  }

  getLocationByKey(key, cb) {
    this.geoFire.get(key).then(cb, function (error) {
      console.error("Error: " + error);
    });
  }

  getLocationObservByKey(key) {
    return from(this.geoFire.get(key));
  }

  /// Adds GeoFire data to database
  setLocation(key:string, coords: Array<number>) {
    return this.geoFire.set(key, coords)
      .then(() => console.log('location updated'))
      .catch((err) => console.error(err))
  }

  removeLocation(key){
    this.geoFire.remove(key);
  }

  /*
  will emit an array with the resulting Keys
   */
  getLocations(radius: number, coords: Array<number>, cb=undefined): Observable<any> {
      // var keys = new Array();

      var geoQuery= this.geoFire.query({
        center: coords,
        radius: radius
      });;

    const observable= Observable.create(observer => {
      geoQuery.on("key_entered", (key, location, distance) =>  {
        // keys.push([key,location,distance]);
        observer.next({key:key,coords:location,dist:distance,mode:'add'});
      });

      // geoQuery.on("key_moved", (key, location, distance) =>  {
      //   var index = keys.indexOf(key);
      //   if (index > -1) {
      //     keys[index]=key;
      //   }
      //   observer.next(keys);
      // });

      geoQuery.on("key_exited", (key, location, distance) => {
        // var index = keys.indexOf(key);
        // if (index > -1) {
        //   keys.splice(index, 1);
        // }
        observer.next({key:key,coords:location,dist:distance,mode:'remove'});
      });
    });
    if(cb!==undefined){
      observable.subscribe(cb)
    }
    return observable;
  }


}
