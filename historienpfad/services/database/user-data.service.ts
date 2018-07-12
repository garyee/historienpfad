import {Injectable} from "@angular/core";
import {AngularFireDatabase, AngularFireList} from "angularfire2/database";
import {map} from "rxjs/operators";
import {Observable} from "rxjs/Observable";
import {GeoService} from "./geo.service";
import {UserData} from "../../src/models/userdata.model";
import {Path} from "../../src/models/path.model";
import moment from "moment";
// import {Point} from "../../src/models/point/point.model";

@Injectable()
export class UserDataService{

  usersRef: AngularFireList<UserData>;
  users: Observable<UserData[]>;

  constructor(private db: AngularFireDatabase,) {
    this.usersRef = db.list<UserData>('users');
    this.users = this.usersRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({key: c.payload.key, ...c.payload.val()}))
      )
    );
  }

  onSignOnActions(user){
    if(user!=null) {
      var that = this;
      this.getUserData(user.uid, (data) => {
        if (data == null) {
          data = that.firstLoginActions(user);
        }
        data.lastLoginTs = moment().valueOf();
        that.updateUserData(user.uid, data);
      },true);
    }
  }

  firstLoginActions(user){
    if(user.hasOwnProperty('name')&& user.name!=null && user.name!='') {
      return {name: user.displayName};
    }else
      return {name: user.email};
  }

  getUserData(uid,cb=undefined,withOutID=false){
    let observable=null;
    if(!withOutID) {
      observable = this.db.object<UserData>(`paths/${uid}`).snapshotChanges();
    }else{
      observable = this.db.object<UserData>(`paths/${uid}`).snapshotChanges().pipe(
        map(c => ({uid: c.payload.key, ...c.payload.val()})));
    }
    if (cb !== undefined) {
      observable.subscribe(cb)
    }
    return observable;
  }

  /*
  add and also destructive update
   */
  addUserData(key,data:UserData){
    delete data.uid;
    this.usersRef.set(key,data);
  }

  /*
  non-destructive Update
   */
  updateUserData(key,data: UserData){
    delete data.uid;
    this.usersRef.update(key, data);
  }
}
