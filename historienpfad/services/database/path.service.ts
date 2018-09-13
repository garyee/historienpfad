import {Injectable} from "@angular/core";
import {AngularFireDatabase, AngularFireList, AngularFireObject} from "angularfire2/database";
import {Path} from "../../src/models/database/path.model";
import {Observable} from "rxjs/Observable";
import {Point} from "../../src/models/database/point.model";
import {PointService} from "./point.service";
import {map, mergeMap, filter, take } from 'rxjs/operators';
import {of as observableOf} from 'rxjs/observable/of'
import "rxjs-compat/add/operator/mergeMap";
import {combineLatest} from "rxjs/observable/combineLatest";
import {GeoService} from "./geo.service";

/**
 * This service has methods to handle paths
 */
@Injectable()
export class PathService {

  pathsRef: AngularFireList<Path>;
  paths: Observable<Path[]>;

  constructor(private db: AngularFireDatabase,
              private points: PointService,
              private  geo: GeoService) {
    this.pathsRef = db.list<Path>('paths');
    this.paths = this.pathsRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({key: c.payload.key, ...c.payload.val()}))
      )
    );
  }

  /**
   * Create a pushId without pushing data or contacting the database at all
   * Use to create pushKey in order to push a new content node to db, if you need to set the pushId before pushing and
   * not  after like usual
   * @returns {string | null}
   */
  getPushKey() {
    return this.db.createPushId();
  }

  /**
   * Get All Paths in DB
   * @param cb - if !==undefined, is subscribed on the results of the query
   * @returns {Observable<Path[]>}
   */
  getPaths(cb=undefined) {
    var that = this;
    const combinedObv = this.paths.pipe(mergeMap(pathsList => {
      if (pathsList == null) {
        return that.paths;
      } else {
        const pathObservables = [];
        pathsList.forEach((path) => {
          pathObservables.push(that.getPath(path.key));
        });
        return combineLatest(pathObservables);
      }
    }));
    if (cb !== undefined) {
      combinedObv.subscribe(cb)
    }
    return combinedObv;

  }

  /**
   * returns an observable of a path in every case but:
   * A. the emitted value (in subscribe callback) can be null if path is not found in DB
   * B. if flat is true the path object will be emitted as it is in the DB (with no further point infos)
   * C. You can subscribe to the observable by passing a callback cb
   * @param {any} path_key
   * @param {any} point_key
   * @param {any} cb
   * @param {boolean} flat
   * @returns {any}
   */
  getPath(path_key=undefined,point_key=undefined, cb = undefined, flat=false) {
    if(path_key!=undefined){
      return this.getPathByPathKey(path_key,cb,flat);
    }else{
      if(point_key!=undefined){
        return this.getPathByPointKey(point_key,cb,flat);
      }
    }
    return observableOf(null);
  }

  /**
   * private method to get a path by path key
   * @param key - pathkey
   * @param {any} cb - if !=undefined will be subscribed to the query
   * @param {boolean} flat - just the path-data no point oder further nested data
   * @returns {any} - observable<Path>
   */
  private getPathByPathKey(key, cb = undefined, flat=false) {
    var that = this;
    const observable = this.db.object<Path>(`paths/${key}`);
    const combinedObv = observable.valueChanges().pipe(mergeMap(pathVal => {
      return that.getPointsListFromPath(key, undefined).map(
        (pointListVal) => {
          pathVal['points'] = pointListVal;
          pathVal['key'] = key;
          return pathVal
        }
      )
    }));
    if (cb !== undefined) {
      if(flat){
        observable.snapshotChanges().pipe(
          map(c => ({key: c.payload.key, ...c.payload.val()}))
        ).subscribe(cb)
      }else {
        combinedObv.subscribe(cb)
      }
    }
    if(flat){
      return observable.snapshotChanges().pipe(
        map(c => ({key: c.payload.key, ...c.payload.val()}))
      );
    }
    return combinedObv;
  }

  /**
   * returns the point Observable and subscribse to the path.
   * @param point_key
   * @param {any} cb - if !=undefined will be subscribed to the query
   * @param {boolean} flat  - just the path-data no point oder further nested data
   * @returns {Observable<{key: *}>}
   */
  private getPathByPointKey(point_key,cb=undefined,flat=false){
    var that=this;
    const observable = this.points.getPoint(point_key);
    const pathObs = observable.pipe(mergeMap((point)=>{
      return that.getPathByPathKey(point.parentKey,undefined,flat);
    }));
    if (cb !== undefined) {
      pathObs.subscribe(cb)
    }
    return pathObs;
  }

  /**
   * Removes a Path from the DB AND Points AND all data associated with the point!!
   * @param key
   * @param data
   */
  removePath(key, data) {
    if (data.hasOwnProperty("points") && data.points.length > 0) {
      data.points.forEach((elem) => {
        if (typeof elem === "string") {
          this.points.removePoint(elem);
        } else {
          this.points.removePoint(elem.key);
        }
      });
    }
    this.pathsRef.remove(key);
  }

  /**
   * Removes Point from point list in path AND all data associated with the point!!
   * @param point_key
   * @param {any} path_key
   */
  removePointFromPath(point_key,path_key=undefined){
    var that=this;
    this.getPath(path_key,point_key,undefined, true).pipe(take(1)).subscribe(
      (path)=> {
        if (path.points!=undefined && path.points.indexOf(point_key) > -1) {
          path.points.splice(path.points.indexOf(point_key), 1);
          that.pathFlatUpdate(path);
        }
        that.points.removePoint(point_key);
      });
  }

  /**
   * Adds a path to the DB
   * and returns the key
   * @param path
   * @returns {string | null}
   */
  addPath(path) {
    let points = undefined;
    if (path.hasOwnProperty('points') &&
      path.points != null &&
      Array.isArray(path.points) &&
      path.points.length > 0 &&
      !(typeof path.points[0] === "string")
    ) {
      points = Object.assign({}, path.points);
      const pointKeyList = path.points.map((point) => point.key);
      path.points = pointKeyList;

    }
    const pathKey = this.pathsRef.push(path).key;
    if (points != undefined) {
      let isFirst = true;
      points.forEach((pointsObj) => {
        pointsObj.isStartPoint = isFirst;
        if (isFirst) {
          isFirst = false
        }
        pointsObj.parentKey = pathKey;
        this.addPointToPath(pathKey, pointsObj);
      });
    }
    return pathKey;
  }

  /**
   * Get the PointList of a path (not flat)
   * @param key - pathkey
   * @param cb  - if !=undefined will be subscribed to the query
   * @returns {Observable<Point[] | null>}
   */
  getPointsListFromPath(key, cb=undefined) {
    var that = this;
    const observable = this.db.object<Point[]>(`paths/${key}/points`).valueChanges();
    const combindedObv = observable.pipe(mergeMap((keyList) => {
      if (keyList == null) {
        return observable;
      } else {
        const pointObservables = [];
        keyList.forEach((pointKey) => {
          pointObservables.push(that.points.getPoint(pointKey, undefined));
        });
        return combineLatest(pointObservables);
      }
    }));
    if (cb !== undefined) {
      combindedObv.subscribe(cb)
    }
    return combindedObv;
  }

  /**
   * will add a point to the point-list of a path
   * if the point has no key-property it will get saved to the points db
   * if the point has a key, it will get updated with the parent-properties (isfirst etc.)
   * @param path_key
   * @param {Point} data
   */
  addPointToPath(path_key, data: Point) {
    var that = this;
    this.db.object<Path>(`paths/${path_key}`).valueChanges().pipe(take(1)).subscribe(
      (path) => {
        if (path === null) {
          console.error('No Path found for key: ' + path_key);
        } else {
          if (!path.hasOwnProperty('points')){
            path.points=[];
          }
          if (path.hasOwnProperty('points') && //point is not in list or in not in point-db either
            Array.isArray(path.points) &&
            (!data.hasOwnProperty('key') ||
            path.points.indexOf(data.key) < 0)
          ) {
            data.parentKey = path_key;
            let point_key;
            if (!path.hasOwnProperty('points') || path.points === null || (path.points.length === 0)) {
              data.isStartPoint = true;
            } else {
              data.isStartPoint = false;
            }
            if (data.hasOwnProperty('key')) {
              point_key = this.points.updatePoint(data.key, data);
            } else {
              const key = this.points.addPoint(data);
              data.key = key;
              point_key = key;
            }
            if (point_key != undefined) {
              this.addPointToList(path_key, path, point_key, undefined);
            }
          }

        }
      }
    );
  }

  /**
   * private method which does add the point_key to the paths pointlist
   * @param path_key
   * @param path
   * @param point_key
   * @param index
   */
  private addPointToList(path_key, path, point_key, index) {
    if (index === undefined) {
      if (!path.hasOwnProperty('points') || path.points === null) {
        path.points = [point_key];
      } else {
        if (path.points.indexOf(point_key) < 0) {
          path.points.push(point_key);
        }
      }
      this.pathsRef.update(path_key, path);
    } else {
      console.error('method not implemented yet!');
    }

  }

  /**
   *
   * @param path_key
   * @param point_index
   * @param cb
   * @returns {Observable<Point>}
   */
  getPointFromPath(path_key, point_index, cb) {
    var that = this;
    const observable = this.db.object<Point>(`paths/${path_key}/points/${point_index}`).valueChanges().pipe(
      mergeMap((point_key) => {
        return that.points.getPoint(point_key, undefined)
      }));
    if (cb !== undefined) {
      observable.subscribe(cb)
    }
    return observable;
  }

  /**
   * Updates the flat path object
   * @param {Path} path
   * @param {any} cb
   */
  private pathFlatUpdate(path:Path,cb=undefined){
    const tmp1=this.first(path.points);
    if(Array.isArray(path.points) &&
      (path.points.length==0 || typeof this.first(path.points) === "string")){
      this.pathsRef.set(path.key,path)
        .then(cb).catch((err)=>console.error(err));
    }else{
      console.error('pathFlatUpdate is not for deep-Updates!');
    }
  }

  /**
   * Pop of the first element of an array
   * @param array
   * @param {number} n
   * @returns {any}
   */
  private first (array, n=1){
    if (array == null)
      return void 0;
    if (n == null)
      return array[0];
    if (n < 0)
      return [];
    return array.slice(0, n);
  };

  /**
   * Change the Order of points in a path list
   * @param path_key
   * @param from
   * @param to
   */
  reorderPointsInPath(path_key, from, to) {
    if(from!=to) {
      var that = this;
      const observable = this.getPath(path_key, undefined,undefined, true);
      observable.pipe(take(1)).subscribe(
        (path) => {
          let element = path.points[from];
          path.points.splice(from, 1);
          path.points.splice(to, 0, element);
          this.pathFlatUpdate(path, (res) => {
            if (to == 0 || from == 0) {
              this.points.updatePoint(path.points[to], {isStartPoint: to == 0});
              this.points.updatePoint(path.points[from], {isStartPoint: from == 0});
            }
          });
        });
    }
  }

  /**
   * This function will get the firebase results for the query.
   * Attention this function will emit one result at the time!
   * res ={
   * coords: Array [ number, number ]
   * dist: number
   * key: string - point-key
   * mode: "add"/"remove"
   * path: Path - Object
   * point: Point - Object
   * }
   *
   * @param radius
   * @param coords
   * @param {any} cb
   * @returns {Observable<any>}
   */
  getPathsByGeofireSearch(radius, coords, cb = undefined) {
    var that = this;
    var parentKeyReg = [];
    const observable = this.geo.getLocations(radius, coords);

    const resObsv = observable.pipe(mergeMap((geoRes) => {
      const pointObsev = that.points.getPoint(geoRes.key);
      return pointObsev.pipe(mergeMap((point) => {
        if (point.hasOwnProperty('parentKey') &&
          point.hasOwnProperty('isStartPoint') &&
          point.isStartPoint === true &&
          parentKeyReg.indexOf(point.parentKey) < 0
        ) {
          parentKeyReg.push(point.parentKey);
          const pathObsev = that.getPath(point.parentKey);
          return pathObsev.map((path) => {
            geoRes.point = point;
            geoRes.path = path;
            return geoRes;
          });
        } else {
          return observableOf(null);
        }
      }));
    })).pipe(filter(val => val !== null));

    if (cb !== undefined) {
      resObsv.subscribe(cb)
    }
    return resObsv;


  }
}
