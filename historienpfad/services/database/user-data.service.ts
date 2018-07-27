import {Injectable} from "@angular/core";
import {AngularFireDatabase, AngularFireList} from "angularfire2/database";
import {map, take} from "rxjs/operators";
import {Observable} from "rxjs/Observable";
import {UserData} from "../../src/models/database/userdata.model";
import moment from "moment";
import {AuthService} from "../auth.service";

// import {Point} from "../../src/models/point/point.model";

@Injectable()
export class UserDataService {

  usersRef: AngularFireList<UserData>;
  user: Observable<UserData>;

  constructor(private db: AngularFireDatabase,
              private auth: AuthService) {
    this.usersRef = db.list<UserData>('users');
    const uid = this.auth.getUID();
    if (uid) {
      this.user = this.db.object<UserData>(`users/${uid}`).snapshotChanges().pipe(
        map(c => (<UserData>{uid: c.payload.key, ...c.payload.val()})));
    }
    auth.subscribeToAuthState(this.onSignOnActions);
  }

  /**
   * Get UID from Auth service
   *
   * @returns {string}
   */
  getUIDWrapper(): string {
    return this.auth.getUID()
  }

  /**
   * Callback which is triggered when a user loggs in
   * (or gets logged in automatically)
   *
   * @param user
   */
  onSignOnActions = (user): void => {
    if (user != null) {
      var that = this;
      this.getUserDataFromDB(undefined, user.uid, true).pipe(take(1)).subscribe((data) => {
        if (data == null) {
          data = <UserData>that.firstLoginActions(user);
        } else {
          data = {};
        }
        data.lastLoginTs = moment().valueOf();
        that.updateUserData(data);
      });
    }
  }

  /**
   * First Time a User logs in name is saved and lp are initialized
   *
   * @param user
   * @returns {any}
   */
  firstLoginActions(user): Object {
    const rtnObj = {lp: 100};
    rtnObj['email'] = user.email;
    if (user.displayName && user.displayName != null && user.displayName != '') {
      rtnObj['name'] = user.displayName;
    } else {
      rtnObj['name'] = user.email;
    }
    return rtnObj;
  }

  /**
   * Returns an observable of the userdata from either the current or a user identified by the key
   * If key not given current user is taken
   * when a callback-function is passed as cb this function is subscribed
   *
   * @param {any} cb
   * @param {any} key
   * @returns {any}
   */
  getUserDataFromDB(cb = undefined, key = undefined, withOutKey = undefined): Observable<UserData> {
    let observable = null;
    if (key) {
      if (withOutKey) {
        observable = this.db.object<UserData>(`users/${key}`).valueChanges();
      } else {
        observable = this.db.object<UserData>(`users/${key}`).snapshotChanges().pipe(
          map(c => ({uid: c.payload.key, ...c.payload.val()})));
      }
    } else {
      observable = this.user;
    }
    if (cb !== undefined) {
      observable.subscribe(cb)
    }
    return observable;
  }

  /**
   * workaround for getUserDataFromDB not triggering on second subscribe
   * @param cb
   */
  getUserObsv(cb, takeOne = false): Observable<UserData> {
    const key = this.getUIDWrapper();
    let observable = this.db.object<UserData>(`users/${key}`).valueChanges();
    if (takeOne) {
      observable = this.db.object<UserData>(`users/${key}`).valueChanges().pipe(take(1));
    }
    if (cb !== undefined) {
      observable.subscribe(cb)
    }
    return observable;
  }

  /*
  add and also destructive update
  If key not given current user is taken
   */
  addUserData(data: UserData, key = undefined): void {
    key = key || this.getUIDWrapper();
    delete data.uid;
    this.usersRef.set(key, data);
  }

  /*
  non-destructive Update
  If key not given current user is taken
   */
  updateUserData(data, key = undefined): void {
    key = key || this.getUIDWrapper();
    delete data.uid;
    this.usersRef.update(key, data);
  }

  /**
   * returns observable (of the lps)
   * subscribe by passing callback on cb
   *
   */
  getLPFromUser(cb): Observable<number> {
    const observable = this.user.pipe(map((data) => {
      return data.lp
    }));
    if (cb !== undefined) {
      observable.subscribe(cb)
    }
    return observable;
  }

  /**
   * Add lp to the User
   *
   * @param {number} lp2add
   */
  addLPToUser(lp2add: number): void {
    var that = this;
    this.getUserObsv((data) => {
      if (data && data.lp) {
        that.updateUserData({lp: (data.lp + lp2add)});
      }
    },true);
  }
}
