import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';

import GeoFire from 'geofire';
// import { BehaviorSubject } from 'rxjs/BehaviorSubject'
// import {Point} from "../../src/models/point/point.model";

@Injectable()
export class GeoService {

  dbRef: any;
  geoFire: any;

  // hits = new BehaviorSubject([])

  constructor(private db: AngularFireDatabase) {
    /// Reference database location for GeoFire
    this.dbRef = this.db.list('/locations');
    this.geoFire = new GeoFire(this.dbRef.query.ref);
  }

  /// Adds GeoFire data to database
  setLocation(key:string, coords: Array<number>) {
    return this.geoFire.set(key, coords)
      .then(() => console.log('location updated'))
      .catch((err) => console.log(err))
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
