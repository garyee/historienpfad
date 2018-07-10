import {Injectable} from "@angular/core";
import {AngularFireDatabase, AngularFireList, AngularFireObject} from "angularfire2/database";
import {Path} from "../../src/models/path.model";
import {Observable} from "rxjs/Observable";
import {map, mergeMap} from 'rxjs/operators';
import {Point} from "../../src/models/point.model";
import {PointService} from "./point.service";
import {take} from 'rxjs/operators';
import "rxjs-compat/add/operator/mergeMap";
import {combineLatest} from "rxjs/observable/combineLatest";

@Injectable()
export class PathService {

  // private dbRef = this.db.list<Path>('paths');
  pathsRef: AngularFireList<Path>;
  paths: Observable<Path[]>;

  constructor(private db: AngularFireDatabase,
              private points: PointService) {
    this.pathsRef = db.list<Path>('paths');
    this.paths = this.pathsRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({key: c.payload.key, ...c.payload.val()}))
      )
    );
  }

  getPushKey() {
    return this.db.createPushId();
  }

  getPaths(cb) {
    var that=this;
    const combinedObv=this.paths.pipe(mergeMap(pathsList =>
    {
      if(pathsList==null){
        return that.paths;
      }else{
        const pathObservables=[];
        pathsList.forEach((path)=>{
          pathObservables.push(that.getPath(path.key,undefined));
        });
        return combineLatest(pathObservables);
      }
    }));
    if(cb!==undefined){
      combinedObv.subscribe(cb)
    }
    return combinedObv;

  }

  getPath(key, cb) {
    var that=this;
    const observable=this.db.object<Path>(`paths/${key}`).valueChanges();
    const combinedObv = observable.pipe(mergeMap(pathVal =>
    {
      return that.getPointsListFromPath(key,undefined).map(
        (pointListVal) => {
          pathVal['points'] = pointListVal;
          return pathVal
        }
      )
    }));
    if(cb!==undefined){
      combinedObv.subscribe(cb)
    }
    return combinedObv;
  }

  removePath(key) {
    const promise = this.db.object(`paths/${key}`).remove();
    promise
      .then(_ => console.log('Deleted Path: ' + key))
      .catch(err => console.error(err, 'Error while trying to delete path with key: !' + key));
  }

  addPath(path: Path) {
    return this.pathsRef.push(path).key;
  }

  getPointsListFromPath(key, cb) {
    var that = this;
    const observable=this.db.object<Point[]>(`paths/${key}/points`).valueChanges();

    const combindedObv=observable.pipe(mergeMap((keyList)=>{
        if(keyList==null){
          return observable;
        }else{
          const pointObservables=[];
          keyList.forEach((pointKey)=>{
            pointObservables.push(that.points.getPoint(pointKey,undefined));
          });
          return combineLatest(pointObservables);
        }
      }));
    if(cb!==undefined){
      combindedObv.subscribe(cb)
    }
    return combindedObv;
  }

  addPointToPath(path_key, data: Point) {
    let point_key;
    if (data.hasOwnProperty('key')) {
      point_key = this.points.updatePoint(data.key, data);
    } else {
      const key = this.points.addPoint(data);
      data.key = key;
      point_key = key;
    }
    if (point_key != undefined) {
      this.addPointToList(path_key, point_key, undefined);
    }
  }

  private addPointToList(path_key, point_key, index) {
    if (index === undefined) {
      this.db.object<Path>(`paths/${path_key}`).valueChanges().pipe(take(1)).subscribe(
        (path) => {
          if (path === null) {
            console.error('No Path found for key: ' + path_key);
          } else {
            if (!path.hasOwnProperty('points') || path.points === null) {
              path.points = [point_key];
            } else {
              if (path.points.indexOf(point_key) < 0) {
                path.points.push(point_key);
              }
            }
            this.pathsRef.update(path_key, path);
          }
        }, (err) => {
          console.error(err);
        }
      );
    } else {
      console.error('method not implemented yet!');
    }

  }

  getPointFromPath(path_key, point_index, cb) {
    var that = this;
    const observable = this.db.object<Point>(`paths/${path_key}/points/${point_index}`).valueChanges().
      pipe(mergeMap((point_key)=>{
      return that.points.getPoint(point_key,undefined)
    }));
    if(cb!==undefined){
      observable.subscribe(cb)
    }
    return observable;

  }


  // getPointInfo(Point_id)

}
