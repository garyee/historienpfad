import {Injectable} from "@angular/core";
import {AngularFireDatabase} from "angularfire2/database";
// import {Point} from "../../src/models/point/point.model";

@Injectable()
export class PointListService{

  private pointListRef = this.db.list('location-info');

  constructor(private db: AngularFireDatabase){

  }

  getPointList(){
    return this.pointListRef;
  }

  getPoint(key,cb){
    this.db.object(`location-info/${key}`).valueChanges()
      .subscribe(cb);
  }

  addPoint(key,value){
    return this.pointListRef.query.ref.child(key).set(value);
  }

}
