import {Injectable} from "@angular/core";
import {HttpClient} from '@angular/common/http';
import {badgrConfig} from '../firebase.credentials';
import {TokenResponse} from "../src/models/responses/token.response.model";
import {map, mergeMap, filter, take} from 'rxjs/operators';
import {Observable} from "rxjs/Observable";
import {AngularFireDatabase, AngularFireList} from "angularfire2/database";
import {Point} from "../src/models/database/point.model";
import {UserData} from "../src/models/database/userdata.model";
import moment from "moment";
import {UserDataService} from "./database/user-data.service";

@Injectable()
export class BadgrService {

  issuerRef: AngularFireList<Object>;
  issuerList: Observable<Object[]>;

  token: Observable<String>;

  constructor(public http: HttpClient,
              private db: AngularFireDatabase,
              private user: UserDataService) {
    this.issuerRef = db.list<Object>('badgr-data');
    this.issuerList = this.issuerRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({key: c.payload.key, ...c.payload.val()}))
      ));
    this.getToken();
    this.token.subscribe((res) => {/*console.log(res)*/
    }, (err) => console.error(err));
    this.snycDB();
    // this.getUserSelf();
  }

  getToken() {
    if (badgrConfig) {
      this.token = this.http.post<TokenResponse>('https://api.badgr.io/api-auth/token', badgrConfig)
        .pipe(map(res => res.token));
    }
  }

  getUserSelf() {
    var that = this;
    that.callBadgr('users/self', 'get', (res) => {
    });
    that.callBadgr('issuers', 'get',
      (res) => {
        const issuerID = res['result'][0]['entityId'];
        that.callBadgr('issuers/' + issuerID + '/badgeclasses', 'get',
          (res) => {
            // console.log(res);
            // const data = {
            //   badgeclass: res['result'][0]['entityId'],
            //   recipient:
            //     {
            //       identity: "Gerald_Meier@gmx.de",
            //       hashed: false,
            //       type: "email",
            //       plaintextIdentity: "Gerald_Meier@gmx.de",
            //     }
            // };
            // that.callBadgr('issuers/' + issuerID + '/assertions', token, 'post',
            //   (res) => console.log(res), data);
          });
      });
  }

  /**
   * internal callwrapper
   *
   * @param {string} endpoint e.g. 'users/self'
   * @param {string} method
   * @param cb
   * @param {any} data
   */
  private callBadgr(endpoint: string, method: string, cb, data = undefined) {
    this.token.subscribe((token) => {
      switch (method) {
        case 'get':
          this.http.get('https://api.badgr.io/v2/' + endpoint, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': 'Token ' + token
            }
          }).subscribe(cb);
          break;
        case 'post':
          this.http.post<TokenResponse>('https://api.badgr.io/v2/' + endpoint,
            data,
            {
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Token ' + token
              }
            }
          ).subscribe((res) => {
            console.log(res)
          });
          break;
      }
    });
  }

  getFirstIssuer(cb) {
    this.callBadgr('issuers', 'get',
      (res) => {
        cb(res['result'][0]);
      });
  }

  getBadges(issuerID, cb) {
    this.callBadgr('issuers/' + issuerID + '/badgeclasses', 'get', (res) => {
      cb(res['result']);
    });
  }

  /**
   * checks for Badgr Data in DB and updates it if needed
   */
  snycDB() {
    var that = this;
    this.issuerList.subscribe((data) => {
      if (data == null || (Array.isArray(data) && data.length == 0)) {
        that.getBadgrDataSetToDB(that);
      } else {
        if (data[0]['lastUpdated'] && moment(data[0]['lastUpdated']).diff(moment(), 'days') > 7) {
          that.getBadgrDataSetToDB(that);
        }
      }
    });
  }

  /**
   * gets Badgr Data from api and does breaking update on the issuerList id
   *
   * @param that
   */
  private getBadgrDataSetToDB(that) {
    that.getFirstIssuer((issuer_data) => {
      const issuerID = issuer_data['entityId'];
      that.getBadges(issuerID, (badgeClasses_res) => {
        const data = {};
        if (badgeClasses_res != null && Array.isArray(badgeClasses_res)) {
          badgeClasses_res.forEach((val) => {
            if (!data.hasOwnProperty('badges')) {
              data['badges'] = {};
            }
            data['badges'][val.entityId] = val.name;
          });
        }
        data['lastUpdated'] = moment().valueOf();
        that.issuerRef.set(issuerID, data);
      })
    });
  }

  assertBadgeToUser() {

  }

  private getAllBadgesFromIssuer(issuerID, mail, cb) {
    this.callBadgr('issuers/' + issuerID + '/assertions?recipient=' + mail, 'get', cb);
  }

  getAllBadgesForUser(cb) {
    var that = this;
    this.getIssuerIDFromDB((issuerID) => {
      this.user.getUserDataFromDB((userData) => {
        if (userData != null && userData.email && issuerID != null) {
          that.getAllBadgesFromIssuer(issuerID, userData.email, cb);

        }
      });
    });
  }

  ///////////////////////DB functions

  getIssuerIDFromDB(cb): Observable<string> {
    const observ = this.issuerList.pipe(map((data) => {
      return data[0]['key']
    }))
    observ.subscribe(cb);
    return observ
  }

}
