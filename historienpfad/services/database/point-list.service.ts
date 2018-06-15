import {Injectable} from "@angular/core";
import {AngularFireDatabase} from "angularfire2/database";
import {Point} from "../../src/models/point/point.model";

@Injectable()
export class PointListService{

  private pointListRef = this.db.list<Point>('point-list');

  constructor(private db: AngularFireDatabase){

  }

  getPointList(){
    return this.pointListRef;
  }

  addPoint(point: Point){
    return this.pointListRef.push(point);
  }

}
