import {Injectable} from "@angular/core";
import {AngularFireDatabase, AngularFireList} from "angularfire2/database";
import {Point} from "../../src/models/point.model";
import {map, mergeMap, take} from "rxjs/operators";
import {Observable} from "rxjs/Observable";
import {GeoService} from "./geo.service";
import {ContentService} from "./content.service";
import { combineLatest } from 'rxjs';
import 'rxjs/add/operator/map'
import {Content} from "../../src/models/content.model";
import {PathService} from "./path.service";
import {deprecate} from "util";

@Injectable()
export class PointService {

  pointsRef: AngularFireList<Point>;
  points: Observable<Point[]>;

  constructor(private db: AngularFireDatabase,
              private geo: GeoService,
              private content: ContentService) {
    this.pointsRef = db.list<Point>('points');
    this.points = this.pointsRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({key: c.payload.key, ...c.payload.val()}))
      )
    );
  }

  getPushKey() {
    return this.db.createPushId();
  }

  /*
  will retrieve point from DB
  will return observable in every case
  pass callback-function on second parameter to subscribe to the observable directly
  Attention: observable is returned even if point is not found in DB in that case the value
  emitted to the callback will be null!
   */
  getPoint(key, cb = undefined) {
    var that = this;
    if (key != null) {
      let point = this.db.object<Point>(`points/${key}`).valueChanges();
      const content = this.content.getContent(key);
      const coords = this.geo.getLocationObservByKey(key);

      const observable = point.pipe(
        mergeMap((pointVal) => {
          if(pointVal!==null) {
            return combineLatest(coords, content).map((combinedVals) => {
              pointVal['key'] = key;
              pointVal['content'] = combinedVals[1];
              pointVal['coords'] = combinedVals[0];
              return pointVal;
            });
          }
          return point;
        }));

      if (cb !== undefined) {
        observable.subscribe(cb)
      }
      return observable;
    }
    return null
  }


  addPoint(data: Point) {
    let coords=undefined;
    let content=undefined;
    if(data.hasOwnProperty('coords')) {
      coords = data.coords;
      delete data.coords;
    }
    if(data.hasOwnProperty('content')) {
      content = data.content;
      delete data.content;
    }
    const key = this.pointsRef.push(data).key;
    if (key != undefined && key != '') {
      if (coords != undefined && Array.isArray(coords) && coords.length > 0) {
        this.geo.setLocation(key, coords);
      }
      if (content != undefined) {
        this.content.updateContent(key, <Content>content);
      }
    }
    return key;
  }

  updatePoint(key, data) {
    if(data.hasOwnProperty('coords')){
      this.geo.setLocation(key,data.coords as Array<number>);
      delete data.coords;
    }
    if(data.hasOwnProperty('content')){
      this.content.updateContent(key,<Content>data.content);
      delete data.content;
    }
    this.pointsRef.update(key, data);
  }

  /*
  This removes the point identified by the key.
  AND all other data identified by the key (content& location)
  BUT this does not delete the point from the paths-point list!
  for this pourpouse use the removePointfrom Path method in path-service
  @deprecated it is because it is better to use path-service method!
   */
  removePoint(key){
        this.content.removeContent(key);
        this.geo.removeLocation(key);
        this.pointsRef.remove(key);
  }
}
