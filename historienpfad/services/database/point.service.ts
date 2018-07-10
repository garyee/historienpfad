import {Injectable} from "@angular/core";
import {AngularFireDatabase, AngularFireList} from "angularfire2/database";
import {Point} from "../../src/models/point.model";
import { map, mergeMap} from "rxjs/operators";
import {Observable} from "rxjs/Observable";
import {GeoService} from "./geo.service";
import {ContentService} from "./content.service";
import {combineLatest} from 'rxjs/observable/combineLatest';
import 'rxjs/add/operator/map'
import {Content} from "../../src/models/content.model";

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

  // getPoint(key,cb){
  //   var that=this;
  //   if(key!=null) {
  //     return this.db.object<Point>(`points/${key}`).valueChanges().subscribe(
  //       (res) => {
  //         that.geo.getLocationByKey(key, (coord_res) => {
  //           if(coord_res!=null) {
  //             res.coords = coord_res;
  //           }
  //           that.content.getContent(key, (content_res) => {
  //             if(content_res!=null) {
  //               res.content = content_res.html;
  //             }
  //             cb(res);
  //           });
  //         });
  //       });
  //   }
  //   return null;
  // }

  getPoint(key, cb) {
    var that = this;
    if (key != null) {
      const point = this.db.object<Point>(`points/${key}`).valueChanges();
      const content = this.content.getContentObserv(key).valueChanges();
      const coords = this.geo.getLocationObservByKey(key);

      const observable = point.pipe(
        mergeMap((pointVal) => {
          return combineLatest(coords, content).map((combinedVals) => {
            pointVal['content'] = combinedVals[0];
            pointVal['coords'] = combinedVals[1];
            return pointVal;
          });
        }));

      if (cb !== undefined) {
        observable.subscribe(cb)
      }
      return observable;
    }
    return null
  }


  addPoint(data: Point) {
    const coords = data.coords;
    delete data.coords;
    const content = data.content;
    delete data.content;

    const key = this.pointsRef.push(data).key;
    if (key != undefined && key != '') {
      if (coords != undefined && Array.isArray(coords) && coords.length > 0) {
        this.geo.setLocation(key, coords);
      }
      if (content != undefined) {
        this.content.addContent(key, content);
      }
    }
    return key;
  }

  updatePoint(key, data: Point) {
    if(data.hasOwnProperty('coords')){
      this.geo.setLocation(key,data.coords as Array<number>);
      delete data.coords;
    }
    if(data.hasOwnProperty('content')){
      this.content.updatePoint(key,<Content>data.content);
      delete data.content;
    }
    this.pointsRef.update(key, data);
  }
}