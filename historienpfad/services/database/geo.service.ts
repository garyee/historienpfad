import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';

import GeoFire from 'geofire';
import { from } from 'rxjs';

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


  /// Queries database for nearby locations
  /// Maps results to the hits BehaviorSubject
  getLocations(radius: number, coords: Array<number>, cb) {
    this.geoFire.query({
      center: coords,
      radius: radius
    }).on("key_entered", cb);

  }

}
